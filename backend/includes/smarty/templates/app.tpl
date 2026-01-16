{include file="components/head.tpl"}
<script src="https://cdn.socket.io/4.8.1/socket.io.min.js" integrity="sha384-mkQ3/7FUtcGyoppY6bz/PORYoGqOl7/aSUMn2ymDOJcapfS6PHqxhRTMh1RR0Q6+" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>

<div id="app-loading-overlay" class="app-loading-overlay" aria-hidden="false">
    <div class="app-loading-card">
        <div class="app-loading-title">Apilageai is here to help <span class="app-loading-cursor" aria-hidden="true"></span></div>
        <div class="app-loading-subtitle">Loading…</div>
    </div>
</div>

<div class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <button id="sidebarback" class="sidebar-backn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-panel-right-open h-6 w-6" style="color: black;"> <rect width="18" height="18" x="3" y="3" rx="2"></rect> <path d="M15 3v18"></path> <path d="m10 15-3-3 3-3"></path> </svg>
          </button>
        </div>

    <div class="sidebar-items" style="padding: 16px; display: flex; flex-direction: column; gap: 12px;">
        <button class="sidebar-but new-chat-btn" id="sidebar-new-chat" type="button">
            <span class="sidebar-but-icon"><i class="fa fa-plus"></i></span>
            <span class="sidebar-but-text">New chat</span>
            <span class="sidebar-but-shortcut" aria-hidden="true">⇧⌘O</span>
        </button>
        <button class="sidebar-but" id="open-conversation-gallery" type="button">
            <span class="sidebar-but-icon"><i class="fa fa-comments"></i></span>
            <span class="sidebar-but-text">Conversations</span>
            <span class="sidebar-but-shortcut" aria-hidden="true">⇧⌘K</span>
        </button>
        <button class="sidebar-but" id="open-share-modal" type="button">
            <span class="sidebar-but-icon"><i class="fa fa-share-alt"></i></span>
            <span class="sidebar-but-text">Share with friends</span>
            <span class="sidebar-but-shortcut" aria-hidden="true">⇧⌘S</span>
        </button>

        <!-- Collaborative voice mic (shown only for shared chats) -->
        <button class="sidebar-but" id="collab-mic-toggle" type="button" style="display:none;">
            <i class="fa fa-microphone-slash" style="margin-right: 8px;"></i> Mic
        </button>
        <button class="sidebar-but" id="mindmap-open-btn" type="button">
            <i class="fa-solid fa-brain" style="margin-right: 8px;"></i> Mind map
        </button>
        <button class="sidebar-but" id="mcqblust-gameyard-icon" type="button">
            <i class="fas fa-gamepad" style="margin-right: 8px;"></i> MCQ game
        </button>
         <button class="sidebar-but" type="button" onclick="window.open('https://apilageai.lk/dashboard', '_self');">
            <i class="fa fa-image" style="margin-right: 8px;"></i> Image Gallery
        </button>
    </div>

 <!-- Sidebar Footer User Info -->
<div class="sidebar-footer sidebar-footer-userinfo" id="sidebarUserInfo" title="Open settings">
  <div class="user-avatar">
    <img
      src="{if !empty($user->_data.image)}https://apilageai.lk{$user->_data.image}{else}https://apilageai.lk/assets/images/user.png{/if}"
      alt="{$user->_data.first_name} Avatar"
      onerror="this.onerror=null;this.src='https://apilageai.lk/assets/images/user.png';"
    />
  </div>
  <div class="user-details">
    <div class="user-name" id="sidebar-user-name">{$user->_data['first_name']}</div>
    <div class="user-credit-text" id="sidebar-credit-text">Credit: Loading...</div>
    <div class="credit-bar-container">
      <div class="credit-bar-fill" id="sidebar-credit-bar" style="width: 0%;"></div>
    </div>
  </div>
</div>

