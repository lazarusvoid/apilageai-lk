<?php
require_once __DIR__ . "/youtube_helper.php";
require_once __DIR__ . "/image_helper.php";

class User
{
    public $_logged_in = false;
    public $_data = [];

    private $_cookie_user_id = "APILAGE_AI_LK_USER_ID";
    private $_cookie_user_token = "APILAGE_AI_LK_TOKEN";

    public function __construct()
    {
        global $db, $date;

        if (
            isset($_COOKIE[$this->_cookie_user_id]) &&
            isset($_COOKIE[$this->_cookie_user_token])
        ) {
            $stmt = $db->prepare(
                "SELECT * FROM users JOIN sessions ON users.id = sessions.user_id WHERE users.id =? AND sessions.token =? AND sessions.active = '1'"
            );
            $stmt->bind_param(
                "is",
                $_COOKIE[$this->_cookie_user_id],
                $_COOKIE[$this->_cookie_user_token]
            );
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 1) {
                $this->_data = $result->fetch_assoc();
                $this->_logged_in = true;
                $stmt->close();

                $stmt = $db->prepare(
                    "UPDATE sessions SET last_seen =? WHERE user_id =? AND token =?"
                );
                $stmt->bind_param(
                    "sis",
                    $date,
                    $_COOKIE[$this->_cookie_user_id],
                    $_COOKIE[$this->_cookie_user_token]
                );
                $stmt->execute();
                $stmt->close();
            } else {
                $stmt->close();
                $this->unset_cookies();
            }
        }
    }

    function get_unique_media_prefix()
    {
        return "ApilageAI_t_" . time() . "_t_tk_" . get_hash_token();
    }

    // NEW: Generate verification token
    private function generate_verification_token()
    {
        return bin2hex(random_bytes(32));
    }

    // NEW: Send verification email
    private function send_verification_email($email, $firstName, $token)
    {
        $verificationLink =
            "https://apilageai.lk/auth/verify-email?token=" . urlencode($token);

        $body = get_email_template("email_verification", [
            "name" => $firstName,
            "verification_link" => $verificationLink,
        ]);

        return _email($email, "Verify Your Email - Apilage AI", $body);
    }

    // UPDATED: Sign in with email verification check
    public function sign_in($data = [])
    {
        global $db;

        if ($this->_logged_in) {
            returnJSON(["e" => true, "m" => "You're already logged in"]);
        }

        if (empty(trim($data["captcha"]))) {
            returnJSON(["e" => true, "m" => "Invalid credentials"]);
        }

        if (!captchaVerify($data["captcha"])) {
            returnJSON(["e" => true, "m" => "Captcha validation failed"]);
        }

        $fields = [
            "email" => ["Email", FILTER_VALIDATE_EMAIL, "valid email"],
            "password" => ["Password"],
        ];

        $error = validateFields($data, $fields);

        if ($error) {
            returnJSON(["e" => true, "m" => $error]);
        }

        $stmt = $db->prepare(
            "SELECT password, id, email_verified, first_name FROM users WHERE email =?"
        );
        $stmt->bind_param("s", $data["email"]);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($row = $result->fetch_assoc()) {
            if (password_verify($data["password"], $row["password"])) {
                // Check if email is verified
                if ($row["email_verified"] == 0) {
                    $stmt->close();
                    returnJSON([
                        "e" => true,
                        "m" =>
                            "Please verify your email address before signing in. Check your inbox for the verification link.",
                        "resend" => true,
                        "email" => $data["email"],
                    ]);
                }

                $this->create_session($row["id"]);
                $stmt->close();
                returnJSON(["e" => false]);
            } else {
                $stmt->close();
                returnJSON(["e" => true, "m" => "Invalid Password"]);
            }
        } else {
            $stmt->close();
            returnJSON(["e" => true, "m" => "Invalid Email"]);
        }
    }

    // UPDATED: Sign up with email verification
    public function sign_up($data = [])
    {
        global $db, $date;

        if ($this->_logged_in) {
            returnJSON(["e" => true, "m" => "You're already logged in"]);
        }

        if (empty(trim($data["captcha"]))) {
            returnJSON(["e" => true, "m" => "Invalid credentials"]);
        }

        if (!captchaVerify($data["captcha"])) {
            returnJSON(["e" => true, "m" => "Captcha validation failed"]);
        }

        $fields = [
            "firstName" => ["First Name", "/^[a-zA-Z\s]+$/", "letters only"],
            "lastName" => ["Last Name", "/^[a-zA-Z\s]+$/", "letters only"],
            "email" => ["Email", FILTER_VALIDATE_EMAIL, "valid email"],
            "phone" => ["Phone", "/^\d+$/", "numbers only"],
            "password" => [
                "Password",
                '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/',
                "at least 8 characters long, with one uppercase letter, one lowercase letter, one number, and one special character",
            ],
        ];

        $error = validateFields($data, $fields);

        if ($error) {
            returnJSON(["e" => true, "m" => $error]);
        }

        checkExists(
            $db,
            "users",
            "email",
            $data["email"],
            "Email is already being used",
            true
        );

        if (
            is_empty($data["image"]["tmp_name"]) &&
            !is_empty($_SESSION["gb_auth"]["picture"])
        ) {
            $imagePrefix = $this->get_unique_media_prefix();
            $data["image"] = save_picture_from_url(
                $_SESSION["gb_auth"]["picture"],
                $imagePrefix,
                "low"
            );
        } elseif (!is_empty($data["image"]["tmp_name"])) {
            require_once __DIR__ . "/class-image.php";
            $image = new Image($data["image"]["tmp_name"]);
            $image_name = $this->get_unique_media_prefix() . $image->_img_ext;
            $path = __DIR__ . "/../public_html/uploads/" . $image_name;
            $image->save($path, "low");
            $data["image"] = $image_name;
        }

        // Generate verification token
        $verificationToken = $this->generate_verification_token();
        $tokenExpires = date("Y-m-d H:i:s", strtotime("+24 hours"));

        $data["password"] = _password_hash($data["password"]);
        $stmt = $db->prepare(
            "INSERT INTO users (first_name, last_name, email, phone, image, password, email_verified, verification_token, verification_token_expires, reg_date) VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)"
        );
        $stmt->bind_param(
            "ssssissss",
            $data["firstName"],
            $data["lastName"],
            $data["email"],
            $data["phone"],
            $data["image"],
            $data["password"],
            $verificationToken,
            $tokenExpires,
            $date
        );
        $stmt->execute();
        $userId = $db->insert_id;
        $stmt->close();

        if (!is_empty($_SESSION["gb_auth"])) {
            if (!is_empty($_SESSION["gb_auth"]["user_id"])) {
                $stmt = $db->prepare(
                    "INSERT INTO gb_auth (user_id, auth) VALUES (?, ?)"
                );
                $stmt->bind_param(
                    "is",
                    $userId,
                    $_SESSION["gb_auth"]["user_id"]
                );
                $stmt->execute();
                $stmt->close();
            }
            unset($_SESSION["gb_auth"]);
        }

        // Send verification email
        $emailSent = $this->send_verification_email(
            $data["email"],
            $data["firstName"],
            $verificationToken
        );

        if (!$emailSent) {
            error_log(
                "Failed to send verification email to: " . $data["email"]
            );
        }

        // CHANGED: Return success with email info instead of creating session
        returnJSON([
            "e" => false,
            "m" =>
                "Registration successful! Please check your email to verify your account.",
            "email" => $data["email"],
            "verify_required" => true,
        ]);
    }

    // NEW: Verify email with token
    public function verify_email($token)
    {
        global $db, $date;

        if (empty($token)) {
            return ["e" => true, "m" => "Invalid verification token"];
        }

        $stmt = $db->prepare(
            "SELECT id, first_name, email, email_verified, verification_token_expires FROM users WHERE verification_token = ? LIMIT 1"
        );
        $stmt->bind_param("s", $token);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $stmt->close();
            return ["e" => true, "m" => "Invalid verification token"];
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        // Check if already verified
        if ($user["email_verified"] == 1) {
            return [
                "e" => false,
                "m" => "Email already verified. You can now sign in.",
                "already_verified" => true,
            ];
        }

        // Check if token expired
        if (strtotime($user["verification_token_expires"]) < time()) {
            return [
                "e" => true,
                "m" =>
                    "Verification link has expired. Please request a new one.",
                "expired" => true,
            ];
        }

        // Verify the email
        $stmt = $db->prepare(
            "UPDATE users SET email_verified = 1, verification_token = NULL, verification_token_expires = NULL WHERE id = ?"
        );
        $stmt->bind_param("i", $user["id"]);
        $success = $stmt->execute();
        $stmt->close();

        if ($success) {
            // Send welcome email
            $body = get_email_template("welcome", [
                "name" => $user["first_name"],
            ]);
            _email($user["email"], "Welcome to Apilage AI!", $body);

            return [
                "e" => false,
                "m" => "Email verified successfully! You can now sign in.",
            ];
        } else {
            return [
                "e" => true,
                "m" => "Failed to verify email. Please try again.",
            ];
        }
    }

    // NEW: Resend verification email
    public function resend_verification_email($email)
    {
        global $db;

        if (empty($email)) {
            returnJSON(["e" => true, "m" => "Email is required"]);
        }

        $stmt = $db->prepare(
            "SELECT id, first_name, email_verified FROM users WHERE email = ? LIMIT 1"
        );
        $stmt->bind_param("s", $email);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $stmt->close();
            returnJSON(["e" => true, "m" => "Email not found"]);
        }

        $user = $result->fetch_assoc();
        $stmt->close();

        if ($user["email_verified"] == 1) {
            returnJSON(["e" => true, "m" => "Email is already verified"]);
        }

        // Generate new token
        $verificationToken = $this->generate_verification_token();
        $tokenExpires = date("Y-m-d H:i:s", strtotime("+24 hours"));

        $stmt = $db->prepare(
            "UPDATE users SET verification_token = ?, verification_token_expires = ? WHERE id = ?"
        );
        $stmt->bind_param(
            "ssi",
            $verificationToken,
            $tokenExpires,
            $user["id"]
        );
        $stmt->execute();
        $stmt->close();

        // Send verification email
        $emailSent = $this->send_verification_email(
            $email,
            $user["first_name"],
            $verificationToken
        );

        if ($emailSent) {
            returnJSON([
                "e" => false,
                "m" => "Verification email sent! Please check your inbox.",
            ]);
        } else {
            returnJSON([
                "e" => true,
                "m" =>
                    "Failed to send verification email. Please try again later.",
            ]);
        }
    }

    // UPDATED: Google sign-in (auto-verify email)
    public function google_sign_in()
    {
        global $db, $date;

        if ($this->_logged_in) {
            header("Location: https://apilageai.lk/app");
            exit();
        }

        $client = new Google_Client();
        $client->setClientId(
            "902160013451-vfbr84rg6kaut15jc38im0fl79fskukj.apps.googleusercontent.com"
        );
        $client->setClientSecret("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");
        $client->setRedirectUri("https://apilageai.lk/auth/google-callback");
        $client->addScope("email");
        $client->addScope("profile");

        if (isset($_GET["code"])) {
            try {
                $token = $client->fetchAccessTokenWithAuthCode($_GET["code"]);

                if (isset($token["error"])) {
                    throw new Exception($token["error_description"]);
                }

                $client->setAccessToken($token);
                $oauth = new Google_Service_Oauth2($client);
                $userInfo = $oauth->userinfo->get();

                $googleId = $userInfo->id;
                $email = $userInfo->email;
                $firstName = $userInfo->givenName;
                $lastName = $userInfo->familyName;
                $picture = $userInfo->picture;

                $stmt = $db->prepare(
                    "SELECT user_id FROM google_auth WHERE google_id = ? LIMIT 1"
                );
                $stmt->bind_param("s", $googleId);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows === 1) {
                    $row = $result->fetch_assoc();
                    $stmt->close();
                    $this->create_session($row["user_id"]);
                    header("Location: https://apilageai.lk/app");
                    exit();
                } else {
                    $stmt->close();

                    $stmt = $db->prepare(
                        "SELECT id FROM users WHERE email = ? LIMIT 1"
                    );
                    $stmt->bind_param("s", $email);
                    $stmt->execute();
                    $result = $stmt->get_result();

                    if ($result->num_rows === 1) {
                        $row = $result->fetch_assoc();
                        $userId = $row["id"];
                        $stmt->close();

                        // Auto-verify email for Google sign-in
                        $stmt = $db->prepare(
                            "UPDATE users SET email_verified = 1 WHERE id = ?"
                        );
                        $stmt->bind_param("i", $userId);
                        $stmt->execute();
                        $stmt->close();

                        $stmt = $db->prepare(
                            "INSERT INTO google_auth (user_id, google_id, google_email) VALUES (?, ?, ?)"
                        );
                        $stmt->bind_param("iss", $userId, $googleId, $email);
                        $stmt->execute();
                        $stmt->close();

                        $this->create_session($userId);
                        header("Location: https://apilageai.lk/app");
                        exit();
                    } else {
                        $stmt->close();

                        $imageName = null;
                        if ($picture) {
                            $imagePrefix = $this->get_unique_media_prefix();
                            $imageName = save_picture_from_url(
                                $picture,
                                $imagePrefix,
                                "low"
                            );
                        }

                        $randomPassword = _password_hash(
                            bin2hex(random_bytes(16))
                        );
                        $phone = 0;

                        // Auto-verify email for Google sign-in users
                        $stmt = $db->prepare(
                            "INSERT INTO users (first_name, last_name, email, phone, image, password, email_verified, reg_date) VALUES (?, ?, ?, ?, ?, ?, 1, ?)"
                        );
                        $stmt->bind_param(
                            "sssisss",
                            $firstName,
                            $lastName,
                            $email,
                            $phone,
                            $imageName,
                            $randomPassword,
                            $date
                        );
                        $stmt->execute();
                        $userId = $db->insert_id;
                        $stmt->close();

                        $stmt = $db->prepare(
                            "INSERT INTO google_auth (user_id, google_id, google_email) VALUES (?, ?, ?)"
                        );
                        $stmt->bind_param("iss", $userId, $googleId, $email);
                        $stmt->execute();
                        $stmt->close();

                        $this->create_session($userId);
                        header("Location: https://apilageai.lk/app");
                        exit();
                    }
                }
            } catch (Exception $e) {
                error_log("Google Sign-In Error: " . $e->getMessage());
                header(
                    "Location: https://apilageai.lk/auth/login?error=google_auth_failed"
                );
                exit();
            }
        } else {
            $authUrl = $client->createAuthUrl();
            header("Location: " . $authUrl);
            exit();
        }
    }

    function g_register($auth_key)
    {
        global $db, $smarty;
        require_once __DIR__ . "/includes/libs/globbook_auth.php";

        if ($this->_logged_in) {
            returnJSON(["e" => true, "m" => "You're already logged in"]);
        }

        try {
            $GlobbookAuth = new GlobbookAuthAPI(
                "56532326578385",
                "17f928533a1bc1a580320080cdba8067"
            );
            $GlobbookAuth->authenticate($auth_key);
            $profile = $GlobbookAuth->getUserInfo();

            $stmt = $db->prepare(
                "SELECT user_id FROM gb_auth WHERE auth = ? LIMIT 1"
            );
            $stmt->bind_param("s", $profile->user_id);
            $stmt->execute();
            $result = $stmt->get_result();
            if ($result->num_rows === 1) {
                $val = $result->fetch_assoc();
                $this->create_session($val["user_id"]);
                header("Location: https://apilageai.lk/app");
                exit();
            } else {
                $_SESSION["gb_auth"] = [
                    "user_id" => $profile->user_id,
                    "picture" => $profile->picture,
                ];
                $smarty->assign("view", "register");
                $smarty->assign("profile", $profile);
                page_header("Apilage AI | Register");
                page_footer("register");
                exit();
            }
            $stmt->close();
        } catch (Exception $e) {
            unset($_SESSION["gb_auth"]);
            echo "Authentication failed";
        }
    }

    public function create_session(int $userId)
    {
        global $db, $date;

        $session_token = get_hash_token();
        $expire = time() + 31536000;
        $ip = get_user_ip();
        $client = $_SERVER["HTTP_USER_AGENT"];

        $stmt = $db->prepare(
            "INSERT INTO sessions (user_id, token, ip, client, start, last_seen) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param(
            "isssss",
            $userId,
            $session_token,
            $ip,
            $client,
            $date,
            $date
        );
        $stmt->execute();
        $stmt->close();

        setSecureCookie($this->_cookie_user_id, $userId, $expire, "/");
        setSecureCookie(
            $this->_cookie_user_token,
            $session_token,
            $expire,
            "/"
        );

        $stmt = $db->prepare(
            "SELECT first_name, last_name, email FROM users WHERE id = ?"
        );
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            $body = get_email_template("new_device_signin", [
                "name" => "{$user["first_name"]} {$user["last_name"]}",
                "device" => user_agent_array($client),
                "ip" => $ip,
            ]);
            _email($user["email"], "New Device Sign-in", $body);
        }
        $stmt->close();
    }

    public function sign_out()
    {
        global $db;

        $stmt = $db->prepare(
            "UPDATE sessions SET active = '0' WHERE user_id =? AND token =?"
        );
        $stmt->bind_param(
            "is",
            $_COOKIE[$this->_cookie_user_id],
            $_COOKIE[$this->_cookie_user_token]
        );
        $stmt->execute();
        $stmt->close();

        $this->unset_cookies();
    }

