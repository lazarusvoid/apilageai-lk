<?php
/* Smarty version 5.5.1, created on 2025-06-05 17:25:43
  from 'file:app.tpl' */

/* @var \Smarty\Template $_smarty_tpl */
if ($_smarty_tpl->getCompiled()->isFresh($_smarty_tpl, array (
  'version' => '5.5.1',
  'unifunc' => 'content_684185bf6bc092_75352108',
  'has_nocache_code' => false,
  'file_dependency' => 
  array (
    '51c402894ddf4ec29fb1527130acc09c840d5224' => 
    array (
      0 => 'app.tpl',
      1 => 1749124531,
      2 => 'file',
    ),
  ),
  'includes' => 
  array (
    'file:components/head.tpl' => 1,
  ),
))) {
function content_684185bf6bc092_75352108 (\Smarty\Template $_smarty_tpl) {
$_smarty_current_dir = '/home/sites/26b/0/028089cd94/backend/includes/smarty/templates';
$_smarty_tpl->renderSubTemplate("file:components/head.tpl", $_smarty_tpl->cache_id, $_smarty_tpl->compile_id, 0, $_smarty_tpl->cache_lifetime, array(), (int) 0, $_smarty_current_dir);
?>

<div class="app-container">
    <!-- Mobile Hamburger Menu -->
    <div class="hamburger">
        <div></div>
        <div></div>
        <div></div>
    </div>


    <!-- Sidebar Overlay (Mobile) -->
    <div class="sidebar-overlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
<button id="toggleSidebar" class="sidebar-icon-btn" aria-label="Toggle sidebar">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-right-open h-6 w-6"><rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M15 3v18"></path><path d="m10 15-3-3 3-3"></path></svg>
</button>
        </div>

        <div class="p-16px">
            <a class="new-chat-btn" href="https://apilageai.lk/app">

                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus h-5 w-5 text-muted-foreground hover:cursor-pointer hover:text-[#1A8B7E] transition-colors duration-75 hover:scale-110"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                <span>Get New Chat</span>
            </a>
        </div>

        <div class="sidebar-sections">
            <div class="sidebar-section">
                <div class="sidebar-header-toggle">
                </div>
                <div class="p-16px scrollable-chat-list">
                    <?php
$_from = $_smarty_tpl->getSmarty()->getRuntime('Foreach')->init($_smarty_tpl, $_smarty_tpl->getSmarty()->getModifierCallback('array_reverse')($_smarty_tpl->getValue('conversations')), 'item');
$foreach0DoElse = true;
foreach ($_from ?? [] as $_smarty_tpl->getVariable('item')->value) {
$foreach0DoElse = false;
?>
                    <div class="sidebar-item-wrapper">
                        <div class="sidebar-item">
                            <a href="https://apilageai.lk/app/chat/<?php echo $_smarty_tpl->getValue('item')["conversation_id"];?>
">
                                <span><?php echo $_smarty_tpl->getValue('item')["title"];?>
</span>
                            </a>
                            <button class="menu-toggle" data-menu-id="menu-<?php echo $_smarty_tpl->getValue('item')["conversation_id"];?>
">⋯</button>
                        </div>
                        <div class="menu" id="menu-<?php echo $_smarty_tpl->getValue('item')["conversation_id"];?>
" style="display: none;">
                            <button onclick="deleteConversation('<?php echo $_smarty_tpl->getValue('item')["conversation_id"];?>
')">Delete</button>
                        </div>
                    </div>
                    <?php
}
$_smarty_tpl->getSmarty()->getRuntime('Foreach')->restore($_smarty_tpl, 1);?>
                </div>
            </div>
        </div>

        <div class="sidebar-footer p-16px">
            <a class="sidebar-item" href="https://apilageai.lk/#pricing"
                style="display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-star" style="font-size: 36px;"></i>
                <div>
                    <div style="font-weight: bold;">Be අපිලගේ pro</div>
                    <div>Unlock more features</div>
                </div>
            </a>
        </div>
    </aside>
    <!-- sidebar end -->

    <!-- sidebar for notes -->

    <div id="rightsidebar2" class="sidebar2">
        <div class="sidebar-header">
            <h3>අපිලගේ Homeworks</h3>
            <button class="close-sidebar2">&times;</button>
        </div>
        <div class="sidebar-tabs">
            <button class="tab-button active" data-tab="questions">Questions</button>
            <button class="tab-button" data-tab="blankqsheet">Note sheet</button>
            <button id="exportPDF">Save</button>
        </div>
        <div class="sidebar-content">
            <div id="questionsTab" class="tab-content active">
                <div id="generatedQuestions"></div>
            </div>
            <div id="blankqsheetTab" class="tab-content">
                <textarea id="blankSheetTextarea" placeholder="Paste your notes here..."></textarea>
                <button id="analyzeWithGemini">Create HW (apilageai)</button>
            </div>
        </div>
    </div>


    <!-- sidebar for notes END -->
    
<div class="sidebar" id="tlsidebar">
  <div class="sidebar-header">
    <h2>Whiteboard (BETA)</h2>
    <button class="close-btn" id="closeSidebar" title="Close">
      <i class="fa fa-times"></i>
    </button>
  </div>
  <iframe src="https://www.tldraw.com" title="TLDraw Whiteboard"></iframe>
</div>


    <!-- Desmos Graphing Sidebar -->
    <aside class="right-sidebar" id="rightSidebar">
        <div class="right-sidebar-header">
            <h4>අපිලගේ Graph Calculator</h4>
            <button class="right-sidebar-close" id="closeRightSidebar">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <!-- Desmos Graph Display -->
        <div class="desmos-container" id="desmos-graph" style="height: 600px;"></div>




        <!-- Input box -->
        <div class="graph-input-container">
            <input type="text" class="graph-input" id="graphFunctionInput" placeholder="Enter custom expression">
            <button class="graph-submit" id="graphFunctionSubmit"><i class="fas fa-chart-line"></i></button>
        </div>

        <!-- Expression List -->
        <div class="graph-functions" id="graphFunctionsList">
            <!-- Rendered expressions show here -->
        </div>

        <!-- Controls -->
        <div class="graph-controls mt-3">
            <button class="btn btn-sm btn-primary" id="graph-example1">y = x^2</button>
            <button class="btn btn-sm btn-primary" id="graph-example2">y=sin(x)</button>
            <button class="btn btn-sm btn-warning" id="resetGraph"><i class="fas fa-rotate-right"></i> Size</button>
            <button class="btn btn-sm btn-danger" id="clearAllGraphs"><i class="fas fa-trash"></i> All</button>
        </div>
    </aside>
    <!-- DESMOS GRAPH -->
    
    <div id="tlsidebar">
  <div class="sidebar-header">
    <h3>අපිලගේ Notes</h3>
    <button id="closeBtn" class="close-tlsidebar">&times;</button>
  </div>
  <iframe id="tldrawFrame" src="https://www.tldraw.com" allowfullscreen></iframe>
</div>

    <!-- Main Content -->
    <main class="main-content">
   <!-- Navbar -->
<nav class="navbar">
    <button id="sidebarback" class="sidebar-backn">
<svg xmlns="http://www.w3.org/2000/svg" 
     width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
     class="tabler-icon tabler-icon-layout-sidebar-left-expand h-6 w-6">
  <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
  <path d="M9 4v16" />
  <path d="M14 10l2 2l-2 2" />
</svg>
    </button>

    <div class="brand-wrapper">
        <a id="brandName" class="navbar-brand" href="#"></a>
        <i id="navdropIcon" class="fa-solid fa-chevron-down navdrop-icon"></i>

        <ul id="navdropMenu" class="navdrop-menu">
            <li id="languageOption"></li>
        </ul>
    </div>
       


<!-- Centered Button Section -->
<div class="question-sheet-center">
    <div class="btn-group">
        <button id="openQuestionSheet" class="nav-icon-btn" title="Question Sheet">
            <i class="fa fa-book"></i>
        </button>
        <button id="addPersonBtn" class="nav-icon-btn" title="Add Person">
            <i class="fa fa-user-plus"></i>
        </button>
        <button id="whiteboardBtn" class="nav-icon-btn" title="Whiteboard">
            <i class="fa fa-chalkboard"></i>
        </button>
        <button class="nav-icon-btn" title="Share Chat" onclick="shareChat(123, this)" disabled>
            <i class="fa fa-share-alt"></i>
        </button>
    </div>
</div>

    <div class="ms-auto d-flex align-items-center">
        <!-- Avatar Section -->
        <div class="avatar-wrapper" onclick="toggleProfileMenu()">
            <div class="avatar-circle">
                <img src="<?php if ($_smarty_tpl->getSmarty()->getModifierCallback('is_empty')($_smarty_tpl->getValue('user')->_data['image'])) {?>https://apilageai.lk/assets/images/user.png<?php } else { ?>https://apilageai.lk/uploads/<?php echo $_smarty_tpl->getValue('user')->_data['image'];
}?>"
                    alt="<?php echo $_smarty_tpl->getValue('user')->_data['first_name'];?>
 <?php echo $_smarty_tpl->getValue('user')->_data['last_name'];?>
" class="img-fluid" />
            </div>

            <!-- Dropdown Menu -->
            <ul id="profileMenu" class="profile-dropdown" style="display: none;">
                <li><a href="https://apilageai.lk/dashboard"><i class="fa fa-user"></i> My Profile</a></li>
                <li><a href="https://apilageai.lk/app"><i class="fa fa-comments"></i> Get New Chat</a></li>
                <li><a href="#" id="theme-toggle" class="theme-toggle-btn"><span class="light-icon" style="display: none;">  <i class="fa fa-sun"></i> Light Mode</span>
                <span class="dark-icon" style="display: none;"><i class="fa fa-moon"></i> Dark Mode </span></a></li>
                                <li>
  <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 10px 16px; font-size: 0.95rem;">
    <input type="checkbox" id="toggleDoodle" checked style="margin: 0;" />
    <i class="fa fa-brush" aria-hidden="true"></i>
    Doodle BG
  </label>
</li>
                <li><a href="#" id="reportBugLink"><i class="fa fa-bug"></i> Report Bug</a></li>
                <li><a href="https://apilageai.lk/auth/signout"><i class="fa fa-sign-out-alt"></i> Log Out</a></li>
            </ul>
        </div>
    </div>
</nav>

<div id="lightboxOverlay" class="lightbox-overlay">
  <div class="lightbox">
    <input type="text" placeholder="Friend's email" />
    <p>Add your friend to this workdesk , Chat together work together ! , (This is upcoming Feature. This box is dummy, try again later soon)</p>
  </div>
</div>


        <div style="margin-top: 60px;"></div>
        <div class="chat-area-wrapper">
            <?php if ($_smarty_tpl->getValue('view') === "chat" && !$_smarty_tpl->getSmarty()->getModifierCallback('is_empty')($_smarty_tpl->getValue('old_chat'))) {?>
            <!-- Prism.js for code syntax highlighting -->
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css" rel="stylesheet" />
            <?php echo '<script'; ?>
 src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"><?php echo '</script'; ?>
>
            <?php echo '<script'; ?>

                src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"><?php echo '</script'; ?>
>
            <?php echo '<script'; ?>
 type="text/javascript" id="MathJax-script" async
                src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js">
                    <?php echo '<script'; ?>
>
                        window.MathJax = {
                            tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                        displayMath: [['$$', '$$'], ['\\[', '\\]']],
                        },
                        options: {
                            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'],
                        },
                    };
                <?php echo '</script'; ?>
>

            <div class="messages-container y-overflow-auto" id="messages-container">

            </div>
            <?php } else { ?>
            <div class="y-overflow-auto p-4">
                <div class="d-flex flex-column align-items-center justify-content-center pt-5 pb-4 fade-in slide-up">
                    <div class="logo">
                        <img src="https://apilageai.lk/assets/images/icon.png" alt="AI" width="100px">
                    </div>
                    <h1 class="fw-medium text-dark text-center"><span class="greeting-text">Welcome,</span>
                        <?php echo $_smarty_tpl->getValue('user')->_data['first_name'];?>
 !</h1>
                </div>
<!-- Update Banner Section -->
<div class="update-banner-container p-4">
    <div class="banner-box d-flex align-items-center justify-content-between" id="banner">
        <img id="bannerImage" class="banner-img" src="https://apilageai.lk/assets/images/update1.png" alt="Banner Image" />
        <p class="banner-text" id="typedText"></p>
    </div>

    <!-- Toggle Buttons -->
    <div class="d-flex justify-content-center gap-2 mt-3">
        <button class="toggle-btn" data-index="0">1</button>
        <button class="toggle-btn" data-index="1">2</button>
        <button class="toggle-btn" data-index="2">3</button>
    </div>
</div>

<div class="feature-section mt-4">
  <div class="row row-cols-1 row-cols-md-3 g-4">
    <!-- Grapher -->
    <div class="col">
      <div class="feature-box bg-green">
        <div class="icon-container">
          <i class="fa fa-line-chart"></i>
        </div>
        <h5 class="feature-title">Grapher</h5>
        <p class="feature-desc">සවිස්තරාත්මක පැහැදිලි කිරීම් සමඟින් විශ්ලේෂණය කර ප්‍රස්ථාර අඳින්න.</p>
      </div>
    </div>

    <!-- Homework -->
    <div class="col">
      <div class="feature-box bg-red">
        <div class="icon-container">
          <i class="fa fa-book"></i>
        </div>
        <h5 class="feature-title">Homework</h5>
        <p class="feature-desc">ඔබ ඉගෙන ගත් දේ මත පදනම්ව AI-ජනනය කරන ලද අධ්‍යයන ප්‍රශ්න ලබා ගන්න.</p>
      </div>
    </div>

    <!-- Collaborate -->
    <div class="col">
      <div class="feature-box bg-blue">
        <div class="icon-container">
          <i class="fa fa-users"></i>
        </div>
        <h5 class="feature-title">Collaborate</h5>
        <p class="feature-desc">මිතුරන් සමඟ එකතු වී හවුල් ව්‍යාපෘති සහ ඉගෙනීම සඳහා AI භාවිතා කරන්න.</p>
      </div>
    </div>
  </div>
</div>

<!-- Tips Section -->
<div class="chat-tips-container mt-4 px-4">
    <h5 class="text-center mb-3">Tips for Better Chat</h5>
    <ul class="list-group">
        <li class="list-group-item">👉 වඩා හොඳ ප්‍රතිචාර සඳහා වැදගත් තොරතුරු මුලින්ම දක්වන්න</li>
        <li class="list-group-item">📷 නිවැරදි රූප විශ්ලේෂණය සඳහා රූපයේ අදාළ කොටස් පමණක් යවන්න.</li>
        <li class="list-group-item">⚠️ Avoid long or irrelevant input to save credit</li>
    </ul>
</div>

<!-- Original chat-cards-container -->

                <div class="chat-cards-container">
                    <div class="row row-cols-1 row-cols-md-3 g-4 max-w-3xl mx-auto mt-4">
                        <div class="col">
                            <div class="chat-card">
                                <div class="icon-container bg-blue-50 text-blue-500">
                                    <i class="fa-solid fa-calculator" style="font-size: 24px;"></i>
                                </div>
                                <p class="card-title">Teach me about the Quadratic Formula</p>
                            </div>
                        </div>

                        <div class="col">
                            <div class="chat-card">
                                <div class="icon-container bg-red-50 text-red-500">
                                    <i class="fa-solid fa-chart-line" style="font-size: 24px;"></i>
                                </div>
                                <p class="card-title">Graph the function f(x)= sin(x)</p>
                            </div>
                        </div>

                        <div class="col">
                            <div class="chat-card">
                                <div class="icon-container bg-green-50 text-green-500">
                                    <i class="fa-solid fa-seedling" style="font-size: 24px;"></i>
                                </div>
                                <p class="card-title">Explain the structure of a plant cell</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="height: 128px;"></div> <!-- Spacer -->
            </div>
            <?php }?>

            <!-- Chat Input Area -->
            <div class="chat-wrapper">
                <div class="chat-input-container">
                    <div id="attachment-container">
                        <div class="preview-wrapper">
                            <img class="preview-image" id="imagePreview" src="#" alt="Preview">
                            <button class="remove-btn" id="removeImage">×</button>
                        </div>
                    </div>

                    <div class="max-w-3xl mx-auto px-4">
                        <div id="suggestions-dropdown" class="chat-suggestion position-absolute" style="display: none;">
                        </div>
                        <form id="chat-form" class="position-relative">
                            <textarea id="message-input" placeholder="type @ to get suggestions..." class="chat-input"
                                autocomplete="off"></textarea>
                        </form>
                    </div>

                    <div class="chat-input-buttons buttons">
                        <small id="char-count" class="text-muted">0 / 1000 </small>
                        <button class="toggle-graph-btn" id="toggleGraphBtn">
                            <i class="fas fa-chart-line"></i>
                        </button>

                        <!-- Math Symbols Dropdown -->
                        <div class="dropdown">
                            <button type="button" class="btn-icon" onclick="toggleDropdown()">
                                <i class="fas fa-calculator"></i>
                            </button>
                            <div class="dropdown-content" id="mathSymbols">
                                <button type="button" onclick="insertSymbol('Θ')">Θ</button>
                                <button type="button" onclick="insertSymbol('π')">π</button>
                                <button type="button" onclick="insertSymbol('√')">√</button>
                                <button type="button" onclick="insertSymbol('ƒ')">ƒ</button>
                                <button type="button" onclick="insertSymbol('∑')">∑</button>
                                <button type="button" onclick="insertSymbol('∞')">∞</button>
                                <button type="button" onclick="insertSymbol('Δ')">Δ</button>
                                <button type="button" onclick="insertSymbol('∫')">∫</button>
                                <button type="button" onclick="insertSymbol('≠')">≠</button>
                            </div>
                        </div>

                        <button type="button" id="fileAttach" class="btn-icon">
                            <i class="fa fa-paperclip"></i>
                            <input class="d-none" id="fileInput" type="file" name="f" accept="image/png, image/jpeg" />
                        </button>

                        <!-- Send Button -->
                        <button type="submit" id="send-button" class="btn-icon text-muted" disabled>
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div id="bugReportModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Report a Bug</h2>
                <form id="bugReportForm">
                    <div class="form-group">
                        <label for="email">Email (optional):</label>
                        <input type="email" id="email" name="email">
                        <small class="error-message" id="emailError"></small>
                    </div>
                    <div class="form-group">
                        <label for="problem">Describe the problem (minimum 4 words):</label>
                        <textarea id="problem" name="problem" required></textarea>
                        <small class="error-message" id="problemError"></small>
                    </div>
                    <div class="form-group">
                        <label for="screenshot">Upload Screenshot (optional, max 10MB):</label>
                        <input type="file" id="screenshot" name="screenshot" accept="image/*">
                        <small class="error-message" id="screenshotError"></small>
                        <div id="imagePreview" style="margin-top: 10px; display: none;">
                            <img id="previewImage" src="#" alt="Preview" style="max-width: 100%; max-height: 200px;">
                        </div>
                    </div>
                    <button type="submit" id="sendReport">Send Report</button>
                </form>
                <div id="successMessage" style="display: none;">
                    <p>Thank you! We'll review it soon as we can.</p>
                </div>
            </div>
        </div>
    </main>
</div>

<?php echo '<script'; ?>
 src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"><?php echo '</script'; ?>
>
 
<!-- Add DESMOS calculator script -->
<?php echo '<script'; ?>
 src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=b77098fe4afd4179b5626ad2c0f17ad6"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/app.min.js?V=<?php echo $_smarty_tpl->getSmarty()->getModifierCallback('get_hash_token')();?>
"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://apilageai.lk/assets/scripts/report-data.js"><?php echo '</script'; ?>
>
<?php echo '<script'; ?>
 src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.1/jspdf.umd.min.js"><?php echo '</script'; ?>
>
</body>

</html><?php }
}
