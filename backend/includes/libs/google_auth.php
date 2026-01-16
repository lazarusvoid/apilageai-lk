<?php
require_once __DIR__.'/../../backend/bootstrap.php';

use League\OAuth2\Client\Provider\Google;

switch ($_GET["act"] ?? '') {
    case "login":
        $user->sign_in([
            "email"   => $_POST["e"] ?? '',
            "password"=> $_POST["p"] ?? '',
            "captcha" => $_POST['g-recaptcha-response'] ?? ''
        ]);
    break;

    case "register":
        $user->sign_up([
            "firstName" => $_POST["f"] ?? '',
            "lastName"  => $_POST["l"] ?? '',
            "email"     => $_POST["e"] ?? '',
            "phone"     => $_POST["t"] ?? '',
            "password"  => $_POST["p"] ?? '',
            "image"     => $_FILES['i'] ?? null,
            "captcha"   => $_POST['g-recaptcha-response'] ?? ''
        ]);
    break;

    case "google":
        // Google OAuth setup
        $provider = new Google([
            'clientId'     => 'YOUR_GOOGLE_CLIENT_ID',
            'clientSecret' => 'YOUR_GOOGLE_CLIENT_SECRET',
            'redirectUri'  => 'https://apilageai.lk/api/auth/index.php?act=google_callback',
        ]);

        if (!isset($_GET['code'])) {
            $authUrl = $provider->getAuthorizationUrl();
            $_SESSION['oauth2state'] = $provider->getState();
            header('Location: ' . $authUrl);
            exit;
        }
    break;

    case "google_callback":
        $provider = new Google([
            'clientId'     => 'YOUR_GOOGLE_CLIENT_ID',
            'clientSecret' => 'YOUR_GOOGLE_CLIENT_SECRET',
            'redirectUri'  => 'https://apilageai.lk/api/auth/index.php?act=google_callback',
        ]);

        if (empty($_GET['state']) || ($_GET['state'] !== $_SESSION['oauth2state'])) {
            unset($_SESSION['oauth2state']);
            exit('Invalid Google state');
        }

        try {
            $token = $provider->getAccessToken('authorization_code', [
                'code' => $_GET['code']
            ]);

            $googleUser = $provider->getResourceOwner($token);

            $email = $googleUser->getEmail();
            $firstName = $googleUser->getFirstName();
            $lastName = $googleUser->getLastName();
            $avatar = $googleUser->getAvatar();

            // Check if user exists
            $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            $row = $stmt->fetch();

            if (!$row) {
                // Register Google user
                $user->sign_up([
                    "firstName" => $firstName,
                    "lastName"  => $lastName,
                    "email"     => $email,
                    "phone"     => '',
                    "password"  => '', // No password needed
                    "image"     => $avatar,
                    "captcha"   => '' // skip captcha for OAuth
                ]);
                $userId = $db->lastInsertId();
            } else {
                $userId = $row['id'];
            }

            // Login session
            $_SESSION['user_id'] = $userId;
            header("Location: https://apilageai.lk/app");
            exit;

        } catch (Exception $e) {
            exit('Google login failed: ' . $e->getMessage());
        }
    break;

    default:
        http_response_code(404);
        exit;
    break;
}
