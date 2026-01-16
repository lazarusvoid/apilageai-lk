let typingTimeout;
let stageInterval;
let currentStreamingMessage = null;
let streamingMessageElement = null;

// Initialize Mermaid if available
if (typeof mermaid !== 'undefined') {
    mermaid.initialize({ startOnLoad: false });
}

// Utility: Remove all thinking status indicators
function clearThinkingTexts() {
    document.querySelectorAll('.thinking-status').forEach(el => el.remove());
}


// ==================================================
// OPTIMIZED CHAT BUBBLE MANAGEMENT SYSTEM
// ================================================== 

class ChatBubbleManager {
    constructor() {
        this.chatContainer = null;
        this.streamingElements = new Map(); // Track streaming messages
        // Ensure icons are hidden during streaming via CSS as a safety net
        const styleId = 'chat-icons-stream-css';
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
            s.textContent = '.message.streaming .message-icons{display:none !important;}';
            document.head.appendChild(s);
        }
    }

    // Initialize or get chat container
    initializeChatContainer(isNewConversation = false) {
        if (isNewConversation) {
            // Remove chat-start-container for new conversations
            const startContainer = document.querySelector(".chat-start-container");
            if (startContainer) {
                startContainer.remove();
            }

            // Create new messages container
            this.chatContainer = document.createElement("div");
            this.chatContainer.id = "messages-container";
            this.chatContainer.className = "messages-container y-overflow-auto";

            // Add to chat area wrapper
            const chatAreaWrapper = document.querySelector(".chat-area-wrapper");
            if (chatAreaWrapper) {
                chatAreaWrapper.prepend(this.chatContainer);
            }
        } else {
            // Get existing container
            this.chatContainer = document.getElementById("messages-container");
        }

        return this.chatContainer;
    }

    // Main function to create or update any chat bubble
    createOrUpdateBubble(messageData, options = {}) {
        const {
            isStreaming = false,
            isUpdate = false,
            streamingContent = '',
            finalizeStreaming = false
        } = options;

        // Ensure we have a chat container
        if (!this.chatContainer) {
            this.initializeChatContainer(messageData.is_new);
        }

        if (!this.chatContainer) {
            showDialog("Error", "Chat container not found. Please refresh the page.");
            return null;
        }

        // Check for existing message (prevent duplicates)
        let messageWrapper = document.querySelector(`[data-m-id="${messageData.message_id || messageData.m_id}"]`);

        if (messageWrapper && !isUpdate && !isStreaming) {
            return messageWrapper; // Message already exists
        }

        const messageId = messageData.message_id || messageData.m_id;
        const messageType = parseInt(messageData.type || messageData.t, 10);
        const messageText = messageData.text || messageData.txt || '';
        const attachment = messageData.attachment || messageData.a || '';
        const isUserMessage = messageType === 1;
        const isNewMessage = !messageWrapper;

        // Remove any previous thinking status on new user message
        if (messageData.is_new && isUserMessage) {
            clearThinkingTexts();
        }

        // Create new message wrapper if it doesn't exist
        if (isNewMessage) {
            messageWrapper = document.createElement("div");
            messageWrapper.className = `message ${isUserMessage ? 'user-message' : 'bot-message'} chatBubble`;
            messageWrapper.id = `message-${messageId}`;
            messageWrapper.dataset.mId = messageId;

            if (isStreaming) {
                messageWrapper.classList.add('streaming');
            }
        }

        // Generate message content
        let content = this.generateMessageContent(messageData, {
            isStreaming,
            streamingContent,
            finalizeStreaming
        });

        // Streaming status indicator (for bot messages)
        if (!isUserMessage && isStreaming && !finalizeStreaming) {
            // Insert a "Thinking..." status above the content
            content =
                `<div class="thinking-status" style="color: #888888; font-size: 13px; margin-bottom: 2px;">Thinking...</div>` +
                content;
        }

        // Finalize streaming: replace "Thinking..." with elapsed time
        if (!isUserMessage && finalizeStreaming) {
            // Find the previous streamStart timestamp, if any
            let streamStart = messageWrapper.dataset.streamStart;
            let elapsedText = "";
            if (streamStart) {
                const elapsed = Math.round((Date.now() - parseInt(streamStart, 10)) / 1000);
                elapsedText = `Thought for ${elapsed} second${elapsed === 1 ? '' : 's'}`;
            } else {
                elapsedText = "Thought";
            }
            // Replace or add the status indicator
            // Remove old status if present
            let tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            let statusEl = tempDiv.querySelector('.thinking-status');
            if (statusEl) {
                statusEl.innerHTML = `<span style="color: #888888;">${elapsedText}</span>`;
                statusEl.classList.add('thinking-status-final');
                statusEl.dataset.removeOnNext = "1";
            } else {
                // Prepend if not present
                const newStatus = document.createElement('div');
                newStatus.className = "thinking-status thinking-status-final";
                newStatus.style.color = "#888888";
                newStatus.style.fontSize = "13px";
                newStatus.style.marginBottom = "2px";
                newStatus.dataset.removeOnNext = "1";
                newStatus.innerText = elapsedText;
                tempDiv.insertBefore(newStatus, tempDiv.firstChild);
            }
            content = tempDiv.innerHTML;
        }

        messageWrapper.innerHTML = content;

        // Save stream start timestamp for streaming bot messages
        if (!isUserMessage && isStreaming && !finalizeStreaming) {
            messageWrapper.dataset.streamStart = Date.now().toString();
        }

        // Add to DOM if it's a new message
        if (isNewMessage) {
            this.insertMessageInOrder(messageWrapper, messageId);
        }

        // Add event listeners
        this.addMessageEventListeners(messageWrapper, messageData);

        // Handle streaming-specific logic
        if (isStreaming && !finalizeStreaming) {
            this.streamingElements.set(messageId, messageWrapper.querySelector('.streaming-content'));
        } else if (finalizeStreaming) {
            messageWrapper.classList.remove('streaming');
            this.streamingElements.delete(messageId);
            this.processMessageContent(messageWrapper);
            const icons = messageWrapper.querySelector('.message-icons');
            if (icons) icons.style.display = '';
        }

        // Auto-scroll and other updates
        this.scrollToBottom();

        // Handle new conversation updates
        if (messageData.is_new && isUserMessage) {
            this.handleNewConversation(messageData.conversation_id);
        }

        return messageWrapper;
    }

    // Generate message content HTML
    generateMessageContent(messageData, options = {}) {
        const { isStreaming, streamingContent, finalizeStreaming } = options;
        const messageText = messageData.text || messageData.txt || '';
        const attachment = messageData.attachment || messageData.a || '';
        const messageType = parseInt(messageData.type || messageData.t, 10);
        const messageId = messageData.message_id || messageData.m_id;
        const isUserMessage = messageType === 1;

        let content = '';

        // Handle streaming content
        if (isStreaming && !finalizeStreaming) {
            if (streamingContent) {
                const processedContent = this.processMessageText(streamingContent);
                content = `<p class="streaming-content">${processedContent}<img src="https://apilageai.lk/assets/images/blinker.gif" alt="typing cursor" style="width: 15px; height: auto; vertical-align: bottom; margin-left: 2px;" /></p>`;
            } else {
                content = `
                    <p class="streaming-content">
                        <img src="https://apilageai.lk/assets/images/blinker.gif" alt="typing cursor" style="width: 15px; height: auto; vertical-align: bottom; margin-right: 5px;" />
                    </p>
                `;
            }
        } else {
            // Regular message content
            let processedText = messageText;

            // Remove [Summary: ...] from bot messages, but do not display it
            if (!isUserMessage) {
                const summaryMatch = processedText.match(/\[Summary:\s*(.*?)\]/s);
                if (summaryMatch) {
                    processedText = processedText.replace(summaryMatch[0], '');
                }
            }

            // Process message text
            if (!isUserMessage) {
                processedText = this.processMessageText(processedText);
                if (processedText.includes('<img')) {
                    content = processedText;
                } else {
                    content = `<p>${processedText}</p>`;
                }
            } else {
                content = `<p>${processedText}</p>`;
            }

            // Add attachment for user messages
            if (isUserMessage && attachment) {
                content += `
                    <div class="message-attachment">
                        <img src="https://apilageai.lk/uploads/${attachment}" 
                             alt="User uploaded image" 
                             style="max-width: 300px; border-radius: 8px; margin-top: 10px;" />
                    </div>
                `;
            }
        }

        // Add message icons
        content += this.generateMessageIcons(messageData, { hideIcons: isStreaming && !finalizeStreaming });

        return content;
    }

    // Generate message action icons
    generateMessageIcons(messageData, opts = {}) {
        const messageType = parseInt(messageData.type || messageData.t, 10);
        const messageId = messageData.message_id || messageData.m_id;
        const messageText = messageData.text || messageData.txt || '';
        const isUserMessage = messageType === 1;
        const { hideIcons = false } = opts;
        const hideAttr = hideIcons ? ' style="display:none;"' : '';

        if (isUserMessage) {
            return `
                <div class="message-icons"${hideAttr}>
                    <button class="message-copy icon-button">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                    <button class="message-edit icon-button">
                        <i class="fa-solid fa-edit"></i>
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="message-icons"${hideAttr}>
                    <a href="#" class="report-bug-link">
                        <button style="background: none; border: none; padding-left: 10px; padding-right: 20px; cursor: pointer;">
                            <i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #8B0000;"></i>
                        </button>
                    </a>
                    <button class="message-thumbs-down icon-button" data-message-id="${messageId}">
                        <i class="fa fa-refresh"></i>
                    </button>
                    <button class="message-note icon-button blink-button" data-message="${encodeURIComponent(messageText)}">
                        <i class="fa fa-book"></i>
                    </button>
                    <button class="message-read-aloud icon-button">
                        <i class="fa fa-volume-up"></i>
                    </button>
                    <button class="message-mindmap icon-button" data-message-id="${messageId}" data-message-text="${encodeURIComponent(messageText)}">
                        <i class="fa fa-brain"></i>
                    </button>
                    <button class="message-copy icon-button">
                        <i class="fa-solid fa-copy"></i>
                    </button>
                </div>
            `;
        }
    }

    // Insert message in correct chronological order
    insertMessageInOrder(messageWrapper, messageId) {
        const nextBubble = Array.from(this.chatContainer.children).find(
            (child) => parseInt(child.dataset.mId, 10) > messageId
        );

        if (nextBubble) {
            this.chatContainer.insertBefore(messageWrapper, nextBubble);
        } else {
            this.chatContainer.appendChild(messageWrapper);
        }
    }

    // Update streaming message content
    updateStreamingMessage(messageId, content) {
        const streamingElement = this.streamingElements.get(messageId);
        if (streamingElement) {
            // Remove streaming indicator if it exists
            const streamingIndicator = streamingElement.querySelector('.streaming-indicator');
            if (streamingIndicator) {
                streamingIndicator.remove();
            }

            // Update content with markdown rendering
            const processedContent = this.processMessageText(content);
            streamingElement.innerHTML = processedContent + '<span class="streaming-cursor">▋</span>';
            // Allow MathJax and Prism rendering during streaming but skip Mermaid
            if (window.MathJax?.typesetPromise) {
                MathJax.typesetPromise([streamingElement]).catch(err => console.error('MathJax error:', err));
            }
            if (window.Prism) {
                Prism.highlightAllUnder(streamingElement);
            }
            // Note: Mermaid rendering is intentionally skipped here and only handled in finalizeStreamingMessage/processMessageContent.
        }
    }

    // Finalize streaming message
    finalizeStreamingMessage(messageId, finalContent) {
        const messageWrapper = document.querySelector(`[data-m-id="${messageId}"]`);
        if (messageWrapper) {
            // Remove streaming cursor
            const cursor = messageWrapper.querySelector('.streaming-cursor');
            if (cursor) {
                cursor.remove();
            }

            // Remove streaming class and update content
            messageWrapper.classList.remove('streaming');

            // Update with final content
            this.createOrUpdateBubble({
                message_id: messageId,
                text: finalContent,
                type: 2
            }, {
                isUpdate: true,
                finalizeStreaming: true
            });
            // Ensure MathJax and code boxes are rendered after refresh
            // Find the updated message wrapper again (in case it was replaced)
            const updatedWrapper = document.querySelector(`[data-m-id="${messageId}"]`);
            if (updatedWrapper) {
                this.processMessageContent(updatedWrapper);
            }
        }
    }

    // Process message text (extracted from your existing function)
    processMessageText(text) {
        // Desmos formulas: %%math%%
        text = text.replace(/%%(.*?)%%/g, (_, fn) => {
            const trimmedFunction = fn.trim();
            setTimeout(() => {
                const rightSidebar = document.getElementById("rightSidebar");
                const appContainer = document.querySelector(".app-container");
                if (rightSidebar && !rightSidebar.classList.contains("active")) {
                    rightSidebar.classList.add("active");
                    appContainer?.classList.add("right-sidebar-active");
                }
                const graphFunctionInput = document.getElementById("graphFunctionInput");
                const graphFunctionSubmit = document.getElementById("graphFunctionSubmit");
                if (graphFunctionInput && graphFunctionSubmit) {
                    graphFunctionInput.value = trimmedFunction;
                    setTimeout(() => {
                        graphFunctionSubmit.click();
                        if (window.calculator) {
                            const functionId = "func" + Date.now();
                            window.calculator.setExpression({
                                id: functionId,
                                latex: trimmedFunction,
                                color: Desmos.Colors.BLUE,
                            });
                        }
                    }, 600);
                }
            }, 500);
            return `<span class="graph-function-highlight" data-function="${trimmedFunction}">
                <span class="badge" onclick="openGraphSidebar('${trimmedFunction}')">➕ Open Graph View</span>
            </span>`;
        });

        // Ensure MathJax reads proper delimiters
        text = text.replace(/\\\((.+?)\\\)/g, (_, expr) => `$${expr}$`);
        text = text.replace(/\\\[(.+?)\\\]/gs, (_, expr) => `$$${expr}$$`);

        // Use Marked.js for markdown parsing
        if (typeof marked !== 'undefined') {
            text = marked.parse(text);
        }

        // Extract YouTube links only (leave image links inline for Markdown to render)
        const videoLinks = [...text.matchAll(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g)];

        // Remove YouTube links from the text so we can show them as embeds below
        text = text.replace(/https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g, "");

        if (videoLinks.length) {
            let mediaHTML = '<hr /><div class="resources-section"><div style="margin-top: 10px; font-weight: bold;">Recommended Videos</div><div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">';

            videoLinks.forEach(([, videoId]) => {
                mediaHTML += `<iframe width="320" height="180" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
            });

            mediaHTML += "</div></div>";
            text += mediaHTML;
        }

        // Remove domain text from main response and extract domains
        const foundDomains = [...text.matchAll(/\(\[(https?:\/\/)?([\w.-]+\.\w+)\]\)/g)];
        const resourceSites = [];
        const domainSet = new Set();
        foundDomains.forEach(([, , domain]) => {
            if (!domainSet.has(domain)) {
                domainSet.add(domain);
                resourceSites.push(domain);
            }
        });

        text = text.replace(/\(\[(https?:\/\/)?([\w.-]+\.\w+)\]\)/g, "");

        if (resourceSites.length > 0) {
            const resourceHTML = `
                <hr />
                <div class="resources-section">
                    <div class="resources-title">ApilageAI used the following sources:</div>
                    <div class="resource-scroll">
                        ${resourceSites.map(site => `
                            <div class="resource-card">
                                <img src="https://www.google.com/s2/favicons?sz=64&domain=${site}" width="48" height="48" />
                                <div class="site-name">${site}</div>
                                <div class="site-desc">External resource used</div>
                            </div>
                        `).join("")}
                    </div>
                </div>`;
            text += resourceHTML;
        }

        return text;
    }

    // Process message content for MathJax, Prism, and Mermaid
    processMessageContent(element) {
        // Process MathJax if present
        if (window.MathJax?.typesetPromise) {
            MathJax.typesetPromise([element]).catch(err => console.error('MathJax error:', err));
        }

        // Process code blocks with Prism
        setTimeout(() => {
            element.querySelectorAll('pre code').forEach((block) => {
                if (window.Prism) {
                    Prism.highlightElement(block);
                }
                this.addCodeBlockFeatures(block);
            });
        }, 100);

        // Process Mermaid diagrams
        setTimeout(() => {
            element.querySelectorAll('code.language-mermaid, pre.mermaid, .mermaid-block').forEach(async (block) => {
                const code = block.textContent.trim();
                if (code.startsWith('graph')) {
                    const container = document.createElement('div');
                    container.className = 'mermaid';
                    container.textContent = code;
                    block.replaceWith(container);

                    try {
                        const { svg } = await mermaid.render('mermaid-' + Date.now(), code);
                        container.innerHTML = svg;
                    } catch (err) {
                        console.error('Mermaid render error:', err);
                        container.innerHTML = `<pre style="color:red;">Diagram render failed.</pre>`;
                    }
                }
            });
        }, 200);
    }

    // Add code block features
    addCodeBlockFeatures(codeBlock) {
        const pre = codeBlock.parentElement;
        if (!pre.classList.contains("code-container")) {
            pre.classList.add("code-container");
            pre.classList.add("line-numbers");
            const lang = codeBlock.className.match(/language-([\w-]+)/)?.[1] || "text";
            const header = document.createElement("div");
            header.className = "code-header";
            header.innerHTML = `<span class="lang-label">${lang}</span><button class="copy-code-btn">Copy</button>`;
            pre.insertBefore(header, codeBlock);
        }
    }

    // Add event listeners to message buttons
    addMessageEventListeners(messageWrapper, messageData) {
        // Use your existing addMessageEventListeners function
        if (typeof addMessageEventListeners === 'function') {
            addMessageEventListeners(messageWrapper, messageData);
        }
    }

    // Handle new conversation setup
    handleNewConversation(conversationId) {
        const newUrl = `https://apilageai.lk/app/chat/${conversationId}`;
        window.history.pushState({}, '', newUrl);
        if (typeof socket !== 'undefined') {
            // Find the last loaded conversation in the sidebar
            const lastConversationEl = document.querySelector(".sidebar-item:last-of-type");

            // Extract ID if it exists (assuming data-id or menu ID contains it)
            let lastConversationId = null;
            if (lastConversationEl) {
                const menuToggle = lastConversationEl.querySelector(".menu-toggle");
                if (menuToggle) {
                    lastConversationId = menuToggle.dataset.menuId?.replace("menu-", "");
                }
            }

            // Emit with last_conversation_id if found
            socket.emit(
                "get_conversations",
                lastConversationId ? { last_conversation_id: lastConversationId } : {}
            );
        }
    }

    // Scroll to bottom (only if user is near the bottom)
    scrollToBottom() {
        if (this.chatContainer) {
            const threshold = 100; // px from bottom
            const isNearBottom = this.chatContainer.scrollHeight - this.chatContainer.scrollTop - this.chatContainer.clientHeight < threshold;
            if (isNearBottom) {
                this.chatContainer.scrollTo({
                    top: this.chatContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }
}

const chatBubbleManager = new ChatBubbleManager();

// Socket.IO connection
const socket = io("https://apilageai.lk:5001", {
    withCredentials: true,
    transports: ["websocket", "polling"],
});

const sendButton = document.getElementById("send-button");

socket.on("authenticated", (data) => {
    if (data.success) {
        window.userBalance = data.user.balance;
        window.userData = data.user;

        // ===============================
        // Model selection and capability logic (frontend token names only)
        // ===============================
        // NOTE: frontend only uses tokens: 'free' | 'pro' | 'super'.
        // Real model ids MUST NOT appear here.
        let allowedModelTokens = [];
        let defaultModelToken = "";
        const balance = window.userBalance || 0;
        // All possible model tokens (frontend-side)
        let allModelTokens = ['auto', 'free', 'pro', 'super'];

        if (balance <= 200) {
            allowedModelTokens = ['free'];
            defaultModelToken = 'free';
        } else if (balance > 200 && balance < 400) {
            allowedModelTokens = ['free', 'pro'];
            defaultModelToken = 'pro';
        } else if (balance >= 400) {
            allowedModelTokens = ['free', 'pro', 'super'];
            // If 'super' is in allowed models, make it the default
            if (allowedModelTokens.includes('super')) {
                defaultModelToken = 'super';
            } else {
                defaultModelToken = 'pro';
            }
        }

        window.allowedModels = allowedModelTokens;
        window.defaultModel = defaultModelToken;
        window.allowThinking = balance >= 400;
        window.allowWebSearch = balance >= 400;
        window.allModelTokens = allModelTokens;

        // Determine selected model: use saved model if available and in allModelTokens, else default to 'auto'
        let savedModel = localStorage.getItem("chatSelectedModel");
        if (savedModel && allModelTokens.includes(savedModel)) {
            window.selectedModel = savedModel;
        } else {
            window.selectedModel = 'auto'; // default for all users
        }
        // Save the selected model to localStorage for future sessions
        localStorage.setItem("chatSelectedModel", window.selectedModel);

        if (typeof updateModelSwitcherUI === "function") {
            updateModelSwitcherUI();
        }

        // Update UI with user data if needed
        const balanceElements = document.querySelectorAll(".user-balance");
        balanceElements.forEach((el) => {
            el.textContent = data.user.balance;
        });
    }
});

// ===============================
// Model Switcher UI (Dropdown)
// ===============================
function updateModelSwitcherUI() {
    const currentLabel = document.getElementById("currentModelLabel");
    const dropdownMenu = document.getElementById("modelDropdownMenu");
    const dropdownBtn = document.getElementById("modelDropdownBtn");

    if (!dropdownMenu || !dropdownBtn || !window.allowedModels || !window.selectedModel) return;

    // Update current model label only (next to "Apilage AI")
    currentLabel.textContent = getModelDisplayName(window.selectedModel);

    // Keep button text as ▼ (chevron)
    dropdownBtn.textContent = "▼";

    // Reset dropdown items
    dropdownMenu.innerHTML = "";

    // Use allModelTokens for the dropdown (show all, but gray out non-allowed)
    const allModels = window.allModelTokens || ['free','pro','super'];
    allModels.forEach(model => {
        const li = document.createElement("li");
        li.textContent = getModelDisplayName(model);
        li.className = model === window.selectedModel ? "selected" : "";
        // Keep Auto always enabled, even if not in allowed models
        if (model !== 'auto' && !window.allowedModels.includes(model)) {
            li.classList.add('disabled-model');
            // Don't allow click to select
        } else {
            li.onclick = () => {
                if (model !== window.selectedModel) {
                    window.selectedModel = model;
                    // Save the selected model to localStorage
                    localStorage.setItem('chatSelectedModel', model);
                    updateModelSwitcherUI();
                }
                dropdownMenu.classList.remove('show');
            };
        }
        dropdownMenu.appendChild(li);
    });

    // Toggle dropdown
    dropdownBtn.onclick = (e) => {
        e.stopPropagation(); // Prevent immediate close
        dropdownMenu.classList.toggle("show");

        // Optional: rotate chevron when open
        if (dropdownMenu.classList.contains("show")) {
            dropdownBtn.textContent = "▲";
        } else {
            dropdownBtn.textContent = "▼";
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdownMenu.contains(e.target) && !dropdownBtn.contains(e.target)) {
            dropdownMenu.classList.remove("show");
            dropdownBtn.textContent = "▼"; // reset chevron down
        }
    });

    // Inject CSS for disabled-model if not already present
    if (!document.getElementById("disabled-model-style")) {
        const style = document.createElement("style");
        style.id = "disabled-model-style";
        style.textContent = `
            .disabled-model {
                opacity: 0.5;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }
}

// ===============================
// Helper for pretty model names (Custom UI Names)
// ===============================
function getModelDisplayName(model) {
    // Expect frontend token values: 'auto', 'free', 'pro', 'super'
    switch (model) {
        case 'auto':
            return "Auto";
        case 'free':
            return "Free";
        case 'pro':
            return "Pro";
        case 'super':
            return "Super";
        default:
            // Defensive fallback: don't reveal raw model ids
            if (typeof model === 'string') {
                if (model.includes('2.0') || model.includes('gemini')) return 'Free';
                if (model.includes('2.5') && model.includes('lite')) return 'Pro';
                if (model.includes('2.5') && model.includes('pro')) return 'Super';
            }
            return 'Model';
    }
}

// Existing non-streaming handler for backward compatibility
socket.on("message_response", (response) => {
    handleMessageResponse(response);
});

// NEW STREAMING HANDLERS
socket.on("stream_start", (data) => {
    handleStreamStart(data);
});

socket.on("stream_chunk", (data) => {
    handleStreamChunk(data);
});

socket.on("stream_complete", (data) => {
    handleStreamComplete(data);
    // Remove status indicator if exists
    const statusEl = document.querySelector(`#msg-${data.message_id} .status`);
    if (statusEl) {
        statusEl.remove();
    }
});

socket.on("stream_error", (data) => {
    handleStreamError(data);
});

// 🔍 Show when Gemini is searching the web
socket.on("stream_searching", (data) => {
    // data = { conversation_id, message_id, message }
    let msgElement = document.querySelector(`#msg-${data.message_id} .status`);
    if (!msgElement) {
        const parent = document.querySelector(`#msg-${data.message_id}`);
        if (!parent) return;
        msgElement = document.createElement("div");
        msgElement.className = "status";
        parent.appendChild(msgElement);
    }
    msgElement.innerText = "🔍 " + (data.message || "Searching the web…");
});

// 🤔 Show when Gemini is thinking
socket.on("stream_thinking", (data) => {
    // data = { conversation_id, message_id, chunk }
    let msgElement = document.querySelector(`#msg-${data.message_id} .status`);
    if (!msgElement) {
        const parent = document.querySelector(`#msg-${data.message_id}`);
        if (!parent) return;
        msgElement = document.createElement("div");
        msgElement.className = "status";
        parent.appendChild(msgElement);
    }
    // Append streamed reasoning as it arrives
    msgElement.innerText = "🤔 Thinking… " + (data.chunk || "");
});

socket.on("user_message_saved", (data) => {
    chatBubbleManager.createOrUpdateBubble(data);
});

socket.on("conversations_list", (conversations) => {
    updateConversationsList(conversations);
});

socket.on("conversation_data", (data) => {
    handleConversationData(data);
});

socket.on("conversation_deleted", (result) => {
    if (!result.error) {
        window.location.href = "https://apilageai.lk/app";
    } else {
        showDialog("Error", result.message || "Failed to delete conversation");
    }
});

socket.on("error", (error) => {
    showDialog("Error", error.message || "Connection error occurred");
});

// STREAMING HANDLERS
function handleStreamStart(data) {
    // Stop any existing loading animations
    clearTimeout(typingTimeout);
    clearInterval(stageInterval);
    typingSound.pause();
    typingSound.currentTime = 0;

    // Keep input disabled during streaming
    messageInput.disabled = true;
    messageInput.style.background = "";
    messageInput.value = "Sending...";

    // Create streaming message using optimized system
    currentStreamingMessage = {
        conversation_id: data.conversation_id,
        message_id: data.message_id,
        content: '',
        is_new: data.is_new,
        isImage: !!data.is_image_request
    };

    // Use chatBubbleManager to create or update the bubble
    let bubble = chatBubbleManager.createOrUpdateBubble({
        message_id: data.message_id,
        type: 2,
        is_new: data.is_new
    }, {
        isStreaming: true
    });

    // If this is an image request, show a placeholder
    if (data.is_image_request && bubble) {
        bubble.innerHTML = `<div class="image-processing-placeholder" style="color: #888888; font-style: italic;">Image is processing...</div>`;
    }
    streamingMessageElement = bubble.querySelector('.streaming-content') || bubble;
}

function handleStreamChunk(data) {
    if (
        currentStreamingMessage &&
        currentStreamingMessage.message_id === data.message_id
    ) {
        currentStreamingMessage.content = data.full_content;
        // Skip updating streaming content for image requests
        if (!currentStreamingMessage.isImage) {
            chatBubbleManager.updateStreamingMessage(data.message_id, data.full_content);
        }
        chatBubbleManager.scrollToBottom();
    }
}

function handleStreamComplete(data) {
    if (
        currentStreamingMessage &&
        currentStreamingMessage.message_id === data.message_id
    ) {
        // Ensure isImage is set from backend (in stream_complete, too)
        currentStreamingMessage.isImage = !!data.is_image_request || !!currentStreamingMessage.isImage;

        if (currentStreamingMessage.isImage) {
            // Replace placeholder with final image HTML
            const bubble = document.querySelector(`#message-${data.message_id}`);
            if (bubble) {
                bubble.innerHTML = data.final_content; // final_content is <img> HTML
                chatBubbleManager.processMessageContent(bubble);
            }
        } else {
            // Finalize streaming message as usual
            chatBubbleManager.finalizeStreamingMessage(data.message_id, data.final_content);
        }

        // Update user balance display
        if (data.cost && window.userData) {
            window.userData.balance -= data.cost;
            window.userBalance = window.userData.balance;
            updateBalanceDisplay();
        }

        // Clear streaming state
        currentStreamingMessage = null;
        streamingMessageElement = null;

        // Re-enable input
        enableMessageInput();

        // Clear attachments and input
        clearAttachments();
        messageInput.value = "";
    }
}

function handleStreamError(data) {
    const messageWrapper = document.querySelector(`[data-m-id="${data.message_id}"]`);
    if (messageWrapper) {
        messageWrapper.innerHTML = `
            <div class="error-message" style="color: #ff4444; padding: 10px; border: 1px solid #ff4444; border-radius: 8px; margin: 10px 0;">
                <i class="fas fa-exclamation-triangle"></i>
                ${data.message || 'An error occurred while streaming the message.'}
            </div>
        `;
    }

    // Clear streaming state
    currentStreamingMessage = null;
    streamingMessageElement = null;

    // Re-enable input
    enableMessageInput();
    // Clear attachments and input
    clearAttachments();
    messageInput.value = "";
}

function createStreamingMessageElement(data) {
    let chatContainer;  // Declare here for broader scope

    if (data.is_new) {
        // Find and remove chat-start-container
        const startContainer = document.querySelector(".chat-start-container");
        if (startContainer) {
            startContainer.remove();
        }

        // Create the new messages-container div
        chatContainer = document.createElement("div");
        chatContainer.id = "messages-container";
        chatContainer.className = "messages-container y-overflow-auto";

        // Find the chat-area-wrapper container
        const chatAreaWrapper = document.querySelector(".chat-area-wrapper");
        if (chatAreaWrapper) {
            // Prepend the new container inside chat-area-wrapper
            chatAreaWrapper.prepend(chatContainer);
        }
    } else {
        // Get existing chat container
        chatContainer = document.getElementById("messages-container");
    }

    // Create message wrapper
    const messageWrapper = document.createElement("div");
    messageWrapper.className = 'message bot-message chatBubble streaming';
    messageWrapper.id = `message-${data.message_id}`;
    messageWrapper.dataset.mId = data.message_id;

    // Create message content with streaming indicator
    messageWrapper.innerHTML = `
        <style>
        @keyframes typing-bounce {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1.2); opacity: 1; }
        }
        </style>
        <p class="streaming-content">
            <div class="streaming-indicator">
                <div class="typing-dots" style="display:flex;align-items:center;gap:4px;">
                    <span style="width:6px;height:6px;background:#666;border-radius:50%;display:inline-block;animation:typing-bounce 1s infinite ease-in-out;"></span>
                    <span style="width:6px;height:6px;background:#666;border-radius:50%;display:inline-block;animation:typing-bounce 1s infinite ease-in-out 0.2s;"></span>
                    <span style="width:6px;height:6px;background:#666;border-radius:50%;display:inline-block;animation:typing-bounce 1s infinite ease-in-out 0.4s;"></span>
                </div>
                <span style="margin-left: 10px; color: #666;">Apilage AI is typing...</span>
            </div>
        </p>
        <div class="message-icons">
            <button class="message-copy icon-button">
                <i class="fa-solid fa-copy"></i>
            </button>
        </div>
    `;

    // Add to chat container
    chatContainer.appendChild(messageWrapper);

    // Scroll to show the new message
    scrollToBottom();

    return messageWrapper.querySelector('.streaming-content');
}

function updateStreamingMessageElement(content) {
    if (streamingMessageElement) {
        // Remove streaming indicator if it exists
        const streamingIndicator = streamingMessageElement.querySelector('.streaming-indicator');
        if (streamingIndicator) {
            streamingIndicator.remove();
        }

        // Update content with markdown rendering
        const processedContent = processMessageText(content);
        streamingMessageElement.innerHTML = processedContent + '<span class="streaming-cursor">▋</span>';
    }
}

function finalizeStreamingMessage(finalContent) {
    if (streamingMessageElement) {
        // Remove streaming cursor
        const cursor = streamingMessageElement.querySelector('.streaming-cursor');
        if (cursor) {
            cursor.remove();
        }

        // Remove streaming class
        const messageWrapper = streamingMessageElement.closest('.message');
        if (messageWrapper) {
            messageWrapper.classList.remove('streaming');
        }

        // Process and set final content
        const processedContent = processMessageText(finalContent);
        streamingMessageElement.innerHTML = processedContent;

        // Add proper message icons for AI messages
        const messageIcons = messageWrapper?.querySelector('.message-icons');
        if (messageIcons) {
            messageIcons.innerHTML = `
                <a href="#" class="report-bug-link">
                    <button style="background: none; border: none; padding-left: 10px; padding-right: 20px; cursor: pointer;">
                        <i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #8B0000;"></i>
                    </button>
                </a>
                <button class="message-thumbs-down icon-button" data-message-id="${messageWrapper.dataset.mId}">
                    <i class="fa fa-refresh"></i>
                </button>
                <button class="message-note icon-button blink-button" data-message="${encodeURIComponent(finalContent)}">
                    <i class="fa fa-book"></i>
                </button>
                <button class="message-read-aloud icon-button">
                    <i class="fa fa-volume-up"></i>
                </button>
                <button class="message-mindmap icon-button" data-message-id="${messageWrapper.dataset.mId}" data-message-text="${encodeURIComponent(finalContent)}">
                    <i class="fa fa-brain"></i>
                </button>
                <button class="message-copy icon-button">
                    <i class="fa-solid fa-copy"></i>
                </button>
            `;

            // Add event listeners for the new buttons
            addMessageEventListeners(messageWrapper, {
                m_id: messageWrapper.dataset.mId,
                txt: finalContent,
                t: 2
            });
        }

        // Process any special content (math, code, etc.)
        processMessageContent(streamingMessageElement);
    }
}

function processMessageContent(element) {
    // Process MathJax if present
    if (window.MathJax?.typesetPromise) {
        MathJax.typesetPromise([element]).catch(err => console.error('MathJax error:', err));
    }

    // Process code blocks with Prism
    setTimeout(() => {
        element.querySelectorAll('pre code').forEach((block) => {
            if (window.Prism) {
                Prism.highlightElement(block);
            }
            addCodeBlockFeatures(block);
        });
    }, 100);
}

function scrollToBottom() {
    const chatContainer = document.getElementById('messages-container');
    if (chatContainer) {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function updateBalanceDisplay() {
    const balanceElements = document.querySelectorAll(".user-balance");
    balanceElements.forEach((el) => {
        el.textContent = window.userBalance || 0;
    });
}

function enableMessageInput() {
    messageInput.disabled = false;
    messageInput.style.background = "";
    messageInput.value = "";
    messageInput.focus();

    // Re-enable send button
    sendButton.disabled = false;
    sendButton.classList.remove("text-muted");
    sendButton.classList.add("text-primary");
}

// --- SEND MESSAGE LOGIC PATCH: include model in payload ---
// (This logic is now handled in sendMessage below, so this old handler is not needed.)
const typingSound = new Audio("https://apilageai.lk/assets/sounds/typing.mp3");
typingSound.loop = true;

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");

const messageInput = document.getElementById("message-input");
if (messageInput) {
    messageInput.value = query;
    messageInput.focus();
}

const previewWrapper = document.querySelector(".preview-wrapper");
const removeBtn = document.getElementById("removeImage");

// Extend clearAttachments to also clear the input field and preview
function clearAttachmentsPreview() {
    // Remove preview images or attachments from the previewWrapper
    if (previewWrapper) {
        previewWrapper.innerHTML = "";
        previewWrapper.style.display = "none";
    }
    // Reset any attachment state variables if used
    if (window.uploadedAttachment) {
        window.uploadedAttachment = null;
    }
    // If there is a file input for attachments, reset it
    const fileInput = document.getElementById("fileInput");
    if (fileInput) {
        fileInput.value = "";
    }
}

// ===============================
// Auto Upload + Progress Bar + Improved Drag & Drop
// ===============================

const uploadEndpoint = "https://apilageai.lk:5001/upload";

// --- Create or update upload status UI
function showUploadStatus(statusText, color = "#888") {
    if (!previewWrapper) return;
    let statusEl = previewWrapper.querySelector(".upload-status");
    if (!statusEl) {
        statusEl = document.createElement("div");
        statusEl.className = "upload-status";
        statusEl.style.marginTop = "6px";
        statusEl.style.fontSize = "13px";
        previewWrapper.appendChild(statusEl);
    }
    statusEl.style.color = color;
    statusEl.innerText = statusText;
}

// --- Upload with progress bar ---
function uploadFileAuto(file) {
    if (!file || !file.type.startsWith("image/")) {
        showUploadStatus("❌ Unsupported file type", "#ff4444");
        return;
    }

    previewWrapper.innerHTML = `
        <div class="preview-item" style="display:flex;align-items:center;gap:10px;">
            <img src="${URL.createObjectURL(file)}" 
                 alt="Preview"
                 style="max-width:120px;border-radius:8px;opacity:0.7;">
            <div style="flex-grow:1;">
                <div class="progress-container" style="background:#eee;border-radius:5px;height:8px;width:100%;overflow:hidden;margin-bottom:5px;">
                    <div class="progress-bar" style="background:#007bff;width:0%;height:100%;transition:width 0.3s;"></div>
                </div>
                <div class="progress-text" style="font-size:13px;color:#555;">Uploading 0%</div>
            </div>
            <button class="remove-upload" 
                    style="background:none;border:none;color:#ff4444;font-size:18px;cursor:pointer;">✖</button>
        </div>
    `;
    previewWrapper.style.display = "block";

    const progressBar = previewWrapper.querySelector(".progress-bar");
    const progressText = previewWrapper.querySelector(".progress-text");
    const removeBtn = previewWrapper.querySelector(".remove-upload");
    removeBtn.addEventListener("click", clearAttachments);

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("image", file);

    xhr.open("POST", uploadEndpoint, true);
    xhr.withCredentials = true;

    // Update progress
    xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + "%";
            progressText.textContent = `Uploading ${percent}%`;
        }
    });

    // Upload complete
    xhr.onload = function () {
        if (xhr.status === 200) {
            try {
                const result = JSON.parse(xhr.responseText);
                if (result.filename) {
                    progressBar.style.width = "100%";
                    progressText.textContent = "✅ Uploaded Successfully";
                    progressBar.style.background = "#28a745";

                    previewWrapper.innerHTML = `
                        <div class="preview-item" style="display:flex;align-items:center;gap:10px;">
                            <img src="https://apilageai.lk/uploads/${result.filename}" 
                                 alt="Uploaded image"
                                 style="max-width:120px;border-radius:8px;">
                            <span style="font-size:13px;color:#333;">${file.name}</span>
                            <button class="remove-upload" 
                                    style="background:none;border:none;color:#ff4444;font-size:18px;cursor:pointer;">✖</button>
                        </div>
                        <div class="upload-status" style="color:#28a745;">Uploaded ✅</div>
                    `;

                    const removeBtnFinal = previewWrapper.querySelector(".remove-upload");
                    removeBtnFinal.addEventListener("click", clearAttachments);

                    // Store uploaded file name
                    window.uploadedAttachment = result.filename;
                } else {
                    showUploadStatus("❌ Upload failed", "#ff4444");
                }
            } catch (err) {
                showUploadStatus("❌ Invalid server response", "#ff4444");
            }
        } else {
            showUploadStatus("❌ Upload failed", "#ff4444");
        }
    };

    xhr.onerror = function () {
        showUploadStatus("❌ Network error", "#ff4444");
    };

    xhr.send(formData);
}

// ✅ Wrapper for backward compatibility (fixes handleFileUpload undefined)
function handleFileUpload(file) {
    uploadFileAuto(file);
}

// --- Handle file input selection ---
if (fileInput) {
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) uploadFileAuto(file);
    });
}

// ✅ Unified Drag & Drop Upload (same behavior as select)
["message-input", "previewWrapper"].forEach((idOrEl) => {
    const el = typeof idOrEl === "string" ? document.getElementById(idOrEl) : idOrEl;
    if (!el) return;

    el.addEventListener("dragover", (e) => {
        e.preventDefault();
        el.classList.add("drag-over");
        showUploadStatus("📸 Drop image to upload", "#007bff");
    });

    el.addEventListener("dragleave", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");
        showUploadStatus("");
    });

    el.addEventListener("drop", (e) => {
        e.preventDefault();
        el.classList.remove("drag-over");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            uploadFileAuto(file); // ✅ Same logic as select upload
        } else {
            showUploadStatus("❌ Only image files are allowed", "#ff4444");
        }
    });
});

