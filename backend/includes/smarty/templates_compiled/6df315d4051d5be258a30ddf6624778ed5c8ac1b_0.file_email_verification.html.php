<?php
/* Smarty version 5.6.0, created on 2025-10-29 19:08:54
  from 'file:emails/email_verification.html' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_690218ee8212a4_32603659',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '6df315d4051d5be258a30ddf6624778ed5c8ac1b' => 
    array (
      0 => 'emails/email_verification.html',
      1 => 1761743024,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_690218ee8212a4_32603659 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/emails';
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Apilage AI</title>
</head>

<body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #e63946; color: #ffffff; text-align: center; padding: 30px;">
            <img src="https://apilageai.lk/assets/images/icon.png" alt="ApilageAI" style="width: 100px; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Verify Your Email</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 16px;">Hello <strong><?php echo $_smarty_tpl->getValue('name');?>
</strong>,</p>
            <p style="font-size: 16px;">Welcome to <strong>Apilage AI</strong>! To complete your registration and start using our services, please verify your email address.</p>

            <div style="background-color: #ffecec; padding: 25px; border-radius: 15px; margin: 25px 0; text-align: center;">
                <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">Click the button below to verify your email:</p>
                <a href="<?php echo $_smarty_tpl->getValue('verification_link');?>
" 
                   style="background-color: #e63946; color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px;">Verify Email Address</a>
            </div>

            <p style="font-size: 14px; color: #666666;">If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="font-size: 13px; color: #e63946; word-break: break-all; background-color: #f9f9f9; padding: 12px; border-radius: 8px;"><?php echo $_smarty_tpl->getValue('verification_link');?>
</p>

            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 25px 0; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #856404;">
                    <strong>⏰ Important:</strong> This verification link will expire in <strong>24 hours</strong>.
                </p>
            </div>

            <p style="font-size: 14px; color: #666666;">If you didn't create an account with Apilage AI, you can safely ignore this email.</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #999999;">
            <a href="https://apilageai.lk" style="color: #e63946; text-decoration: none; margin: 0 10px;">Support</a>
            <p style="margin: 5px 0;">&copy; 2025 ApilageAI. All rights reserved.</p>
        </div>
    </div>
</body>

</html><?php }
}
