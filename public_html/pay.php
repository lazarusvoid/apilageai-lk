<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/../backend/bootstrap.php'; 

if (! isset($user) || ! $user->_logged_in) {
    header("Location: https://apilageai.lk/auth/login");
    exit;
}

$uri = $_SERVER['REQUEST_URI'];
$path = parse_url($uri, PHP_URL_PATH);
$parts = explode('/', trim($path, '/'));
$amountRaw = floatval(end($parts));
if ($amountRaw <= 0) {
    die("Invalid amount.");
}
$amount = number_format($amountRaw, 2, '.', '');

$merchant_key   = "B669783789CC996D"; 
$merchant_token = "84CAE8510FBAD220D63EE313DEF2D1A3";

$invoice_id = "INV" . substr(md5(uniqid('', true)), 0, 8);

$token_hash  = strtoupper(hash("sha512", $merchant_token));
$check_value = strtoupper(hash("sha512", "$merchant_key|$invoice_id|$amount|LKR|$token_hash"));

$stmt = $db->prepare("
  INSERT INTO transactions (invoice_id, user_id, amount, paid, created_at, status_indicator)
  VALUES (?, ?, ?, 0, NOW(), '')
");
$stmt->bind_param("sid", $invoice_id, $user->_data['user_id'], $amountRaw);
$stmt->execute();
$stmt->close();

$first_name = $user->_data['first_name'];
$last_name  = $user->_data['last_name'];
$email      = $user->_data['email'];

$raw_mobile = isset($user->_data['phone']) ? $user->_data['phone'] : '';
$mobile = preg_replace('/[^0-9]/', '', $raw_mobile);
if (strlen($mobile) === 9) {
    $mobile = '0' . $mobile;
}
if (strlen($mobile) < 10) {
    $mobile = '0700000000';
}

// Dynamic Greeting
date_default_timezone_set('Asia/Colombo');
$hour = date('H');
if ($hour >= 22 || $hour < 4) {
    $greeting = "Happy Late Night";
} elseif ($hour < 12) {
    $greeting = "Good Morning";
} else {
    $greeting = "Good Evening";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Payment - ApilageAI</title>

<!-- Payable SDK v4 Live -->
<script src="https://ipgsdk.payable.lk/sdk/v4/payable-checkout.js"></script>

<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

<style>
    :root {
      --primary-color: #D90429;
      --primary-hover: #C00424;
      --bg-left: #F9FAFB;
      --bg-right: #FFFFFF;
      --text-main: #111827;
      --text-muted: #6B7280;
      --border-light: #E5E7EB;
      --input-bg: #F3F4F6;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: #F3F4F6;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      color: var(--text-main);
      -webkit-font-smoothing: antialiased;
    }

    /* Main Card Container */
    .checkout-container {
      background: #FFFFFF;
      width: 100%;
      max-width: 1000px;
      min-height: 600px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
      border-radius: 8px; /* Slightly sharper corners like the image */
      overflow: hidden;
    }

    /* Desktop Split Layout */
    @media (min-width: 800px) {
      .checkout-container {
        flex-direction: row;
      }
      .left-pane {
        width: 50%;
        border-right: 1px solid var(--border-light);
      }
      .right-pane {
        width: 50%;
      }
    }

    /* --- Left Pane (Summary) --- */
    .left-pane {
      background-color: var(--bg-left);
      padding: 48px;
      display: flex;
      flex-direction: column;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      margin-bottom: 40px;
      cursor: pointer;
    }

    .back-link span {
      margin-left: 8px;
      background: #E5E7EB;
      color: var(--text-main);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }

    .back-arrow {
      margin-right: 8px;
    }

    .product-title {
      font-size: 16px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }

    .main-price {
      font-size: 42px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 40px;
      letter-spacing: -1px;
    }

    .main-price small {
      font-size: 16px;
      color: var(--text-muted);
      font-weight: 400;
      margin-left: 8px;
    }

    .order-summary {
      margin-top: auto; /* Pushes to bottom if space permits */
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      padding-bottom: 16px;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--border-light);
      font-size: 14px;
      color: var(--text-main);
    }
    
    .summary-item.total {
      border-bottom: none;
      font-weight: 600;
      font-size: 16px;
      margin-top: 10px;
    }

    /* --- Right Pane (Action) --- */
    .right-pane {
      background-color: var(--bg-right);
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .section-header {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--text-main);
    }

    /* Read-only Fields styled like inputs */
    .readonly-field {
      background-color: var(--bg-left);
      border: 1px solid var(--border-light);
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 14px;
      color: var(--text-main);
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .readonly-label {
      color: var(--text-muted);
      margin-right: 10px;
    }

    /* Payment Method Selection Simulation */
    .payment-method-box {
      border: 1px solid var(--primary-color);
      background-color: #FFF5F5; /* Very light red bg */
      border-radius: 6px;
      padding: 16px;
      display: flex;
      align-items: center;
      margin-bottom: 32px;
      position: relative;
    }

    .radio-circle {
      width: 18px;
      height: 18px;
      border: 5px solid var(--primary-color);
      border-radius: 50%;
      margin-right: 12px;
      background: white;
    }

    .card-icons {
      margin-left: auto;
      display: flex;
      gap: 8px;
    }
    
    .card-icon {
      height: 20px;
      opacity: 0.8;
    }

    /* Pay Button */
    .pay-btn {
      width: 100%;
      background-color: var(--primary-color);
      color: white;
      border: none;
      padding: 16px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-bottom: 16px;
    }

    .pay-btn:hover {
      background-color: var(--primary-hover);
    }

    .legal-text {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.5;
      text-align: center;
    }
    
    .legal-text a {
      color: var(--text-muted);
      text-decoration: underline;
    }

    /* Cancel Button Link */
    .cancel-link {
      display: block;
      text-align: center;
      margin-top: 16px;
      color: var(--text-muted);
      font-size: 14px;
      text-decoration: none;
    }
    .cancel-link:hover {
      color: var(--text-main);
    }

  </style>
</head>
<body>

<div class="checkout-container">
  <!-- LEFT PANE -->
  <div class="left-pane">
    <a href="https://apilageai.lk/app" class="back-link">
      <span class="back-arrow">&larr;</span> Recharge Credit <span>ApilageAI</span>
    </a>

    <div class="product-title"><?php echo $greeting; ?>, Payment for</div>
    <div class="main-price">
      LKR <?php echo htmlspecialchars($amount); ?>
      <small>one-time</small>
    </div>

    <div class="order-summary">
      <div class="summary-item">
        <span>Invoice ID</span>
        <span><?php echo $invoice_id; ?></span>
      </div>
      <div class="summary-item">
        <span>Customer</span>
        <span><?php echo htmlspecialchars($first_name); ?></span>
      </div>
      <div class="summary-item">
        <span>Valid for</span>
        <span>60 Days</span>
      </div>
      <div class="summary-item total">
        <span>Total due today</span>
        <span>LKR <?php echo htmlspecialchars($amount); ?></span>
      </div>
    </div>
  </div>

  <!-- RIGHT PANE -->
  <div class="right-pane">
    <div class="section-header">Contact information</div>
    <div class="readonly-field">
      <span class="readonly-label">Email</span>
      <span><?php echo htmlspecialchars($email); ?></span>
    </div>
    <div class="readonly-field">
      <span class="readonly-label">Phone</span>
      <span><?php echo htmlspecialchars($mobile); ?></span>
    </div>

    <div class="section-header">Payment method</div>
    <div class="payment-method-box">
      <div class="radio-circle"></div>
      <span style="font-weight: 500;">Payable Secure Checkout</span>
      <div class="card-icons">
        <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" height="20">
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" height="20">
      </div>
    </div>

    <button onclick="startPayment()" class="pay-btn">
      Pay LKR <?php echo htmlspecialchars($amount); ?>
    </button>

    <div class="legal-text">
      By confirming your payment, you allow ApilageAI to charge you for this invoice. 
      <br>We do not store your card details. 
      <br>Payments are valid for 60 days.
    </div>
    
    <a href="https://apilageai.lk/app" class="cancel-link">Cancel and return</a>
  </div>
</div>

<script>
function startPayment(){
    const payment = {
        logoUrl: "https://apilageai.lk/assets/images/logos/paylog2.png",
        returnUrl: "https://apilageai.lk/app",
        notifyUrl: "https://apilageai.lk/notify.php",
        merchantKey: "<?php echo $merchant_key; ?>",
        checkValue: "<?php echo $check_value; ?>",
        amount: "<?php echo $amount; ?>",
        invoiceId: "<?php echo $invoice_id; ?>",
        orderDescription: "Payment for Invoice <?php echo $invoice_id; ?>",
        currencyCode: "LKR",
        paymentType: 1,
        customerFirstName: "<?php echo $first_name; ?>",
        customerLastName: "<?php echo $last_name; ?>",
        customerEmail: "<?php echo $email; ?>",
        customerMobilePhone: "<?php echo $mobile; ?>",
        customerPhone: "<?php echo $mobile; ?>",
        billingAddressStreet: "No Street",
        billingAddressCity: "Colombo",
        billingAddressCountry: "LKA",
        onCompleted: function(data){
            if (!data || (data.statusCode !== 1 && data.statusMessage.toUpperCase() !== "SUCCESS")){
                alert("Payment failed or not approved");
                return;
            }
            window.location.href = "https://apilageai.lk/app";
        },
        onDismissed: function(){ 
            // Optional: handle dismiss
        },
        onError: function(err){
            console.error("Payment error", err);
            alert("Payment error occurred");
        }
    };

    // Payable v4 live call
    payablePayment(payment);
}
</script>

</body>
</html>