</aside>
    <!-- sidebar end -->

    <!-- sidebar for notes -->

    <div id="rightsidebar2" class="sidebar2 canvas-sidebar" aria-hidden="true">
        <div class="sidebar-header canvas-header">
            <h3>Canvas</h3>
            <div class="canvas-header-actions">
                <button id="canvas-dock-btn" type="button" class="canvas-header-btn" aria-label="Minimize canvas to sidebar"><i class="fa-solid fa-window-minimize" aria-hidden="true"></i></button>
                <button id="canvas-fullscreen-btn" type="button" class="canvas-header-btn" aria-label="Open canvas fullscreen"><i class="fa-solid fa-expand" aria-hidden="true"></i></button>
                <button id="canvas-close-btn" type="button" class="canvas-close-btn" aria-label="Close canvas">&times;</button>
            </div>
        </div>

        <div class="canvas-toolbar" role="toolbar" aria-label="Canvas tools">
            <select id="canvas-font-size" class="canvas-font-size" aria-label="Font size">
                <option value="10">10</option>
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16" selected>16</option>
                <option value="18">18</option>
                <option value="20">20</option>
                <option value="24">24</option>
                <option value="28">28</option>
                <option value="32">32</option>
                <option value="36">36</option>
                <option value="48">48</option>
            </select>

            <button id="canvas-bold-btn" type="button" class="canvas-tool-btn" aria-pressed="false" aria-label="Bold"><i class="fa-solid fa-bold" aria-hidden="true"></i></button>
            <button id="canvas-italic-btn" type="button" class="canvas-tool-btn" aria-pressed="false" aria-label="Italic"><i class="fa-solid fa-italic" aria-hidden="true"></i></button>
            <button id="canvas-underline-btn" type="button" class="canvas-tool-btn" aria-pressed="false" aria-label="Underline"><i class="fa-solid fa-underline" aria-hidden="true"></i></button>
            <button id="canvas-highlight-btn" type="button" class="canvas-tool-btn" aria-label="Highlight yellow"><i class="fa-solid fa-highlighter" aria-hidden="true"></i></button>

            <button id="canvas-undo-btn" type="button" class="canvas-tool-btn" aria-label="Undo"><i class="fa-solid fa-rotate-left" aria-hidden="true"></i></button>
            <button id="canvas-redo-btn" type="button" class="canvas-tool-btn" aria-label="Redo"><i class="fa-solid fa-rotate-right" aria-hidden="true"></i></button>
        </div>

        <div class="canvas-stage" id="canvas-stage">
            <div id="canvas-doc" class="canvas-doc" contenteditable="true" role="textbox" aria-multiline="true" aria-label="Canvas document" spellcheck="true"></div>
            <div id="canvas-empty-hint" class="canvas-empty-hint" aria-hidden="true">Write anything…</div>
            <div id="canvas-cursors" class="canvas-cursors" aria-hidden="true"></div>
        </div>

        <!-- Legacy notes UI (kept hidden to avoid breaking older scripts) -->
        <div class="sidebar-tabs legacy-notes" style="display:none;">
            <button class="tab-button active" data-tab="questions">Questions</button>
            <button class="tab-button" data-tab="blankqsheet">Note sheet</button>
            <button id="exportPDF">Save</button>
        </div>
        <div class="sidebar-content legacy-notes" style="display:none;">
            <div id="questionsTab" class="tab-content active">
                <div id="generatedQuestions"></div>
            </div>
            <div id="blankqsheetTab" class="tab-content">
                <textarea id="blankSheetTextarea" name="notes" placeholder="Paste your notes here..." aria-label="Notes" autocomplete="off"></textarea>
                <button id="analyzeWithGemini">Create HW (apilageai)</button>
            </div>
        </div>
    </div>
