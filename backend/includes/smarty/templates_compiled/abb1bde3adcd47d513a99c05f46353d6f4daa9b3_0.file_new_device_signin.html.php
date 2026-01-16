<?php
/* Smarty version 5.5.1, created on 2025-06-11 22:23:05
  from 'file:emails/new_device_signin.html' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_6849b4715d0249_51593597',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'abb1bde3adcd47d513a99c05f46353d6f4daa9b3' => 
    array (
      0 => 'emails/new_device_signin.html',
      1 => 1744471854,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_6849b4715d0249_51593597 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/emails';
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Device Sign-in</title>
</head>

<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; margin: 0; padding: 0;">
    <div
        style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 10px; background-color: #f9f9f9;">
        <div style="text-align: center; margin-bottom: 20px;">
            <img style="max-width: 150px; margin-top: 5px; margin-bottom: 5px;" src="https://apilageai.lk/assets/images/icon.png" alt="ApilageAI" />
            <hr/>
            <h1 style="color: #333; margin-top: 10px;">New Device Sign-in</h1>
        </div>
        <div style="color: #555; margin-bottom: 20px;">
            <p>Dear <?php echo $_smarty_tpl->getValue('name');?>
, </br> A new device has signed into your Apilage AI account. Here are the details:</p>
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 20px;">
                <p><strong>Browser:</strong>&nbsp;<?php echo $_smarty_tpl->getValue('device')['browser'];?>
</p>
                <p><strong>Operating System:</strong>&nbsp;<?php echo $_smarty_tpl->getValue('device')['platform'];?>
</p>
                <p><strong>IP Address:</strong>&nbsp;<?php echo $_smarty_tpl->getValue('ip');?>
</p>
            </div>
            <p style="margin-top: 15px;">This email was sent to you as part of our security measures. If you did not authorize this sign-in, please contact the system administrator immediately.</p>
        </div>
    </div>
</body>

</html><?php }
}
