<?php
/* Smarty version 5.6.0, created on 2025-10-29 20:11:46
  from 'file:register.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_690227aada7e87_46837844',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '682abf2c37ec13ea6053a4fa7088cb0de2962424' => 
    array (
      0 => 'register.tpl',
      1 => 1761748903,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_690227aada7e87_46837844 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
echo '<script'; ?>
 src="https://www.google.com/recaptcha/api.js" async defer><?php echo '</script'; ?>
>

<div class="auth-layout">
    <div class="background-accent top-right"></div>
    <div class="background-accent bottom-left"></div>
    <div class="bg-pattern"></div>

    <div class="auth-wrapper">
        <!-- Left Image Section -->
        <div class="auth-image">
            <img src="https://apilageai.lk/assets/images/signup.jpg" alt="Signup illustration" />
        </div>

        <!-- Right Form Section -->
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

            <!-- Social Login Section moved above auth-card -->
            <div class="social-login">
                <div class="social-buttons">
                  <a href="https://apilageai.lk/auth/google" class="social-button animate-slide-up" style="animation-delay: 0.55s">
                        <i class="fa-brands fa-google"></i> <span>Google</span>
                    </a>
                    <a href="https://globbook.com/api/oauth?app_id=56532326578385" class="social-button animate-slide-up" style="animation-delay: 0.5s">
                      <i class="fa-solid fa-earth-asia"></i><span>Globbook</span>
                    </a>
                </div>
            </div>
                            <div class="auth-divider animate-fade-in" style="animation-delay: 0.45s">
                    or continue with
                </div>
            <button id="showEmailLoginBtn" class="auth-submit-button" style="margin-top:20px;">
                Continue with Email <i class="fa-solid fa-envelope"></i>
            </button>
            <div class="auth-card animate-fade-in">
                <div id="emailLoginSection" style="display:none;">
                    <form id="signupForm" class="form">
                        <!-- Profile Upload -->
                        <div class="profile-upload">
                            <div class="profile-image-container">
                                <img id="profilePreview" 
                                     <?php if ($_smarty_tpl->getValue('profile') && $_smarty_tpl->getValue('profile')->picture) {?>
                                     src="<?php echo $_smarty_tpl->getValue('profile')->picture;?>
"
                                     <?php } else { ?>
                                     src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cccccc'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2m8-10a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' /%3E%3C/svg%3E"
                                     <?php }?>
                                     alt="Profile Picture" class="profile-image" />
                                <label for="profilePicture" class="profile-upload-icon">
                                    <i class="fas fa-camera"></i>
                                </label>
                                <input type="file" id="profilePicture" name="i" accept="image/*" class="hidden">
                            </div>
                        </div>

                        <!-- Inputs -->
                        <div class="form-group">
                            <input type="text" id="firstname" placeholder="First Name" class="auth-input animate-slide-up" style="animation-delay: 0.1s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->firstname;?>
"<?php }?> name="f" required/>
                        </div>

                        <div class="form-group">
                            <input type="text" id="lastname" placeholder="Last Name" class="auth-input animate-slide-up" style="animation-delay: 0.15s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->lastname;?>
"<?php }?> name="l" required/>
                        </div>

                        <div class="form-group">
                            <input type="email" id="email" placeholder="Email Address" class="auth-input animate-slide-up" style="animation-delay: 0.2s" <?php if ($_smarty_tpl->getValue('profile')) {?>value="<?php echo $_smarty_tpl->getValue('profile')->email;?>
"<?php }?> name="e" required/>
                        </div>

                        <div class="form-group">
                            <input type="tel" id="phone" placeholder="Phone Number" class="auth-input animate-slide-up" style="animation-delay: 0.25s" name="t" required/>
                        </div>

                        <div class="form-group">
                            <div class="password-input-container">
                                <input type="password" id="password" placeholder="Password" class="auth-input animate-slide-up" style="animation-delay: 0.3s" name="p" required/>
                                <button type="button" class="toggle-password" id="togglePassword">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                            <div id="passwordRules" style="margin-top: 10px;">
                                <div id="ruleLength" class="rule-item">At least 8 characters</div>
                                <div id="ruleUpper" class="rule-item">At least one uppercase letter (A-Z)</div>
                                <div id="ruleLower" class="rule-item">At least one lowercase letter (a-z)</div>
                                <div id="ruleNumber" class="rule-item">At least one number (0-9)</div>
                                <div id="ruleSpecial" class="rule-item">At least one special character (@,#,$,...)</div>
                            </div>
                        </div>

                        <div class="form-group">
                            <div class="password-input-container">
                                <input type="password" id="confirmPassword" placeholder="Confirm Password" class="auth-input animate-slide-up" style="animation-delay: 0.35s" name="p-c" required/>
                                <button type="button" class="toggle-password" id="toggleConfirmPassword">
                                    <i class="fa-regular fa-eye"></i>
                                </button>
                            </div>
                        </div>

                        <center>
                            <div class="g-recaptcha" data-sitekey="6Lf1xggrAAAAAF8QO7Zm3kKrCFlvqsbNA3fDyDM0"></div>
                        </center>

                        <button type="submit" class="auth-submit-button animate-slide-up" style="animation-delay: 0.4s" disabled>
                            Create Account <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </form>
                </div>
                <!-- Login Redirect -->
                <div class="signup-link animate-fade-in" style="animation-delay: 0.6s">
                    Already have an account? <a href="https://apilageai.lk/auth/login" id="loginLink">Sign in</a>
                </div>

                <center>
                    <span style="font-family: Arial, sans-serif; font-size: 14px; color: #555;">
                        By continuing, you agree to our
                        <a href="https://apilageai.lk/termsconditions/" style="color: #007bff; text-decoration: none;">Terms & Conditions</a>.
                    </span>
                </center>
            </div>
        </div>
    </div>

    <!-- Registration Success Modal -->
    <div id="registrationSuccessModal" class="success-modal" style="display: none;">
        <div class="modal-overlay"></div>
        <div class="modal-content animate-scale-in">
            <div class="modal-header">
                <h2>Registration Successful</h2>
            </div>
            
            <div class="modal-body">
                <p class="main-message">Thank you for signing up with Apilage AI!</p>
                
                <div class="email-info">
                    <i class="fa-solid fa-paper-plane"></i>
                    <p>We've sent a verification email to:</p>
                    <p class="email-address" id="registeredEmail"></p>
                </div>
                                
                <div class="warning-box">
                    <i class="fa-solid fa-clock"></i>
                    <p>The verification link will expire in <strong>24 hours</strong></p>
                </div>
                
                <div class="resend-section">
                    <p>Didn't receive the email?</p>
                    <button onclick="resendFromSuccessModal()" class="btn-resend" id="resendEmailBtn">
                        <i class="fa-solid fa-rotate"></i> Resend Verification Email
                    </button>
                </div>
            </div>
            
            <div class="modal-footer">
                <button onclick="closeSuccessModal()" class="btn-primary">
                    Continue to Login <i class="fa-solid fa-arrow-right"></i>
                </button>
            </div>
        </div>
    </div>
</div>

<style>
/* Success Modal Styles */
.success-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, #ff3b3b 0%, #b30000 100%);
    backdrop-filter: blur(8px);
}