// Generate secure token for reset
private function generate_reset_token()
{
    return bin2hex(random_bytes(32));
}

// Send password reset email
private function send_password_reset_email($email, $firstName, $token)
{
    $resetLink = "https://apilageai.lk/auth/reset-password?token=" . urlencode($token);

    $body = get_email_template("password_reset", [
        "name" => $firstName,
        "reset_link" => $resetLink
    ]);

    return _email($email, "Password Reset Request - Apilage AI", $body);
}

// Request password reset: create token, save, send email
public function request_password_reset($email)
{
    global $db;

    $stmt = $db->prepare("SELECT id, first_name FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        return ["e" => true, "m" => "Email not found"];
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    $token = $this->generate_reset_token();
    $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    $stmt = $db->prepare("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?");
    $stmt->bind_param("ssi", $token, $expires, $user['id']);
    $stmt->execute();
    $stmt->close();

    $send = $this->send_password_reset_email($email, $user['first_name'], $token);

    if ($send) {
        return ["e" => false, "m" => "Password reset instructions sent to your email"];
    } else {
        return ["e" => true, "m" => "Failed to send reset email. Please try again later."];
    }
}

// Verify reset token validity
public function verify_reset_token($token)
{
    global $db;

    if (empty($token)) {
        return ["e" => true, "m" => "Invalid reset token"];
    }

    $stmt = $db->prepare("SELECT id, reset_token_expires FROM users WHERE reset_token = ? LIMIT 1");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        $stmt->close();
        return ["e" => true, "m" => "Invalid reset token"];
    }

    $user = $result->fetch_assoc();
    $stmt->close();

    if (strtotime($user['reset_token_expires']) < time()) {
        return ["e" => true, "m" => "Reset token expired"];
    }

    return ["e" => false, "user_id" => $user['id']];
}

