<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json');

$game_id = intval($_GET['game_id'] ?? 0);
if ($game_id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid game ID"]);
    exit;
}

try {
    $stmt = $db->prepare("SELECT id, user_id, name, score, finished FROM multiplayer_players WHERE game_id = ?");
    $stmt->execute([$game_id]);
    $players = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($players) < 2) {
        echo json_encode(["success" => true, "results" => $players, "message" => "Waiting for opponent"]);
        exit;
    }

    $results = [];
    foreach ($players as $p) {
        $stmtA = $db->prepare("SELECT question_id, selected_option FROM multiplayer_answers WHERE game_id = ? AND player_id = ? ORDER BY question_id ASC");
        $stmtA->execute([$game_id, $p['id']]);
        $answers = $stmtA->fetchAll(PDO::FETCH_ASSOC);
        $results[] = [
            "player_id" => $p['id'],
            "name" => $p['name'],
            "score" => intval($p['score'] ?? 0),
            "answers" => array_column($answers, 'selected_option')
        ];
    }

    echo json_encode(["success" => true, "results" => $results]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
}