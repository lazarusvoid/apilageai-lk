<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json');

if (!$user->_logged_in) {
    echo json_encode(["success" => false, "error" => "Not logged in"]);
    exit;
}

$input = json_decode(file_get_contents("php://input"), true);
if (!$input) {
    echo json_encode(["success" => false, "error" => "Invalid input"]);
    exit;
}

$game_id = intval($input['game_id']);
$gamer_name = $db->real_escape_string($input['gamer_name']);

$stmt = $db->prepare("INSERT INTO game_players (game_id, user_id, gamer_name, submitted) VALUES (?, ?, ?, 0)");
$stmt->bind_param("iis", $game_id, $user->_data['id'], $gamer_name);
$stmt->execute();

echo json_encode(["success" => true, "player_id" => $db->insert_id]);
?>