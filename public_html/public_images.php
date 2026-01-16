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

$page = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$per_page = 25;
$offset = ($page - 1) * $per_page;

try {
    $stmt = $db->prepare("
        SELECT g.id, g.image_url, g.prompt, g.author_name, g.likes, g.unlikes, g.generated_at,
               u.first_name, u.last_name
        FROM generated_images g
        JOIN users u ON u.id = g.user_id
        WHERE g.public = 1
        ORDER BY g.likes DESC, g.generated_at DESC
        LIMIT ? OFFSET ?
    ");
    $stmt->bind_param("ii", $per_page, $offset);
    $stmt->execute();
    $res = $stmt->get_result();
    $images = [];

    while ($row = $res->fetch_assoc()) {
        $images[] = [
            "id" => (int)$row["id"],
            "image_url" => $row["image_url"],
            "prompt" => $row["prompt"],
            "author_name" => $row["author_name"],
            "likes" => (int)$row["likes"],
            "unlikes" => (int)$row["unlikes"],
            "generated_at" => $row["generated_at"],
            "user_name" => trim($row["first_name"] . " " . $row["last_name"])
        ];
    }

    jsonResponse(["success" => true, "images" => $images]);
} catch (Exception $e) {
    jsonResponse(["success" => false, "error" => $e->getMessage()]);
}