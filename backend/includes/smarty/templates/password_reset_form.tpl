{include file="components/head.tpl"}

<div class="auth-layout">
    <!-- Left Image -->
    <div class="auth-image">
        <img src="https://apilageai.lk/assets/images/reset.png" alt="Reset Password Background" />
    </div>

    <!-- Right Form -->
    <div class="auth-container">
        <div class="auth-card animate-fade-in">
            <div class="header animate-slide-down">
                <h1>Reset Your Password</h1>
                <p>Please enter your new password below.</p>
            </div>

            <!-- Alert: If token invalid or expired -->
            {if isset($result.e) && $result.e}
                <div class="alert alert-danger animate-fade-in">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    {$result.m}
                </div>
                {if isset($result.expired) && $result.expired}
                    <p>If your token has expired, <a href="/auth/reset-request">request a new reset</a>.</p>
                {/if}
            {/if}

            <!-- Password Reset Form -->
            {if !isset($result.e) || !$result.e}
            <form id="resetPasswordForm" class="form" method="POST" action="{$base_url}/auth/reset-password?token={$smarty.get.token}">
                <div class="form-group">
                    <label for="password">New Password</label>
                    <input type="password" id="password" name="password" required placeholder="Enter new password" class="auth-input" />
                </div>

                <div class="form-group">
                    <label for="confirm_password">Confirm New Password</label>
                    <input type="password" id="confirm_password" name="confirm_password" required placeholder="Confirm new password" class="auth-input" />
                </div>

                <button type="submit" class="auth-submit-button">
                    Save New Password <i class="fa-solid fa-arrow-right"></i>
                </button>
            </form>
            {/if}

            <!-- Feedback after submission -->
            {if isset($success)}
                <div class="success-message animate-fade-in">
                    <i class="fas fa-check-circle"></i>
                    <h3>Password Reset Successful!</h3>
                    <p>You can now <a href="{$base_url}/auth/login">log in</a> with your new password.</p>
                </div>
            {/if}

            <!-- Back to login link -->
            <div class="back-link animate-fade-in" style="animation-delay: 0.2s">
                <a href="{$base_url}/auth/login" id="backToLogin">
                    <i class="fa-solid fa-arrow-left"></i> Back to Log in
                </a>
            </div>
        </div>
    </div>
</div>

<style>
/* Style for layout, modal, and form */
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
    margin-bottom: 15px;
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
    margin-top: 20px;
}
.alert {
    padding: 15px;
    background-color: #f8d7da;
    border-radius: 12px;
    color: #721c24;
    display: flex;
    align-items: center;
    gap: 12px;
}
.alert i {
    font-size: 24px;
}
.success-message {
    text-align: center;
    padding: 30px;
    border-radius: 20px;
    background-color: #d4edda;
    color: #155724;
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
</style>

<script>
  // You can add client-side validation or AJAX here if needed
</script>