// --- Clear attachment ---
function clearAttachmentsPreview() {
    if (previewWrapper) {
        previewWrapper.innerHTML = "";
        previewWrapper.style.display = "none";
    }
    if (fileInput) fileInput.value = "";
    window.uploadedAttachment = null;
    showUploadStatus("");
}

// --- Styling for drag and drop + progress bar ---
if (!document.getElementById("drag-style")) {
    const style = document.createElement("style");
    style.id = "drag-style";
    style.textContent = `
        #message-input.drag-over {
            border: 2px dashed #007bff;
            background: #f0f8ff;
            transition: all 0.25s ease-in-out;
        }
        .preview-wrapper {
            margin-top: 10px;
        }
        .upload-status {
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}


function setGreeting() {
    const hour = new Date().getHours();
    let greeting = "";

    if (hour >= 3 && hour < 12) {
        greeting = "Good morning 🌻";
    } else if (hour >= 12 && hour < 16) {
        greeting = "Good afternoon 🌞";
    } else if (hour >= 16 && hour < 20) {
        greeting = "Good evening 🌥️";
    } else if (hour >= 20 && hour < 24) {
        greeting = "Happy late night 🌙";
    } else {
        greeting = "A new day 🌅"; // 12am to 3am
    }

    const greetingElement = document.querySelector(".greeting-text");
    if (greetingElement) {
        greetingElement.textContent = `${greeting},`;
    }
}

function updateCardTitles() {
    const titles = document.querySelectorAll(".card-title");
    const englishTitles = [
        "Teach me about the Quadratic Formula",
        "Graph the function f(x)= sin(x)",
        "Explain photosynthesis",
    ];

    titles.forEach((title, index) => {
        title.textContent = englishTitles[index];
    });
}


// Helper functions for Socket.IO responses (keep for backward compatibility)
function handleMessageResponse(response) {
    // Clean up UI loading states
    clearTimeout(typingTimeout);
    clearInterval(stageInterval);
    typingSound.pause();
    typingSound.currentTime = 0;
    messageInput.disabled = false;
    messageInput.style.background = "";
    messageInput.value = "";

    if (response.error) {
        showDialog("Error", response.message);
    } else {
        messageInput.value = "";
        clearAttachments();
        const currentConversationId = getConversationIdFromURL();
        if (currentConversationId === response.conversation_id) {
            loadConversation(response.conversation_id);
        } else {
            window.location.href = `https://apilageai.lk/app/chat/${response.conversation_id}`;
        }

        // Update user balance if provided
        if (response.cost && window.userData) {
            window.userData.balance -= response.cost;
            window.userBalance = window.userData.balance;
            updateBalanceDisplay();
        }
    }
}


