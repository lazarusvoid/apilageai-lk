<?php
header('Content-Type: application/json');

// Read the JSON input
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['code'])) {
    echo json_encode(['error' => 'No code provided']);
    exit;
}

$code = $input['code'];

// Temp file to store the Python script
$tmpFile = tempnam(sys_get_temp_dir(), 'pycode_') . '.py';
file_put_contents($tmpFile, $code);

// Execute the Python code
$outputFile = tempnam(sys_get_temp_dir(), 'output_') . '.png';
$command = escapeshellcmd("python3 $tmpFile");
exec($command . " 2>&1", $output, $status);

// Clean up
unlink($tmpFile);

if ($status !== 0) {
    echo json_encode(['error' => implode("\n", $output)]);
    exit;
}

// If a graph was saved, return image HTML
$imagePath = '';
foreach ($output as $line) {
    if (preg_match('/(.*\.png)/', $line, $match)) {
        $imagePath = $match[1];
        break;
    }
}

if ($imagePath && file_exists($imagePath)) {
    $base64 = base64_encode(file_get_contents($imagePath));
    unlink($imagePath); // Delete after encoding
    echo json_encode([
        'output' => "<img src='data:image/png;base64,$base64' style='max-width:100%; border:1px solid #ccc;' />"
    ]);
} else {
    echo json_encode(['output' => implode("\n", $output)]);
}
?>