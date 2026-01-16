<?php

function searchImage($query)
{
    $apiKey = "7319fecaded04b774f68cd7f14589d0fa3c4df2e5360e3346ebe85b934a5f761"; // Use your actual SerpAPI key

    // List of unsafe or NSFW-related keywords to block
    $blockedKeywords = ['nude', 'xxx', 'porn', 'sex', 'nsfw', 'erotic', 'naked', 'hot girl', 'sexy'];

    // Check if query contains blocked words (case-insensitive)
    foreach ($blockedKeywords as $badWord) {
        if (stripos($query, $badWord) !== false) {
            return null; // Blocked query – return nothing
        }
    }

    // Use Google's SafeSearch via SerpAPI
    $searchUrl = "https://serpapi.com/search.json?q=" . urlencode($query) . "&tbm=isch&safe=active&api_key={$apiKey}";

    // Fetch the API response
    $response = file_get_contents($searchUrl);
    if (!$response) return null;

    $data = json_decode($response, true);
    if (empty($data['images_results'])) return null;

    // Iterate through results to find a safe image (optionally check image host)
    foreach ($data['images_results'] as $image) {
        if (!empty($image['original'])) {
            $imageUrl = $image['original'];

            // Optionally block known NSFW image hosts
            $blockedDomains = ['xvideos.com', 'pornhub.com', 'imgur.com']; // extend if needed
            $parsedUrl = parse_url($imageUrl);
            $host = $parsedUrl['host'] ?? '';

            foreach ($blockedDomains as $domain) {
                if (stripos($host, $domain) !== false) {
                    continue 2; // Skip this image
                }
            }

            return $imageUrl; // Return the first acceptable image
        }
    }

    return null; // No safe image found
}