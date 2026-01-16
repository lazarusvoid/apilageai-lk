<?php
/* Smarty version 5.5.1, created on 2025-06-03 02:44:06
  from 'file:password_reset.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_683e141e993022_42917788',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '43f6713a8d423ecd108fe61577477f2d2aeac7b6' => 
    array (
      0 => 'password_reset.tpl',
      1 => 1743350093,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_683e141e993022_42917788 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>
    <div class="auth-layout">
        <div class="background-accent top-right"></div>
        <div class="background-accent bottom-left"></div>
        <div class="bg-pattern"></div>

        <div class="auth-container">
            <div class="header animate-slide-down">
                <h1>Reset your password</h1>
                <p id="headerText">We'll send you instructions to reset your password</p>
            </div>

            <div class="auth-card animate-fade-in">
                <div id="requestForm" class="form-container">
                    <form id="forgotPasswordForm" class="form">
                        <div class="form-group">
                            <input
                type="email"
                id="email"
                placeholder="Email Address"
                class="auth-input animate-slide-up"
                style="animation-delay: 0.1s"
              />
                            <p class="error-message" id="emailError"></p>
                        </div>

                        <button
              type="submit"
              class="auth-submit-button animate-slide-up"
              style="animation-delay: 0.15s"
            >
              Send Reset Instructions <i class="fa-solid fa-arrow-right"></i>
            </button>
                    </form>
                </div>

                <div id="successMessage" class="success-container hidden animate-fade-in">
                    <div class="success-icon">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3>Check your inbox</h3>
                    <p>
                        We've sent an email to <strong id="sentEmailAddress">your email</strong> with instructions to
                        reset your password.
                    </p>
                    <p class="resend-text">
                        Didn't receive the email? Check your spam folder or
                        <button type="button" id="tryAgainBtn" class="text-button">
              try again
            </button>
                    </p>
                </div>

                <div class="back-link animate-fade-in" style="animation-delay: 0.2s">
                    <a href="https://apilageai.lk/auth/login" id="backToLoginLink">
                        <i class="fa-solid fa-arrow-left"></i> Back to sign in
                    </a>
                </div>
            </div>
        </div>
    </div>
    <?php echo '<script'; ?>
 src="script.js"><?php echo '</script'; ?>
>
</body>

</html><?php }
}