// ✅ Global wrapper for compatibility — prevents "clearAttachments is not defined" errors
function clearAttachments() {
    if (typeof clearAttachmentsPreview === "function") {
        clearAttachmentsPreview();
    }

    const fileInput = document.getElementById("fileInput");
    const previewWrapper = document.querySelector(".preview-wrapper");
    if (fileInput) fileInput.value = "";
    if (previewWrapper) {
        previewWrapper.innerHTML = "";
        previewWrapper.style.display = "none";
    }
    window.uploadedAttachment = null;
}

function handleConversationData(data) {
    if (data.error) {
        showDialog("Error", data.message);
    } else {
        updateChatContainer(data.messages);
        // Remove loading spinner if exists
        const loading = document.getElementById("conversation-loading");
        if (loading) loading.remove();
    }
}

function updateConversationsList(conversations) {
    // Update sidebar with conversations list
    const sidebarContainer = document.querySelector(".conversations-list");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = "";
        conversations.forEach((conv) => {
            const convElement = createConversationElement(conv);
            sidebarContainer.appendChild(convElement);
        });
    }
}

function createConversationElement(conversation) {
    const id = conversation.conversation_id;
    const wrapper = document.createElement("div");
    wrapper.className = "sidebar-item-wrapper";
    wrapper.style.display = "block";

    wrapper.innerHTML = `
        <div class="sidebar-item">
            <a href="https://apilageai.lk/app/chat/${id}">
                <span>${conversation.title}</span>
            </a>
            <button class="menu-toggle" data-menu-id="menu-${id}">⋮</button>
        </div>
        <div class="menu" id="menu-${id}" style="display:none;">
            <button onclick="deleteConversation('${id}')">Delete</button>
        </div>
    `;
    return wrapper;
}