<!-- sidebar for notes END -->
    
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
            <input type="text" class="graph-input" id="graphFunctionInput" name="graph_expression" placeholder="Enter custom expression" autocomplete="off" aria-label="Graph expression">
            <button class="graph-submit" id="graphFunctionSubmit"><i class="fas fa-chart-line"></i></button>
        </div>


        <!-- Controls -->
        <div class="graph-controls mt-3">
            <button class="btn btn-sm btn-warning" id="resetGraph"><i class="fas fa-rotate-right"></i> Size</button>
            <button class="btn btn-sm btn-danger" id="clearAllGraphs"><i class="fas fa-trash"></i> All</button>
        </div>
    </aside>
    <!-- DESMOS GRAPH -->

    <!-- modal lightbox named talkingassit as requested -->
  <div id="talkingassit" class="modal hidden" aria-hidden="true">
    <div class="panel" role="dialog" aria-labelledby="ta-title">
      <h3 id="ta-title">Apilageai talkingassit</h3>
      <div class="status" id="talk-status">නැවත සක්‍රීයයි</div>

      <div class="mic-visual" id="mic-visual">
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </div>

      <div class="transcript" id="transcript">කතා අසනවා...</div>

      <button id="cut-call" class="cut-btn">කතා අවසන් කරන්න</button>

      <!-- hidden audio element to attach remote audio track so browser can play assistant voice -->
      <audio id="assistant-audio" autoplay playsinline class="hidden"></audio>

    </div>
  </div>
    <!-- Onboarding Lightbox -->

    <div id="onboarding-lightbox" class="onboard-lightbox">
        <div class="onboard-card">
            
            <form id="onboarding-form" class="onboard-steps-container">
                <input type="hidden" name="interests" id="interests-hidden-input">
                <input type="hidden" name="preference" id="preference-hidden-input">

                <!-- Step 1: School -->
                <div id="step-0" class="onboard-step">
                    <div class="onboard-icon-wrapper"><i class="fas fa-rocket onboard-icon"></i></div>
                    <h2>Welcome to අපිලගේ AI</h2>
                    <p>Let's personalize your AI experience in a few simple steps to get you started.</p>
                    <input name="school" id="school-input" type="text" class="onboard-input" placeholder="ඔයාගේ School එක හෝ University එක?">
                    <div class="onboard-checkbox-container">
                        <input id="not-student-checkbox" type="checkbox" name="not_student">
                        <label for="not-student-checkbox">මම student කෙනක් නෙමයි</label>
                    </div>
                </div>

                <!-- Step 2: Focused Areas -->
                <div id="step-1" class="onboard-step">
                     <div class="onboard-icon-wrapper"><i class="fas fa-crosshairs onboard-icon"></i></div>
                    <h2>What are your interests?</h2>
                    <p id="focus-area-subtitle">ඔයා වැඩිපුර AI පාවිච්චි කරන්නේ මොන වගේ දේවල් වලටද?</p>
                    <div class="onboard-focus-grid">
                        <div class="onboard-focus-card" data-interest="science"><div class="onboard-icon-wrapper"><i class="fas fa-flask onboard-icon"></i></div><p>Science</p></div>
                        <div class="onboard-focus-card" data-interest="life"><div class="onboard-icon-wrapper"><i class="fas fa-heart-pulse onboard-icon"></i></div><p>Life</p></div>
                        <div class="onboard-focus-card" data-interest="maths"><div class="onboard-icon-wrapper"><i class="fas fa-calculator onboard-icon"></i></div><p>Maths</p></div>
                        <div class="onboard-focus-card" data-interest="art"><div class="onboard-icon-wrapper"><i class="fas fa-palette onboard-icon"></i></div><p>Art</p></div>
                        <div class="onboard-focus-card" data-interest="business"><div class="onboard-icon-wrapper"><i class="fas fa-briefcase onboard-icon"></i></div><p>Business</p></div>
                        <div class="onboard-focus-card" data-interest="Coding"><div class="onboard-icon-wrapper"><i class="fa-solid fa-code onboard-icon"></i></div><p>Coding</p></div>
                    </div>
                </div>

                <!-- Step 3: AI Preference -->
                <div id="step-2" class="onboard-step">
                    <div class="onboard-icon-wrapper"><i class="fas fa-robot onboard-icon"></i></div>
                    <h2>AI Personality</h2>
                    <p>අපිලගේ AI මොනවගේද ඔයාත් එක්ක කතා කරන්න ඕන?</p>
                    <div class="onboard-preference-list">
                        <div class="onboard-preference-card" data-preference="friendly"><i class="fas fa-hand-holding-heart onboard-icon"></i><div><h3>Friendly & Casual</h3><p>Engaging and conversational.</p></div></div>
                        <div class="onboard-preference-card" data-preference="educational"><i class="fas fa-book-open onboard-icon"></i><div><h3>Informative</h3><p>Knowledgeable and fact-based.</p></div></div>
                        <div class="onboard-preference-card" data-preference="explanatory"><i class="fas fa-magnifying-glass-chart onboard-icon"></i><div><h3>Detailed</h3><p>Breaks down complex topics.</p></div></div>
                        <div class="onboard-preference-card" data-preference="concise"><i class="fas fa-bolt onboard-icon"></i><div><h3>To the Point</h3><p>Brief and direct.</p></div></div>
                    </div>
                </div>

                <!-- Step 4: All Ready -->
                <div id="step-3" class="onboard-step">
                    <div class="onboard-icon-wrapper"><i class="fas fa-check onboard-icon"></i></div>
                    <h2>ඔක්කොම හරි මෙන්න ඔයාටම ගැලපෙන අපිලගේ AI</h2>
                    <p>Apilage AI එක්ක Chat කරන්න පටන් ගන්න මෙන්න අහන්න දේවල් කිහිපයක්</p>
                    <div class="onboard-prompt-list">
                        <div class="onboard-prompt-example">"මට මේ පාර term test එකේ ළකුණු වැඩි කරගන්න ක්‍රමයක් කියන්න."</div>
                        <div class="onboard-prompt-example">"මට සිංහල O/L syllabus එකේ සංධි ටික කෙටි සටහනක් දෙන්න"</div>
                        <div class="onboard-prompt-example">"මගේ ඉස්කෝලේ grade 12 , Physics past papers වල වැඩිපුර මොනවද අහලා තියෙන්නේ?"</div>
                    </div>
                </div>
            </form>

            <div class="onboard-footer">
                <button id="back-btn" class="onboard-button onboard-back-btn invisible">Back</button>
                <div class="onboard-footer-center">
                    <div id="error-message" class="onboard-error-message"></div>
                    <div class="onboard-progress-dots">
                        <div id="dot-0" class="onboard-progress-dot"></div>
                        <div id="dot-1" class="onboard-progress-dot"></div>
                        <div id="dot-2" class="onboard-progress-dot"></div>
                        <div id="dot-3" class="onboard-progress-dot"></div>
                    </div>
                </div>
                <button id="next-btn" class="onboard-button onboard-next-btn">Next</button>
                <button id="continue-btn" class="onboard-button onboard-continue-btn hidden">Continue</button>
            </div>
        </div>
    </div>


     <!-- MInd map-->
       <div id="mindmap-lightbox" class="mindmap-lightbox-overlay">
        <div class="mindmap-lightbox-content">
            <span id="mindmap-close-btn" class="mindmap-close-btn">&times;</span>
            
            <div class="mindmap-left-panel">
                <h3>Apilage Mind Map</h3>
                <p>Describe topic with what you wanna add !</p>
                <textarea id="mindmap-input" placeholder="උදාහරණයක් ලෙස: ශ්වසන පද්ධතියේ ක්‍රියාකාරීත්වය....රෝග, රෝග වලින් වැළකෙන ආකාරය , පද්ධතියේ විවිධ කොටස්"></textarea>
                <button id="mindmap-go-btn" class="mindmap-button">Map your mind</button>

                <div class="ai-assistant">
                    <h3>Ask Apilageai to</h3>
                    <p>type a general instruction to develop your mind map further.</p>
                    <textarea id="mindmap-develop-input" rows="3" placeholder="e.g., තවත් වැඩිදුර විස්තර එකතු කරන්න , ශ්වසන පද්ධතියේ ආසාත්මිකතා දක්වන්න"></textarea>
                    <button id="mindmap-develop-btn" class="mindmap-button">Edit mind map</button>
                </div>
            </div>

            <div id="mindmap-right-panel" class="mindmap-right-panel">
                <div class="mindmap-toolbar">
                    <button id="add-node-btn" title="Add Node"><i class="fa-solid fa-plus"></i></button>
                    <button id="add-text-btn" title="Add Text"><i class="fa-solid fa-font"></i></button>
                    <button id="connect-node-btn" title="Connect Nodes"><i class="fa-solid fa-link"></i></button>
                    <button id="zoom-in-btn" title="Zoom In"><i class="fa-solid fa-magnifying-glass-plus"></i></button>
                    <button id="zoom-out-btn" title="Zoom Out"><i class="fa-solid fa-magnifying-glass-minus"></i></button>
                    <button id="fullscreen-btn" title="Fullscreen"><i class="fa-solid fa-expand"></i></button>
                    <button id="save-png-btn" title="Save as PNG"><i class="fa-solid fa-image"></i></button>
                </div>
                <div id="mindmap-visualizer">
                    <div id="mindmap-canvas">
                        <!-- Nodes and SVG layer will be appended here -->
                    </div>
                </div>
                <div id="mindmap-loader" class="mindmap-loader" style="display: none;">
                    <div class="mindmap-spinner"></div>
                    <p>Visualizing your ideas...</p>
                </div>
                <div class="help-text">
                    Right-click a node for AI actions | Click a connector + <kbd>Delete</kbd> to remove
                </div>
            </div>
        </div>
    </div>
    
    <div id="context-menu">
        <div class="context-menu-item" id="ctx-add-subnodes">Add Sub-Nodes with AI</div>
    </div>
    <!-- MInd map end-->

