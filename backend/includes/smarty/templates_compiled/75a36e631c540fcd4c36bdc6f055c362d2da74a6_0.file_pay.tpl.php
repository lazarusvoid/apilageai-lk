<?php
/* Smarty version 5.5.2, created on 2025-08-30 23:33:06
  from 'file:pay.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.2',
  'unifunc' => 'content_68b33cda374a23_87740683',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '75a36e631c540fcd4c36bdc6f055c362d2da74a6' => 
    array (
      0 => 'pay.tpl',
      1 => 1754985742,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
    'file:components/payhead.tpl' => 1,
    'file:components/footer.tpl' => 1,
  ),
))) {
function content_68b33cda374a23_87740683 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates';
echo '<?php'; ?>

function generateCheckValue($merchantKey, $merchantToken, $invoiceId, $amount, $currencyCode) {
    // Format amount to 2 decimal places
    $amount = number_format((float)$amount, 2, '.', '');
    $mToken = strtoupper(hash('sha512', $merchantToken));
    $val = implode('|', [$merchantKey, $invoiceId, $amount, $currencyCode, $mToken]);
    error_log("Hash String: " . $val);
    return strtoupper(hash('sha512', $val));
}
$merchantKey = 'BC3F67B1B7CCC5B8';
$merchantToken = '31138CA7138C16BBF8DB1E8F8FDBCBF6';
$invoiceId = $order_id;
$amount = $amount;
$currencyCode = 'LKR';
$hash = generateCheckValue($merchantKey, $merchantToken, $invoiceId, $amount, $currencyCode);
<?php echo '?>'; ?>

<?php $_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
$_smarty_tpl->renderSubTemplate("file:components/payhead.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>
<style>

.checkout-container {
  margin-top: 120px; 
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1000px;
  margin-left: auto; 
  margin-right: auto;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 2rem;
   margin-bottom: 40px; 
}
.form-section {
  flex: 2;
}

.form-section form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.form-col {
  flex: 1;
  min-width: 220px;
  display: flex;
  flex-direction: column;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 600;
  font-size: 0.95rem;
}

input[type="text"],
input[type="email"],
input[type="tel"],
select,
textarea {
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  border: 1px solid #ccc;
  font-size: 1rem;
  background-color: #fefefe;
  transition: border-color 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #007bff;
}

textarea {
  resize: vertical;
}

input[type="submit"] {
  padding: 1rem;
  background-color: #f00b0b;
  color: #fff;
  border: none;
  font-weight: 600;
  border-radius: 0.6rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

input[type="submit"]:hover {
  background-color: #980404;
}

.summary-panel {
  flex: 1;
  background-color: #f8f9fa;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: inset 0 0 0.75rem rgba(0, 0, 0, 0.03);
}

.summary-panel h3 {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.summary-panel img {
  width: 100%;
  max-width: 120px;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.summary-amount {
  font-weight: 600;
  font-size: 1.1rem;
}

.summary-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #007bff;
  margin-bottom: 0.5rem;
}

.summary-panel input[type="text"] {
  font-size: 0.95rem;
  padding: 0.65rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid #ccc;
  width: 100%;
}

.summary-panel button {
  background-color: #ffd2d8;
  color: #d90429;
  border: none;
  padding: 0.65rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.summary-panel button:hover {
  background-color: #fbb8c2;
}

@media (max-width: 768px) {
  .checkout-container {
    flex-direction: column;
  }
}

</style>

<!-- ---------- BODY ---------- -->
<div class="checkout-container">
  <div class="form-section">
    <form action="https://payable-ipg-payment.web.app/ipg/sandbox/" method="post">
      <input type="hidden" name="invoiceId" value="<?php echo $_smarty_tpl->getValue('order_id');?>
" />
      <input type="hidden" name="merchantKey" value="<?php echo '<?php'; ?>
 echo $merchantKey; <?php echo '?>'; ?>
" />
      <input type="hidden" name="merchantToken" value="<?php echo '<?php'; ?>
 echo $merchantToken; <?php echo '?>'; ?>
" />
      <input type="hidden" name="integrationType" value="MSDK" />
      <input type="hidden" name="integrationVersion" value="1.0.1" />
      <input type="hidden" name="refererUrl" value="https://apilageai.lk" />
      <input type="hidden" name="logoUrl" value="https://apilageai.lk/assets/images/icon.png" />
      <input type="hidden" name="webhookUrl" value="https://apilageai.lk/api/pay" />
      <input type="hidden" name="returnUrl" value="https://apilageai.lk/billing" />
      <input type="hidden" name="amount" value="<?php echo $_smarty_tpl->getValue('amount');?>
" />
      <input type="hidden" name="currencyCode" value="LKR" />
      <input type="hidden" name="orderDescription" value="Add Credits" />
      <input type="hidden" name="customerFirstName" value="<?php echo $_smarty_tpl->getValue('user')['first_name'];?>
" />
      <input type="hidden" name="customerLastName" value="<?php echo $_smarty_tpl->getValue('user')['last_name'];?>
" />
      <input type="hidden" name="customerEmail" value="<?php echo $_smarty_tpl->getValue('user')['email'];?>
" />
      <input type="hidden" name="customerMobilePhone" value="<?php echo $_smarty_tpl->getValue('user')['phone'];?>
" />
      <input type="hidden" name="billingAddressStreet" value="Hill Street" />
      <input type="hidden" name="billingAddressCity" value="Dehiwala" />
      <input type="hidden" name="billingAddressCountry" value="LK" />
      <input type="hidden" name="billingAddressPostcodeZip" value="10350" />
      <input type="hidden" name="billingAddressStateProvince" value="Western" />
      <input type="hidden" name="shippingContactFirstName" value="<?php echo $_smarty_tpl->getValue('user')['first_name'];?>
" />
      <input type="hidden" name="shippingContactLastName" value="<?php echo $_smarty_tpl->getValue('user')['last_name'];?>
" />
      <input type="hidden" name="shippingContactEmail" value="<?php echo $_smarty_tpl->getValue('user')['email'];?>
" />
      <input type="hidden" name="shippingContactMobilePhone" value="<?php echo $_smarty_tpl->getValue('user')['phone'];?>
" />
      <input type="hidden" name="shippingAddressStreet" value="Hill Street" />
      <input type="hidden" name="shippingAddressCity" value="Dehiwala" />
      <input type="hidden" name="shippingAddressCountry" value="LK" />
      <input type="hidden" name="shippingAddressPostcodeZip" value="10350" />
      <input type="hidden" name="shippingAddressStateProvince" value="Western" />
      <input type="hidden" name="paymentType" value="1" />
      <input type="hidden" name="checkValue" value="<?php echo '<?php'; ?>
 echo $hash; <?php echo '?>'; ?>
" />

      <div class="form-row">
        <div class="form-col">
          <label for="first_name">First Name</label>
          <input type="text" id="first_name" name="first_name" required />
        </div>
        <div class="form-col">
          <label for="last_name">Last Name</label>
          <input type="text" id="last_name" name="last_name" required />
        </div>
      </div>

      <div class="form-row">
        <div class="form-col">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div class="form-col">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" name="phone" required />
        </div>
      </div>

      <label for="address">Address</label>
      <textarea id="address" name="address" rows="3" required></textarea>

      <div class="form-row">
        <div class="form-col">
          <label for="city">City</label>
          <input type="text" id="city" name="city" required />
        </div>
        <div class="form-col">
          <label for="country">Country</label>
          <select id="country" name="country" required>
            <option value="Sri Lanka" selected>Sri Lanka</option>
          </select>
        </div>
      </div>

      <input type="submit" value="Continue to Payment" />
    </form>
  </div>

  <aside class="summary-panel">
    <h3>Order Summary</h3>
    <img src="https://apilageai.lk/assets/images/ai-pro-icon.png" alt="Item" />
    <p class="summary-amount">Recharge</p>
    <div class="summary-price">Rs. <?php echo $_smarty_tpl->getValue('amount');?>
</div>
    <div style="margin-top: 1rem">
      <p style="margin: 0 0 0.4rem; font-weight: 600">
        Subtotal: <span style="float: right">Rs. <?php echo $_smarty_tpl->getValue('amount');?>
</span>
      </p>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem">
        <input
          type="text"
          placeholder="Enter coupon code"
          style="flex: 1; padding: 0.65rem 0.75rem; border-radius: 0.5rem; border: 1px solid #ccc"
        />
        <button
          type="button"
          style="background-color: #ffd2d8; color: #d90429; border: none; padding: 0.65rem 1rem; border-radius: 0.5rem; font-weight: 600"
        >
          Apply
        </button>
      </div>
    </div>
  </aside>
</div>

<?php $_smarty_tpl->renderSubTemplate("file:components/footer.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
}
}
