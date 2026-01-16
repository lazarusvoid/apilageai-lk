<?php
/* Smarty version 5.6.0, created on 2025-10-29 19:44:54
  from 'file:emails/new_device_signin.html' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_6902215e8a77b4_50759883',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '2ca2bef5fd34b929eff8f0e3b04ae0736c07a0e4' => 
    array (
      0 => 'emails/new_device_signin.html',
      1 => 1761743084,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_6902215e8a77b4_50759883 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/emails';
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Device Sign-in</title>
</head>

<body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #f6f6f6;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #e60000; color: #ffffff; text-align: center; padding: 30px;">
            <img src="https://apilageai.lk/assets/images/icon.png" alt="ApilageAI" style="width: 100px; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">New Device Sign-in</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px;">Hello <strong><?php echo $_smarty_tpl->getValue('name');?>
</strong>,</p>
            <p style="font-size: 16px;">We noticed a new device signed into your <strong>Apilage AI</strong> account. Here are the details:</p>

            <div style="background-color: #ffe6e6; padding: 20px; border-radius: 15px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Browser:</strong> <?php echo $_smarty_tpl->getValue('device')['browser'];?>
</p>
                <p style="margin: 8px 0;"><strong>Operating System:</strong> <?php echo $_smarty_tpl->getValue('device')['platform'];?>
</p>
                <p style="margin: 8px 0;"><strong>IP Address:</strong> <?php echo $_smarty_tpl->getValue('ip');?>
</p>
            </div>

            <p style="font-size: 14px; color: #666666;">This email was sent as part of our security measures. If you did not authorize this sign-in, please contact the system administrator immediately.</p>

            <!-- Button -->
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://apilageai.lk/account/security" 
                   style="background-color: #e60000; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 50px; font-weight: bold; display: inline-block;">Secure Your Account</a>
            </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #999999;">
            &copy; 2025 ApilageAI. All rights reserved.
        </div>
    </div>
</body>

</html><?php }
}
