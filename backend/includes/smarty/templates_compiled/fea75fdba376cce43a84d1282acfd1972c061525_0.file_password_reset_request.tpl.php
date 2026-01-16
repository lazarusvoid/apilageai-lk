<?php
/* Smarty version 5.6.0, created on 2025-10-29 16:33:46
  from 'file:password_reset_request.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_6901f492c8eb70_41743663',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'fea75fdba376cce43a84d1282acfd1972c061525' => 
    array (
      0 => 'password_reset_request.tpl',
      1 => 1761735824,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_6901f492c8eb70_41743663 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>

<div class="auth-layout">
    <!-- Left Image -->
    <div class="auth-image">
        <img src="https://apilageai.lk/assets/images/reset.png" alt="Reset Password Background" />
    </div>

    <!-- Right Form -->
    <div class="auth-container">
        <div class="auth-card animate-fade-in">
            <div class="header animate-slide-down">
                <h1>Forgot your password?</h1>
                <p>Enter your email address below and we'll send you instructions to reset your password.</p>
            </div>

            <?php if ((true && ($_smarty_tpl->hasVariable('error') && null !== ($_smarty_tpl->getValue('error') ?? null)))) {?>
                <div class="alert alert-danger animate-fade-in">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    <?php echo $_smarty_tpl->getValue('error');?>

                </div>
            <?php }?>

            <?php if ((true && ($_smarty_tpl->hasVariable('success') && null !== ($_smarty_tpl->getValue('success') ?? null)))) {?>
                <div class="success-message animate-fade-in">
                    <i class="fa-solid fa-check-circle"></i>
                    <h3>Instructions Sent!</h3>
                    <p>Please check your email <strong><?php echo $_smarty_tpl->getValue('success_email');?>
</strong> for password reset instructions.</p>
                </div>
            <?php }?>

            <?php if (!(true && ($_smarty_tpl->hasVariable('success') && null !== ($_smarty_tpl->getValue('success') ?? null)))) {?>
                <form id="passwordResetRequestForm" class="form" method="POST" action="<?php echo $_smarty_tpl->getValue('base_url');?>
/auth/reset-request">
                    <div class="form-group">
                        <input type="email" id="email" name="email" required placeholder="Email Address" class="auth-input" />
                    </div>

                    <button type="submit" class="auth-submit-button">
                        Send Reset Instructions <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            <?php }?>

            <!-- Back to Login -->
            <div class="back-link animate-fade-in" style="animation-delay: 0.2s">
                <a href="<?php echo $_smarty_tpl->getValue('base_url');?>
/auth/login" id="backToLoginLink">
                    <i class="fa-solid fa-arrow-left"></i> Back to Login
                </a>
            </div>
        </div>
    </div>
</div>

<style>
.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
}

.auth-image {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.auth-image img {
    max-width: 100%;
    border-radius: 20px;
}

.auth-container {
    flex: 1;
    max-width: 400px;
    padding: 30px;
}

.auth-card {
    background: #fff;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.2);
}

.header h1 {
    margin-bottom: 10px;
    font-size: 28px;
    font-weight: bold;
    text-align: center;
}

.header p {
    text-align: center;
    font-size: 16px;
    margin-bottom: 20px;
}

.form-group {
    margin-bottom: 20px;
}

.auth-input {
    width: 100%;
    padding: 12px 20px;
    border-radius: 50px;
    border: 1px solid #ddd;
}

.auth-submit-button {
    width: 100%;
    padding: 14px;
    border-radius: 50px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
}

.alert {
    padding: 15px;
    background-color: #f8d7da;
    border-radius: 12px;
    color: #721c24;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
}

.alert i,
.success-message i {
    font-size: 24px;
}

.success-message {
    text-align: center;
    padding: 30px;
    border-radius: 20px;
    background-color: #d4edda;
    color: #155724;
    margin-bottom: 15px;
}

.back-link {
    display: block;
    margin-top: 20px;
    text-align: center;
    font-size: 14px;
    color: #666;
}

.back-link a {
    color: #667eea;
    text-decoration: none;
}

@media(max-width: 768px){
    .auth-layout {
        flex-direction: column;
        padding: 20px;
    }
    .auth-image {
        display: none;
    }
    .auth-container {
        max-width: 100%;
    }
}
</style><?php }
}
