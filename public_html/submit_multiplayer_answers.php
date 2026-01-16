<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents("php://input"), true);
if (!$input || empty($input['game_id']) || empty($input['player_id']) || empty($input['answers'])) {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$game_id = intval($input['game_id']);
$player_id = intval($input['player_id']);
$answers = $input['answers'];

try {
    $stmt = $db->prepare("SELECT id, answer, mark FROM questions WHERE game_id = ?");
    $stmt->execute([$game_id]);
    $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $score = 0;
    foreach ($questions as $index => $q) {
        $selected = $answers[$index] ?? '';
        $correct = ($selected === $q['answer']);
        $change = $correct ? intval($q['mark']) : -intval($q['mark']);
        $score += $change;

        $stmtAns = $db->prepare("INSERT INTO multiplayer_answers (game_id, player_id, question_id, selected_option, is_correct, score_change) VALUES (?, ?, ?, ?, ?, ?)");
        $stmtAns->execute([$game_id, $player_id, $q['id'], $selected, $correct ? 1 : 0, $change]);
    }

    $stmtScore = $db->prepare("UPDATE multiplayer_players SET score = ?, finished = 1, finished_at = NOW() WHERE id = ?");
    $stmtScore->execute([$score, $player_id]);

    echo json_encode(["success" => true, "score" => $score]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
}