<?php
require_once __DIR__ . "/../backend/bootstrap.php";
header('Content-Type: application/json');

// ✅ Must be logged in
if (!$user->_logged_in) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit();
}

$user_id = (int) $user->_data['id'];
$action = $_GET['action'] ?? null;

try {
    if ($action === 'get') {
        // Fetch notifications for logged-in user
        $stmt = $db->prepare("
            SELECT id, message, is_read, created_at 
            FROM notific 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        $notifications = $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        echo json_encode($notifications);
        exit();
    }

    if ($action === 'delete' && isset($_GET['id'])) {
        $id = (int) $_GET['id'];
        $stmt = $db->prepare("DELETE FROM notific WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Notification deleted']);
        exit();
    }

    if ($action === 'clear') {
        $stmt = $db->prepare("DELETE FROM notific WHERE user_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'All notifications cleared']);
        exit();
    }

    if ($action === 'add') {
        // Add new notification (POST JSON: { "message": "your text" })
        $data = json_decode(file_get_contents("php://input"), true);
        $message = $data['message'] ?? '';

        if (trim($message) === '') {
            echo json_encode(['success' => false, 'message' => 'Message cannot be empty']);
            exit();
        }

        $stmt = $db->prepare("INSERT INTO notific (user_id, message, is_read, created_at) VALUES (?, ?, 0, NOW())");
        $stmt->bind_param("is", $user_id, $message);
        $stmt->execute();
        $stmt->close();

        echo json_encode(['success' => true, 'message' => 'Notification added']);
        exit();
    }

    // Default response if invalid action
    echo json_encode(['success' => false, 'message' => 'Invalid action']);

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
exit();