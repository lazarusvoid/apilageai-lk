<?php
/* Smarty version 5.6.0, created on 2025-10-29 13:20:07
  from 'file:password_reset.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_6901c72f198b91_14482831',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '5d3870ca01070487933707846f0d351f43dd3e31' => 
    array (
      0 => 'password_reset.tpl',
      1 => 1760078307,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_6901c72f198b91_14482831 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>

<div class="auth-wrapper">
  <!-- Left Image -->
  <div class="auth-image">
    <img src="https://apilageai.lk/assets/images/reset.png" alt="Reset Password Background" />
  </div>

  <!-- Right Side Form -->
  <div class="auth-container">
    <div class="auth-card animate-fade-in">
      <div class="header animate-slide-down">
        <h1>Reset your password</h1>
        <p id="headerText">
          We'll send you instructions to reset your password.
        </p>
      </div>

      <!-- Request Form -->
      <div id="requestForm" class="form-container animate-slide-up">
        <form id="forgotPasswordForm" class="form" method="POST" action="<?php echo $_smarty_tpl->getValue('base_url');?>
/password_reset_request.php">
          <div class="form-group">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email Address"
              class="auth-input"
              required
            />
            <p class="error-message" id="emailError">
              <?php if ((true && ($_smarty_tpl->hasVariable('error') && null !== ($_smarty_tpl->getValue('error') ?? null)))) {
echo $_smarty_tpl->getValue('error');
}?>
            </p>
          </div>

          <button type="submit" class="auth-submit-button">
            Send Reset Instructions <i class="fa-solid fa-arrow-right"></i>
          </button>
        </form>
      </div>

      <!-- Success Message -->
      <?php if ((true && ($_smarty_tpl->hasVariable('success') && null !== ($_smarty_tpl->getValue('success') ?? null)))) {?>
      <div id="successMessage" class="success-container animate-fade-in">
        <div class="success-icon">
          <i class="fas fa-envelope"></i>
        </div>
        <h3>Check your inbox</h3>
        <p>
          We've sent an email to
          <strong id="sentEmailAddress"><?php echo $_smarty_tpl->getValue('success_email');?>
</strong> with instructions
          to reset your password.
        </p>
        <p class="resend-text">
          Didn't receive the email? Check your spam folder or
          <a href="<?php echo $_smarty_tpl->getValue('base_url');?>
/password_reset" class="text-button">try again</a>
        </p>
      </div>
      <?php }?>

      <!-- Back to Login -->
      <div class="back-link animate-fade-in" style="animation-delay: 0.2s">
        <a href="<?php echo $_smarty_tpl->getValue('base_url');?>
/auth/login" id="backToLoginLink">
          <i class="fa-solid fa-arrow-left"></i> I can remember my password Back to log in
        </a>
      </div>
    </div>
  </div>
</div>

<?php echo '<script'; ?>
 src="/assets/js/script.js"><?php echo '</script'; ?>
>
</body>
</html><?php }
}
