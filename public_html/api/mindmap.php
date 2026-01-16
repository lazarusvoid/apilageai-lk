<?php
header('Content-Type: application/json');

// --- Secure API Key ---
$GEMINI_API_KEY = "AIzaSyBjjzjDzp5ruIzuMg_FEJLjrmoOydsKSSg"; 
$API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={$GEMINI_API_KEY}";

// --- Read input ---
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['action']) || empty($input['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Action is required']);
    exit;
}

$action = $input['action'];
$prompt = '';

// --- Build prompt based on action ---
switch ($action) {
    case 'generate':
        if (!isset($input['text']) || empty($input['text'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Text is required for generation']);
            exit;
        }
        $text = $input['text'];
        $prompt = "From the following text, generate a complete, multi-level mind map structure as a valid, nested JSON object. Respond in the same language as the input text (e.g., if the text is in Sinhala, the output topics and notes must be in Sinhala).
        - The root object must have \"id\", \"topic\", \"note\", and an array of \"children\".
        - Each child object must also have \"id\", \"topic\", \"note\", and \"children\" (which can be an empty array).
        - Create a meaningful hierarchy with sub-nodes and sub-nodes of sub-nodes where appropriate.
        - IDs must be short, unique strings.
        - The \"topic\" should be a concise summary (1-4 words).
        - The \"note\" should be a one-sentence summary.
        - Do not output any text other than the single, complete JSON object.
        Text: \"{$text}\"";
        break;

    case 'develop':
        if (!isset($input['instruction']) || empty($input['instruction'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Instruction is required for development']);
            exit;
        }
        if (!isset($input['currentMap']) || empty($input['currentMap'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Current map is required for development']);
            exit;
        }
        $instruction = $input['instruction'];
        $currentMap = json_encode($input['currentMap'], JSON_PRETTY_PRINT);
        $prompt = "Based on the following instruction, develop the existing mind map JSON structure. You can add new nodes, sub-nodes, or modify existing ones. Return only the complete, updated JSON object. Do not add any other text.
        Instruction: \"{$instruction}\"
        Existing Mind Map:
        {$currentMap}";
        break;

    case 'addSubnodes':
        if (!isset($input['topic']) || empty($input['topic'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Topic is required for adding sub-nodes']);
            exit;
        }
        $topic = $input['topic'];
        $prompt = "Generate 2 to 3 sub-nodes for the topic \"{$topic}\". Return a valid JSON array of objects, where each object has \"id\", \"topic\", and \"note\". Make the IDs unique strings. Do not return any other text.";
        break;

    default:
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid action']);
        exit;
}

// --- Prepare request body ---
$requestBody = json_encode([
    "contents" => [
        ["parts" => [["text" => $prompt]]]
    ]
]);

// --- Send request to Gemini API ---
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $requestBody);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => curl_error($ch)]);
    curl_close($ch);
    exit;
}
curl_close($ch);

// --- Parse and extract text only ---
$responseData = json_decode($response, true);

if ($httpCode === 200 && 
    isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
    
    $textContent = $responseData['candidates'][0]['content']['parts'][0]['text'];
    
    // Return only the text content in generic format
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => $textContent,
        'timestamp' => time(),
        'request_id' => bin2hex(random_bytes(16))
    ]);
    
} else {
    // Generic error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Processing failed',
        'timestamp' => time()
    ]);
}