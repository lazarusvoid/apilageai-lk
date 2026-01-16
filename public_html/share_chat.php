<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require_once(__DIR__ . '/../backend/user.php');



header("Content-Type: application/json");

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["e" => true, "m" => "Invalid request method"]);
    exit;
}

// Read raw input and parse JSON
$data = json_decode(file_get_contents('php://input'), true);

// Validate input
if (!isset($data['id']) || !is_numeric($data['id'])) {
    echo json_encode(["e" => true, "m" => "Invalid or missing conversation ID"]);
    exit;
}

$user = new User();
$user->share_conversation((int)$data['id']);