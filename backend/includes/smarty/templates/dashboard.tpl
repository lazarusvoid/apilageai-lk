{include file="components/head.tpl"}
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
                src="{if !empty($user->_data.image)}https://apilageai.lk/uploads/{$user->_data.image}{else}https://apilageai.lk/assets/images/user.png{/if}"
                alt="{$user->_data.first_name} Avatar"
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

     <script src="https://apilageai.lk/assets/scripts/dashboard.min.js?V=04.22.10.2025"></script>
</body>
</html>