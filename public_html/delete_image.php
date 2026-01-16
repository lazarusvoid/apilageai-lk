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
$user_id = (int)$user->_data['id'];

if (!$id) jsonResponse(["success" => false, "error" => "Invalid ID"]);

try {
    // Get image URL to delete from disk
    $stmt = $db->prepare("SELECT image_url FROM generated_images WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $res = $stmt->get_result()->fetch_assoc();

    if (!$res) jsonResponse(["success" => false, "error" => "Not found or unauthorized"]);

    $imagePath = str_replace("https://apilageai.lk/", "../", $res['image_url']);
    if (file_exists($imagePath)) unlink($imagePath);

    // Delete DB record
    $stmt = $db->prepare("DELETE FROM generated_images WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();

    jsonResponse(["success" => true]);
} catch (Exception $e) {
    jsonResponse(["success" => false, "error" => $e->getMessage()]);
}