{include file="components/head.tpl"}
{include file="components/payhead.tpl"}

<div class="checkout-container">
  <div class="form-section">
    <form action="https://payable-ipg-payment.web.app/ipg/sandbox/" method="post">
      <input type="hidden" name="invoiceId" value="{$order_id}" />
      <input type="hidden" name="merchantKey" value="{$merchantKey}" />
      <input type="hidden" name="integrationType" value="MSDK" />
      <input type="hidden" name="integrationVersion" value="1.0.1" />
      <input type="hidden" name="refererUrl" value="https://apilageai.lk" />
      <input type="hidden" name="logoUrl" value="https://apilageai.lk/assets/images/icon.png" />
      <input type="hidden" name="webhookUrl" value="https://apilageai.lk/api/payable-webhook.php" />
      <input type="hidden" name="returnUrl" value="https://apilageai.lk/billing" />
      <input type="hidden" name="amount" value="{$amount}" />
      <input type="hidden" name="currencyCode" value="LKR" />
      <input type="hidden" name="orderDescription" value="Add Credits - Apilage AI" />
      <input type="hidden" name="customerFirstName" value="{$firstName}" />
      <input type="hidden" name="customerLastName" value="{$lastName}" />
      <input type="hidden" name="customerEmail" value="{$email}" />
      <input type="hidden" name="customerMobilePhone" value="0770000000" />
      <input type="hidden" name="billingAddressStreet" value="Hill Street" />
      <input type="hidden" name="billingAddressCity" value="Dehiwala" />
      <input type="hidden" name="billingAddressCountry" value="LK" />
      <input type="hidden" name="billingAddressPostcodeZip" value="10350" />
      <input type="hidden" name="billingAddressStateProvince" value="Western" />
      <input type="hidden" name="shippingContactFirstName" value="{$firstName}" />
      <input type="hidden" name="shippingContactLastName" value="{$lastName}" />
      <input type="hidden" name="shippingContactEmail" value="{$email}" />
      <input type="hidden" name="shippingContactMobilePhone" value="0770000000" />
      <input type="hidden" name="shippingAddressStreet" value="Hill Street" />
      <input type="hidden" name="shippingAddressCity" value="Dehiwala" />
      <input type="hidden" name="shippingAddressCountry" value="LK" />
      <input type="hidden" name="shippingAddressPostcodeZip" value="10350" />
      <input type="hidden" name="shippingAddressStateProvince" value="Western" />
      <input type="hidden" name="paymentType" value="1" />
      <input type="hidden" name="checkValue" value="{$checkValue}" />

      <input type="submit" value="Continue to Payment" />
    </form>
  </div>

  <aside class="summary-panel">
    <h3>Order Summary</h3>
    <p class="summary-amount">Recharge</p>
    <div class="summary-price">Rs. {$amount}</div>
  </aside>
</div>

{include file="components/footer.tpl"}
