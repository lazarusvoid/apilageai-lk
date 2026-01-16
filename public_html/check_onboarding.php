<?php
require_once __DIR__ . "/../backend/bootstrap.php";
header('Content-Type: application/json');

if (!$user->_logged_in) {
    echo json_encode(['completed' => false]);
    exit();
}

$user_id = (int) $user->_data['id'];

// Check onboard_complete column in users table
$stmt = $db->prepare("SELECT onboard_complete FROM users WHERE id = ? LIMIT 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($onboard_complete);
$stmt->fetch();
$stmt->close();

echo json_encode(['completed' => $onboard_complete == 1]);
exit();
?>
