// Navbar scroll effect
window.addEventListener('scroll', function() {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 20) {
    navbar.classList.remove('navbar-normal');
    navbar.classList.add('navbar-scrolled');
  } else {
    navbar.classList.remove('navbar-scrolled');
    navbar.classList.add('navbar-normal');
  }
});

// Feature cards video playback on hover
document.addEventListener('DOMContentLoaded', function() {
  const flipCards = document.querySelectorAll('.flip-card');

  flipCards.forEach(card => {
    const video = card.querySelector('video');
    if (video) {
      card.addEventListener('mouseenter', () => {
        video.play().catch(e => console.log('Video play failed:', e));
      });
      card.addEventListener('mouseleave', () => {
        video.pause();
        video.currentTime = 0; // Reset to start
      });
    }
  });
});

// Chat functionality
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

async function sendMessage(message) {
  // Add user message
  const userMessageDiv = document.createElement('div');
  userMessageDiv.className = 'message-user';
  userMessageDiv.innerHTML = `
    <div class="message-bubble">
      <p>${message}</p>
    </div>
  `;
  chatMessages.appendChild(userMessageDiv);

  // Add loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message-model';
  loadingDiv.innerHTML = `
    <div class="loading-bubble">
      <svg class="w-4 h-4 text-brand-red animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
      </svg>
      <span class="text-xs font-bold text-brand-dark opacity-50">Thinking...</span>
    </div>
  `;
  chatMessages.appendChild(loadingDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch("https://endpoint.apilageai.lk/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer apk_lKOtfJhVe7fJUfYfkTLNgBOxZqgkLRgK"
      },
      body: JSON.stringify({
        message: message,
        enableGoogleSearch: true,
        model: "SUPER"
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const result = await response.json();
    const aiResponse = result.response || "No response received.";

    // Remove loading indicator
    chatMessages.removeChild(loadingDiv);

    // Add AI response
    const aiMessageDiv = document.createElement('div');
    aiMessageDiv.className = 'message-model';
    aiMessageDiv.innerHTML = `
      <div class="message-bubble">
        <p>${aiResponse}</p>
      </div>
    `;
    chatMessages.appendChild(aiMessageDiv);
  } catch (error) {
    console.error("ApilageAI API Error:", error);

    // Remove loading indicator
    chatMessages.removeChild(loadingDiv);

    // Add error message
    const errorMessageDiv = document.createElement('div');
    errorMessageDiv.className = 'message-model';
    errorMessageDiv.innerHTML = `
      <div class="message-bubble">
        <p>Oops! My brain is buffering. Check your connection or try again later.</p>
      </div>
    `;
    chatMessages.appendChild(errorMessageDiv);
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatForm.addEventListener('submit', function(e) {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (message) {
    sendMessage(message);
    chatInput.value = '';
  }
});
