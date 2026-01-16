<?php
header('Content-Type: application/json');

// Allowed referrers (your site and trusted services)
$allowedReferrers = [
    'https://apilageai.lk',
    'https://www.apilageai.lk',
    'https://firebase.google.com',
    'https://www.googleapis.com'
];

// Get the Referer header
$referer = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : '';

// Check if the referer matches allowed domains
$accessAllowed = false;
foreach ($allowedReferrers as $allowed) {
    if (strpos($referer, $allowed) === 0) {
        $accessAllowed = true;
        break;
    }
}

// Deny access if not allowed
if (!$accessAllowed) {
    http_response_code(403); // Forbidden
    echo json_encode(["error" => "Access denied."]);
    exit;
}

// ------------------- Firebase Configuration -------------------
$firebaseConfig = [
    "apiKey" => "AIzaSyBY5gsQusKZ95Os3KoWvjauEMxGI8fBw3c",
    "authDomain" => "apilage-ai.firebaseapp.com",
    "databaseURL" => "https://apilage-ai-default-rtdb.firebaseio.com",
    "projectId" => "apilage-ai",
    "storageBucket" => "apilage-ai.firebasestorage.app",
    "messagingSenderId" => "902160013451",
    "appId" => "1:902160013451:web:498911915681b72ce25c8e",
    "measurementId" => "G-N7SRT0LHJV"
];

// ------------------- Gemini API Key -------------------
$geminiApiKey = "AIzaSyBjjzjDzp5ruIzuMg_FEJLjrmoOydsKSSg";

// ------------------- Return JSON -------------------
echo json_encode([
    "firebaseConfig" => $firebaseConfig,
    "geminiApiKey" => $geminiApiKey
]);
?>