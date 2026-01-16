<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$user->_logged_in) {
    jsonResponse(["success" => false, "error" => "Unauthorized"]);
}

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$make_public = isset($_GET['public']) ? (int)$_GET['public'] : 0;
$user_id = (int)$user->_data['id'];

if (!$id) jsonResponse(["success" => false, "error" => "Invalid ID"]);

try {
    $stmt = $db->prepare("UPDATE generated_images SET public = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("iii", $make_public, $id, $user_id);
    $stmt->execute();
    if ($stmt->affected_rows > 0) {
        jsonResponse(["success" => true, "public" => $make_public]);
    } else {
        jsonResponse(["success" => false, "error" => "No permission or invalid image"]);
    }
} catch (Exception $e) {
    jsonResponse(["success" => false, "error" => $e->getMessage()]);
}