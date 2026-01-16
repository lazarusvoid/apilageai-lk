<?php

require_once __DIR__.'/../../backend/bootstrap.php';
if(!$user->_logged_in){
    returnJSON(["e" => true, "m" => "You're not logged in"]);
}

switch($_GET["act"]){
    case "new":
        $user->new_message($_POST['m'], $_POST['t'], $_FILES['f'], $_POST['i']);
    break;
    case "delete":
        $user->delete_conversation(['id' => $_POST['i']]);
    break;
    case "message":
        $user->new_message($_POST['m'], $_POST['i']);
    break;
    case "get":
        $user->get_conversation($_POST['i'], true, explode(',', $_POST['m_ids']));
    break;
    default:
        http_response_code(404);
        exit;
    break;
}

?>