// Reset password using a valid token
public function reset_password($token, $newPassword)
{
    global $db;

    $verification = $this->verify_reset_token($token);

    if ($verification['e']) {
        return $verification;
    }

    $userId = $verification['user_id'];
    $hashedPassword = _password_hash($newPassword);

    $stmt = $db->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?");
    $stmt->bind_param("si", $hashedPassword, $userId);
    $success = $stmt->execute();
    $stmt->close();

    if ($success) {
        return ["e" => false, "m" => "Password reset successful"];
    } else {
        return ["e" => true, "m" => "Failed to reset password"];
    }
}

    public function unset_cookies()
    {
        session_destroy();
        unset($_COOKIE[$this->_cookie_user_id]);
        unset($_COOKIE[$this->_cookie_user_token]);
        setSecureCookie($this->_cookie_user_id, "", -1, "/");
        setSecureCookie($this->_cookie_user_token, "", -1, "/");
    }

    public function conversation_exists($id): bool
    {
        global $db;

        $stmt = $db->prepare(
            "SELECT 1 FROM conversations WHERE user_id = ? AND conversation_id = ? LIMIT 1"
        );
        $stmt->bind_param("ii", $this->_data["user_id"], $id);
        $stmt->execute();
        return $stmt->get_result()->num_rows > 0;
        $stmt->close();
    }

    public function get_conversations(): array
    {
        global $db;

        $stmt = $db->prepare(
            "SELECT conversation_id, title FROM conversations WHERE user_id = ?"
        );
        $stmt->bind_param("i", $this->_data["user_id"]);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
    }
}
?>