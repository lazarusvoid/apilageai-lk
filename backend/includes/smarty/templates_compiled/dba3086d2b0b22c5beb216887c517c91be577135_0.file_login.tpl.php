<?php
/* Smarty version 5.5.1, created on 2025-06-06 23:03:03
  from 'file:login.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_6843264f138d40_32678551',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'dba3086d2b0b22c5beb216887c517c91be577135' => 
    array (
      0 => 'login.tpl',
      1 => 1749231135,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_6843264f138d40_32678551 (\Smarty\Template $_smarty_tpl) {
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
                <h1>Welcome back</h1>
                <p>Sign in to your account</p>
            </div>
<div id="loadingOverlay" style="display: none;">
    <div class="overlay-background">
        <div class="spinner"></div>
    </div>
</div>

            <div class="auth-card animate-fade-in">
                <form id="loginForm" class="form">
                <div class="form-group">
                    <input type="email" id="identifier" placeholder="Email" class="auth-input animate-slide-up" style="animation-delay: 0.1s" name="e" required/>
                    <p class="error-message" id="identifierError"></p>
                </div>

                <div class="form-group">
                    <div class="password-input-container">
                    <input type="password" id="password" placeholder="Password" class="auth-input animate-slide-up" style="animation-delay: 0.15s" name="p" required/>
                    <button type="button" class="toggle-password" id="togglePassword">
                        <i class="fa-regular fa-eye"></i>
                    </button>
                    </div>
                    <p class="error-message" id="passwordError"></p>
                </div>

                <center>
                    <div class="g-recaptcha" data-sitekey="6Lf1xggrAAAAAF8QO7Zm3kKrCFlvqsbNA3fDyDM0"></div>
                </center>

                <div class="forgot-password animate-fade-in" style="animation-delay: 0.2s">
                    <a href="https://apilageai.lk/auth/reset" id="forgotPasswordLink">Forgot password?</a>
                </div>

                <button type="submit" class="auth-submit-button animate-slide-up" style="animation-delay: 0.25s">
                    Sign in <i class="fa-solid fa-arrow-right"></i>
                </button>
                </form>

                <div class="social-login">
                <div class="auth-divider animate-fade-in" style="animation-delay: 0.3s">
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

                <div class="signup-link animate-fade-in" style="animation-delay: 0.35s">
                Don't have an account?
                <a href="https://apilageai.lk/auth/register" id="signupLink">Sign up</a>
                </div>
            </div>
            </div>
        </div>

        <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"><?php echo '</script'; ?>
>
        <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/auth-login.min.js?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
    </body>
</html><?php }
}
