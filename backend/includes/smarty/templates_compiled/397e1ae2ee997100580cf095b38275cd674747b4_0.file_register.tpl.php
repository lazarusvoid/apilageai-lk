<?php
/* Smarty version 5.5.1, created on 2025-06-06 23:03:28
  from 'file:register.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68432668143fc5_67831795',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '397e1ae2ee997100580cf095b38275cd674747b4' => 
    array (
      0 => 'register.tpl',
      1 => 1749231164,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_68432668143fc5_67831795 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>
    <?php echo '<script'; ?>
 src="https://www.google.com/recaptcha/api.js" async defer><?php echo '</script'; ?>
>

    <div class="auth-layout">
        <div class="background-accent top-right"></div>
        <div class="background-accent bottom-left"></div>
        <div class="bg-pattern"></div>

        <div class="auth-container">
            <div class="header animate-slide-down">
                <h1>Create your account</h1>
                <p>Sign up to get started</p>
            </div>
<div id="loadingOverlay" style="display: none;">
    <div class="overlay-background">
        <div class="spinner"></div>
    </div>
</div>
            <div class="auth-card animate-fade-in">
                <form id="signupForm" class="form">
                    <div class="profile-upload">
                        <div class="profile-image-container">
                            <img id="profilePreview" <?php if ($_smarty_tpl->getValue('profile') && $_smarty_tpl->getValue('profile')->picture) {?>src="<?php echo $_smarty_tpl->getValue('profile')->picture;?>
"<?php } else { ?>src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23cccccc' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E"<?php }?> alt="Profile Picture" class="profile-image">
                            <label for="profilePicture" class="profile-upload-icon">
                                <i class="fas fa-camera"></i>
                            </label>
                            <input type="file" id="profilePicture" name="i" accept="image/*" class="hidden">
                        </div>
                    </div>

                    <div class="form-group">
                        <input type="text" id="name" placeholder="First Name" class="auth-input animate-slide-up" style="animation-delay: 0.1s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->firstname;?>
"<?php }?> name="f" required/>
                    </div>

                    <div class="form-group">
                        <input type="text" id="name" placeholder="Last Name" class="auth-input animate-slide-up" style="animation-delay: 0.1s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->lastname;?>
"<?php }?> name="l" required/>
                    </div>

                    <div class="form-group">
                        <input type="email" id="email" placeholder="Email Address" class="auth-input animate-slide-up" style="animation-delay: 0.15s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->email;?>
"<?php }?> name="e" required/>
                    </div>

                    <div class="form-group">
                        <input type="tel" id="phone" placeholder="Phone Number" class="auth-input animate-slide-up" style="animation-delay: 0.2s" name="t" required/>
                    </div>

                    <div class="form-group">
                        <div class="password-input-container">
                            <input type="password" id="password" placeholder="Password" class="auth-input animate-slide-up" style="animation-delay: 0.25s" name="p" required/>
                            <button type="button" class="toggle-password" id="togglePassword">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    <div id="passwordRules" style="margin-top: 10px;">
    <div id="ruleLength" class="rule-item">least 8 characters</div>
    <div id="ruleUpper" class="rule-item">least one uppercase letter (A,B,..) </div>
    <div id="ruleLower" class="rule-item">least one lowercase letter (a,b...)</div>
    <div id="ruleNumber" class="rule-item">least one number (1,2,...)</div>
    <div id="ruleSpecial" class="rule-item">least one special character (@,$,#)</div>
</div>
                    <div class="form-group">
                        <div class="password-input-container">
                            <input type="password" id="confirmPassword" placeholder="Confirm Password" class="auth-input animate-slide-up" style="animation-delay: 0.3s" name="p-c" required/>
                            <button type="button" class="toggle-password" id="toggleConfirmPassword">
                                <i class="fa-regular fa-eye"></i>
                            </button>
                        </div>
                    </div>


                    <center>
                        <div class="g-recaptcha" data-sitekey="6Lf1xggrAAAAAF8QO7Zm3kKrCFlvqsbNA3fDyDM0"></div>
                    </center>

                    <button type="submit" class="auth-submit-button animate-slide-up" style="animation-delay: 0.35s" disabled>
                        Create Account <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>

                <div class="social-login">
                    <div class="auth-divider animate-fade-in" style="animation-delay: 0.4s">
                        or continue with
                    </div>

                    <div class="social-buttons">
                      <a href="https://globbook.com/api/oauth?app_id=56532326578385" class="social-button animate-slide-up" style="animation-delay: 0.1s">
                        <span>Globbook</span>
                      </a>
                      <a href="https://apilageai.lk/comingsoon/" class="social-button animate-slide-up" style="animation-delay: 0.15s">
                        <span>Google</span>
                      </a>
                    </div>
                </div>

                <div class="signup-link animate-fade-in" style="animation-delay: 0.55s">
                    Already have an account?
                    <a href="https://apilageai.lk/auth/login" id="loginLink">Sign in</a>
                </div>
                <center>
  <span style="font-family: Arial, sans-serif; font-size: 14px; color: #555;">
    Continue means you are agreeing with our 
    <a href="https://apilageai.lk/termsconditions/" style="color: #007bff; text-decoration: none;">terms and conditions</a>.
  </span>
</center>
            </div>
        </div>
    </div>

    <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"><?php echo '</script'; ?>
>
    <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/auth-register.min.js?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
</body>

</html><?php }
}
