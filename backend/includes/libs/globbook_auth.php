<?php
class GlobbookAuthAPI {
    private $app_id;
    private $app_secret;
    private $access_token;
    private $base_url = "https://globbook.com/api";
    public string $version = "1.0";

    public function __construct($app_id = null, $app_secret = null) {
        $this->app_id = $app_id ?: getenv('APP_ID');
        $this->app_secret = $app_secret ?: getenv('APP_SECRET');
    }
    
    private function request($endpoint, $params = [], $method = 'POST') {
        $url = $this->base_url . $endpoint;
        $options = [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 100,
        ];

        if ($method == 'POST') {
            $options[CURLOPT_POST] = true;
            $options[CURLOPT_POSTFIELDS] = http_build_query($params);
        } else {
            $url .= '?' . http_build_query($params);
        }

        $options[CURLOPT_URL] = $url;
        $ch = curl_init();
        curl_setopt_array($ch, $options);

        $response = curl_exec($ch);
        if ($response === false) {
            throw new Exception('cURL error: ' . curl_error($ch));
        }
        curl_close($ch);

        $data = json_decode($response, true);
        if (isset($data['error'])) {
            throw new Exception('API error: ' . $data['message']);
        }
        
        return $data;
    }

    public function authenticate($auth_key) {
        $response = $this->request("/authorize", [
            "app_id" => $this->app_id,
            "app_secret" => $this->app_secret,
            "auth_key" => $auth_key
        ]);
        
        if (!empty($response['access_token'])) {
            $this->access_token = $response['access_token'];
            return $this->access_token;
        }
        
        return null;
    }

    public function getUserInfo() {
        if (!$this->access_token) {
            throw new Exception("Access token is not set. Authenticate first.");
        }
        
        $userInfo = $this->request("/get_user_info", ["access_token" => $this->access_token]);
        
        if (!empty($userInfo['user_info'])) {
            return (object) [
                'user_id' => $userInfo['user_info']['user_id'] ?? '',
                'username' => $userInfo['user_info']['user_name'] ?? '',
                'email' => $userInfo['user_info']['user_email'] ?? '',
                'firstname' => $userInfo['user_info']['user_firstname'] ?? '',
                'lastname' => $userInfo['user_info']['user_lastname'] ?? '',
                'gender' => $userInfo['user_info']['user_gender'] ?? '',
                'birthdate' => $userInfo['user_info']['user_birthdate'] ?? '',
                'picture' => $userInfo['user_info']['user_picture'] ?? '',
                'cover' => $userInfo['user_info']['user_cover'] ?? '',
                'verified' => $userInfo['user_info']['user_verified'] ?? '',
                'relationship' => $userInfo['user_info']['user_relationship'] ?? '',
                'biography' => $userInfo['user_info']['user_biography'] ?? '',
                'website' => $userInfo['user_info']['user_website'] ?? '',
            ];
        }
        
        return null;
    }
}
?>