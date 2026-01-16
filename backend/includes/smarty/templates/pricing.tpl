{include file="components/head.tpl"}
{include file="components/header.tpl"}
<script
  src="https://app.livechatai.com/embed.js"
  data-id="cm9xodvtz0008jj0bvkdklztx"
  async defer>
</script>
<section id="pricing" class="pricing-section bg-light">
    <!-- Price Slider Section -->
    <div class="text-center mb-5">
        <div class="badge text-bg-light rounded-pill px-3 py-2 mb-3">Choose your limits</div>
        <h2 class="display-5 fw-bold">අපිලගේ Budget එකට ගැලපෙන්න තෝරන්න</h2>
      <p class="lead text-muted mx-auto" style="max-width: 700px;">
       මාසේ ගානේ ගෙවලා එපා වෙලාද? මෙන්න විසඳුම, ඔයාට ගන්න ඕන Credit ගාන තෝරලා Recharge කරන්න.
      </p>
    </div>
    <div id="pricingSection" class="pricing-section">
        <div class="card">
            {if $user->_logged_in}
                <h2 class="card-title">Choose Your Price</h2>

                <div class="price-display">
                    <span id="priceDisplay" class="price">LKR 200</span>
                </div>

                <div class="slider-container">
                    <div class="slider-labels">
                        <span>200 LKR</span>
                        <span>10000 LKR</span>
                    </div>
                    <input type="range" id="priceSlider" min="200" max="10000" step="100" value="200" class="slider">
                </div>

                <div class="button-container">
                    <button class="button" id="recharge">
                        <span>Recharge</span>
                        <i class="fa fa-arrow-right"></i>
                    </button>
                </div>

                <script src="https://apilageai.lk/assets/scripts/pricing.min.js?v={get_hash_token()}"></script>
                <script src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"></script>
                {literal}
                <script>
                    const rechargeButton = document.getElementById('recharge');

                    rechargeButton.addEventListener('click', (e) => {
                        window.location.href = `https://apilageai.lk/pay/${priceSlider.value}`;
                    });
                </script>
                {/literal}
            {/if}

            <!-- Price Table -->
            <div class="table-container">
                <table class="price-table">
                    <thead>
                        <tr>
                            <th>Usage</th>
                            <th>Feature</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rs. 0.0007409</td>
                            <td>For a single word supporting සිංහල (ApilV-1)</td>
                        </tr>
                        <tr>
                            <td>RS. 1.0</td>
                            <td>For A one High quality Image (ApilV-1)</td>
                        </tr>
                        <tr>
                            <td>Rs. 15.00</td>
                            <td>for Document analyse (ApilV-1)</td>
                        </tr>
                        <tr>
                            <td>Rs. 12.00</td>
                            <td>One Image Analyse (ApilV-1)</td>
                        </tr>
                        <tr>
                            <td>Rs. 1.00</td>
                            <td>Memory Cost (apilageai.lk)</td>
                        </tr>
                        <tr>
                            <td colspan="2">And you will get daily Rs. 50.00 FREE 🎁 reward, only valid for a day. <a
                                    href="https://apilageai.lk/blog/post.html?id=2980935902655791454">Learn More / තව දැනගන්න</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
{include file="components/footer.tpl"}
