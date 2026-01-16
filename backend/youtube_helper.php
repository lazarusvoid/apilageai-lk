<?php

function searchYouTube($query)
{
    $apiKey = "AIzaSyDLq2zrx9UbGUpgouo2ItfhEzaxQttYYkU"; // Replace this with your actual key
    $maxResults = 1;
    $query = urlencode($query);

    $url = "https://www.googleapis.com/youtube/v3/search?part=snippet&q={$query}&type=video&maxResults={$maxResults}&key={$apiKey}";

    $response = file_get_contents($url);
    $data = json_decode($response, true);

    if (!empty($data['items'])) {
        $videoId = $data['items'][0]['id']['videoId'];
        return "https://www.youtube.com/watch?v={$videoId}";
    }

    return null;
}