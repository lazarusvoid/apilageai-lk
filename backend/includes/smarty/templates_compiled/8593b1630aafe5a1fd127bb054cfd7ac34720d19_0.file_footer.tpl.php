<?php
/* Smarty version 5.5.1, created on 2025-06-02 23:17:38
  from 'file:components/footer.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_683de3ba3e7439_15858146',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '8593b1630aafe5a1fd127bb054cfd7ac34720d19' => 
    array (
      0 => 'components/footer.tpl',
      1 => 1745978270,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
  ),
))) {
function content_683de3ba3e7439_15858146 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates/components';
?>    <footer class="bg-white border-top py-5">
    <div class="container py-4">
      <div class="row g-4">
        <div class="col-lg-3 col-md-6">
          <div class="d-flex align-items-center mb-3">
            <div class="brand-icon me-2"><img src="https://apilageai.lk/assets/images/icon.png" alt="Logo" width="65" height="65" style="padding: 5px;"></div>
            <span class="fw-bold fs-4">Apilage AI</span>
          </div>
          <p class="text-muted mb-4">
            ශ්‍රී ලාංකික සන්දර්භයන් සහ භාෂා සඳහා විශේෂයෙන් නිර්මාණය කර ඇති පුරෝගාමී කෘතිම බුද්ධි විසඳුම්.
          </p>
          <div class="d-flex gap-3">
            <a href="https://www.facebook.com/apilageai" class="text-muted"><i class="fab fa-facebook"></i></a>
            <a href="https://www.instagram.com/apilageai" class="text-muted"><i class="fab fa-instagram"></i></a>
            <a href="https://www.linkedin.com/company/apilageai/" class="text-muted"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3">Company</h5>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="#about" class="text-muted text-decoration-none">About Us</a></li>
            <li class="mb-2"><a href="#features" class="text-muted text-decoration-none">Features</a></li>
            <li class="mb-2"><a href="#pricing" class="text-muted text-decoration-none">Pricing</a></li>
            <li class="mb-2"><a href="#blog" class="text-muted text-decoration-none">Blog</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3">Resources</h5>
          <ul class="list-unstyled">
            <li class="mb-2"><a href="https://blog.apilageai.lk/2025/04/pricing.html" class="text-muted text-decoration-none">Usages</a></li>
            <li class="mb-2"><a href="mailto:dineth@apilageai.lk" class="text-muted text-decoration-none">Support</a></li>
          </ul>
        </div>

        <div class="col-lg-3 col-md-6">
          <h5 class="fw-bold mb-3">Contact</h5>
          <ul class="list-unstyled">
            <li class="mb-2 d-flex">
              <i class="far fa-envelope text-muted mt-1 me-2"></i>
              <span class="text-muted">contact@apilageai.lk</span>
            </li>
            <li class="mb-2 d-flex">
              <i class="fas fa-phone text-muted mt-1 me-2"></i>
              <span class="text-muted">+94701840527</span>
            </li>
            <li class="mb-2 text-muted">
              151, Suwasewa Mawatha Kaluatra South, Sri Lanka
            </li>
          </ul>
        </div>
      </div>
 <iframe src="https://status.apilageai.lk/badge?theme=light" width="250" height="30" frameborder="0" scrolling="no" style="color-scheme: dark"></iframe>
      <div class="border-top mt-5 pt-4 d-flex flex-column flex-md-row justify-content-between align-items-center">
        <p class="text-muted small mb-3 mb-md-0">
          © 2025 apilageai.lk. All rights reserved.
        </p>
        <div class="d-flex gap-4">
          <a href="./privacypolicy/" class="text-muted small">Privacy Policy</a>
          <a href="./termsconditions/" class="text-muted small">Terms of Service</a>
          <a href="./refundpolicies/" class="text-muted small">Refund Policy</a>
        </div>
      </div>
    </div>
  </footer>
</div>

<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/main.js?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>

<?php echo '<script'; ?>
>
    window.addEventListener("load", function () {
        let preloader = document.getElementById("preloader");
        let content = document.getElementById("content");

        let minTime = 2000; 
        let startTime = Date.now();

        function hidePreloader() {
            let elapsedTime = Date.now() - startTime;
            let remainingTime = minTime - elapsedTime;

            if (remainingTime > 0) {
                setTimeout(() => {
                    preloader.style.display = "none";
                    content.style.display = "block";
                    document.body.style.overflow = "auto"; 
                }, remainingTime);
            } else {
                preloader.style.display = "none";
                content.style.display = "block";
                document.body.style.overflow = "auto";
            }
        }

        if (document.readyState === "complete") {
            hidePreloader();
        } else {
            setTimeout(() => {
                if (document.readyState === "complete") {
                    hidePreloader();
                } else {
                    window.addEventListener("load", hidePreloader);
                }
            }, minTime);
        }
    });
<?php echo '</script'; ?>
>
</body>

</html><?php }
}
