<?php
// get_results.php
require_once __DIR__.'/../backend/bootstrap.php';

header('Content-Type: application/json; charset=utf-8');
function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

$game_id = isset($_GET['game_id']) ? (int)$_GET['game_id'] : 0;
$user_id = isset($_GET['user_id']) ? (int)$_GET['user_id'] : 0;

// if user_id not provided, use current user if logged in
if ($user_id <= 0) {
    if (isset($user) && $user->_logged_in) {
        if (isset($user->_data['id'])) $user_id = (int)$user->_data['id'];
        elseif (isset($user->_data->id)) $user_id = (int)$user->_data->id;
    }
}

if ($game_id <= 0 || $user_id <= 0) {
    jsonResponse(["success" => false, "error" => "Missing game_id or user_id"]);
}

// sum score_change
$stmt = $db->prepare("SELECT IFNULL(SUM(score_change),0) AS total_score FROM answers WHERE user_id = ? AND game_id = ?");
$stmt->bind_param("ii", $user_id, $game_id);
$stmt->execute();
$res = $stmt->get_result();
$row = $res->fetch_assoc();
$score = isset($row['total_score']) ? (int)$row['total_score'] : 0;
$stmt->close();

// fetch per-question answers
$stmt2 = $db->prepare("SELECT question_id, selected_option, is_correct, score_change FROM answers WHERE user_id = ? AND game_id = ?");
$stmt2->bind_param("ii", $user_id, $game_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$answers = [];
while ($r = $res2->fetch_assoc()) {
    $answers[] = [
        "question_id" => (int)$r['question_id'],
        "selected_option" => $r['selected_option'],
        "is_correct" => (int)$r['is_correct'],
        "score_change" => (int)$r['score_change']
    ];
}
$stmt2->close();

jsonResponse(["success" => true, "score" => $score, "answers" => $answers]);