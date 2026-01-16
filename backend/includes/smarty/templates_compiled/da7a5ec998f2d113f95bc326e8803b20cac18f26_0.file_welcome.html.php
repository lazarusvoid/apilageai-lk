<?php
/* Smarty version 5.6.0, created on 2025-10-29 23:26:45
  from 'file:emails/welcome.html' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_6902555de59282_73051269',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'da7a5ec998f2d113f95bc326e8803b20cac18f26' => 
    array (
      0 => 'emails/welcome.html',
      1 => 1761750315,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_6902555de59282_73051269 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates/emails';
?><!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Apilage AI</title>
</head>

<body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; background-color: #ffffff;">
    <div style="max-width: 600px; margin: 40px auto; padding: 0; border-radius: 15px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background-color: #e63946; color: #ffffff; text-align: center; padding: 40px 30px;">
            <img src="https://apilageai.lk/assets/images/icon.png" alt="ApilageAI" style="width: 100px; margin-bottom: 15px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">Welcome to Apilage AI! ?</h1>
        </div>

        <!-- Body -->
        <div style="background-color: #ffffff; padding: 30px; color: #333333; line-height: 1.6;">
            <p style="font-size: 18px; margin-bottom: 10px;">Hi <strong><?php echo $_smarty_tpl->getValue('name');?>
</strong>,</p>
            <p style="font-size: 16px;">Your email has been verified successfully! You're all set to explore the power of Apilage AI.</p>

            <!-- Feature Highlights -->
            <div style="background-color: #ffecec; padding: 25px; border-radius: 15px; margin: 25px 0;">
                <h2 style="color: #e63946; font-size: 20px; margin-top: 0;">What you can do with Apilage AI:</h2>
                <ul style="padding-left: 20px; margin: 15px 0;">
                    <li style="margin: 10px 0; font-size: 15px;">? <strong>AI-Powered Conversations</strong> - Chat with our advanced AI assistant</li>
                    <li style="margin: 10px 0; font-size: 15px;">? <strong>Creative Tools</strong> - Generate images, text, and more</li>
                    <li style="margin: 10px 0; font-size: 15px;">? <strong>Personalized Experience</strong> - AI that remembers your preferences</li>
                    <li style="margin: 10px 0; font-size: 15px;">? <strong>Secure & Private</strong> - Your data is protected with us</li>
                </ul>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://apilageai.lk/app" 
                   style="background-color: #e63946; color: #ffffff; text-decoration: none; padding: 15px 50px; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px;">Get Started Now</a>
            </div>

            <!-- Tips Section -->
            <div style="border-top: 2px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
                <h3 style="color: #e63946; font-size: 18px;">Quick Tips to Get Started:</h3>
                <ol style="padding-left: 20px; color: #555;">
                    <li style="margin: 10px 0;">Complete your profile to personalize your experience</li>
                    <li style="margin: 10px 0;">Explore our AI tools and features</li>
                    <li style="margin: 10px 0;">Check out our tutorials and guides</li>
                </ol>
            </div>

            <p style="font-size: 14px; color: #666666; margin-top: 25px;">If you have any questions, our support team is here to help!</p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #999999;">
            <p style="margin: 5px 0;">
                <a href="https://apilageai.lk" style="color: #e63946; text-decoration: none; margin: 0 10px;">Support</a>
            </p>
            <p style="margin: 15px 0 5px 0;">&copy; 2025 ApilageAI. All rights reserved.</p>
        </div>
    </div>
</body>

</html><?php }
}
