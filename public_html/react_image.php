<?php
require_once __DIR__.'/../backend/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://apilageai.lk');
header('Access-Control-Allow-Credentials: true');

function jsonResponse($arr) { echo json_encode($arr, JSON_UNESCAPED_UNICODE); exit; }

if (!$user->_logged_in) jsonResponse(["success" => false, "error" => "Unauthorized"]);

$user_id = (int)$user->_data['id'];
$image_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
$type = $_GET['type'] ?? '';

if (!$image_id || !in_array($type, ['like','unlike'])) {
    jsonResponse(["success" => false, "error" => "Invalid parameters"]);
}

try {
    // Check if user already reacted
    $check = $db->prepare("SELECT reaction FROM image_reactions WHERE user_id=? AND image_id=?");
    $check->bind_param("ii", $user_id, $image_id);
    $check->execute();
    $result = $check->get_result()->fetch_assoc();

    if ($result) {
        if ($result['reaction'] == $type) {
            // remove reaction
            $del = $db->prepare("DELETE FROM image_reactions WHERE user_id=? AND image_id=?");
            $del->bind_param("ii", $user_id, $image_id);
            $del->execute();

            // decrease count
            $field = $type == 'like' ? 'likes' : 'unlikes';
            $db->query("UPDATE generated_images SET $field = $field - 1 WHERE id=$image_id");
        } else {
            // switch reaction
            $old = $result['reaction'];
            $db->query("UPDATE image_reactions SET reaction='$type' WHERE user_id=$user_id AND image_id=$image_id");

            if ($old == 'like') {
                $db->query("UPDATE generated_images SET likes = likes - 1, unlikes = unlikes + 1 WHERE id=$image_id");
            } else {
                $db->query("UPDATE generated_images SET likes = likes + 1, unlikes = unlikes - 1 WHERE id=$image_id");
            }
        }
    } else {
        // new reaction
        $insert = $db->prepare("INSERT INTO image_reactions (user_id,image_id,reaction) VALUES (?,?,?)");
        $insert->bind_param("iis", $user_id, $image_id, $type);
        $insert->execute();
        $field = $type == 'like' ? 'likes' : 'unlikes';
        $db->query("UPDATE generated_images SET $field = $field + 1 WHERE id=$image_id");
    }

    // send updated counts
    $counts = $db->query("SELECT likes, unlikes FROM generated_images WHERE id=$image_id")->fetch_assoc();
    jsonResponse(["success" => true, "likes" => (int)$counts['likes'], "unlikes" => (int)$counts['unlikes']]);

} catch (Exception $e) {
    jsonResponse(["success" => false, "error" => $e->getMessage()]);
}