<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://apilageai.lk');
header('Access-Control-Allow-Credentials: true');

function jsonResponse($arr) {
    echo json_encode($arr, JSON_UNESCAPED_UNICODE);
    exit;
}

if (!$user->_logged_in) {
    jsonResponse(["success" => false, "error" => "Unauthorized"]);
}

$user_id = (int)$user->_data['id'];
$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$per_page = 25;
$offset = ($page - 1) * $per_page;

try {
    $stmt = $db->prepare("
        SELECT id, image_url, prompt, author_name, public, likes, unlikes, generated_at
        FROM generated_images
        WHERE user_id = ?
        ORDER BY generated_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bind_param("iii", $user_id, $per_page, $offset);
    $stmt->execute();
    $res = $stmt->get_result();
    $images = [];

    while ($row = $res->fetch_assoc()) {
        $images[] = [
            "id" => (int)$row["id"],
            "image_url" => $row["image_url"],
            "prompt" => $row["prompt"],
            "author_name" => $row["author_name"],
            "public" => (int)$row["public"],
            "likes" => (int)$row["likes"],
            "unlikes" => (int)$row["unlikes"],
            "generated_at" => $row["generated_at"]
        ];
    }

    jsonResponse(["success" => true, "images" => $images]);
} catch (Exception $e) {
    jsonResponse(["success" => false, "error" => $e->getMessage()]);
}