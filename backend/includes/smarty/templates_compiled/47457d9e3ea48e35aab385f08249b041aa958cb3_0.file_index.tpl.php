<?php
/* Smarty version 5.5.1, created on 2025-06-04 23:08:11
  from 'file:index.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68408483298033_50724132',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '47457d9e3ea48e35aab385f08249b041aa958cb3' => 
    array (
      0 => 'index.tpl',
      1 => 1749058687,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
    'file:components/header.tpl' => 1,
    'file:components/footer.tpl' => 1,
  ),
))) {
function content_68408483298033_50724132 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
echo '<script'; ?>
>
  document.addEventListener("DOMContentLoaded", () => {
    const isAuthenticated = <?php echo json_encode((($tmp = $_smarty_tpl->getValue('user')->_logged_in ?? null)===null||$tmp==='' ? false ?? null : $tmp));?>
;

    if (isAuthenticated && !sessionStorage.getItem("hasRedirected")) {
      sessionStorage.setItem("hasRedirected", "true");
      window.location.href = "https://apilageai.lk/app/";
    }
  });
<?php echo '</script'; ?>
>
<?php $_smarty_tpl->renderSubTemplate("file:components/header.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
echo '<script'; ?>

  src="https://app.livechatai.com/embed.js"
  data-id="cm9xodvtz0008jj0bvkdklztx"
  async defer>
<?php echo '</script'; ?>
>
<section id="hero" class="min-vh-100 d-flex align-items-center position-relative overflow-hidden">
   <div class="position-absolute top-0 end-0 translate-middle-x gradient-circle-1"></div>
   <div class="position-absolute top-50 start-0 translate-middle gradient-circle-2"></div>
   <!-- background icons -->
<i class="fas fa-book background-icon" style="top: 10%; left: 20%;"></i>
  <i class="fas fa-calculator background-icon" style="top: 50%; left: 50%;"></i>
  <i class="fas fa-ruler background-icon" style="top: 20%; left: 80%;"></i>
  <i class="fas fa-paper-plane background-icon" style="top: 15%; left: 60%;"></i>
  <i class="fas fa-lightbulb background-icon" style="top: 30%; left: 40%;"></i>
  <i class="fas fa-brain background-icon" style="top: 80%; left: 70%;"></i>
  <i class="fas fa-atom background-icon" style="top: 60%; left: 85%;"></i>
  <i class="fas fa-square-root-variable background-icon" style="top: 35%; left: 85%;"></i>
  <i class="fas fa-flask background-icon" style="top: 5%; left: 5%;"></i>
  <i class="fas fa-microscope background-icon" style="top: 85%; left: 40%;"></i>
  <i class="fas fa-chalkboard-teacher background-icon" style="top: 50%; left: 90%;"></i>
   <div class="container py-5">
      <div class="row align-items-center g-5">
         <div class="col-lg-6">
            <div class="mb-4 badge text-bg-light rounded-pill px-3 py-2">
               <i class="fas fa-sparkles me-1"></i>
               Introducing Sri Lanka's First Advanced AI Model
            </div>
            <h1 class="display-4 fw-bold mb-4">Introducing<span class="text-primary"> අපිලගේ AI</span> for Sri Lanka</h1>
            <p class="text-main" style="font-size: 20px; ">
               <b>ලාංකික අපේ අනාගතය වෙනුවෙන්</b> අපිලගේ AI දැන් ඔබේ අතටම
            </p>
<div class="search-container glass-effect mb-5">
            <form class="d-flex w-100" action="app.php" method="get">
              <input type="text" name="q" class="form-control border-0 bg-transparent" placeholder="Ask me anything...">
              <button class="btn btn-sm btn-link ms-auto" type="submit">
                <i class="fas fa-arrow-right"></i>
              </button>
            </form>
          </div>
            <div class="d-flex align-items-center gap-3 text-muted mt-4">
               <p class="small mb-0">Working with 1000+ Students across Sri Lanka</p>
            </div>
         </div>
         <div class="col-lg-6">
            <div class="ai-visualization">
               <div class="main-circle">
                  <div class="gradient-overlay"></div>
                  <div class="pulse-circle"></div>
                  <div class="rotating-circle"></div>
                  <div class="center-pulse"></div>
                  <img src="https://apilageai.lk/assets/images/icon.png" alt="අපිලගේ AI" class="core-image">
               </div>
               <div class="floating-element top-right">
                  <div>මට ශ්වසන පද්ධතිය ගැන පැහැදිලි කරන්න</div>
               </div>
               <div class="floating-element right-mid">
                  <div>physics නම් කෙලවෙලා වගේ, mn dan mk? </div>
               </div>
               <div class="floating-element bottom-left">
                  <div>Apilge Ai නම් මරු</div>
               </div>
               <div class="floating-element left-mid">
                  <div>|2x+1| මාපංක ප්‍රස්ථාරය ඇදලා පැහැදිලි කරන්න.</div>
               </div>
               <div class="floating-element top-left">
                  <div>🖼️ Look at this Image</div>
               </div>
            </div>
         </div>
      </div>
   </div>
</section>
 <!-- Promotions -->
    <div class="promo-banner" id="promoBanner">
      <div class="promo-text" id="promoText">අපිලගේ AI වලට අලුත් ඔයාට අපි ගානේ රුපියල් 50 ක Free Credit එකක්!</div>
      <div>
        <button class="promo-button" onclick="loginNow()">Try Now</button>
      </div>
      <i class="fa fa-times close-btn" onclick="closeBanner()"></i>
    </div>
 <!-- Promotions END -->
 
<section class="look-section" id="lookSection">
  <div class="look-text" id="lookText">
    <h2 id="lookHeading">Loading...</h2>
    <p id="lookParagraph">Please wait while the content loads.</p>
  </div>
  <div class="look-image" id="lookImage">
    <!-- Image will go here -->
  </div>
</section>

  
<section class="maths-section">
    <div class="image-container">
      <img src="https://apilageai.lk/assets/images/preview1.png" alt="Maths related image">
    </div>
    <div class="text-container">
       <h2>ලංකාවේ හොදම සිංහල AI අත්දැකීම</h2>
 <p>
 ලංකාවේ එතෙක් මෙතෙක් හදපු AI chats bots වලින් හොදම අත්දැකීමක් අපිලගේ AI එකෙන් ඔබට ලබා ගන්න පුළුවන්. ApilageAI v-1 Model එකෙහි ඇති better understanding සහ native සිංහල (සිංහල කතන භාෂාව) වඩා හොදින් භාවිතා කිරීමට ඇති හැකියාව නිසා 
 ඉතාමත් ඉහල සාර්ථකත්වයක් සහිතව ඔබේ ප්‍රශ්න වලට පිළිතුරු ලබා දිය හැකිය. තවත් විශේෂත්වයක් වන්නේ මෙය ලංකාවේ උසස්පෙළ සාමාන්‍යපෙළ syllabus වලට අනුකූලව උදව් කිරීමට හුරු වී ඇත.
      </p>
    </div>
  </section>
  <!-- Second Section (Text Left, Image Right) -->
<section class="maths-section reverse">
  <div class="text-container">
        <h2>Deep Research හා Google Search</h2>
    <p>
      ලංකාවේ ප්‍රථම වතාවට AI Helper එකක් සිංහල බසින් තත් කාලීන (Real-Time) Google Search Analyse කර ඔබට උදව් කරන පළමු අවස්ථාව මෙයයි. මෙය විශේෂ වන්නේ ලංකාවේ Web-Resouces භාවිතා කරන බැවින් අධ්‍යාපනික මෙන්න භාහිර Search සදහාද ඉතාමත් ඉහල නිරවද්‍ය Responses ලබා දෙයි. Apilage AI එකේ Search Intelligence එක නිසා ඔබට අහන ඕනම ප්‍රශ්නයකට ලංකාවේ Reasources වලින් හරියටම ගැලපෙන information තෝරලා ඔයාට කියන්න Apilage Ai වලට පුලුවන්.
    </p>
  </div>
  <div class="image-container">
    <img src="http://apilageai.lk/assets/images/preview-2.png" alt="Maths related image 2">
  </div>
</section>
<!-- About Section -->
  <section id="about" class="py-5">
    <div class="container py-5">
      <div class="row align-items-center g-5">
        <div class="col-lg-6 position-relative">
          <div class="about-visual glass-effect p-3 rounded-4 position-relative">
            <div class="rounded-4 aspect-ratio-1 position-relative overflow-hidden">
              <div class="gradient-overlay"></div>
              <div class="text-center p-5 position-relative">
                <div class="mb-4 d-inline-block">
                  <div class="nested-circles">
                    <div class="sriAI-text"><img src="https://apilageai.lk/assets/images/icon.png" width="200px" style="margin-top: 95px;"></div>
                  </div>
                </div>
                <p style="margin-top: 90px;">
                  <ul class="listd">
                    Your data is secured.</br>
                    All pricing plans are <strong>Pay-As-You-Go</strong>.<br>
                    <strong>No subscriptions required:</strong> just pay when you need to use it.</br>
                </ul>
                </p>
              </div>
            </div>
          </div>

          <div class="stat-card top-right">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon">🇱🇰</div>
              <div class="stat-info">
                <div class="stat-title">ලංකාවේ අපි වෙනුවෙන්</div>
                <div class="stat-subtitle">ApilageAI</div>
              </div>
            </div>
          </div>

          <div class="stat-card bottom-left">
            <div class="d-flex align-items-center gap-3">
              <div class="stat-icon">🧠</div>
              <div class="stat-info">
                <div class="stat-title">අපිව අදුරන Apilage Intelligence</div>
                <div class="stat-subtitle">Made in Sri Lanka</div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="badge rounded-pill text-bg-light px-3 py-2 mb-3">About Our AI</div>
          <h2 class="display-5 fw-bold mb-4">ලංකාවේ අපි වෙනුවෙන්, අපි හැමෝටම 🇱🇰</h2>
          <p class="lead text-muted mb-4">
            Apilage AI කියන්නේ ශ්‍රී ලංකාවේ හදපු සිංහල AI agent කෙනෙක්.  Apilage AI හරහා, ඔබට ශ්‍රී ලාංකික විෂය නිර්දේශය මත පදනම්ව සියලුම උසස් පෙළ සහ සාමාන්‍ය පෙළ විෂයයන් සඳහා සහාය ලබා ගත හැකිය. එය ප්‍රස්ථාර, රූප සහ PDF සමඟ පැහැදිලි කිරීම් ද සපයයි. මීට අමතරව Image Genaration වැනි දේ සමගද ඔබට සහය ලබා ගත හැක. AI හි premium අත්දැකීම ලබා ගැනීමට ලොකු මුදලක් ගෙවන්නේ ඇයි? Apilage AI තමා සුපිරිම ! ඔයාගේ භාෂාවෙන් AI premium අත්දෑකීම ගන්න ඔන්න දැන් අවස්ථාව. 
          </p>

          <div class="benefits-list">
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>Developed by Sri Lankan developers for local contexts</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>Trained to to all kind of tasks</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>Continuously improved through user feedback</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>Optimized for Sri Lankan syllabus and education system</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>සිංහල භාෂාව හොදටම පුලුවන් 😉</p>
            </div>
            <div class="benefit-item">
              <i class="fas fa-check text-primary"></i>
              <p>Additional explaining in subjects with images and graphs</p>
            </div>
          </div>

          <div class="mt-4">
            <a href="./app/" class="btn btn-primary px-4 py-2">
              අදම Try කරන්න
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
<!-- Features Section -->
  <section id="features" class="py-5 bg-light">
    <div class="container py-5">
      <div class="text-center mb-5">
        <div class="badge text-bg-light rounded-pill px-3 py-2 mb-3">Advanced Capabilities</div>
        <h2 class="display-5 fw-bold">Powerful Features Designed for Sri Lanka</h2>
        <p class="lead text-muted mx-auto" style="max-width: 700px;">
          Our AI model comes with a set of features specifically optimized for Sri Lankan Students,
          Researchers, and Tech-community.
        </p>
      </div>

      <div class="row g-4">
        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-globe"></i>
            </div>
            <h3 class="h5 fw-bold">100% අපේ දෙයක්</h3>
            <p class="text-muted">අපිලගේ Ai කියන්නේ ලංකාවේ පළෙවනි multitasking Ai agent කියලා ඔයලා දන්නවද?
            </p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-comment"></i>
            </div>
            <h3 class="h5 fw-bold">මේකේ තියෙන විශේෂත්වය මොකක්ද?</h3>
            <p class="text-muted">අපිළගේ AI එකේ තියන Search Intelligence එක නිසා ඔයා අහන ඕනම ප්‍රශ්නයකට ලංකාවේ Reasources වලින් හරියටම ගැලපෙන information තෝරලා ඔයාට කියන්න Apilage Ai වලට පුලුවන්</p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-layer-group"></i>
            </div>
            <h3 class="h5 fw-bold">Apilage AI මතකය</h3>
            <p class="text-muted">ඔයා Apilage AI එක්ක කරන හැම converstation එකක් ගැනම Apilage AI වලට හොද අවබෝධයක් තියනවා. ඒ හින්දා වඩා හොද reponses දෙන්න අපිලගේ Ai වලට පුලුවන්</p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-shield"></i>
            </div>
            <h3 class="h5 fw-bold">Privacy කේස් නම් කොහෙත්ම නෑ</h3>
            <p class="text-muted">ඔයාලගේ Data 100% secured, ඒක නිසා කොහෙත්ම බය වෙන්න එපා තව දැනගන්න ඕන නම් privacypolicy කියවන්න</p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-bolt"></i>
            </div>
            <h3 class="h5 fw-bold">Updative technology එක නිසා සුපිරී</h3>
            <p class="text-muted">අපේ users ලා හැමදෙම Updative තියගන්න එක ApilageAi අපේ වගකීම ඒන හින්දා ඔයාලට ගැලපෙන අලුත් Updates කලට වෙලාවට Relase කරනවා</p>
          </div>
        </div>

        <div class="col-md-6 col-lg-4">
          <div class="feature-card glass-effect p-4 rounded-4 h-100">
            <div class="feature-icon mb-3">
              <i class="fas fa-users"></i>
            </div>
            <h3 class="h5 fw-bold">අපිත් එක්ක ඉන්න ඔයාලගේ අදහස් වලින්..</h3>
            <p class="text-muted">අපිලගේ Ai ඉස්සරහට Develop කරන් යන්න ඔයාලගේ අදහස් අපිට කියන්න <a href="https://whatsapp.com/channel/0029Vb5o3a9HLHQhPio8fs0k">Whatsapp Channel</a> / <a href="https://discord.gg/CfgCtYa2nM">Discord</a></p>
          </div>
        </div>
      </div>
    </div>
  </section>
  <!-- Pricing Section -->
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
            <?php if ($_smarty_tpl->getValue('user')->_logged_in) {?>
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

                <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/pricing.min.js?v=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
                <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"><?php echo '</script'; ?>
>
                
                <?php echo '<script'; ?>
>
                    const rechargeButton = document.getElementById('recharge');

                    rechargeButton.addEventListener('click', (e) => {
                        window.location.href = `https://apilageai.lk/pay/${priceSlider.value}`;
                    });
                <?php echo '</script'; ?>
>
                
            <?php }?>

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

<!-- Blog Section -->
<section id="blog" class="py-5">
    <div class="container py-5">
        <div class="text-center mb-5">
            <div class="badge text-bg-light rounded-pill px-3 py-2 mb-3">Updates</div>
            <h2 class="display-5 fw-bold">Latest Insights & Updates</h2>
            <p class="lead text-muted mx-auto" style="max-width: 700px;">
                Stay informed about the latest developments in AI technology for Sri Lanka
                and discover how our solutions are making an impact.
            </p>
        </div>

        <section class="blog-section">
            <div id="blog-posts"></div>
        </section>

        <div class="text-center mt-5">
            <a href="https://blog.apilageai.lk" class="btn btn-outline-primary">View All Articles</a>
        </div>
    </div>
</section>
<!-- Partner Brands Section -->
<section id="partners" class="py-5 bg-light-pink">
   <div class="container py-4">
      <div class="text-center mb-5">
         <div class="badge text-bg-light rounded-pill px-3 py-2 mb-3">
            <i class="fas fa-handshake text-primary me-1"></i>
            Working with
         </div>
         <h2 class="h2 fw-bold">Power and Technology</h2>
         <p class="text-muted mx-auto" style="max-width: 600px;">
            Join the growing network of organizations leveraging ApilageAI cutting-edge technology
         </p>
      </div>
      <div class="row row-cols-2 row-cols-md-3 row-cols-lg-5 g-4 align-items-center justify-content-center">
         <div class="col">
            <div class="partner-logo">
               <img src="https://apilageai.lk/assets/images/partners/globbook.png" alt="Globbook" class="img-fluid">
            </div>
         </div>
         <div class="col">
            <div class="partner-logo">
               <img src="https://apilageai.lk/assets/images/partners/openai.webp" alt="OpenAI" class="img-fluid">
            </div>
         </div>

         <div class="col">
            <div class="partner-logo">
               <img src="https://apilageai.lk/assets/images/partners/nividu.webp" alt="Nividu" class="img-fluid" width="70px">
            </div>
         </div>
      </div>
   </div>
</section>
  <div class="cookie-banner" id="cookieBanner">
  <div class="cookie-text">
    <img src="https://cdn-icons-png.flaticon.com/512/1047/1047711.png" alt="Cookie">
    <p>Apilageai uses cookies to ensure you get the best experience.</p>
  </div>
  <button class="cookie-btn" onclick="acceptCookies()">Accept</button>
</div>

<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/blog.min.js?v=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
<?php $_smarty_tpl->renderSubTemplate("file:components/footer.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
}
}
