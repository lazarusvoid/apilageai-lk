<?php
require_once __DIR__.'/../backend/bootstrap.php';

$do = $_GET['do'] ?? '';
$base_url = "https://apilageai.lk";

if ($do === "log" || $do === "reg") {
    if ($user->_logged_in) {
        header("Location: $base_url/app");
        exit;
    }
    $title = ($do === "log") ? "Login" : "Register";
    $page = ($do === "log") ? "login" : "register";
} elseif ($do === "out") {
    if (!$user->_logged_in) {
        header("Location: $base_url/auth/login");
        exit;
    }
    $user->sign_out();
    header("Location: $base_url/auth/login");
    exit;
} elseif ($do === "reset-request") {
    if ($user->_logged_in) {
        header("Location: $base_url/app");
        exit;
    }
    $title = "Password Reset Request";
    $page = "password_reset_request";
} elseif ($do === "reset-password") {
    $token = $_GET['token'] ?? '';
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Handle password reset submission
        $newPassword = $_POST['password'] ?? '';
        $result = $user->reset_password($token, $newPassword);
        $smarty->assign('result', $result);
    } else {
        // Verify token validity before showing form
        $result = $user->verify_reset_token($token);
        $smarty->assign('result', $result);
    }
    $title = "Reset Password";
    $page = "password_reset_form";
} elseif ($do === "google") {
    $user->google_sign_in();
    exit;
} elseif ($do === "google-callback") {
    $user->google_sign_in();
    exit;
} elseif ($do === "verify-email") {
    // Handle email verification
    $token = $_GET['token'] ?? '';
    $result = $user->verify_email($token);
    
    // Assign result to Smarty
    $smarty->assign('result', $result);
    
    // Set page variables
    $title = "Email Verification";
    $page = "email_verification";
    
    // IMPORTANT: Don't exit here - let it fall through to page_header/footer
} elseif ($do === "resend-verification") {
    // Handle resend verification email (AJAX endpoint)
    header('Content-Type: application/json');
    $email = $_POST['email'] ?? '';
    $user->resend_verification_email($email);
    exit;
} else {
    http_response_code(404);
    exit;
}

page_header("Apilage AI | $title");
page_footer($page);
?>