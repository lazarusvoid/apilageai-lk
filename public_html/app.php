<?php
require_once __DIR__ . "/../backend/bootstrap.php";

if (!$user->_logged_in) {
    header("Location: https://apilageai.lk/auth/login");
    exit();
}

$title = "";

switch ($_GET["view"]) {
    case "":
        if (isset($_GET['uid']) || isset($_['statusIndicator'])) {
            header("Location: https://apilageai.lk/app");
            exit(); // Important: stop script execution after redirect
        }
        $title = " | Playground";
        break;
    case "chat":
        // IMPORTANT:
        // Shared chats may not be owned by the current user, so we must allow
        // rendering the chat page shell for any numeric conversation id.
        // The Node backend (Socket.IO / APIs) remains the source of truth for access control.
        if (!is_empty($_GET["sub_view"]) && is_numeric($_GET["sub_view"])) {
            $smarty->assign("old_chat", "true");
            if (isset($_GET['share']) && !is_empty($_GET['share'])) {
                $smarty->assign('share_token', trim((string)$_GET['share']));
            }
        } else {
            http_response_code(404);
            exit();
        }
        break;
    default:
        http_response_code(404);
        exit();
        break;
}

$smarty->assign("view", $_GET["view"]);
$smarty->assign("sub_view", $_GET["sub_view"]);
$smarty->assign("conversations", $user->get_conversations());

page_header("Apilage AI $title");
page_footer("app");
?>
