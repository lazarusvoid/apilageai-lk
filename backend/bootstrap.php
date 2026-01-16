<?php
header("Expires: Thu, 19 Nov 1981 08:52:00 GMT");
header("Cache-Control: no-store, no-cache, must-revalidate");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

//Load
require __DIR__."/includes/libs/vendor/autoload.php";
require __DIR__.'/functions.php';

//Time config
date_default_timezone_set('Asia/Colombo');
$time = time();
$DateTime = new DateTime();
$date = $DateTime->format('Y-m-d H:i:s');

//Smarty 
use Smarty\Smarty;
use Smarty\Filter\Output\TrimWhitespace;
$smarty = new Smarty();

$error_reporting = false;
if($error_reporting){
    ini_set("display_errors", true);
    error_reporting(E_ALL ^ E_WARNING); 
    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $smarty->error_reporting = E_ALL & ~E_NOTICE;
} else {
    $smarty->error_reporting = 0;
    ini_set("display_errors", false);
    ini_set("log_errors", true);
    error_reporting(E_ALL ^ E_WARNING); 
    ini_set('error_log', __DIR__.'/error.log');
}

session_name("APILAGE_AI_SESSID");
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set("session.cookie_samesite", "Lax");
session_start();

/*Intialize components*/
//Configure MYSQL
$db = new mysqli('localhost', "apilageai_lk", "Dam9WVqPAciD62O", "apilageai_lk", '3306');
$db->query("SET time_zone = '+05:30'");
$db->set_charset('utf8mb4');

//Configure Smarty
$smarty->setTemplateDir(__DIR__.'/includes/smarty/templates/');
$smarty->setCompileDir(__DIR__.'/includes/smarty/templates_compiled/');
$smarty->registerFilter('output', [new TrimWhitespace(), 'filter']);
foreach (array_merge(...array_values(get_defined_functions())) as $function) {
    $smarty->registerPlugin('modifier', $function, $function);
}
function minify_html($tpl_output, \Smarty\Template $template) {
    // Remove new lines and extra whitespace
    $tpl_output = preg_replace('/\s+/', ' ', $tpl_output);
    
    return $tpl_output;
}
$smarty->registerFilter('output', 'minify_html');

//Global Constants
$gcons['months'] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
$gcons['days_of_week'] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

//User
require __DIR__."/user.php";
$user = new User();
$smarty->assign('user', $user);
$smarty->assign('gcons', $gcons);

if($user->_logged_in){
    //$smarty->debugging = true;
}
?>