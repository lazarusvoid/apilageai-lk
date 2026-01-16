{include file="components/head.tpl"}

<div class="auth-layout">
    <div class="background-accent top-right"></div>
    <div class="background-accent bottom-left"></div>
    <div class="bg-pattern"></div>

    <div class="auth-wrapper">
        <div class="auth-container" style="max-width: 600px; margin: 0 auto;">
            <div class="verification-result-card animate-fade-in">
                {if $result.e}
                    {* Verification Failed *}
                    <div class="verification-failed">
                        <i class="fa-solid fa-times-circle"></i>
                        <h2>Verification Failed</h2>
                        <p>{$result.m}</p>
                        
                        {if isset($result.expired) && $result.expired}
                            <button onclick="requestNewLink()" class="auth-submit-button" style="margin-top: 20px;">
                                <i class="fa-solid fa-envelope"></i> Request New Verification Link
                            </button>
                        {/if}
                        
                        <a href="https://apilageai.lk/auth/login" class="back-link">
                            <i class="fa-solid fa-arrow-left"></i> Back to Login
                        </a>
                    </div>
                {else}
                    {* Verification Success *}
                    <div class="verification-success">
                        <div class="success-animation">
                            <i class="fa-solid fa-check-circle"></i>
                        </div>
                        <h2>Email Verified!</h2>
                        <p>{$result.m}</p>
                        
                        {if isset($result.already_verified) && $result.already_verified}
                            <p class="info-text">Your email was already verified.</p>
                        {else}
                            <p class="info-text">Welcome to Apilage AI! You can now access all features.</p>
                        {/if}
                        
                        <a href="https://apilageai.lk/auth/login?verified=success" class="auth-submit-button" style="margin-top: 20px;">
                            Go to Login <i class="fa-solid fa-arrow-right"></i>
                        </a>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
/* Auth Layout Base Styles */
.auth-layout {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    background: linear-gradient(135deg, #ff3b3b 0%, #b30000 100%);
}

.background-accent {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    filter: blur(80px);
}

.background-accent.top-right {
    top: -200px;
    right: -200px;
}

.background-accent.bottom-left {
    bottom: -200px;
    left: -200px;
}

.bg-pattern {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.05;
    background-image: 
        repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px);
}

.auth-wrapper {
    position: relative;
    z-index: 1;
    width: 100%;
    padding: 20px;
}

.auth-container {
    max-width: 600px;
    margin: 0 auto;
}

/* Verification Card Styles */
.verification-result-card {
    background: white;
    border-radius: 24px;
    padding: 60px 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    text-align: center;
    animation: fadeIn 0.5s ease;
}

/* Success Styles */
.verification-success {
    color: #333;
}

.success-animation i {
    font-size: 100px;
    color: #28a745;
    margin-bottom: 30px;
    display: block;
    animation: scaleIn 0.6s ease;
}

@keyframes scaleIn {
    0% {
        transform: scale(0);
        opacity: 0;
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

/* Failed Styles */
.verification-failed i {
    font-size: 100px;
    color: #dc3545;
    margin-bottom: 30px;
    display: block;
    animation: shake 0.6s ease;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
}

/* Typography */
.verification-result-card h2 {
    font-size: 36px;
    margin-bottom: 20px;
    font-weight: 700;
    color: #333;
}

.verification-result-card p {
    color: #666;
    font-size: 18px;
    line-height: 1.6;
    margin-bottom: 15px;
}

.info-text {
    font-size: 16px !important;
    color: #888 !important;
    margin-top: 10px;
}

/* Buttons */
.auth-submit-button {
    display: inline-block;
    padding: 16px 48px;
    background: linear-gradient(135deg, #ff3b3b 0%, #b30000 100%);
    color: white;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    font-size: 16px;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 20px rgba(255, 59, 59, 0.3);
}

.auth-submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(255, 59, 59, 0.5);
}

.auth-submit-button:active {
    transform: translateY(0);
}

.auth-submit-button i {
    margin-left: 8px;
}

/* Links */
.back-link {
    display: inline-block;
    margin-top: 30px;
    color: #ff3b3b;
    text-decoration: none;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
}

.back-link:hover {
    transform: translateX(-5px);
    color: #b30000;
}

.back-link i {
    margin-right: 8px;
}

/* Animations */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in {
    animation: fadeIn 0.5s ease;
}

/* Responsive */
@media (max-width: 768px) {
    .verification-result-card {
        padding: 40px 30px;
    }

    .verification-result-card h2 {
        font-size: 28px;
    }

    .verification-result-card p {
        font-size: 16px;
    }

    .verification-success i,
    .verification-failed i {
        font-size: 80px;
    }

    .auth-submit-button {
        padding: 14px 36px;
        font-size: 15px;
    }

    .background-accent {
        width: 300px;
        height: 300px;
    }
}

@media (max-width: 480px) {
    .verification-result-card {
        padding: 30px 20px;
    }

    .verification-result-card h2 {
        font-size: 24px;
    }

    .verification-success i,
    .verification-failed i {
        font-size: 60px;
    }

    .auth-submit-button {
        width: 100%;
        padding: 12px 24px;
    }
}
</style>

<script>
function requestNewLink() {
    const email = prompt('Enter your email address to receive a new verification link:');
    
    if (!email) {
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Show loading state
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

    fetch('https://apilageai.lk/auth/resend-verification', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: 'email=' + encodeURIComponent(email)
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (data.e) {
            alert('Error: ' + data.m);
        } else {
            alert('Success! ' + data.m + '\n\nPlease check your email inbox.');
            setTimeout(() => {
                window.location.href = 'https://apilageai.lk/auth/login';
            }, 2000);
        }
    })
    .catch(err => {
        btn.disabled = false;
        btn.innerHTML = originalText;
        console.error('Error:', err);
        alert('Failed to send verification email. Please try again or contact support.');
    });
}

// Auto-redirect after successful verification
{if !$result.e && !isset($result.already_verified)}
    setTimeout(function() {
        window.location.href = 'https://apilageai.lk/auth/login?verified=success';
    }, 5000);
{/if}
</script>

</body>
</html>