function getConversationIdFromURL() {
    const url = window.location.href;
    const match = url.match(/(\d+)(?!.*\d)/);
    return match ? parseInt(match[1]) : null;
}

function loadConversation(conversationId) {
    // Show loading buffer
    let loading = document.getElementById("conversation-loading");
    if (!loading) {
        loading = document.createElement("div");
        loading.id = "conversation-loading";
        loading.style.textAlign = "center";
        loading.style.padding = "20px";
        loading.innerHTML = '<img src="https://apilageai.lk/assets/images/buffer.gif" alt="Loading..." style="max-width: 60px;" />';
        const chatContainer = document.getElementById("messages-container") || document.querySelector(".chat-area-wrapper");
        if (chatContainer) {
            chatContainer.appendChild(loading);
        }
    }
    socket.emit("get_conversation", {
        conversation_id: conversationId,
        get_messages: true,
        message_ids: getExistingMessageIds(),
    });
}

function getExistingMessageIds() {
    const chatContainer = document.getElementById("messages-container");
    if (!chatContainer) return "";

    const messageIds = [...chatContainer.querySelectorAll(".chatBubble")].map(
        (e) => e.dataset.mId
    );
    return messageIds.join(",");
}

document.addEventListener("DOMContentLoaded", function () {
    // Sidebar responsive open/close logic
    const toggleSidebarBtn = document.getElementById("toggleSidebar");
    const sidebar = document.getElementById("sidebar");
    const sidebarBack = document.getElementById("sidebarback");
    const SIDEBAR_BREAKPOINT = 955; // px

    function isDesktop() {
      return window.innerWidth > SIDEBAR_BREAKPOINT;
    }

    function setSidebarOpen(open) {
      if (!sidebar) return;

      if (open) {
        sidebar.classList.remove("hidden");
        sidebar.setAttribute("aria-hidden", "false");
        // hide open button (since sidebar is open)
        if (toggleSidebarBtn) toggleSidebarBtn.style.display = "none";
      } else {
        sidebar.classList.add("hidden");
        sidebar.setAttribute("aria-hidden", "true");
        // show open button when sidebar is closed
        if (toggleSidebarBtn) toggleSidebarBtn.style.display = "block";
      }

      // Sidebar close button visibility
      if (sidebarBack) {
        if (isDesktop()) {
          sidebarBack.style.display = "block"; // always visible on desktop
        } else {
          sidebarBack.style.display = open ? "block" : "none"; // mobile: show only when open
        }
      }
    }

    // Default state
    setSidebarOpen(isDesktop());

    // Resize listener
    let resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setSidebarOpen(isDesktop());
      }, 120);
    });

    // Open sidebar from navbar button
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener("click", function () {
        setSidebarOpen(true);
      });
    }

    // Close sidebar from inside sidebar
    if (sidebarBack) {
      sidebarBack.addEventListener("click", function () {
        setSidebarOpen(false);
      });
    }

    // Keep rest of initialization logic (greeting, chat, etc.)
    setGreeting();

    // Handle chat form submission
    const chatForm = document.getElementById("chat-form");
    const suggestionsDropdown = document.getElementById("suggestions-dropdown");

    const suggestions = [
        "Look at the image",
        "Search the web (Sri Lankan based)",
        "Draw the graph of",
        "Answer In සිංහල",
    ];

    messageInput.addEventListener("input", function () {
        const cursorPos = this.selectionStart;
        const textBeforeCursor = this.value.slice(0, cursorPos);
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");

        if (
            lastAtIndex !== -1 &&
            (cursorPos === lastAtIndex + 1 || textBeforeCursor.endsWith("@"))
        ) {
            showSuggestions();
        } else {
            suggestionsDropdown.style.display = "none";
        }

        function showSuggestions() {
            suggestionsDropdown.innerHTML = "";
            suggestions.forEach((item) => {
                const div = document.createElement("div");
                div.textContent = item;
                div.classList.add("ghost-style");
                div.onclick = () => insertSuggestion(item);
                suggestionsDropdown.appendChild(div);
            });

            const inputRect = messageInput.getBoundingClientRect();
            const formRect = chatForm.getBoundingClientRect();

            // Position dropdown above textarea
            suggestionsDropdown.style.display = "block";
            suggestionsDropdown.style.left = `${inputRect.left - formRect.left
                }px`;
            suggestionsDropdown.style.top = `${inputRect.top -
                formRect.top -
                suggestionsDropdown.offsetHeight -
                10
                }px`;
        }

        function insertSuggestion(text) {
            const cursorPos = messageInput.selectionStart;
            const value = messageInput.value;
            const atIndex = value.lastIndexOf("@", cursorPos);

            const before = value.substring(0, atIndex);
            const after = value.substring(cursorPos);

            const insertedText = text + " ; ";

            messageInput.value = before + insertedText + after;

            // Place cursor after the inserted suggestion
            const newPos = (before + insertedText).length;
            messageInput.focus();
            messageInput.setSelectionRange(newPos, newPos);

            suggestionsDropdown.style.display = "none";
        }
    });

    const charCountDisplay = document.getElementById("char-count");

    messageInput.addEventListener("beforeinput", function (e) {
        const currentLength = this.value.length;

        // Allow deletion and paste
        const allowedInputTypes = [
            "deleteContentBackward",
            "deleteContentForward",
            "insertFromPaste",
        ];

        // Predict next input length
        const inputData = e.data || "";
        const selectionLength = this.selectionEnd - this.selectionStart;
        const predictedLength =
            currentLength - selectionLength + inputData.length;

        if (
            predictedLength > 1000 &&
            !allowedInputTypes.includes(e.inputType)
        ) {
            e.preventDefault();
        }
    });

    messageInput.addEventListener("input", function () {
        let currentLength = this.value.length;

        // Trim if user pastes a lot
        if (currentLength > 1000) {
            this.value = this.value.slice(0, 1000);
            currentLength = 1000;
        }

        // Update live character count
        charCountDisplay.textContent = `${currentLength} / 1000 `;

        // Style change at limit
        charCountDisplay.classList.toggle(
            "limit-reached",
            currentLength >= 1000
        );

        // Toggle send button
        const hasText = this.value.trim().length > 0;
        sendButton.disabled = !hasText;
        sendButton.classList.toggle("text-muted", !hasText);
        sendButton.classList.toggle("text-primary", hasText);
    });

    messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    const imagePreview = document.getElementById("imagePreview");

    fileInput.addEventListener("change", function (event) {
        const file = event.target.files[0];

        if (file && file.type.match("image.*")) {
            const reader = new FileReader();

            reader.onload = function (e) {
                imagePreview.src = e.target.result;
                previewWrapper.style.display = "block";
            };

            reader.readAsDataURL(file);
        }
    });

    removeBtn.addEventListener("click", function () {
        clearAttachments();
    });

    // UPDATED SEND MESSAGE FUNCTION WITH STREAMING
    async function sendMessage() {
        const message = messageInput.value.trim();
        if (!message || messageInput.disabled) return;

        // Show loading image and disable input
        const originalValue = messageInput.value;
        messageInput.disabled = true;
        typingSound.play().catch(() => { });
        messageInput.value = "";

        sendButton.disabled = true;
        sendButton.classList.add("text-muted");
        sendButton.classList.remove("text-dark");

        try {
            // Upload image if present (drag/drop or file input)
            let attachment = null;

            // Use existing uploaded file if available (drag/drop)
            if (window.uploadedAttachment) {
                attachment = window.uploadedAttachment;
            } else if (fileInput.files[0]) {
                const formData = new FormData();
                formData.append("image", fileInput.files[0]);
                const uploadResponse = await fetch("https://apilageai.lk:5001/upload", {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                });
                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    attachment = uploadResult.filename;
                }
            }

            // Generate title for new conversation if needed
            let title = "";
            const currentConversationId = getConversationIdFromURL();

            if (!currentConversationId) {
                title = await generateTitleWithGemini(message);
                if (!title) {
                    throw new Error("Failed to generate conversation title");
                }
            }

            // Determine which model to use
            const selectedModel = window.selectedModel || window.defaultModel || "free";

            const payload = {
                text: message,
                title: title,
                attachment: attachment,
                conversation_id: currentConversationId,
                model: selectedModel
            };
            // Send message via Socket.IO with STREAMING and model info
            socket.emit("new_message_stream", payload);

            // After sending, clear the input and attachment preview fully
            messageInput.value = "";
            clearAttachments();
            if (previewWrapper) {
                previewWrapper.innerHTML = "";
                previewWrapper.style.display = "none";
            }
        } catch (error) {
            // Clean up UI loading states
            clearTimeout(typingTimeout);
            clearInterval(stageInterval);
            typingSound.pause();
            typingSound.currentTime = 0;
            messageInput.disabled = false;
            messageInput.style.background = "";
            messageInput.value = originalValue;
            showDialog("Error", error.message || "Something went wrong");
        }
    }

    sendButton.addEventListener("click", function (event) {
        event.preventDefault();
        sendMessage();
    });

    // Instantly clear the preview when clicking send
    sendButton.addEventListener("click", function () {
        if (previewWrapper) {
            previewWrapper.innerHTML = "";
            previewWrapper.style.display = "none";
        }
        if (fileInput) fileInput.value = "";
        window.uploadedAttachment = null;
    });

    // Make chat cards clickable
    const chatCards = document.querySelectorAll(".chat-card");

    chatCards.forEach((card) => {
        card.addEventListener("click", function () {
            const cardTitle = this.querySelector(".card-title").textContent;
            messageInput.value = cardTitle;
            messageInput.focus();

            // Trigger input event to enable send button
            const inputEvent = new Event("input", { bubbles: true });
            messageInput.dispatchEvent(inputEvent);
        });
    });

    // Auto-resize textarea
    messageInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = this.scrollHeight + "px";
    });

    // Handle Enter key for submission
    messageInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });

    fileAttach.addEventListener("click", () => {
        fileInput.click();
    });

    // Load previous conversation if ID present in URL
    const conversationId = getConversationIdFromURL();
    if (conversationId) {
        loadConversation(conversationId);
    }
});

