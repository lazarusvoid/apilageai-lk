<?php
require_once __DIR__.'/../backend/bootstrap.php';

if (!$user->_logged_in) {
    header("Location: https://apilageai.lk/auth/login");
    exit;
}

$title = "";

switch($_GET["view"]){
    case "":
        $title = " | My Gallery Ai genrated Images";
    break;
    case "usage":   
        $stmt = $db->prepare("SELECT balance, ROUND(IFNULL(COUNT(DISTINCT c.conversation_id) / GREATEST(DATEDIFF(CURDATE(), MIN(c.created_at)), 1), 0)) AS conversations_count, COUNT(m.message_id) AS messages_count FROM users u LEFT JOIN conversations c ON c.user_id = u.id LEFT JOIN messages m ON m.conversation_id = c.conversation_id WHERE u.id = ? GROUP BY u.id");
        $stmt->bind_param("i", $user->_data['id']);
        $stmt->execute();
        $result = $stmt->get_result();
        $val = $result->fetch_assoc();

        $smarty->assign('current_balance', $val['balance']);
        $smarty->assign('messages_count', $val['messages_count']);
        $smarty->assign('conversations_count', $val['conversations_count']);

        $title = " | Dashboard - Usage";
    break;
    case "profile":
        $title = " | Dashboard - Profile";
    break;
    default: 
        http_response_code(404);
        exit;
    break;
}

$smarty->assign("view", $_GET["view"]);

page_header("Apilage AI $title");
page_footer('dashboard');
?>