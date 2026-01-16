<?php
/* Smarty version 5.5.1, created on 2025-06-05 13:11:53
  from 'file:dashboard.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_68414a414ddbe6_43656019',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    'f323eed635ad4f20582b0ac23afb3f15ccadf2b4' => 
    array (
      0 => 'dashboard.tpl',
      1 => 1746152121,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
    'file:dashboard/".$_prefixVariable1.".tpl' => 1,
  ),
))) {
function content_68414a414ddbe6_43656019 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
echo '<script'; ?>

  src="https://app.livechatai.com/embed.js"
  data-id="cm9xodvtz0008jj0bvkdklztx"
  async defer>
<?php echo '</script'; ?>
>
  <body>
    <div id="app">
      <!-- Top Navbar -->
      <header class="top-navbar">
        <div class="container">
          <div class="navbar-content">
            <div class="navbar-left">
              <button id="sidebar-toggle" class="menu-button">
                <i class="fas fa-bars"></i>
              </button>
              <a href="https://apilageai.lk/dashboard" class="logo">
                <i class="fas fa-comment-dots logo-icon"></i>
                අපිලගේ AI
              </a>
            </div>
            
            <div class="navbar-right">
              <a href="https://apilageai.lk/dashboard" class="menu-item active">
                <i class="fas fa-home"></i>
                <span class="menu-text">Home</span>
              </a>
              <a href="https://apilageai.lk/app" class="menu-item">
                <i class="fas fa-comment"></i>
                <span class="menu-text">Go to Chat</span>
              </a>
              <button id="theme-toggle" class="theme-toggle-button">
    <i class="fa fa-moon-o dark-icon"></i>
    <i class="fa fa-sun-o light-icon"></i>
</button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="main-layout">
        <!-- Sidebar (initially hidden on mobile) -->
        <div id="sidebar" class="sidebar">
          <div class="sidebar-header">
            <img src="https://apilageai.lk/assets/images/icon.png" alt="Custom Icon" class="custom-icon" width="100px" height="100px">
            <h3>අපිලගේ AI</h3>
            <button id="sidebar-close" class="close-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="sidebar-content">
            <ul class="sidebar-menu">
              <li><a href="https://apilageai.lk/dashboard/profile" class="sidebar-item"><i class="fas fa-user"></i> Profile</a></li>
              <li><a href="https://apilageai.lk/dashboard/usage" class="sidebar-item"><i class="fas fa-chart-bar"></i> Usage</a></li>
              <li><a href="https://apilageai.lk/auth/signout" class="sidebar-item"><i class="fas fa-sign-out-alt"></i> Sign Out</a></li>
                          </ul>
          </div>
        </div>

        <!-- Page Content -->
        <main class="page-content">
            <?php ob_start();
echo (($tmp = $_smarty_tpl->getValue('view') ?? null)===null||$tmp==='' ? 'index' ?? null : $tmp);
$_prefixVariable1=ob_get_clean();
$_smarty_tpl->renderSubTemplate("file:dashboard/".$_prefixVariable1.".tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>
        </main>
      </div>

      <!-- Overlay for sidebar on mobile -->
      <div id="sidebar-overlay" class="sidebar-overlay"></div>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-copyright">
              © 2025 අපිලගේ AI. All rights reserved.
            </div>
            
            <nav class="footer-links">
              <a href="https://apilageai.lk/privacypolicy/">Privacy Policy</a>
              <a href="https://apilageai.lk/termsconditions/">T&C</a>
            </nav>
          </div>
        </div>
      </footer>
    </div>

    <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/dashboard.min.js"><?php echo '</script'; ?>
>
  </body>
</html><?php }
}