// Update chat container with new messages
function updateChatContainer(messages) {
    messages.forEach((messageData) => {
        chatBubbleManager.createOrUpdateBubble(messageData);
    });

    // Re-process all messages (math, code, etc.)
    const chatBubbles = document.querySelectorAll(".chatBubble");
    chatBubbles.forEach(bubble => {
        const mId = bubble.dataset.mId;
        const messageData = messages.find(m => m.message_id == mId || m.m_id == mId);
        if (messageData) {
            addMessageEventListeners(bubble, messageData);
            chatBubbleManager.processMessageContent(bubble);
        }
    });

    // Ensure code block features exist after refresh
    document.querySelectorAll("#messages-container pre code").forEach(block => {
        chatBubbleManager.addCodeBlockFeatures(block);
    });

    if (window.MathJax?.typesetPromise) {
        MathJax.typesetPromise().catch((err) =>
            console.warn("MathJax typeset failed", err)
        );
    }
}

// Process message text (extracted from original function)
function processMessageText(text) {
    // Desmos formulas: %%math%%
    text = text.replace(/%%(.*?)%%/g, (_, fn) => {
        const trimmedFunction = fn.trim();
        setTimeout(() => {
            const rightSidebar = document.getElementById("rightSidebar");
            const appContainer = document.querySelector(".app-container");
            if (rightSidebar && !rightSidebar.classList.contains("active")) {
                rightSidebar.classList.add("active");
                appContainer?.classList.add("right-sidebar-active");
            }
            const graphFunctionInput = document.getElementById(
                "graphFunctionInput"
            );
            const graphFunctionSubmit = document.getElementById(
                "graphFunctionSubmit"
            );
            if (graphFunctionInput && graphFunctionSubmit) {
                graphFunctionInput.value = trimmedFunction;
                setTimeout(() => {
                    graphFunctionSubmit.click();
                    if (window.calculator) {
                        const functionId = "func" + Date.now();
                        window.calculator.setExpression({
                            id: functionId,
                            latex: trimmedFunction,
                            color: Desmos.Colors.BLUE,
                        });
                    }
                }, 600);
            }
        }, 500);
        return `<span class="graph-function-highlight" data-function="${trimmedFunction}">
            <span class="badge" onclick="openGraphSidebar('${trimmedFunction}')">➕ Open Graph View</span>
        </span>`;
    });

    // Ensure MathJax reads proper delimiters
    text = text.replace(/\\\((.+?)\\\)/g, (_, expr) => `$${expr}$`);
    text = text.replace(/\\\[(.+?)\\\]/gs, (_, expr) => `$$${expr}$$`);

    // Use Marked.js for markdown parsing
    text = marked.parse(text);

    // Extract YouTube links only (leave image links inline for Markdown to render)
    const videoLinks = [
        ...text.matchAll(
            /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g
        ),
    ];

    // Remove YouTube links from the text so we can show them as embeds below
    text = text.replace(
        /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/g,
        ""
    );

    if (videoLinks.length) {
        let mediaHTML =
            '<hr /><div class="resources-section"><div style="margin-top: 10px; font-weight: bold;">Recommended Videos</div><div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">';

        videoLinks.forEach(([, videoId]) => {
            mediaHTML += `<iframe width="320" height="180" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
        });

        mediaHTML += "</div></div>";
        text += mediaHTML;
    }

    // Remove domain text from main response and extract domains
    const foundDomains = [
        ...text.matchAll(/\(\[(https?:\/\/)?([\w.-]+\.\w+)\]\)/g),
    ];
    const resourceSites = [];
    const domainSet = new Set();
    foundDomains.forEach(([, , domain]) => {
        if (!domainSet.has(domain)) {
            domainSet.add(domain);
            resourceSites.push(domain);
        }
    });

    text = text.replace(/\(\[(https?:\/\/)?([\w.-]+\.\w+)\]\)/g, "");

    if (resourceSites.length > 0) {
        const resourceHTML = `
            <hr />
            <div class="resources-section">
                <div class="resources-title">ApilageAI used the following sources:</div>
                <div class="resource-scroll">
                    ${resourceSites
                .map(
                    (site) => `
                        <div class="resource-card">
                            <img src="https://www.google.com/s2/favicons?sz=64&domain=${site}" width="48" height="48" />
                            <div class="site-name">${site}</div>
                            <div class="site-desc">External resource used</div>
                        </div>
                    `
                )
                .join("")}
                </div>
            </div>`;
        text += resourceHTML;
    }

    return text;
}

// Add event listeners for message buttons
function addMessageEventListeners(chatBubble, item) {
    // Copy button
    const copyBtn = chatBubble.querySelector(".message-copy");
    if (copyBtn) {
        copyBtn.addEventListener("click", () => {
            const text = (item.txt || item.text || "").trim();
            if (!text) return;
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    const originalIcon = copyBtn.innerHTML;
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
                    copyBtn.disabled = true;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalIcon;
                        copyBtn.disabled = false;
                    }, 1500);
                })
                .catch(() => {
                    showDialog("Error", "Failed to copy text to clipboard.");
                });
        });
    }

    // Edit button for user messages
    if (item.t == 1) {
        const editBtn = chatBubble.querySelector(".message-edit");
        if (editBtn) {
            editBtn.addEventListener("click", () => {
                const inputBox = document.querySelector("#chat-form textarea");
                if (inputBox) {
                    inputBox.value = (item.txt || item.text || "").trim();
                    inputBox.focus();
                }
            });
        }
    }

    // Mindmap button
    const mindmapBtn = chatBubble.querySelector(".message-mindmap");
    if (mindmapBtn) {
        mindmapBtn.addEventListener("click", () => {
            const mindmapInput = document.getElementById("mindmap-input");
            const openBtn = document.getElementById("mindmap-open-btn");
            const goBtn = document.getElementById("mindmap-go-btn");
            if (mindmapInput && openBtn && goBtn) {
                mindmapInput.value = (item.txt || item.text || "").trim();
                openBtn.click();
                setTimeout(() => {
                    goBtn.click();
                }, 200);
            }
        });
    }

    // Report bug button
    const reportBugLinks = chatBubble.querySelectorAll(".report-bug-link");
    reportBugLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            const modal = document.getElementById("bugReportModal");
            const form = document.getElementById("bugReportForm");
            const successMessage = document.getElementById("successMessage");
            const imagePreview = document.getElementById("imagePreview");

            if (modal && form && successMessage) {
                modal.style.display = "block";
                form.style.display = "block";
                successMessage.style.display = "none";
                form.reset();
                if (imagePreview) imagePreview.style.display = "none";
                if (typeof clearErrors === "function") clearErrors();
            }
        });
    });

    // Regenerate button
    const thumbsDownButton = chatBubble.querySelector(".message-thumbs-down");
    if (thumbsDownButton) {
        thumbsDownButton.addEventListener("click", async () => {
            const mId = thumbsDownButton.dataset.messageId;
            if (!mId) return;

            try {
                // Remove the old message from DOM
                chatBubble.remove();

                // Reload conversation to get updated messages
                const conversationId = getConversationIdFromURL();
                if (conversationId) {
                    loadConversation(conversationId);
                }
            } catch (error) {
                showDialog("Error", "Failed to regenerate: " + error.message);
            }
        });
    }

    // Note button
    const noteBtn = chatBubble.querySelector(".message-note");
    if (noteBtn) {
        noteBtn.addEventListener("click", async () => {
            const message = decodeURIComponent(noteBtn.dataset.message);
            const sidebar = document.getElementById("rightsidebar2");
            if (!sidebar.classList.contains("active")) {
                toggleSidebar2();
            }
            switchTab("questions");

            const questionsTab = document.querySelector(
                "#rightsidebar2 #generatedQuestions"
            );
            questionsTab.innerHTML =
                '<div class="loading">Generating questions...</div>';

            const questions = await analyzeWithGemini(
                "Generate study questions based on this content:",
                message
            );

            questionsTab.innerHTML = "";
            const formatted = formatTextWithMathAndStyle(questions);
            const questionDiv = document.createElement("div");
            questionDiv.className = "generated-question";
            questionDiv.innerHTML = formatted;
            questionsTab.appendChild(questionDiv);

            MathJax.typesetPromise([questionDiv]);

            const existing = JSON.parse(
                localStorage.getItem("generatedQA") || "[]"
            );
            const updatedExisting = [...existing, questions].slice(-10);
            localStorage.setItem(
                "generatedQA",
                JSON.stringify(updatedExisting)
            );
        });
    }

    // Python run button - add after syntax highlighting
    setTimeout(() => {
        chatBubble
            .querySelectorAll("pre code.language-python")
            .forEach((codeBlock) => {
                const pre = codeBlock.parentElement;
                const header = pre.querySelector(".code-header");
                if (!header) return;
                // Prevent duplicate run button
                if (header.querySelector(".run-python-btn")) return; // prevent duplicate run button

                const codeText = codeBlock.textContent;
                if (
                    /^(import\s+(matplotlib|numpy)|plt\.|np\.)/m.test(codeText)
                ) {
                    const runBtn = document.createElement("button");
                    runBtn.className = "run-python-btn icon-button";
                    runBtn.innerHTML = '<i class="fa fa-play"></i> Run';
                    runBtn.style.marginLeft = "8px";

                    if (window.userBalance >= 100) {
                        runBtn.addEventListener("click", async () => {
                            try {
                                let safeCode = codeText;
                                if (safeCode.length > 2000) {
                                    alert("Code is too long to execute.");
                                    return;
                                }
                                if (safeCode.includes("plt.show")) {
                                    safeCode = safeCode.replace(
                                        /plt\.show\s*\(\s*\)/g,
                                        'plt.savefig("graph.png")\nprint("graph.png")'
                                    );
                                }

                                // Create lightbox
                                let lightbox = document.getElementById(
                                    "codeOutputLightbox"
                                );
                                if (!lightbox) {
                                    lightbox = document.createElement("div");
                                    lightbox.id = "codeOutputLightbox";
                                    lightbox.className = "lightbox-backdrop";

                                    const boxContent = document.createElement(
                                        "div"
                                    );
                                    boxContent.className = "lightbox-box";
                                    boxContent.innerHTML = `
                                    <button class="lightbox-close-btn" onclick="document.getElementById('codeOutputLightbox').remove()">Close</button>
                                    <div class="lightbox-content"><img src="https://apilageai.lk/assets/images/buffer.gif" alt="Loading..." style="max-width: 80px;" /></div>
                                `;

                                    lightbox.appendChild(boxContent);
                                    document.body.appendChild(lightbox);
                                } else {
                                    lightbox.querySelector(
                                        ".lightbox-content"
                                    ).innerHTML =
                                        '<img src="https://apilageai.lk/assets/images/buffer.gif" alt="Loading..." style="max-width: 80px;" />';
                                    lightbox.style.display = "flex";
                                }

                                const response = await fetch(
                                    "https://apilageai.lk/api/run-python.php",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            code: safeCode,
                                        }),
                                    }
                                );

                                const result = await response.json();
                                const lightboxContent = document.querySelector(
                                    "#codeOutputLightbox .lightbox-content"
                                );

                                if (result.error) {
                                    lightboxContent.innerHTML = `<div style="color:red;">Error: ${result.error}</div>`;
                                } else {
                                    if (
                                        !result.output.trim() &&
                                        codeText.includes("plt.show")
                                    ) {
                                        lightboxContent.innerHTML =
                                            '<div style="color: #999;">No output returned. Did you forget to save the figure with <code>plt.savefig("graph.png")</code> and print the filename?</div>';
                                    } else {
                                        lightboxContent.innerHTML =
                                            result.output;
                                    }
                                }
                            } catch (err) {
                                let lightbox = document.getElementById(
                                    "codeOutputLightbox"
                                );
                                if (!lightbox) {
                                    lightbox = document.createElement("div");
                                    lightbox.id = "codeOutputLightbox";
                                    lightbox.style =
                                        "position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;";
                                    const boxContent = document.createElement(
                                        "div"
                                    );
                                    boxContent.style =
                                        "background:#fff;padding:20px;border-radius:8px;max-width:90%;max-height:80%;overflow:auto;position:relative;";
                                    boxContent.innerHTML = `
                                    <button style="position:absolute;top:10px;right:10px;background:red;color:#fff;border:none;padding:5px 10px;border-radius:4px;cursor:pointer;" onclick="document.getElementById('codeOutputLightbox').remove()">Close</button>
                                    <div class="lightbox-content"></div>
                                `;
                                    lightbox.appendChild(boxContent);
                                    document.body.appendChild(lightbox);
                                }
                                const lightboxContent = document.querySelector(
                                    "#codeOutputLightbox .lightbox-content"
                                );
                                lightboxContent.innerHTML = `<div style="color:red;">Execution failed: ${err.message}</div>`;
                            }
                        });
                        header.appendChild(runBtn);
                    } else {
                        const warnIcon = document.createElement("span");
                        warnIcon.className = "warn-icon";
                        warnIcon.innerHTML = "⚠️";
                        warnIcon.style.cursor = "pointer";
                        warnIcon.title =
                            "Account balance must be more than 100 to run python codes";
                        warnIcon.addEventListener("click", () => {
                            alert(
                                "Account balance must be more than 100 to run python codes"
                            );
                        });
                        header.appendChild(warnIcon);
                    }
                }
            });
    }, 150);
}

// Add code block features (copy button, syntax highlighting)
function addCodeBlockFeatures(codeBlock) {
    const pre = codeBlock.parentElement;
    if (!pre.classList.contains("code-container")) {
        pre.classList.add("code-container");
        pre.classList.add("line-numbers");
        const lang =
            codeBlock.className.match(/language-([\w-]+)/)?.[1] || "text";
        const header = document.createElement("div");
        header.className = "code-header";
        header.innerHTML = `<span class="lang-label">${lang}</span><button class="copy-code-btn">Copy</button>`;
        pre.insertBefore(header, codeBlock);
    }
}

// Delete conversation function
function deleteConversation(conversationId) {
    const existingModal = document.getElementById("delete-confirmation-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "delete-confirmation-modal";
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100vw";
    modal.style.height = "100vh";
    modal.style.backgroundColor = "rgba(0,0,0,0.6)";
    modal.style.display = "flex";
    modal.style.alignItems = "center";
    modal.style.justifyContent = "center";
    modal.style.zIndex = "2147483647";

    modal.innerHTML = `
        <div class="modal-content">
            <p style="margin-bottom: 20px;">Are you sure you want to delete this conversation? This action cannot be undone.</p>
            <button class="modal-button cancel-btn" id="cancel-delete">Cancel</button>
            <button class="modal-button delete-btn" id="confirm-delete">Delete</button>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("cancel-delete").onclick = () => modal.remove();
    document.getElementById("confirm-delete").onclick = () => {
        modal.remove();
        socket.emit("delete_conversation", { conversation_id: conversationId });
    };
}

function showDialog(title, message) {
    if (typeof Dialog !== "undefined") {
        new Dialog(title, message, {
            text: "Okay",
            action: () => { },
            color: "#ff3333",
        });
    } else {
        alert(`${title}: ${message}`);
    }
}

// Copy code button handler
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("copy-code-btn")) {
        const button = e.target;
        const code = button.closest("pre").querySelector("code");

        if (!code) return;

        const text = code.innerText;

        navigator.clipboard
            .writeText(text)
            .then(() => {
                const originalText = button.textContent;
                button.textContent = "Copied!";
                button.disabled = true;

                setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                }, 1500);
            })
            .catch(() => {
                showDialog(
                    "Error",
                    "Failed to copy code to clipboard"
                );
                button.textContent = "Failed";
            });
    }
});