<!-- Use setting-->

 <div class="preferencebox-overlay" id="preferenceboxOverlay">
        <div class="preferencebox" id="preferencebox">
            <button class="preferencebox-close-btn" id="preferenceboxCloseBtn" title="Close settings">&times;</button>
            
            <!-- Sidebar Navigation -->
            <aside class="preferencebox-sidebar">
                <nav>
                    <ul>
                        <li><a href="#" class="preferencebox-tab-link active" data-tab="general"><i class="fa fa-cog"></i> General</a></li>
                        <li><a href="#" class="preferencebox-tab-link" data-tab="ai"><i class="fa fa-robot"></i>Preference</a></li>
                        <li><a href="#" class="preferencebox-tab-link" data-tab="billing"><i class="fa fa-credit-card"></i> Billing</a></li>
                        <li><a href="#" class="preferencebox-tab-link" data-tab="app"><i class="fa fa-cogs"></i> Account</a></li>
                    </ul>
                </nav>
            </aside>

            <!-- Main Content Area -->
            <main class="preferencebox-content">
                <!-- General Tab Content -->
                <div id="general" class="preferencebox-tab-content active">
                    <h2>General Settings</h2>
                    <div class="form-section">
                        <h3>Profile</h3>
                        <div class="profile-photo-section">
                            <img
                              id="profilePhoto"
                              src="{if !empty($user->_data.image)}https://apilageai.lk{$user->_data.image}{else}https://apilageai.lk/assets/images/user.png{/if}"
                              alt="{$user->_data.first_name} Avatar"
                              onerror="this.onerror=null;this.src='https://apilageai.lk/assets/images/user.png';"
                            />
                            <div>
                                <input type="file" id="profilePhotoInput" accept="image/*" style="display:none;">
                                <button class="btn btn-primary" id="changePhotoBtn">Change Photo</button>
                                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">JPG, GIF or PNG. 1MB max.</p>
                            </div>
                        </div>
                    </div>
                    <div class="form-section">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="firstName">First Name</label>
                                <input type="text" id="firstName" value="{$user->_data['first_name']}">
                            </div>
                            <div class="form-group">
                                <label for="lastName">Last Name</label>
                                <input type="text" id="lastName" value="{$user->_data['last_name']}">
                            </div>
                        </div>
                    </div>
                     <div class="form-section">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="email">Email</label>
                                <input type="email" id="email" value="{$user->_data['email']}">
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" value="{$user->_data['phone']}">
                            </div>
                        </div>
                    </div>
                    <div class="form-section">
                        <h3>Password</h3>
                        <button class="btn btn-secondary">Change Password</button>
                    </div>
                    <div class="form-section">
                        <h3>Connected Profiles</h3>
                        <div class="connected-profiles">
                            <a href="#"><i class="fab fa-google" style="color:#DB4437;"></i> Connect with Google</a>
                            <a href="#"><i class="fab fa-github" style="color:var(--text-primary);"></i> Connect with GitHub</a>
                            <a href="#"><i class="fab fa-google-drive" style="color:#4285F4;"></i> Connect with Google Drive</a>
                        </div>
                    </div>
                <div class="form-section">
                  <button class="btn btn-primary" id="saveGeneralBtn">Save Changes</button>
                <div id="generalAlertBox" style="display:none; margin-top:10px;"></div>
                </div>
                </div>

                <!-- AI Preference Tab Content -->
                <div id="ai" class="preferencebox-tab-content">
                    <h2>Preference</h2>
                    <div class="form-section">
                        <div class="form-group" style="margin-bottom: 16px;">
                            <label for="schoolInput">School / Institute</label>
                            <input type="text" id="schoolInput" placeholder="e.g., University of Colombo">
                            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
                              Either fill School or check 'Not a student', not both.
                            </div>
                        </div>
                        <div class="form-group">
                            <div class="onboard-checkbox-container" style="margin-bottom: 12px;">
                                <input id="notStudentInput" type="checkbox" name="not_student">
                                <label for="notStudentInput">මම student කෙනක් නෙමයි</label>
                            </div>
                            <label>Interested Subjects</label>
                            <div class="checkbox-group" id="subjectCheckboxes">
                              <label><input type="checkbox" name="subjects" value="science"> Science</label><br>
                              <label><input type="checkbox" name="subjects" value="life"> Life</label><br>
                              <label><input type="checkbox" name="subjects" value="maths"> Maths</label><br>
                              <label><input type="checkbox" name="subjects" value="art"> Art</label><br>
                              <label><input type="checkbox" name="subjects" value="business"> Business</label><br>
                              <label><input type="checkbox" name="subjects" value="coding"> Coding</label>
                            </div>
                        </div>
                    </div>
                    <div class="form-section">
                         <div class="form-group">
                            <label>AI Tone</label>
                            <div class="radio-group" id="aiToneRadios">
                              <label><input type="radio" name="aiTone" value="friendly"> Friendly and casual</label><br>
                              <label><input type="radio" name="aiTone" value="educational"> Informative</label><br>
                              <label><input type="radio" name="aiTone" value="explanatory"> Detailed</label><br>
                              <label><input type="radio" name="aiTone" value="concise"> To the point</label>
                            </div>
                        </div>
                    </div>
                    <div class="form-section">
                        <h3>Memory</h3>
                        <div id="currentMemoryBox" class="memory-box">
                          Loading memory...
                        </div>
                        <p style="font-size: 14px; color: var(--text-secondary); margin-top: -10px; margin-bottom: 16px;">This will clear the AI's memory of past conversations.</p>
                        <button class="btn btn-secondary" id="clearMemoryBtn">Clear Memory</button>
                    </div>
                <div class="form-section">
                  <button class="btn btn-primary" id="savePreferenceBtn">Save Preferences</button>
                <div id="preferenceAlertBox" style="display:none; margin-top:10px;"></div>
                </div>
                </div>

                <!-- Billing Tab Content -->
                <div id="billing" class="preferencebox-tab-content">
                    <h2>Billing</h2>
                    <div class="form-section">
                        <h3>Pay as you go</h3>
                        <div class="price-slider-container">
                            <label for="priceRange">Select Amount (Rs.)</label>
                             <div class="price-display" id="priceDisplay">Rs. 5000</div>
                            <input type="range" min="100" max="20000" value="5000" class="slider" id="priceRange">
                            <button class="btn btn-primary" id="payButton">Pay Rs. 5000</button>
                        </div>
                    </div>
                     <div class="form-section">
                        <h3>Billing History</h3>
                        <div class="table-scroll-container">
                            <table class="billing-history-table">
                                <thead>
                                  <tr>
                                    <th>Invoice ID</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Receipt</th>
                                  </tr>
                                </thead>
                                <tbody id="billingHistoryBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- App Setting Tab Content -->
                <div id="app" class="preferencebox-tab-content">
                    <h2>Account</h2>
                    <div class="form-section">
                        <div class="setting-item">
                            <span>Theme</span>
                            <a href="#" id="theme-toggle" class="theme-toggle-btn btn btn-secondary" role="button">
                                <span class="light-icon">Light Mode</span>
                                <span class="dark-icon" style="color: white;">Dark Mode</span>
                            </a>
                        </div>
                        <div class="setting-item">
                           <span>Bug Report</span>
                           <a href="#" id="reportBugLink" class="btn btn-secondary"><i class="fa fa-bug"></i> Report Bug</a>
                        </div>
                        <div class="setting-item">
                            <span>Contact Support</span>
                            <a href="#" class="btn btn-secondary"><i class="fa fa-headset"></i> Contact Support</a>
                        </div>
                         <div class="setting-item">
                            <span>Account</span>
                            <a href="https://apilageai.lk/auth/signout" class="btn btn-secondary"><i class="fa fa-sign-out-alt"></i> Log Out</a>
                        </div>
                    </div>
                    <div class="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button class="btn btn-danger">Delete My Account</button>
                    </div>
                </div>

            </main>
        </div>
    </div>


