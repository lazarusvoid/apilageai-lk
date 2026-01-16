<?php
require_once __DIR__ . "/../backend/bootstrap.php";
header('Content-Type: application/json');

if (!$user->_logged_in) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

$user_id = (int)$user->_data['id'];
$action = $_REQUEST['action'] ?? null;

// ----------- LOAD ACTION -----------
if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'load') {

    // Fetch user general info
    $stmt = $db->prepare("SELECT first_name, last_name, email, phone, memory FROM users WHERE id=?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $userData = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    // Fetch user preferences including school
    $stmt = $db->prepare("SELECT school, not_student, interests, preference FROM user_onboarding WHERE user_id=?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $prefData = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    $interests = $prefData['interests'] ? json_decode($prefData['interests'], true) : [];
    $preference = $prefData['preference'] ?? '';
    $school = $prefData['school'] ?? '';
    $not_student = $prefData['not_student'] ?? 0;

    // Fetch billing history
    $stmt = $db->prepare("SELECT invoice_id, amount, created_at, status_indicator FROM transactions WHERE user_id=? ORDER BY created_at DESC");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $billingResult = $stmt->get_result();
    $billing = [];
    while($row = $billingResult->fetch_assoc()){
        $billing[] = $row;
    }
    $stmt->close();

    echo json_encode([
        'success' => true,
        'user' => $userData,
        'school' => $school,
        'not_student' => $not_student,
        'interests' => $interests,
        'preference' => $preference,
        'billing' => $billing
    ]);
    exit();
}

// ----------- GENERAL SETTINGS UPDATE -----------
if ($action === 'general' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $first = trim($_POST['firstName'] ?? '');
    $last = trim($_POST['lastName'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');

    if ($first === '' || $last === '' || $email === '' || $phone === '') {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit();
    }

    $image_url = null;
    $photoUploading = false;
    if (!empty($_FILES['profilePhoto']['name'])) {
        $photoUploading = true;
        $uploadDir = __DIR__ . "/uploads/profile/";
        if (!file_exists($uploadDir)) mkdir($uploadDir, 0777, true);

        $fileExt = pathinfo($_FILES['profilePhoto']['name'], PATHINFO_EXTENSION);
        $fileName = "user_" . $user_id . "_" . time() . "." . $fileExt;
        $filePath = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['profilePhoto']['tmp_name'], $filePath)) {
            $image_url = "/uploads/profile/" . $fileName;
        }
    }

    if ($image_url) {
        $stmt = $db->prepare("UPDATE users SET first_name=?, last_name=?, email=?, phone=?, image=? WHERE id=?");
        $stmt->bind_param("sssssi", $first, $last, $email, $phone, $image_url, $user_id);
    } else {
        $stmt = $db->prepare("UPDATE users SET first_name=?, last_name=?, email=?, phone=? WHERE id=?");
        $stmt->bind_param("ssssi", $first, $last, $email, $phone, $user_id);
    }

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'photoUploading'=>$photoUploading]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update profile', 'photoUploading'=>$photoUploading]);
    }
    exit();
}

// ----------- PREFERENCE SETTINGS UPDATE -----------
if ($action === 'preferences' && $_SERVER['REQUEST_METHOD'] === 'POST') {

    $subjects_raw = $_POST['subjects'] ?? '[]';
    $subjects = json_decode($subjects_raw, true);
    $aiTone = trim($_POST['aiTone'] ?? '');
    $school = trim($_POST['school'] ?? '');
    $not_student = isset($_POST['not_student']) ? (int)$_POST['not_student'] : 0;

    // Enforce that only one can be selected: school or not_student
    if ($school && $not_student) {
        echo json_encode(['success' => false, 'message' => 'Select either School or Not a Student, not both.']);
        exit();
    }

    if (empty($subjects) || $aiTone === '') {
        echo json_encode(['success' => false, 'message' => 'All fields required']);
        exit();
    }

    $interests = json_encode($subjects);

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
    $stmt->bind_param("sisss", $user_id, $school, $not_student, $interests, $aiTone);

    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to update preferences']);
    }
    exit();
}

// ----------- CLEAR MEMORY -----------
if ($action === 'clearmemory' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $db->prepare("UPDATE users SET memory=NULL WHERE id=?");
    $stmt->bind_param("i", $user_id);
    $success = $stmt->execute();
    $stmt->close();
    echo json_encode(['success' => $success]);
    exit();
}

// ----------- INVALID REQUEST -----------
echo json_encode(['success' => false, 'message' => 'Invalid request']);
exit();
?>