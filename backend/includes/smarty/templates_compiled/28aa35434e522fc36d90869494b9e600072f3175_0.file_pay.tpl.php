<?php
/* Smarty version 5.5.1, created on 2025-06-05 13:25:53
  from 'file:pay.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68414d89c52c77_56321629',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '28aa35434e522fc36d90869494b9e600072f3175' => 
    array (
      0 => 'pay.tpl',
      1 => 1747554809,
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
function content_68414d89c52c77_56321629 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
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
    <form action="https://www.payhere.lk/pay/checkout" method="post">
      <input type="hidden" name="merchant_id" value="1230065" />
      <input type="hidden" name="return_url" value="https://apilageai.lk/dashboard/usage" />
      <input type="hidden" name="cancel_url" value="https://apilageai.lk/dashboard" />
      <input type="hidden" name="notify_url" value="https://apilageai.lk/api/pay/payhere" />
      <input type="hidden" name="currency" value="LKR" />
      <input type="hidden" name="hash" value="<?php echo $_smarty_tpl->getValue('hash');?>
" />
      <input type="hidden" name="items" value="Recharge" />
      <input type="hidden" name="amount" value="<?php echo $_smarty_tpl->getValue('amount');?>
" />
      <input type="hidden" name="order_id" value="<?php echo $_smarty_tpl->getValue('order_id');?>
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