<!-- Use setting-->



<!-- Gameyard Lightbox start-->
 <!-- Lightbox / Modal -->
    <div id="mcqblust-lightbox" class="mcqblust-lightbox hidden">
        <div id="mcqblust-container">
            <button id="mcqblust-close-btn"><i class="fas fa-times"></i></button>

            <!-- Screen: Language Selection -->
            <div id="mcqblust-screen-language">
                <h2 class="screen-title">Choose Your Language</h2>
                <div class="flex-center-gap">
                    <button class="mcqblust-lang-btn" data-lang="Sinhala">සිංහල</button>
                    <button class="mcqblust-lang-btn" data-lang="English">English</button>
                </div>
            </div>

            <!-- Screen: Game Mode Selection -->
            <div id="mcqblust-screen-mode" class="hidden">
                <h2 class="screen-title">Select Game Mode</h2>
                <div class="flex-center-gap" style="flex-direction: column; align-items: center;">
                    <button id="mcqblust-btn-single-player" class="mode-btn"><i class="fas fa-user"></i> Single Player</button>
                </div>
                 <button class="mcqblust-back-btn" data-target="mcqblust-screen-language"><i class="fas fa-arrow-left"></i> Back</button>
            </div>

            <!-- Screen: Single Player Setup -->
            <div id="mcqblust-screen-single-setup" class="hidden">
                 <h2 class="screen-title">Single Player Setup</h2>
                 <form id="mcqblust-form-single-player" class="form-space-y">
                    <div class="form-grid">
                        <input type="text" id="mcqblust-single-subject" class="form-input" placeholder="Subject (e.g., Science, History)" required>
                        <select id="mcqblust-single-grade" class="form-select" required>
                            <option value="" disabled selected>Select Grade</option>
                        </select>
                        <select id="mcqblust-single-term" class="form-select" required>
                            <option value="1">1st Term</option>
                            <option value="2">2nd Term</option>
                            <option value="3">3rd Term</option>
                        </select>
                         <input type="number" id="mcqblust-single-timer" class="form-input" placeholder="Timer in minutes (optional)">
                    </div>
                    <textarea id="mcqblust-single-focus" class="form-input" rows="2" placeholder="Specific focus areas or units (optional)"></textarea>
                    <div>
                        <label for="mcqblust-single-mcqs">Number of MCQs: <span id="mcqblust-single-mcq-count-label">10</span></label>
                        <input type="range" id="mcqblust-single-mcqs" min="5" max="50" value="10" style="width: 100%;">
                    </div>
                    <div class="form-actions">
                        <button type="button" class="mcqblust-back-btn" data-target="mcqblust-screen-mode"><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="submit" class="btn-primary">Generate Quiz</button>
                    </div>
                </form>
            </div>
            
            <!-- Multiplayer and Challenge screens removed -->

            <!-- Screen: Loading -->
            <div id="mcqblust-screen-loading" class="hidden" style="text-align: center; padding: 3rem 0;">
                <div class="spinner"></div>
                <p style="margin-top: 1.5rem; font-size: 1.125rem; font-weight: 600; color: #374151;">Generating your custom quiz with AI...</p>
                <p style="color: #6b7280;">Please wait a moment.</p>
            </div>
            
            <!-- Screen: Game/MCQ Display -->
            <div id="mcqblust-screen-game" class="hidden">
                <div class="game-header">
                    <div id="mcqblust-game-timer"></div>
                    <div class="question-counter">Question <span id="mcqblust-current-q-num"></span> of <span id="mcqblust-total-q-num"></span></div>
                </div>
                <div id="mcqblust-question-text"></div>
                <div id="mcqblust-options-container" class="options-grid"></div>
                <div class="game-nav">
                    <button id="mcqblust-btn-prev" class="btn-secondary"><i class="fas fa-step-backward"></i> Previous</button>
                    <div>
                        <button id="mcqblust-btn-skip">Skip</button>
                        <button id="mcqblust-btn-next" class="btn-primary">Next <i class="fas fa-arrow-right"></i></button>
                        <button id="mcqblust-btn-submit" class="btn-primary hidden">Submit</button>
                    </div>
                </div>
            </div>

            <!-- Screen: Single Player Results -->
            <div id="mcqblust-screen-results" class="hidden">
                <h2 class="screen-title">Quiz Results</h2>
                <p class="results-header">You scored <span id="mcqblust-final-score" style="color: #4f46e5; font-weight: 700;"></span> out of <span id="mcqblust-total-score" style="color: #4f46e5; font-weight: 700;"></span>!</p>
                <div id="mcqblust-results-summary" class="results-summary-container"></div>
                 <div style="text-align: center; margin-top: 2rem;">
                    <button id="mcqblust-btn-play-again" class="btn-primary">Play Again</button>
                </div>
            </div>

            <!-- Final Multiplayer Results screen removed -->
            <button id="mcqblust-btn-back-to-main" class="btn-secondary" style="display:none;">Back to Main</button>
        </div>
    </div>


    
    <!-- Main Content --> 
    <main class="main-content">
    <!-- Conversation Gallery View -->
