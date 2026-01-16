<?php
/**
 * get_hash_number
 * 
 * @return string
 */
function get_hash_number() {
    return time()*rand(1, 99999);
}

/**
 * Check if a value is empty (including whitespace and non-breaking spaces) or an empty array.
 *
 * @param mixed $value The value to check.
 * @return bool True if the value is empty, false otherwise.
 */
function is_empty(mixed $value): bool {
    if (is_null($value)) {
        return true;
    }

    if (is_string($value)) {
        // Replace non-breaking spaces with regular spaces and trim
        return trim(str_replace("\xc2\xa0", ' ', $value)) === '';
    }

    if (is_array($value)) {
        return empty($value);
    }

    return false;
}

/**
 * get_hash_token
 * 
 * @return string
 */
function get_hash_token() {
    return md5(get_hash_number());
}

/**
 * setSecureCookie
 * 
 * @return void
 */
function setSecureCookie($name, $value, $expire, $path, $domain = "apilageai.lk") {
    setcookie(
        $name, 
        $value, 
        [
            'expires'  => $expire,
            'path'     => $path,
            'domain'   => $domain,
            'secure'   => true,
            'httponly' => true,
            'samesite' => 'Lax'
        ]
    );
}

/**
 * getDateForDayOfWeek
 * 
 * @param string $d
 * @return string
 */
function get_date_by_digits($d) {
    return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][$d - 1];
}

/**
 * page_header
 * 
 * @param string $title
 * @param string $description
 * @return void
 */
function page_header($title, $description = "Discover an advanced AI model designed to assist Sri Lankan citizens in studying, daily routines, language practice, school exams, and more—uniquely trained to embrace and reflect Sri Lankan culture.", $image = '') {
    global $smarty;
    
    if($image == '') {
        $image = 'https://apilageai.lk/assets/images/logo.png';
    }
    $smarty->assign('page_title', $title);
    $smarty->assign('page_description', $description);
    $smarty->assign('page_image', $image);
}

/**
 * checkExists
 * 
 * @param string $db
 * @param string $table
 * @param integer $id
 * @param string $message
 * @return void
 */
function checkExists($db, $table, $column, $value, $message, $bool = false) {
    $stmt = $db->prepare("SELECT 1 FROM $table WHERE $column = ? LIMIT 1");
    $stmt->bind_param("s", $value);
    $stmt->execute();
    $exists = $stmt->get_result()->num_rows > 0;
    $stmt->close();
    if ($exists === $bool) {
        returnJSON(["e" => true, "m" => $message]);
    }
}

/**
 * page_footer
 * 
 * @param string $page
 * @return void
 */
function page_footer($page) {
    global $smarty;
    $smarty->assign('page', $page);
    $smarty->display("$page.tpl");
}

/**
 * _password_hash
 * 
 * @param string $password
 * @return string
 */
function _password_hash($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * get_user_ip
 * 
 * @return string
 */
function get_user_ip() {
    return trim(
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? 
        $_SERVER['HTTP_CLIENT_IP'] ?? 
        $_SERVER['REMOTE_ADDR']
    );
}

/**
 * returnJSON
 * @param string $jsonData
 * @return string
 */
function returnJSON($jsonData) {
  $jsonString = json_encode($jsonData);
  //$compressedData = gzencode($jsonString, 8);
  //header('Content-Encoding: gzip');
  header('Content-Type: application/json');
  exit($jsonString);
}

/**
 * captchaVerify
 * @param string $token
 * @return boolean
 */
function captchaVerify($token){
    $recaptcha = new \ReCaptcha\ReCaptcha('6Lf1xggrAAAAALkPyuadZpMV45bAABQ83pbwC0g6');
    $resp = $recaptcha->verify($token, get_user_ip());
    if ($resp->isSuccess()) {
        return true;
    } else {
        return false;
    }
}

/**
 * validateFields
 * @param array $data
 * @param array $fields
 * @return string
 */
function validateFields($data, $fields) {
    foreach ($fields as $key => [$name, $pattern, $message]) {
        if (empty($data[$key])) {
            return "$name is required.";
        } elseif ($pattern === FILTER_VALIDATE_EMAIL && !filter_var($data[$key], FILTER_VALIDATE_EMAIL)) {
            return "$name must be a valid email.";
        } elseif ($pattern === 'date') {
            $d = DateTime::createFromFormat('Y-m-d', $data[$key]);
            if (!$d || $d->format('Y-m-d') !== $data[$key]) {
                return "$name must be a valid date in YYYY-MM-DD format.";
            }
        } elseif (is_string($pattern) && !preg_match($pattern, $data[$key])) {
            return "$name must contain $message.";
        } elseif ($pattern === 'base64' && !preg_match('/^[A-Za-z0-9+\/=]+$/', $data[$key])) {
            return "$name must be a valid Base64 encoding.";
        }
    }

    return null;
}

/**
 * _email
 * 
 * @param string $email
 * @param string $subject
 * @param string $body
 * @param array $attachments
 * @return boolean
 */
function _email($email, $subject, $body, $attachments = []) {
    global $system;
    
    /* SMTP */
    $mail = new PHPMailer\PHPMailer\PHPMailer;
    $mail->CharSet = "UTF-8";
    $mail->isSMTP();
    $mail->Host = 'mail.apilageai.lk';
    $mail->SMTPAuth = true;
    $mail->Username = 'no-reply@apilageai.lk';
    $mail->Password = 'yVSZjgE5i4gs84magasc58DL2';
    $mail->Port = 587;
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;

    $mail->XMailer = "ApilageAI";
    $mail->setFrom('no-reply@apilageai.lk', 'ApilageAI');
    $mail->addAddress($email);

    $mail->Subject = $subject;
    $mail->isHTML(true);
    $mail->Body = $body;
    if(!empty($attachments)){
        foreach ($attachments['name'] as $key => $name) {
            $mail->addAttachment($attachments["tmp_name"][$key], $name);
        }
    }

    if(!$mail->send()) {
        error_log($mail->ErrorInfo);
        return false;
    }

    return true;
}

/**
 * get_email_template
 * 
 * @param string $template_name
 * @param string $template_subject
 * @param array $template_variables
 * @return array
 */
function get_email_template($template_name, $template_variables = []) {
    global $smarty;
    if($template_variables) {
        foreach ($template_variables as $key => $value) {
            $smarty->assign($key, $value);
        }
    }
    $body = $smarty->fetch("emails/".$template_name.".html");
    return $body;
}

/**
 * user_agent_array
 * 
 * @return array
 */
function user_agent_array($agent) {
    $Browser = new foroco\BrowserDetection();
    $agent = $Browser->getAll($agent);

    return [
        'browser' => $agent['browser_title'],
        'platform' => $agent['os_title']
    ];
}

/**
 * save_picture_from_url
 * 
 * @return string
 */
function save_picture_from_url($file, $prefix, $img_quality = 'medium') {
    // init image & prepare image name & path
    require_once(__DIR__.'/class-image.php');
    
    $image = new Image($file);
    $image_name = $prefix.$image->_img_ext;
    $path = __DIR__.'/../public_html/uploads/'.$image_name;

    /* save the new image */
    $image->save($path, $img_quality);
    return $image_name;
}
?>