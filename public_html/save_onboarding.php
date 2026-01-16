<?php
require_once __DIR__ . "/../backend/bootstrap.php";
header('Content-Type: application/json');

if (!$user->_logged_in) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

$user_id = (int) $user->_data['id'];
$school = $data['school'] ?? null;
$not_student = isset($data['not_student']) ? (int)$data['not_student'] : 0;
$interests = $data['interests'] ?? '';
$preference = $data['preference'] ?? null;

// Insert or update in user_onboarding table
$stmt = $db->prepare("
    INSERT INTO user_onboarding (user_id, school, not_student, interests, preference, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, NOW(), NOW())
    ON DUPLICATE KEY UPDATE 
        school = VALUES(school),
        not_student = VALUES(not_student),
        interests = VALUES(interests),
        preference = VALUES(preference),
        updated_at = NOW()
");
$stmt->bind_param("isiss", $user_id, $school, $not_student, $interests, $preference);

if ($stmt->execute()) {
    // Mark onboard_complete in users table
    $update = $db->prepare("UPDATE users SET onboard_complete = 1 WHERE id = ?");
    $update->bind_param("i", $user_id);
    $update->execute();
    $update->close();

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to save onboarding data.']);
}

$stmt->close();
exit();
?>