<div id="conversation-gallery" style="display:none;">
  <div id="conversation-search-box">
    <input type="text" id="conversation-search-input" name="conversation_search" placeholder="Search conversations..." autocomplete="off" aria-label="Search conversations">
    <select id="conversation-sort-select" name="conversation_sort" aria-label="Sort conversations">
        <option value="updated_desc">Latest updated</option>
        <option value="created_desc">Latest created</option>
        <option value="created_asc">Oldest created</option>
      </select>
  </div>
  <div id="conversation-gallery-grid"></div>
    </div>
    <!-- Share Modal -->
    <div id="share-modal" class="share-modal hidden" role="dialog" aria-labelledby="share-modal-title">
        <div class="share-modal-content">
            <div class="share-modal-header">
                <div>
                    <p class="share-modal-kicker">Share chat</p>
                    <h3 id="share-modal-title">Share with friends</h3>
                </div>
                <button id="share-modal-close" class="share-modal-close" aria-label="Close share modal">&times;</button>
            </div>
            <div class="share-modal-body">
                <p class="share-modal-subtitle">Send this chat to another user. Both of you can keep chatting, edit, or add more collaborators.</p>

                <div class="share-modal-row">
                    <label for="share-search-input">Search users</label>
                    <div class="share-search-box">
                        <i class="fa fa-search"></i>
                        <input id="share-search-input" name="share_search" type="text" placeholder="Type a name or email" autocomplete="off" aria-label="Search users to share" />
                    </div>
                    <div id="share-search-results" class="share-search-results"></div>
                </div>

                <div class="share-modal-row">
                    <div class="share-section-header">Already shared</div>
                    <div id="share-participants" class="share-pill-container"></div>
                </div>

                <div id="share-link-row" class="share-link-row hidden">
                    <input id="share-link-input" name="share_link" type="text" readonly aria-label="Share link" />
                    <button id="copy-share-link-btn" type="button">Copy link</button>
                </div>

                <div class="share-modal-row">
                    <div class="share-section-header">Publish to all users</div>
                    <p class="share-modal-subtitle" style="margin: 8px 0; font-size: 0.9em; color: #666;">Make this chat visible to all Apilageai users. They can read the conversation but cannot edit it.</p>
                    <div id="publish-status-container" style="display: flex; flex-direction: column; gap: 12px;">
                        <div id="publish-info-box" style="padding: 12px; background: #f0f8ff; border-radius: 6px; border-left: 4px solid #2196F3;">
                            <div style="font-size: 0.85em; color: #666;">
                                <span id="publish-status-text">Click below to publish this chat for all users.</span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button id="publish-chat-btn" type="button" class="share-modal-publish-btn" title="Publish this chat to all users">
                                <i class="fa fa-globe" style="margin-right: 6px;"></i> Publish Chat
                            </button>
                            <button id="unpublish-chat-btn" type="button" class="share-modal-unpublish-btn" style="display: none;" title="Make this chat private again">
                                <i class="fa fa-lock" style="margin-right: 6px;"></i> Unpublish
                            </button>
                        </div>
                        <div id="publish-link-container" style="display: none;">
                            <label for="publish-link-input" style="font-size: 0.85em; color: #666; display: block; margin-bottom: 4px;">Public link:</label>
                            <div style="display: flex; gap: 8px;">
                                <input id="publish-link-input" type="text" readonly aria-label="Public publish link" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85em;" />
                                <button id="copy-publish-link-btn" type="button" style="padding: 8px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Copy</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="share-modal-status" class="share-modal-status"></div>
            </div>
        </div>
    </div>
   <!-- Navbar -->
