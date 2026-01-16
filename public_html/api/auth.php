<?php
require_once __DIR__.'/../../backend/bootstrap.php';

switch($_GET["act"]){
    case "login":
        $user->sign_in([
                "email" => $_POST["e"],
                "password" => $_POST["p"],
                "captcha" => $_POST['g-recaptcha-response']
            ]);
    break;
    case "register":
        $user->sign_up([
                "firstName" => $_POST["f"],
                "lastName" => $_POST["l"],
                "email" => $_POST["e"],
                "phone" => $_POST["t"],
                "password" => $_POST["p"],
                "image" => $_FILES['i'],
                "captcha" => $_POST['g-recaptcha-response']
            ]);
    break;
    default:
        http_response_code(404);
        exit;
    break;
}

?>