// Math symbols dropdown
function toggleDropdown() {
    var dropdown = document.getElementById("mathSymbols");
    dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
}

function insertSymbol(symbol) {
    var inputField = document.getElementById("message-input");
    inputField.value += symbol;
    inputField.focus();
}

window.onclick = function (event) {
    if (
        !event.target.matches(".btn-icon") &&
        !event.target.closest(".dropdown")
    ) {
        document.getElementById("mathSymbols").style.display = "none";
    }
};

// Desmos graph integration
document.addEventListener("DOMContentLoaded", function () {
    const rightSidebar = document.getElementById("rightSidebar");
    const toggleGraphBtn = document.getElementById("toggleGraphBtn");
    const closeRightSidebar = document.getElementById("closeRightSidebar");
    const appContainer = document.querySelector(".app-container");
    const graphFunctionInput = document.getElementById("graphFunctionInput");
    const graphFunctionSubmit = document.getElementById("graphFunctionSubmit");
    const graphFunctionsList = document.getElementById("graphFunctionsList");
    const clearAllGraphs = document.getElementById("clearAllGraphs");
    const resetGraph = document.getElementById("resetGraph");
    const graphExample1 = document.getElementById("graph-example1");
    const graphExample2 = document.getElementById("graph-example2");

    if (typeof Desmos !== "undefined") {
        const calculator = Desmos.GraphingCalculator(
            document.getElementById("desmos-graph"),
            {
                keypad: true,
                expressions: true,
                expressionsTopbar: true,
                settingsMenu: true,
                zoomButtons: true,
                trace: true,
                folders: true,
                sliders: true,
                images: true,
                degreeMode: false,
            }
        );

        window.calculator = calculator; // Make it globally accessible

        let functionCounter = 0;
        let addedFunctions = {};

        function insertToInput(value) {
            graphFunctionInput.value += value;
            graphFunctionInput.focus();
        }

        function addFunctionToGraph(expression) {
            if (!expression.trim()) return;

            const functionId = "func" + ++functionCounter;
            calculator.setExpression({
                id: functionId,
                latex: expression,
                color: Desmos.Colors.BLUE,
            });

            addedFunctions[functionId] = expression;

            const functionItem = document.createElement("div");
            functionItem.className = "graph-function-item";
            functionItem.innerHTML = `
                <span>${expression}</span>
                <button class="graph-function-remove" data-id="${functionId}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            graphFunctionsList.appendChild(functionItem);

            functionItem
                .querySelector(".graph-function-remove")
                .addEventListener("click", function () {
                    calculator.removeExpression({ id: functionId });
                    delete addedFunctions[functionId];
                    functionItem.remove();
                });
        }

        graphFunctionSubmit?.addEventListener("click", function () {
            addFunctionToGraph(graphFunctionInput.value);
            graphFunctionInput.value = "";
        });

        graphFunctionInput?.addEventListener("keypress", function (e) {
            if (e.key === "Enter") {
                addFunctionToGraph(graphFunctionInput.value);
                graphFunctionInput.value = "";
            }
        });

        clearAllGraphs?.addEventListener("click", function () {
            calculator.setBlank();
            graphFunctionsList.innerHTML = "";
            functionCounter = 0;
            addedFunctions = {};
        });

        resetGraph?.addEventListener("click", function () {
            calculator.setMathBounds({
                left: -10,
                right: 10,
                bottom: -10,
                top: 10,
            });
        });

        graphExample1?.addEventListener("click", function () {
            addFunctionToGraph("y = x^2");
        });

        graphExample2?.addEventListener("click", function () {
            addFunctionToGraph("y = \\sin(x)");
        });

        window.insertToInput = insertToInput;
    }

    toggleGraphBtn?.addEventListener("click", function () {
        rightSidebar.classList.toggle("active");
        appContainer.classList.toggle("right-sidebar-active");
    });

    closeRightSidebar?.addEventListener("click", function () {
        rightSidebar.classList.remove("active");
        appContainer.classList.remove("right-sidebar-active");
    });
});

// Graph function click handler
document.addEventListener("click", function (e) {
    if (e.target.classList.contains("graph-function")) {
        const functionText = e.target.getAttribute("data-function");
        const rightSidebar = document.getElementById("rightSidebar");
        const appContainer = document.querySelector(".app-container");

        if (rightSidebar && !rightSidebar.classList.contains("active")) {
            rightSidebar.classList.add("active");
            if (appContainer)
                appContainer.classList.add("right-sidebar-active");
        }

        if (window.calculator) {
            const functionId = "func" + Date.now();
            window.calculator.setExpression({
                id: functionId,
                latex: functionText,
                color: Desmos.Colors.BLUE,
            });

            const graphFunctionsList = document.getElementById(
                "graphFunctionsList"
            );
            if (graphFunctionsList) {
                const functionItem = document.createElement("div");
                functionItem.className = "graph-function-item";
                functionItem.innerHTML = `
                    <span>${functionText}</span>
                    <button class="graph-function-remove" data-id="${functionId}">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                graphFunctionsList.appendChild(functionItem);

                functionItem
                    .querySelector(".graph-function-remove")
                    .addEventListener("click", function () {
                        window.calculator.removeExpression({ id: functionId });
                        functionItem.remove();
                    });
            }
        }
    }

    if (
        e.target.classList.contains("graph-function-remove") ||
        e.target.closest(".graph-function-remove")
    ) {
        const button = e.target.classList.contains("graph-function-remove")
            ? e.target
            : e.target.closest(".graph-function-remove");
        const functionId = button.getAttribute("data-id");

        if (window.calculator && functionId) {
            window.calculator.removeExpression({ id: functionId });
            button.closest(".graph-function-item").remove();
        }
    }
});

