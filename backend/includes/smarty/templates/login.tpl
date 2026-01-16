{include file="components/head.tpl"}
<script src="https://www.google.com/recaptcha/api.js" async defer></script>

<div class="auth-layout">
    <div class="background-accent top-right"></div>
    <div class="background-accent bottom-left"></div>
    <div class="bg-pattern"></div>

    <div class="auth-wrapper">
        <!-- Left Image Section -->
        <div class="auth-image">
            <img src="https://apilageai.lk/assets/images/login.jpg" alt="Login illustration" />
        </div>

        <!-- Right Form Section -->
        <div class="auth-container">
            <div class="header animate-slide-down">
                <h1>Welcome To Apilageai</h1>
                <p>Sign in to your account</p>
            </div>

            <div class="toggle-message animate-fade-in">
                <p>Are you a new member?? <a href="https://apilageai.lk/auth/register" id="signupLink">Sign up</a></p>
            </div>

            {* Email Verification Alert *}
            {if isset($smarty.get.verified) && $smarty.get.verified == 'success'}
            <div class="alert alert-success animate-fade-in" style="margin: 20px 0;">
                <i class="fa-solid fa-check-circle"></i>
                <span>Email verified successfully! You can now sign in.</span>
            </div>
            {/if}

            {if isset($smarty.get.error) && $smarty.get.error == 'email_not_verified'}
            <div class="alert alert-warning animate-fade-in" style="margin: 20px 0;">
                <i class="fa-solid fa-exclamation-triangle"></i>
                <span>Please verify your email before signing in.</span>
            </div>
            {/if}

            <div id="loadingOverlay" style="display: none;">
                <div class="overlay-background">
                    <div class="spinner"></div>
                </div>
            </div>

            {* Email Verification Notice Modal *}
            <div id="verificationModal" class="verification-modal" style="display: none;">
                <div class="modal-content animate-fade-in">
                    <div class="modal-header">
                        <i class="fa-solid fa-envelope-circle-check"></i>
                        <h3>Email Verification Required</h3>
                    </div>
                    <div class="modal-body">
                        <p id="verificationMessage">Please verify your email address before signing in. Check your inbox for the verification link.</p>
                        <p class="verification-email" id="verificationEmail"></p>
                        <p class="resend-text">Didn't receive the email?</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary" onclick="closeVerificationModal()">Close</button>
                        <button type="button" class="btn-primary" onclick="resendVerificationEmail()" id="resendBtn">
                            <i class="fa-solid fa-paper-plane"></i> Resend Email
                        </button>
                    </div>
                </div>
            </div>

            <div class="social-login">
                <div class="social-buttons">
                    <a href="https://globbook.com/api/oauth?app_id=56532326578385" class="social-button animate-slide-up" style="animation-delay: 0.1s">
                        <i class="fa-solid fa-earth-asia"></i> <span>Globbook</span>
                    </a>
                    <a href="https://apilageai.lk/auth/google" class="social-button animate-slide-up" style="animation-delay: 0.15s">
                        <i class="fa-brands fa-google"></i> <span>Google</span>
                    </a>
                </div>
            </div>

                            <div class="auth-divider animate-fade-in" style="animation-delay: 0.3s">
                    or continue with
                </div>

            <button id="showEmailLoginBtn" class="auth-submit-button" style="margin-top:20px;">
                Sign in with Email <i class="fa-solid fa-envelope"></i>
            </button>

            <div class="auth-card animate-fade-in">
                <div id="emailLoginSection" style="display:none;">
                    <form id="loginForm" class="form">
                        <div class="form-group">
                            <input type="email" id="identifier" placeholder="Email" class="auth-input animate-slide-up" style="animation-delay: 0.1s" name="e" required />
                            <p class="error-message" id="identifierError"></p>
                        </div>

                        <div class="form-group">
                            <div class="password-input-container">
                                <input type="password" id="password" placeholder="Password" class="auth-input animate-slide-up" style="animation-delay: 0.15s" name="p" required />
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
                            <a href="https://apilageai.lk/auth/reset-request" id="forgotPasswordLink">Forgot password?</a>
                        </div>

                        <button type="submit" class="auth-submit-button animate-slide-up" style="animation-delay: 0.25s">
                            Sign in <i class="fa-solid fa-arrow-right"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>

</div>
<script>
document.getElementById("showEmailLoginBtn").addEventListener("click", function() {
    var section = document.getElementById("emailLoginSection");
    section.style.display = "block";
    this.style.display = "none";
});
</script>
	<script src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"></script>
	<script src="https://apilageai.lk/assets/scripts/auth-login.min.js?V={get_hash_token()}"></script>
</body>
</html>