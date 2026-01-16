<?php
require_once __DIR__.'/../backend/bootstrap.php';

$do = $_GET['do'];

switch ($do) {
    case "connect":
        if(empty($_GET['auth_key'])){
            echo "Something went wrong";
            exit;
        }
        $user->g_register($_GET['auth_key']);
    break;
    default:
        http_response_code(404);
        exit;
    break;
}
?>