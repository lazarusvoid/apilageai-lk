{include file="components/head.tpl"}
<style>
    .published-container {
        max-width: 900px;
        margin: 0 auto;
        padding: 20px;
    }
    .published-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .published-header h1 {
        margin: 0 0 10px 0;
        font-size: 28px;
    }
    .published-badge {
        display: inline-block;
        background: rgba(255, 255, 255, 0.3);
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        margin-bottom: 10px;
    }
    .published-info {
        font-size: 14px;
        opacity: 0.9;
    }
    .messages-container {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        min-height: 400px;
        max-height: 600px;
        overflow-y: auto;
    }
    .message {
        margin-bottom: 15px;
        padding: 12px;
        border-radius: 6px;
        word-wrap: break-word;
    }
    .user-message {
        background: #e3f2fd;
        border-left: 4px solid #2196F3;
        margin-left: 20px;
    }
    .assistant-message {
        background: #f5f5f5;
        border-left: 4px solid #757575;
        margin-right: 20px;
    }
    .message-role {
        font-weight: 600;
        font-size: 12px;
        color: #666;
        text-transform: uppercase;
        margin-bottom: 5px;
    }
    .message-content {
        line-height: 1.6;
        color: #333;
    }
    .loading {
        text-align: center;
        padding: 40px;
        color: #999;
    }
    .error-message {
        background: #ffebee;
        border: 1px solid #ef5350;
        color: #c62828;
        padding: 15px;
        border-radius: 4px;
        margin-bottom: 20px;
    }
    .footer-note {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 20px;
        padding: 15px;
    }
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>

<div class="published-container">
    <div class="published-header">
        <div class="published-badge">
            <i class="fa fa-globe"></i> Public Chat
        </div>
        <h1 id="chat-title">Loading conversation...</h1>
        <div class="published-info">
            <span id="chat-owner"></span>
            <span id="chat-date"></span>
        </div>
    </div>

    <div id="error-box"></div>

    <div class="messages-container" id="messages-box">
        <div class="loading">
            <div class="spinner"></div>
            <p>Loading messages...</p>
        </div>
    </div>

    <div class="footer-note">
        <p>This is a read-only view of a published conversation from Apilageai</p>
    </div>
</div>

<script>
    const token = '{$publish_token}';

    async function loadPublishedChat() {
        const errorBox = document.getElementById('error-box');
        const messagesBox = document.getElementById('messages-box');
        const chatTitle = document.getElementById('chat-title');
        const chatOwner = document.getElementById('chat-owner');
        const chatDate = document.getElementById('chat-date');

        try {
            if (!token || token.trim() === '') {
                throw new Error('Invalid publish token');
            }

            // Fetch conversation metadata
            const baseUrl = window.location.origin;
            const metadataResponse = await fetch(`${baseUrl}/api/conversations/published/${token}`);
            
            if (!metadataResponse.ok) {
                throw new Error('Conversation not found or has been unpublished');
            }

            const metadataData = await metadataResponse.json();
            
            if (metadataData.error) {
                throw new Error(metadataData.message || 'Failed to load conversation');
            }

            const convData = metadataData.data;
            chatTitle.textContent = convData.title || 'Published Chat';
            
            if (convData.owner_id) {
                chatOwner.textContent = 'By User #' + convData.owner_id;
            }
            if (convData.created_at) {
                const date = new Date(convData.created_at);
                chatDate.textContent = ' • ' + date.toLocaleDateString();
            }

            // Fetch messages
            const messagesResponse = await fetch(`${baseUrl}/api/conversations/published/${token}/messages`);
            
            if (!messagesResponse.ok) {
                throw new Error('Failed to load messages');
            }

            const messagesData = await messagesResponse.json();
            
            if (messagesData.error) {
                throw new Error(messagesData.message || 'Failed to load messages');
            }

            messagesBox.innerHTML = '';

            if (!messagesData.data || messagesData.data.length === 0) {
                messagesBox.innerHTML = '<div class="loading"><p>No messages in this conversation</p></div>';
                return;
            }

            // Display messages
            messagesData.data.forEach(msg => {
                const div = document.createElement('div');
                const isUser = msg.role === 'user' || msg.role === 'assistant' === false;
                div.className = `message ${isUser ? 'user-message' : 'assistant-message'}`;
                
                const roleText = isUser ? 'You' : 'Apilageai';
                div.innerHTML = `
                    <div class="message-role">${roleText}</div>
                    <div class="message-content">${escapeHtml(msg.content)}</div>
                `;
                messagesBox.appendChild(div);
            });

            // Auto-scroll to bottom
            messagesBox.scrollTop = messagesBox.scrollHeight;

        } catch (error) {
            console.error('Error loading chat:', error);
            errorBox.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${escapeHtml(error.message)}
                </div>
            `;
            messagesBox.innerHTML = '<div class="loading"><p>Unable to load conversation</p></div>';
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Load chat when page loads
    document.addEventListener('DOMContentLoaded', loadPublishedChat);
</script>

</body>
</html>
