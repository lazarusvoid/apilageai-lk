<?php
// submit_answer.php
require_once __DIR__.'/../backend/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($user) || !$user->_logged_in) {
    jsonResponse(["success" => false, "error" => "Not logged in"]);
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input || !is_array($input)) {
    jsonResponse(["success" => false, "error" => "Invalid input"]);
}

$game_id = isset($input['game_id']) ? (int)$input['game_id'] : 0;
$answers = isset($input['answers']) && is_array($input['answers']) ? $input['answers'] : [];

if ($game_id <= 0 || empty($answers)) {
    jsonResponse(["success" => false, "error" => "Missing game_id or answers"]);
}

// get user id
$uid = null;
if (isset($user->_data['id'])) $uid = (int)$user->_data['id'];
elseif (isset($user->_data->id)) $uid = (int)$user->_data->id;
if (empty($uid)) jsonResponse(["success" => false, "error" => "User not identified"]);

$db->begin_transaction();
try {
    // We'll insert each provided answer into answers table
    $stmtSelect = $db->prepare("SELECT answer, mark FROM questions WHERE id = ?");
    $stmtInsert = $db->prepare("INSERT INTO answers (user_id, game_id, question_id, selected_option, is_correct, score_change, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");

    foreach ($answers as $ans) {
        // support both {question_id, selected_option} and raw option strings (if needed)
        if (!isset($ans['question_id'])) continue;
        $qId = (int)$ans['question_id'];
        $selected = isset($ans['selected_option']) ? $ans['selected_option'] : null;

        // fetch correct answer and mark
        $stmtSelect->bind_param("i", $qId);
        $stmtSelect->execute();
        $res = $stmtSelect->get_result();
        $q = $res->fetch_assoc();
        if (!$q) continue;

        $correct = $q['answer'];
        $mark = (int)$q['mark'];
        $isCorrect = ($selected !== null && trim($selected) === trim($correct)) ? 1 : 0;
        $scoreChange = $isCorrect ? $mark : ($selected === null ? 0 : -$mark);

        $stmtInsert->bind_param("iiisis", $uid, $game_id, $qId, $selected, $isCorrect, $scoreChange);
        $stmtInsert->execute();
    }

    $stmtInsert->close();
    $stmtSelect->close();

    $db->commit();
    jsonResponse(["success" => true]);

} catch (Exception $e) {
    $db->rollback();
    jsonResponse(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
}