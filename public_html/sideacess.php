<?php
// sideq.php

header('Content-Type: application/json');

// Your Firebase Realtime Database URL (no apiKey needed for read if rules allow)
$databaseURL = "https://apilage-ai-default-rtdb.firebaseio.com/";

// The node you want to fetch (root -> ".json" fetches all)
$node = ".json";

// Initialize cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $databaseURL . $node);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// If your database requires authentication, add auth like:
// curl_setopt($ch, CURLOPT_URL, $databaseURL . $node . "?auth=YOUR_DATABASE_SECRET");

$response = curl_exec($ch);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to connect to Firebase"]);
    exit;
}

curl_close($ch);

// Decode Firebase response
$data = json_decode($response, true);

// Show pretty JSON in browser
echo json_encode($data, JSON_PRETTY_PRINT);
?>