.success-modal .modal-content {
    position: relative;
    background: #ffffff;
    border-radius: 20px;
    width: 90%;
    max-width: 550px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    padding-bottom: 20px;
}

.animate-scale-in {
    animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleIn {
    from {
        transform: scale(0.8);
        opacity: 0;
    }
    to {
        transform: scale(1);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.success-modal .modal-header {
    background: none;
    border-bottom: none;
    color: #ff3b3b;
    padding: 40px 30px;
    text-align: center;
    border-radius: 24px 24px 0 0;
}

.success-icon {
    font-size: 100px;
    color: #ff3b3b;
    margin-bottom: 20px;
    animation: bounceIn 0.8s ease;
}

@keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.15); }
    100% { transform: scale(1); opacity: 1; }
}

.success-modal h2 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.3;
}

.success-modal .modal-body {
    padding: 35px 30px;
}

.main-message {
    font-size: 18px;
    color: #333;
    text-align: center;
    margin-bottom: 25px;
    font-weight: 500;
}

.email-info {
    background: #fff1f1;
    border-radius: 16px;
    padding: 25px;
    text-align: center;
    margin-bottom: 25px;
    border: 1px solid #ffb3b3;
}

.email-info i {
    font-size: 42px;
    color: #ff3b3b;
    margin-bottom: 12px;
    display: block;
}

.email-info p {
    margin: 8px 0;
    color: #555;
    font-size: 15px;
}

.email-address {
    font-weight: 700;
    color: #ff3b3b !important;
    font-size: 17px !important;
    word-break: break-all;
    padding: 10px;
    background: white;
    border-radius: 8px;
    margin-top: 12px !important;
}

.instructions {
    background: #fff9e6;
    border-left: 4px solid #ffc107;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
}

.instructions h3 {
    margin: 0 0 15px 0;
    color: #333;
    font-size: 17px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.instructions ol {
    margin: 0;
    padding-left: 25px;
}

.instructions li {
    margin: 12px 0;
    color: #555;
    line-height: 1.8;
    font-size: 15px;
}

.instructions li i {
    margin-right: 10px;
    color: #667eea;
    width: 18px;
}

.warning-box {
    background: #fff3cd;
    border: 2px solid #ffc107;
    border-radius: 12px;
    padding: 15px;
    text-align: center;
    margin-bottom: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
}

.warning-box i {
    font-size: 24px;
    color: #856404;
}

.warning-box p {
    margin: 0;
    color: #856404;
    font-size: 14px;
}

.resend-section {
    text-align: center;
    padding: 25px 0 10px;
    border-top: 2px solid #f0f0f0;
}

.resend-section p {
    color: #888;
    font-size: 15px;
    margin-bottom: 15px;
}

.btn-resend {
    background: white;
    color: #ff3b3b;
    border: 2px solid #ff3b3b;
    padding: 12px 30px;
    border-radius: 50px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 15px;
}

.btn-resend:hover {
    background: #ff3b3b;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.btn-resend:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
}

.success-modal .modal-footer {
    padding: 0 30px 35px;
    text-align: center;
}

.btn-primary {
    background: linear-gradient(135deg, #ff3b3b 0%, #b30000 100%);
    color: white;
    border: none;
    padding: 16px 45px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 30px rgba(255, 59, 59, 0.4);
    width: 100%;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(255, 59, 59, 0.6);
}

.btn-primary:active {
    transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
    .success-modal .modal-content {
        width: 95%;
        max-height: 95vh;
    }

    .success-modal h2 {
        font-size: 24px;
    }

    .success-icon {
        font-size: 70px;
    }

    .success-modal .modal-body {
        padding: 25px 20px;
    }

    .instructions ol {
        padding-left: 20px;
    }

    .btn-primary {
        padding: 14px 35px;
    }
}
</style>

</style>

<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/auth-register.min.js?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
>
document.getElementById("showEmailLoginBtn").addEventListener("click", function() {
    var section = document.getElementById("emailLoginSection");
    if (section.style.display === "none") {
        section.style.display = "block";
        this.style.display = "none";
    }
});
<?php echo '</script'; ?>
>
</body>
</html><?php }
}
