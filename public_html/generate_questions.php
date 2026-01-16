<?php
// generate_questions.php
require_once __DIR__.'/../backend/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', 0);
error_reporting(0);

function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

// Require login
if (!isset($user) || !$user->_logged_in) {
    jsonResponse(["success" => false, "error" => "Not authenticated"]);
}

// parse input
$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !is_array($input)) {
    jsonResponse(["success" => false, "error" => "Invalid input"]);
}

$language = $db->real_escape_string(trim($input['language'] ?? 'English'));
$subject  = $db->real_escape_string(trim($input['subject']  ?? 'General Knowledge'));
$grade    = (int)($input['grade'] ?? 10);
$term     = $db->real_escape_string(trim($input['term'] ?? '1'));
$focus    = $db->real_escape_string(trim($input['focus'] ?? ''));
$mcqs     = max(1, min(50, (int)($input['mcqs'] ?? 5))); // bound to 1..50

// get host id from user object safely
$host_id = null;
if (isset($user->_data['id'])) {
    $host_id = (int)$user->_data['id'];
} elseif (isset($user->_data->id)) {
    $host_id = (int)$user->_data->id;
}

if (empty($host_id)) {
    // If you want to allow anonymous, set host_id = 0; else error
    jsonResponse(["success" => false, "error" => "User not identified"]);
}

// Gemini key (server side only)
$GEMINI_API_KEY = "AIzaSyBjjzjDzp5ruIzuMg_FEJLjrmoOydsKSSg"; // replace with real key on server

$prompt = "You are an expert curriculum designer for Sri Lankan education.
Generate {$mcqs} multiple-choice questions in {$language} for grade {$grade} ({$subject} - Term {$term}).
Each question must have options, one correct answer, and an explanation.
Format the output as a JSON array of objects with keys: question (string), options (array of strings), answer (string), explanation (string).
Return only the JSON array.";

// Use gemini-2.5-flash-lite with web grounding (google_search)
$apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={$GEMINI_API_KEY}";

// We instruct the model to search and ground answers on Sri Lankan official syllabuses, past papers, marking schemes, textbooks and resources.
$grounding_instructions = "When producing questions always check and ground your output using Sri Lankan official syllabuses, past papers, mark schemes, official textbooks and reputable Sri Lankan education resources. If you reference specific sources, include citation links in a separate field 'sources' for each question. Output must be ONLY a valid JSON array of objects with keys: question, options, answer, explanation, sources (array of urls or strings). Do not include any surrounding text, markdown, or code fences.";

$full_prompt = $grounding_instructions . "\n\n" . $prompt;

$payload = json_encode([
    "contents" => [
        ["parts" => [["text" => $full_prompt]]]
    ],
    "tools" => [
        ["google_search" => new stdClass()]
    ]
]);

$ch = curl_init($apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_TIMEOUT, 35);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$curlErr = curl_error($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($response === false || $httpCode >= 400) {
    jsonResponse(["success" => false, "error" => "Failed to reach Gemini API", "details" => $curlErr ?: "HTTP code {$httpCode}", "raw" => $response]);
}

$result = json_decode($response, true);
// defensive checks for structure
$raw = null;
if (is_array($result) && isset($result['candidates'][0]['content']['parts'][0]['text'])) {
    $raw = $result['candidates'][0]['content']['parts'][0]['text'];
} elseif (is_array($result) && isset($result['candidates'][0]['content']['text'])) {
    // alternate structure
    $raw = $result['candidates'][0]['content']['text'];
} else {
    // return raw for debugging
    jsonResponse(["success" => false, "error" => "Gemini response missing expected text field", "raw_full" => $response]);
}

$clean = preg_replace('/```json|```/', '', trim($raw));
$questions = json_decode($clean, true);
if (!$questions || !is_array($questions)) {
    // Try to recover if model returned JSON with trailing commentary: try to extract the first JSON array using regex
    if (preg_match('/(\[\s*\{.*\}\s*\])/s', $clean, $matches)) {
        $maybe = $matches[1];
        $questions = json_decode($maybe, true);
    }
}

if (!$questions || !is_array($questions)) {
    jsonResponse(["success" => false, "error" => "Gemini output not valid JSON", "raw_clean" => $clean]);
}

// Insert game row
$db->begin_transaction();
try {
    $stmt = $db->prepare("INSERT INTO games (host_id, mode, subject, grade, term, focus, language, created_at) VALUES (?, 'single', ?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param("isisss", $host_id, $subject, $grade, $term, $focus, $language);
    $stmt->execute();
    $game_id = $db->insert_id;
    $stmt->close();

    $stmtQ = $db->prepare("INSERT INTO questions (game_id, question, options, answer, explanation, mark) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($questions as $q) {
        // normalize fields
        $q_question = isset($q['question']) ? $q['question'] : '';
        $q_options  = isset($q['options']) && is_array($q['options']) ? json_encode(array_values($q['options']), JSON_UNESCAPED_UNICODE) : json_encode([]);
        $q_answer   = isset($q['answer']) ? $q['answer'] : '';
        $q_explain  = isset($q['explanation']) ? $q['explanation'] : '';
        $mark = rand(1, 5);

        $stmtQ->bind_param("issssi", $game_id, $q_question, $q_options, $q_answer, $q_explain, $mark);
        $stmtQ->execute();
    }
    $stmtQ->close();

    $db->commit();
    jsonResponse(["success" => true, "game_id" => (int)$game_id]);

} catch (Exception $e) {
    $db->rollback();
    jsonResponse(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
}