<nav class="navbar">
    <!-- Sidebar open button -->
    <button id="toggleSidebar" class="sidebar-icon-btn" aria-label="Toggle sidebar" style="display: none;">
<svg xmlns="http://www.w3.org/2000/svg" 
     width="24" height="24" viewBox="0 0 24 24" fill="none" 
     stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" 
     class="tabler-icon tabler-icon-layout-sidebar-left-expand h-6 w-6">
  <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z" />
  <path d="M9 4v16" />
  <path d="M14 10l2 2l-2 2" />
</svg>
    </button>

<!-- Model Switcher Dropdown (right side of navbar) -->
<div id="modelSwitcher" class="model-switcher">
  <div class="brand-model">
    Apilage AI
    <sup><span id="currentModelLabel"></span></sup>
  </div>
  <div class="dropdown">
    <button class="model-switcher-btn" id="modelDropdownBtn" type="button">
      ▼
    </button>
    <ul id="modelDropdownMenu" class="dropdown-menu"></ul>
  </div>
</div>


<!-- Notification Bell -->
<div class="notification-wrapper">
  <button id="notificationBell" class="notification-btn">
    <i class="fa fa-bell"></i>
    <span id="notificationCount" class="notification-count" style="display:none;">0</span>
  </button>

  <!-- Dropdown -->
  <div id="notificationDropdown" class="notification-dropdown">
    <div class="dropdown-header">
      <span>Notifications</span>
      <button id="clearNotifications" class="clear-btn">Clear All</button>
    </div>
    <ul id="notificationList" class="notification-list">
      <li class="no-notification">No notifications</li>
    </ul>
  </div>
</div>

    <!-- Centered Button Section -->
    <div class="question-sheet-center">
        <div class="btn-group">
            <!-- Buttons moved to sidebar-action-row -->
        </div>
    </div>

