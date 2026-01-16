<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json');

if (!$user->_logged_in) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input || empty($input['game_id']) || empty($input['name'])) {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$game_id = intval($input['game_id']);
$name = trim($input['name']);

try {
    // Check if game exists
    $check = $db->prepare("SELECT id FROM games WHERE id = ? AND mode = 'multi'");
    $check->execute([$game_id]);
    if ($check->rowCount() == 0) {
        echo json_encode(["success" => false, "error" => "Game not found"]);
        exit;
    }

    // Add player
    $stmt = $db->prepare("INSERT INTO multiplayer_players (game_id, user_id, name, joined_at) VALUES (?, ?, ?, NOW())");
    $stmt->execute([$game_id, $user->_data['id'], $name]);
    $player_id = $db->lastInsertId();

    echo json_encode([
        "success" => true,
        "game_id" => $game_id,
        "player_id" => $player_id
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Database error", "details" => $e->getMessage()]);
}