// Placeholder rotation
const placeholders = [
    "හායි Apilage Ai කොහොමද?",
    "Click SHIFT+ENTER to line break..",
    "අපිලගෙන් ahanna...",
    "Type @ to get suggestions..",
    "මට Exam tips කියන්න",
    "ප්‍රස්ථාරය අදින්න y=3x^2+5",
];

function changePlaceholder() {
    const randomIndex = Math.floor(Math.random() * placeholders.length);
    const messageInput = document.getElementById("message-input");
    if (messageInput) {
        messageInput.placeholder = placeholders[randomIndex];
    }
}

setInterval(changePlaceholder, 3000);

// Theme toggle
document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    const lightIcon = themeToggle.querySelector(".light-icon");
    const darkIcon = themeToggle.querySelector(".dark-icon");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        if (theme === "dark") {
            lightIcon.style.display = "inline";
            darkIcon.style.display = "none";
        } else {
            lightIcon.style.display = "none";
            darkIcon.style.display = "inline";
        }
    }

    const savedTheme =
        localStorage.getItem("theme") ||
        (prefersDarkScheme.matches ? "dark" : "light");
    applyTheme(savedTheme);

    themeToggle.addEventListener("click", function (e) {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute(
            "data-theme"
        );
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        applyTheme(newTheme);
    });
});