</nav>
        <div style="margin-top: 62px;"></div>

        <div class="chat-area-wrapper">
            {if $view === "chat" && !is_empty($old_chat)}
          
            <div class="messages-container y-overflow-auto" id="messages-container">

            </div>
            {else}
            <div id="empty-chat-state" style="display:none;"></div>
            <div class="y-overflow-auto p-4 chat-start-container">
                <div class="empty-greeting fade-in slide-up">
                    <h1 class="fw-medium text-dark text-center"><span class="greeting-text">Welcome </span>
                        {$user->_data['first_name']} !
                    </h1>
                </div>
                <div style="height: 24px;"></div> <!-- Reduced spacer for closer greeting and chat input -->
            </div>
            {/if}

            <!-- Error Banner (sticky above chat input) -->
            {if isset($error_message) && $error_message != ''}
            <div id="errorTag" class="error-banner">
              <span class="error-icon"><i class="fa fa-exclamation-triangle"></i></span>
              <span class="error-text">{$error_message}</span>
              <div class="error-buttons">
                <button class="btn-upgrade" onclick="openPreferenceBoxWithBillingTab()">Upgrade</button>
                <button class="btn-close" onclick="document.getElementById('errorTag').style.display='none'">Close</button>
              </div>
            </div>
            {/if}
            <!-- Chat Input Area -->
            <div class="chat-wrapper">
                <!-- Scroll to bottom button -->
                <button id="scroll-to-bottom-btn" class="scroll-to-bottom-btn" style="display: none; align-self: center;" title="Scroll to latest messages">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div id="chatInputContainer" class="chat-input-container" style="display: flex; flex-direction: column; gap: 8px;">
                    <!-- Trial Ended Banner -->
                    <div id="trial-ended-banner" class="trial-ended-banner" style="display: none;">
                        <div class="trial-ended-banner-content">
                            <div class="trial-ended-message">
                                <strong>Your Access to Apilageai-Master is ended</strong>
                                <p>Use another model now or upgrade to Pro</p>
                            </div>
                            <div class="trial-ended-banner-actions">
                                <button id="banner-upgrade-btn" class="banner-upgrade-button" type="button">Upgrade to Pro</button>
                                <button id="banner-close-btn" class="banner-close-button" type="button" aria-label="Close banner">×</button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Chat input box above icons -->
                    <div class="chat-input-center" style="flex: 1 1 auto; min-width: 0;">
                        <div class="max-w-3xl mx-auto px-4" style="padding: 0;">
                            <div id="suggestions-dropdown" class="chat-suggestion position-absolute" style="display: none;">
                            </div>
                            <form id="chat-form" class="position-relative">
                                <textarea id="message-input" name="message" placeholder="type @ to get suggestions..." class="chat-input"
                                    autocomplete="off" aria-label="Message" style="width: 100%;"></textarea>
                            </form>
                        </div>
                    </div>
                    <!-- Attachment image preview (if any) -->
                    <div id="attachment-container" style="align-self: flex-end;">
                        <div class="preview-wrapper">
                            <img class="preview-image" id="imagePreview" src="#" alt="Preview">
                            <button class="remove-btn" id="removeImage">×</button>
                        </div>
                    </div>
                    <!-- Icon row: left and right groups aligned under input -->
                    <div class="chat-bottom-row" style="display: flex; justify-content: space-between; align-items: center;">
                      <div class="chat-input-left" style="display: flex; gap: 8px; align-items: center; position: relative;">
                        <div class="dropup" style="position: relative;">
                          <button class="btn-icon" id="button-drop" type="button" aria-label="More tools">
                            <i class="fa-solid fa-plus"></i>
                          </button>
                          <div class="dropup-menu">
                            <button id="enebleThink" class="dropup-menu-item" type="button"><i class="fas fa-flask"></i>DeepThink</button>
                            <button id="toggleGraphBtn" class="dropup-menu-item" type="button"><i class="fas fa-chart-line"></i> Graph</button>
                             <button id="toggleCanvasBtn" class="dropup-menu-item" type="button"><i class="fa-solid fa-pen-to-square"></i> Canvas</button>
                            
                          </div>
                        </div>
                        
                        <!-- Feature badge will be inserted dynamically here -->
                        <div id="selected-feature-placeholder" style="display: flex; align-items: center; gap: 8px;"></div>

                        <button type="button" id="fileAttach" class="btn-icon" aria-label="Attach image">
                          <i class="fas fa-images"></i>
                          <input class="d-none" id="fileInput" type="file" name="f" accept="image/png, image/jpeg" aria-label="Attach image" />
                        </button>
                      </div>
                      <div class="chat-input-right" style="display: flex; gap: 8px;">
                                                <div id="collab-speaking-indicator" class="collab-speaking-indicator" style="display:none;"></div>
                        <button type="submit" id="send-button" class="btn-icon text-muted" aria-label="Send"><i class="fa-solid fa-paper-plane"></i></button>
                      </div>
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
                        <label for="bug-email">Email (optional):</label>
                        <input type="email" id="bug-email" name="email" autocomplete="email" aria-label="Your email">
                        <small class="error-message" id="emailError"></small>
                    </div>
                    <div class="form-group">
                        <label for="bug-problem">Describe the problem (minimum 4 words):</label>
                        <textarea id="bug-problem" name="problem" required aria-label="Problem description" autocomplete="off"></textarea>
                        <small class="error-message" id="problemError"></small>
                    </div>
                    <div class="form-group">
                        <label for="bug-screenshot">Upload Screenshot (optional, max 10MB):</label>
                        <input type="file" id="bug-screenshot" name="screenshot" accept="image/*" aria-label="Screenshot">
                        <small class="error-message" id="screenshotError"></small>
                        <div id="bugImagePreview" style="margin-top: 10px; display: none;">
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
    <script>
    // Observe chat changes to reposition input automatically
    const chatMessages = document.getElementById('messages-container');
    if (chatMessages) {
        const observer = new MutationObserver(() => {
            if (typeof positionChatInputContainer === 'function') {
                positionChatInputContainer();
            }
        });
        observer.observe(chatMessages, { childList: true });
    }
    </script>
    </main>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/3.0.4/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://www.desmos.com/api/v1.10/calculator.js?apiKey=b77098fe4afd4179b5626ad2c0f17ad6"></script>
<script>
  window.userBalance = {$user->_data['balance']|intval};
</script>
<script src="https://gen.apilageai.lk/static/apilage-sdk.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-database.js"></script>
<script src="https://www.gstatic.com/firebasejs/8.10.0/firebase-storage.js"></script>
<script src="https://apilageai.lk/assets/scripts/libs/dialog-js/main.min.js?V=01.03.04.2025"></script>
<script src="https://apilageai.lk/assets/scripts/mp.min.js?V=01.22.22.2025"></script>
<script src="https://apilageai.lk/assets/scripts/app.min.js?V=19.14.01.2026"></script>
<script src="https://apilageai.lk/assets/scripts/prefrence.min.js?V=26.25.11.2025"></script>
<script src="https://apilageai.lk/assets/scripts/notifications.js?V=03.01.10.2025"></script>
<script type="module" src="https://apilageai.lk/assets/scripts/gm.min.js?V=12.20.10.2025"></script>
<script src="https://apilageai.lk/assets/scripts/ob.js?V=10.26.09.2025"></script>
<script src="https://apilageai.lk/assets/scripts/report-data.js?V=03.06.10.2025"></script>
</body>
</html>
