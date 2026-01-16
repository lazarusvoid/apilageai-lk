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
                <h1>Forgot your password?</h1>
                <p>Enter your email address below and we'll send you instructions to reset your password.</p>
            </div>

            {if isset($error)}
                <div class="alert alert-danger animate-fade-in">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                    {$error}
                </div>
            {/if}

            {if isset($success)}
                <div class="success-message animate-fade-in">
                    <i class="fa-solid fa-check-circle"></i>
                    <h3>Instructions Sent!</h3>
                    <p>Please check your email <strong>{$success_email}</strong> for password reset instructions.</p>
                </div>
            {/if}

            {if !isset($success)}
                <form id="passwordResetRequestForm" class="form" method="POST" action="{$base_url}/auth/reset-request">
                    <div class="form-group">
                        <input type="email" id="email" name="email" required placeholder="Email Address" class="auth-input" />
                    </div>

                    <button type="submit" class="auth-submit-button">
                        Send Reset Instructions <i class="fa-solid fa-arrow-right"></i>
                    </button>
                </form>
            {/if}

            <!-- Back to Login -->
            <div class="back-link animate-fade-in" style="animation-delay: 0.2s">
                <a href="{$base_url}/auth/login" id="backToLoginLink">
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
</style>