// Menu toggles
document.querySelectorAll(".menu-toggle").forEach((button) => {
    button.addEventListener("click", function (e) {
        e.stopPropagation();
        const menuId = this.getAttribute("data-menu-id");
        const menu = document.getElementById(menuId);
        const isVisible = menu.style.display === "block";

        document
            .querySelectorAll(".menu")
            .forEach((m) => (m.style.display = "none"));

        if (!isVisible) {
            menu.style.display = "block";
        }
    });
});

document.addEventListener("click", function (e) {
    if (!e.target.closest(".menu") && !e.target.closest(".menu-toggle")) {
        document.querySelectorAll(".menu").forEach((menu) => {
            menu.style.display = "none";
        });
    }
});

// Gemini integration functions
async function analyzeWithGemini(prompt, context) {
    try {
        const response = await fetch("https://apilageai.lk/api/sideqa.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, context }),
        });

        const data = await response.json();
        return data.result || "No questions generated.";
    } catch (error) {
        return "Error generating questions. Please try again.";
    }
}

// Title generation with Gemini
async function generateTitleWithGemini(message) {
    try {
        const response = await fetch("https://apilageai.lk/api/convoname.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        const result = await response.json();
        return result.title || null;
    } catch (error) {
        showDialog(
            "Error",
            "Failed to generate title. Please try again."
        );
        return null;
    }
}

function formatTextWithMathAndStyle(text) {
    return text.replace(
        /\$begin:math:text\$(.+?)\\\$end:math:text\$/gs,
        (_, expr) => {
            return `$begin:math:text${expr.trim()}\\$end:math:text$`;
        }
    );
}

// ==================================================
// Chat search 
// ==================================================

const toggleBtn = document.getElementById('toggleSearch');
const container = toggleBtn.closest('.p-16px');
toggleBtn.addEventListener('click', () => {
    const input = container.querySelector('#chatlook');
    if (input.style.display === 'none' || !input.style.display) {
        input.style.display = 'block';
        input.focus();
    } else {
        input.style.display = 'none';
    }
});

document.getElementById('chatlook').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const items = document.querySelectorAll('.sidebar-item-wrapper');
    items.forEach(item => {
        const title = item.querySelector('.sidebar-item span')?.textContent.toLowerCase() || '';
        item.style.display = title.includes(query) ? 'block' : 'none';
    });
});



// ==================================================
// Q and A in sidebar
// ==================================================

async function analyzeWithGemini(prompt, context) {
    try {
        const response = await fetch("https://apilageai.lk/api/sideqa.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt, context })
        });

        const data = await response.json();
        return data.result || "No questions generated.";
    } catch (error) {
        console.error("Backend error:", error);
        return "Error generating questions. Please try again.";
    }
}

// Format LaTeX and Markdown-style formatting
function formatTextWithMathAndStyle(text) {
    text = text.replace(/\$begin:math:text\$(.+?)\\\$end:math:text\$/gs, (_, expr) => {
        return `\$begin:math:text$${expr.trim()}\\$end:math:text$`;
    });
    text = text.replace(/\$begin:math:display\$(.+?)\\\$end:math:display\$/gs, (_, expr) => {
        return `\$begin:math:display$${expr.trim()}\\$end:math:display$`;
    });
    text = text.replace(/`([^`\n]+)`/g, (match, codeContent) => {
        const escaped = codeContent
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `<code class="inline-code">${escaped}</code>`;
    });

    text = text.replace(
        /\\\[(.*?)\\\]/gs,
        (match, mathContent) => {
            return `<span class="mathjax-latex">\\[${mathContent}\\]</span>`;
        }
    );
    text = text.replace(/```([a-zA-Z0-9+#-]*)\s*\n?([\s\S]*?)```/g, (match, lang, codeContent) => {
        // Escape HTML entities
        const escapedCode = codeContent
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\\n/g, "\n");

        const uid = 'code_' + Math.random().toString(36).substring(2, 10);
        const hasLang = lang && lang.trim().length > 0;
        const languageClass = hasLang ? `language-${lang.toLowerCase()}` : 'plain-text';

        return `
        <div class="code-container ${hasLang ? '' : 'code-container-plain'}">
            ${hasLang ? `<div class="code-header">${lang.toUpperCase()}
                <button class="copy-btn" data-copy-target="${uid}">Copy</button>
            </div>` : ''}
            <pre><code id="${uid}" class="${languageClass}">${escapedCode}</code></pre>
        </div>
    `;
    });
    text = text.trim();
    text = text.replace(/\n{3,}/g, '\n\n');
    text = text.replace(/-\s*\n\s*(.+)/g, '<ul><li>$1</li></ul>');
    text = text.replace(/<\/ul>\s*<ul>/g, '');
    text = text.replace(/(<br\s*\/?>\s*)+$/g, '');
    text = text.replace(/<p>\s*<br\s*\/?>/g, '<p>');
    text = text.replace(/<br\s*\/?>\s*<\/p>/g, '</p>');
    text = text.replace(/(^|\s)([*_~]{1})(\s|$)/g, '$1$3');
    text = text.replace(/###\s+(.*?)(\n|$)/g, (_, head) => `<span style="color:red;"><em>### ${head}</em></span><br>`);
    text = text.replace(/-\s*\n\s*(.+)/g, '<ul><li>$1</li></ul>');
    text = text.replace(/-\s*\n\s*(.+)/g, (match, listItem) => {
        return `<ul><li>${listItem}</li></ul>`;
    });
    text = text.replace(/\n{3,}/g, '\n\n');

    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    text = text.replace(/(?:\*\*(.+?)\*\*|\*(.+?)\*)/g, (match, p1, p2) => {
        return `<strong>${p1 || p2}</strong>`;
    });
    text = text.replace(/_(.+?)_/g, '<em>$1</em>');
    return text.replace(/\n/g, '<br>');
}

// Sidebar controls
function toggleSidebar2() {
    const sidebar = document.getElementById('rightsidebar2');
    const appContainer = document.querySelector('.app-container');
    sidebar.classList.toggle('active');
    if (appContainer) appContainer.classList.toggle('right-sidebar2-active');
}

function switchTab(tabName) {
    const sidebar = document.getElementById('rightsidebar2');
    sidebar.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    sidebar.querySelectorAll('.tab-button').forEach(button => button.classList.remove('active'));
    sidebar.querySelector(`#${tabName}Tab`).classList.add('active');
    sidebar.querySelector(`.tab-button[data-tab="${tabName}"]`).classList.add('active');
}

// DOM Ready
document.addEventListener('DOMContentLoaded', function () {
    document.querySelector('.close-sidebar2')?.addEventListener('click', toggleSidebar2);

    document.querySelectorAll('#rightsidebar2 .tab-button').forEach(button => {
        button.addEventListener('click', function () {
            switchTab(this.dataset.tab);
        });
    });

    // Restore questions from localStorage
    const questionsTab = document.querySelector('#rightsidebar2 #generatedQuestions');
    const savedQA = JSON.parse(localStorage.getItem('generatedQA') || '[]');
    savedQA.forEach(entry => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'generated-question';
        questionDiv.innerHTML = formatTextWithMathAndStyle(entry);
        questionsTab.appendChild(questionDiv);
    });

    // Add Clear Questions button below generated questions
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearQuestionsBtn';
    clearBtn.className = 'clear-questions';
    clearBtn.textContent = 'Clear Questions';
    questionsTab.insertAdjacentElement('afterend', clearBtn);

    document.getElementById('clearQuestionsBtn')?.addEventListener('click', function () {
        const questionsTab = document.querySelector('#rightsidebar2 #generatedQuestions');
        localStorage.removeItem('generatedQA');
        questionsTab.innerHTML = '';
    });

    document.getElementById('analyzeWithGemini')?.addEventListener('click', async function () {
        const textarea = document.getElementById('blankSheetTextarea');
        const content = textarea.value.trim();

        if (content) {
            textarea.value = "Generating questions...";
            const questions = await analyzeWithGemini("", content);
            textarea.value = "";

            const formatted = formatTextWithMathAndStyle(questions);
            const questionDiv = document.createElement('div');
            questionDiv.className = 'generated-question';
            questionDiv.innerHTML = formatted;

            questionsTab.appendChild(questionDiv);
            MathJax.typesetPromise([questionDiv]);

            // Save to localStorage
            const updatedQA = [...savedQA, questions].slice(-10); // Keep only last 10
            localStorage.setItem('generatedQA', JSON.stringify(updatedQA));

            switchTab('questions');
        }
    });

    // Export to PDF
    document.getElementById('exportPDF')?.addEventListener('click', function () {
        const savedQA = JSON.parse(localStorage.getItem('generatedQA') || '[]');

        if (savedQA.length === 0) {
            alert("No questions to export.");
            return;
        }

        if (savedQA.some(qa => qa.includes("\\["))) {
            alert("PDF export is disabled for questions containing LaTeX math.");
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        let y = 10;

        savedQA.forEach((qa, i) => {
            const plain = qa.replace(/<[^>]+>/g, '').replace(/\n/g, ' ');
            const questionLines = doc.splitTextToSize(plain, 180);

            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.text(`Question ${i + 1}:`, 10, y);
            y += 6;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(11);
            questionLines.forEach(line => {
                if (y > 270) {
                    doc.addPage();
                    y = 10;
                }
                doc.text(line, 10, y);
                y += 6;
            });

            y += 4;
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        });

        doc.save("apilageQandA.pdf");
    });
});

// Message-note click handler
document.addEventListener('click', async function (e) {
    if (e.target.closest('.message-note')) {
        const button = e.target.closest('.message-note');
        const message = decodeURIComponent(button.dataset.message);

        const sidebar = document.getElementById('rightsidebar2');
        if (!sidebar.classList.contains('active')) {
            toggleSidebar2();
        }

        switchTab('questions');

        const questionsTab = document.querySelector('#rightsidebar2 #generatedQuestions');
        questionsTab.innerHTML = '<div class="loading">Generating questions...</div>';

        const questions = await analyzeWithGemini("Generate study questions based on this content:", message);

        questionsTab.innerHTML = '';
        const formatted = formatTextWithMathAndStyle(questions);
        const questionDiv = document.createElement('div');
        questionDiv.className = 'generated-question';
        questionDiv.innerHTML = formatted;
        questionsTab.appendChild(questionDiv);

        MathJax.typesetPromise([questionDiv]);

        // Save to localStorage
        const existing = JSON.parse(localStorage.getItem('generatedQA') || '[]');
        const updatedExisting = [...existing, questions].slice(-10); // Keep only last 10
        localStorage.setItem('generatedQA', JSON.stringify(updatedExisting));
    }
});

document.getElementById('openQuestionSheet')?.addEventListener('click', function () {
    const sidebar = document.getElementById('rightsidebar2');

    if (sidebar.classList.contains('active')) {
        // Sidebar is already open → close it
        toggleSidebar2(); // Assumes this function handles closing
    } else {
        // Sidebar is closed → open it and switch tab
        toggleSidebar2();
        switchTab('questions');
    }
});

// ==================================================
// This is input field dropup menu
// ================================================== 
document.addEventListener("DOMContentLoaded", () => {
  const dropButton = document.getElementById("button-drop");
  const dropMenu = document.querySelector(".dropup-menu");

  // Toggle menu visibility
  dropButton.addEventListener("click", (e) => {
    e.stopPropagation();
    dropMenu.classList.toggle("show");
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!dropButton.contains(e.target) && !dropMenu.contains(e.target)) {
      dropMenu.classList.remove("show");
    }
  });
});
