<?php
// get_questions.php
require_once __DIR__.'/../backend/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

$game_id = isset($_GET['game_id']) ? (int)$_GET['game_id'] : 0;
if ($game_id <= 0) {
    jsonResponse(["success" => false, "error" => "Missing or invalid game_id"]);
}

$stmt = $db->prepare("SELECT id, question, options, answer, explanation, mark FROM questions WHERE game_id = ?");
$stmt->bind_param("i", $game_id);
$stmt->execute();
$res = $stmt->get_result();
$rows = [];
while ($row = $res->fetch_assoc()) {
    // decode options JSON to array
    $opts = json_decode($row['options'], true);
    if (!is_array($opts)) $opts = [];
    $rows[] = [
        "id" => (int)$row['id'],
        "question" => $row['question'],
        "options" => $opts,
        "answer" => $row['answer'],
        "explanation" => $row['explanation'],
        "mark" => (int)$row['mark']
    ];
}
$stmt->close();

jsonResponse(["success" => true, "questions" => $rows]);