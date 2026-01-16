<?php
/* Smarty version 5.6.0, created on 2025-11-14 10:03:45
  from 'file:dashboard.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.6.0',
  'unifunc' => 'content_6916b129824205_23570970',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '60f3ceb33a24e1ec8f73cc4f5e8858019f164c00' => 
    array (
      0 => 'dashboard.tpl',
      1 => 1763094821,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_6916b129824205_23570970 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/apilageai.lk/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>
<body>
  <div class="main-container">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <h1 class="logo-title">Apilage AI</h1>
          <span class="logo-badge">Gallery</span>
        </div>
        <button id="sidebar-toggle" class="sidebar-toggle">
          <i class="fas fa-chevron-left"></i>
        </button>
      </div>
      <nav class="sidebar-nav">
         <a href="https://apilageai.lk/app" class="nav-link">
         <i class="fas fa-comments"></i> <span>AI Chat</span>
        </a>
        <a href="#" class="nav-link active" data-tab="explore">
         <i class="fa fa-user"></i> <span>My Images</span>
        </a>
        <a href="#" class="nav-link" data-tab="friends">
          <i class="fas fa-user-friends"></i> <span>Explore</span>
        </a>
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <header class="header">
        <div class="container">
          <div class="header-content">
            <div class="search-container">
              <i class="fas fa-search search-icon"></i>
              <input
                type="text"
                id="search-input"
                placeholder="Search your images..."
                class="search-input"
              />
            </div>
            <div class="header-actions">
              <button id="theme-toggle" class="theme-toggle">
                <i id="theme-icon" class="fas fa-sun"></i>
              </button>
              <img
                src="<?php if (!( !true || empty($_smarty_tpl->getValue('user')->_data['image']))) {?>https://apilageai.lk/uploads/<?php echo $_smarty_tpl->getValue('user')->_data['image'];
} else { ?>https://apilageai.lk/assets/images/user.png<?php }?>"
                alt="<?php echo $_smarty_tpl->getValue('user')->_data['first_name'];?>
 Avatar"
                class="profile-pic"
                onerror="this.onerror=null;this.src='https://apilageai.lk/assets/images/user.png';"
              />
            </div>
          </div>
        </div>
      </header>

      <div id="image-gallery" class="container">
        <div class="image-grid"></div>
      </div>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <a href="#" class="bottom-nav-link active" data-tab="explore">
       <i class="fa fa-user"></i> <span>My Images</span>
      </a>
      <a href="#" class="bottom-nav-link" data-tab="friends">
       <i class="fas fa-compass"></i> <span>Explore</span>
      </a>
      <a href="https://apilageai.lk/app/" class="bottom-nav-link">
        <i class="fas fa-comments"></i> <span>AI Chat</span>
      </a>
    </nav>
  </div>

     <?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/dashboard.min.js?V=04.22.10.2025"><?php echo '</script'; ?>
>
</body>
</html><?php }
}
