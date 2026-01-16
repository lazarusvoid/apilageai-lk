let typingTimeout;
let stageInterval;
let currentStreamingMessage = null;
let streamingMessageElement = null;

// ===== Collaborative voice (minimal Discord-like mic toggle) =====
const collabVoice = {
    enabled: false,
    conversationId: null,
    mode: 'off', // 'off' | 'listen' | 'talk'
    localStream: null,
    audioContext: null,
    analyser: null,
    analyserData: null,
    analyserRAF: null,
    lastSpeakingEmit: 0,
    isSpeaking: false,
    peers: new Map(), // socketId -> { pc, audioEl, remoteUserId, polite, makingOffer, ignoreOffer, pendingCandidates }
    speakingUsers: new Set(),
};

// ===== Collaborator @mentions =====
const mentionState = {
    active: false,
    startIndex: -1,
    query: '',
    items: [], // { userId, name, image, isBot?: boolean }
    selectedIndex: 0,
};

function isMentionDropdownOpen(dropdownEl) {
    return !!dropdownEl && dropdownEl.style.display === 'block' && mentionState.active;
}

function normalizeNameForMatch(s) {
    return String(s || '').trim().toLowerCase();
}

function getCollaboratorsForMention() {
    const myUserId = Number(window.userData?.id || 0);
    const map = window.conversationParticipantsById || {};
    return Object.keys(map)
        .map((id) => {
            const userId = Number(id);
            const info = map[id] || {};
            return {
                userId,
                name: info.name || `User ${id}`,
                image: info.image || '',
            };
        })
        .filter((u) => u.userId && u.userId !== myUserId);
}

function getApilageAiMentionCandidate() {
    return {
        userId: 0,
        name: 'apilageai',
        image: '',
        isBot: true,
    };
}

function getMentionCandidates() {
    // Always include the assistant in collaborative chats.
    return [getApilageAiMentionCandidate(), ...getCollaboratorsForMention()];
}

function renderMentionDropdown(dropdownEl) {
    if (!dropdownEl) return;
    dropdownEl.innerHTML = '';

    if (!mentionState.items.length) {
        const div = document.createElement('div');
        div.textContent = 'No matches';
        div.classList.add('ghost-style');
        dropdownEl.appendChild(div);
        return;
    }

    mentionState.items.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'mention-suggestion' + (idx === mentionState.selectedIndex ? ' is-active' : '');

        const imgUrl = item.image
            ? (String(item.image).startsWith('http') ? item.image : `https://apilageai.lk${item.image}`)
            : 'https://apilageai.lk/assets/images/user.png';

        div.innerHTML = `
            <img class="mention-avatar" src="${imgUrl}" alt="" onerror="this.onerror=null;this.src='https://apilageai.lk/assets/images/user.png';" />
            <span class="mention-name">${item.name}</span>
        `;
        div.addEventListener('mousedown', (e) => {
            // Prevent textarea blur
            e.preventDefault();
        });
        div.addEventListener('click', () => {
            mentionState.selectedIndex = idx;
            applySelectedMention();
        });
        dropdownEl.appendChild(div);
    });
}

function findMentionAtCursor(inputEl) {
    const cursorPos = inputEl.selectionStart;
    const value = inputEl.value;
    const before = value.slice(0, cursorPos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex === -1) return null;
    // Only trigger if @ starts a token (start or whitespace)
    const prevChar = atIndex > 0 ? before[atIndex - 1] : ' ';
    if (prevChar && !/\s/.test(prevChar)) return null;

    const afterAt = before.slice(atIndex + 1);
    // If contains whitespace/newline, not a mention token
    if (/\s/.test(afterAt)) return null;
    return { atIndex, query: afterAt };
}

function updateMentionState(inputEl, dropdownEl) {
    if (!window.isCollaborativeChat) {
        mentionState.active = false;
        return;
    }
    const info = findMentionAtCursor(inputEl);
    if (!info) {
        mentionState.active = false;
        return;
    }

    const query = normalizeNameForMatch(info.query);
    const candidates = getMentionCandidates();
    const items = candidates
        .filter((c) => !query || normalizeNameForMatch(c.name).includes(query))
        .slice(0, 8);

    mentionState.active = true;
    mentionState.startIndex = info.atIndex;
    mentionState.query = info.query;
    mentionState.items = items;
    mentionState.selectedIndex = Math.max(0, Math.min(mentionState.selectedIndex, items.length - 1));
    renderMentionDropdown(dropdownEl);
}

function applySelectedMention() {
    const inputEl = document.getElementById('message-input');
    const dropdownEl = document.getElementById('suggestions-dropdown');
    if (!inputEl || !dropdownEl) return;
    if (!mentionState.active || !mentionState.items.length) return;

    const item = mentionState.items[mentionState.selectedIndex];
    if (!item) return;

    const cursorPos = inputEl.selectionStart;
    const value = inputEl.value;
    const before = value.substring(0, mentionState.startIndex);
    const after = value.substring(cursorPos);
    const inserted = `@${item.name} `;

    inputEl.value = before + inserted + after;
    const newPos = (before + inserted).length;
    inputEl.focus();
    inputEl.setSelectionRange(newPos, newPos);

    mentionState.active = false;
    dropdownEl.style.display = 'none';
}

function extractMentionedUserIdsFromText(text) {
    if (!window.isCollaborativeChat) return [];
    const normalizedText = String(text || '').toLowerCase();
    const collaborators = getCollaboratorsForMention();
    const mentioned = [];
    for (const c of collaborators) {
        const token = `@${String(c.name || '').toLowerCase()}`;
        if (!token || token.length < 2) continue;
        if (normalizedText.includes(token)) {
            mentioned.push(c.userId);
        }
    }
    return Array.from(new Set(mentioned));
}

function hasApilageAiMention(text) {
    const t = String(text || '');
    return /(^|\s)@apilageai(?=[\s\.,!?]|$)/i.test(t);
}

function stripApilageAiMention(text) {
    const t = String(text || '');
    const stripped = t.replace(/(^|\s)@apilageai(?=[\s\.,!?]|$)/gi, '$1');
    return stripped.replace(/\s{2,}/g, ' ').trim();
}

function escapeRegExp(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function highlightCollaboratorMentionsInText(text) {
    if (!window.isCollaborativeChat) return text;
    let out = String(text || '');
    const candidates = getMentionCandidates();
    for (const c of candidates) {
        const name = String(c?.name || '').trim();
        if (!name) continue;
        const pattern = new RegExp(`(^|\\s)(@${escapeRegExp(name)})(?=[\\s\\.,!?]|$)`, 'gi');
        out = out.replace(pattern, (m, prefix, mention) => {
            return `${prefix}<span class="chat-mention">${mention}</span>`;
        });
    }
    return out;
}

function getMyUserId() {
    return Number(window.userData?.id || 0);
}

function isPolitePeer(remoteUserId, remoteSocketId) {
    const myUserId = getMyUserId();
    const theirUserId = Number(remoteUserId || 0);
    if (myUserId && theirUserId) return myUserId > theirUserId;
    // Fallback (still deterministic): compare socket ids lexicographically
    return String(socket.id || '') > String(remoteSocketId || '');
}

function shouldInitiateOffer(remoteUserId, remoteSocketId) {
    const myUserId = getMyUserId();
    const theirUserId = Number(remoteUserId || 0);
    if (myUserId && theirUserId) return myUserId < theirUserId;
    // Fallback (still deterministic): smaller socket id initiates
    return String(socket.id || '') < String(remoteSocketId || '');
}

function setMicButtonVisible(visible) {
    const btn = document.getElementById('collab-mic-toggle');
    if (!btn) return;
    btn.style.display = visible ? '' : 'none';
}

function setMicButtonState(isUnmuted) {
    const btn = document.getElementById('collab-mic-toggle');
    if (!btn) return;
    const icon = btn.querySelector('i');
    btn.classList.toggle('is-unmuted', !!isUnmuted);
    if (icon) {
        icon.className = isUnmuted ? 'fa fa-microphone' : 'fa fa-microphone-slash';
    }
}

function updateSpeakingIndicator() {
    const el = document.getElementById('collab-speaking-indicator');
    if (!el) return;
    if (!collabVoice.speakingUsers.size) {
        el.style.display = 'none';
        el.textContent = '';
        return;
    }
    const names = Array.from(collabVoice.speakingUsers)
        .map((uid) => getCollaboratorNameById(uid))
        .filter(Boolean);
    if (!names.length) {
        el.style.display = 'none';
        el.textContent = '';
        return;
    }
    const label = names.length === 1 ? `${names[0]} is talking` : `${names.slice(0, 2).join(', ')}${names.length > 2 ? '…' : ''} are talking`;
    el.textContent = label;
    el.style.display = '';
}

function isCollaborativeChatActive() {
    const ids = Object.keys(window.conversationParticipantsById || {});
    return ids.length > 1;
}

function getRtcConfig() {
    return {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            // Additional public STUN (helps in some enterprise NAT scenarios)
            { urls: 'stun:global.stun.twilio.com:3478' },
        ],
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 4,
    };
}

function closePeer(socketId) {
    const peer = collabVoice.peers.get(socketId);
    if (!peer) return;
    if (peer.disconnectedTimer) {
        try {
            clearTimeout(peer.disconnectedTimer);
        } catch (_) {}
        peer.disconnectedTimer = null;
    }
    try {
        peer.pc?.close();
    } catch (_) {}
    try {
        peer.audioEl?.remove();
    } catch (_) {}
    collabVoice.peers.delete(socketId);
}

function stopSpeakingAnalyser() {
    if (collabVoice.analyserRAF) {
        cancelAnimationFrame(collabVoice.analyserRAF);
        collabVoice.analyserRAF = null;
    }
    collabVoice.analyser = null;
    collabVoice.analyserData = null;
    try {
        collabVoice.audioContext?.close();
    } catch (_) {}
    collabVoice.audioContext = null;
}

function startSpeakingAnalyser() {
    stopSpeakingAnalyser();
    if (!collabVoice.localStream) return;
    try {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return;
        const ctx = new AudioContextCtor();
        const source = ctx.createMediaStreamSource(collabVoice.localStream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        const data = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        collabVoice.audioContext = ctx;
        collabVoice.analyser = analyser;
        collabVoice.analyserData = data;

        const tick = () => {
            if (!collabVoice.enabled || !collabVoice.analyser) return;
            collabVoice.analyser.getByteFrequencyData(collabVoice.analyserData);
            let sum = 0;
            for (let i = 0; i < collabVoice.analyserData.length; i++) sum += collabVoice.analyserData[i];
            const avg = sum / collabVoice.analyserData.length;
            const now = Date.now();

            // Simple threshold with debounce
            const speakingNow = avg > 22;
            if (speakingNow !== collabVoice.isSpeaking && now - collabVoice.lastSpeakingEmit > 250) {
                collabVoice.isSpeaking = speakingNow;
                collabVoice.lastSpeakingEmit = now;
                socket.emit('voice_speaking', {
                    conversation_id: collabVoice.conversationId,
                    speaking: speakingNow,
                });
            }
            collabVoice.analyserRAF = requestAnimationFrame(tick);
        };
        collabVoice.analyserRAF = requestAnimationFrame(tick);
    } catch (e) {
        // ignore analyser failures
    }
}

async function enableCollabVoice(conversationId) {
    // Backwards-compatible: enable voice in TALK mode (explicit user click)
    const cid = Number(conversationId);
    if (!cid) return;
    await enableCollabVoiceTalk(cid);
}

async function enableCollabVoiceListen(conversationId) {
    const cid = Number(conversationId);
    if (!cid) return;
    if (collabVoice.enabled && collabVoice.conversationId === cid && collabVoice.mode === 'listen') return;

    // Reset if switching conversations or changing mode
    if (collabVoice.enabled) {
        await disableCollabVoice();
    }

    collabVoice.conversationId = cid;
    collabVoice.enabled = true;
    collabVoice.mode = 'listen';
    collabVoice.localStream = null;

    setMicButtonState(false);
    try {
        socket.emit('voice_join', { conversation_id: cid });
    } catch (_) {}
}

async function enableCollabVoiceTalk(conversationId) {
    const cid = Number(conversationId);
    if (!cid) return;
    if (collabVoice.enabled && collabVoice.conversationId === cid && collabVoice.mode === 'talk') return;

    // Reset (simpler + avoids renegotiation edge-cases)
    if (collabVoice.enabled) {
        await disableCollabVoice();
    }

    collabVoice.conversationId = cid;
    collabVoice.enabled = true;
    collabVoice.mode = 'talk';

    if (!collabVoice.localStream) {
        collabVoice.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }
    collabVoice.localStream.getAudioTracks().forEach((t) => (t.enabled = true));

    setMicButtonState(true);
    socket.emit('voice_join', { conversation_id: cid });
    startSpeakingAnalyser();
}

async function disableCollabVoice() {
    if (!collabVoice.enabled) {
        setMicButtonState(false);
        return;
    }

    try {
        socket.emit('voice_leave', { conversation_id: collabVoice.conversationId });
        socket.emit('voice_speaking', { conversation_id: collabVoice.conversationId, speaking: false });
    } catch (_) {}

    stopSpeakingAnalyser();

    collabVoice.localStream?.getTracks()?.forEach((t) => {
        try {
            t.stop();
        } catch (_) {}
    });
    collabVoice.localStream = null;

    for (const socketId of Array.from(collabVoice.peers.keys())) {
        closePeer(socketId);
    }
    collabVoice.peers.clear();

    collabVoice.enabled = false;
    collabVoice.mode = 'off';
    collabVoice.isSpeaking = false;
    collabVoice.speakingUsers.clear();
    updateSpeakingIndicator();
    setMicButtonState(false);
    collabVoice.conversationId = null;
}

async function ensurePeerConnection(remoteSocketId) {
    if (!collabVoice.enabled) return null;
    if (collabVoice.peers.has(remoteSocketId)) return collabVoice.peers.get(remoteSocketId);

    const pc = new RTCPeerConnection(getRtcConfig());
    // If we're in listen mode (or before mic granted), request audio receive.
    if (!collabVoice.localStream) {
        try {
            pc.addTransceiver('audio', { direction: 'recvonly' });
        } catch (_) {}
    } else {
        collabVoice.localStream.getTracks().forEach((track) => pc.addTrack(track, collabVoice.localStream));
    }

    const audioEl = document.createElement('audio');
    audioEl.autoplay = true;
    audioEl.playsInline = true;
    audioEl.className = 'hidden';
    document.body.appendChild(audioEl);

    pc.ontrack = (ev) => {
        const [stream] = ev.streams;
        if (stream) {
            audioEl.srcObject = stream;
            audioEl.muted = false;
            audioEl.volume = 1;
            // Autoplay may still be blocked, but try.
            try {
                const p = audioEl.play();
                if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch (_) {}
        }
    };

    pc.onicecandidate = (ev) => {
        if (ev.candidate) {
            socket.emit('voice_ice', {
                conversation_id: collabVoice.conversationId,
                to_socket_id: remoteSocketId,
                candidate: ev.candidate,
            });
        }
    };

    const entry = {
        pc,
        audioEl,
        remoteUserId: null,
        polite: isPolitePeer(null, remoteSocketId),
        makingOffer: false,
        ignoreOffer: false,
        pendingCandidates: [],
        disconnectedTimer: null,
        lastIceRestartAt: 0,
    };

    const maybeRecover = async (reason) => {
        if (!collabVoice.enabled) return;
        const now = Date.now();
        if (now - (entry.lastIceRestartAt || 0) < 4000) return;
        entry.lastIceRestartAt = now;
        try {
            if (typeof pc.restartIce === 'function') pc.restartIce();
        } catch (_) {}
        try {
            // Only the designated initiator should renegotiate.
            if (shouldInitiateOffer(entry.remoteUserId, remoteSocketId)) {
                await createOfferTo(remoteSocketId);
            }
        } catch (_) {}
    };

    pc.oniceconnectionstatechange = () => {
        const st = pc.iceConnectionState;
        if (st === 'failed') {
            maybeRecover('ice-failed');
            return;
        }
        if (st === 'disconnected') {
            if (entry.disconnectedTimer) clearTimeout(entry.disconnectedTimer);
            entry.disconnectedTimer = setTimeout(() => {
                entry.disconnectedTimer = null;
                if (pc.iceConnectionState === 'disconnected') {
                    maybeRecover('ice-disconnected');
                }
            }, 2500);
            return;
        }
        if (st === 'connected' || st === 'completed') {
            if (entry.disconnectedTimer) {
                clearTimeout(entry.disconnectedTimer);
                entry.disconnectedTimer = null;
            }
        }
    };

    collabVoice.peers.set(remoteSocketId, entry);
    return entry;
}

async function createOfferTo(remoteSocketId) {
    const entry = await ensurePeerConnection(remoteSocketId);
    if (!entry) return;
    // Prevent overlapping negotiations
    if (entry.pc.signalingState !== 'stable') return;

    try {
        entry.makingOffer = true;
        const offer = await entry.pc.createOffer();
        await entry.pc.setLocalDescription(offer);
        socket.emit('voice_offer', {
            conversation_id: collabVoice.conversationId,
            to_socket_id: remoteSocketId,
            sdp: entry.pc.localDescription,
        });
    } catch (_) {
        // ignore
    } finally {
        entry.makingOffer = false;
    }
}

// Collaboration display helpers
window.conversationParticipantsById = window.conversationParticipantsById || {};
let participantsFetchInFlight = null;

async function ensureConversationParticipants(conversationId) {
    const cid = Number(conversationId);
    if (!cid) return;
    if (participantsFetchInFlight) return participantsFetchInFlight;

    participantsFetchInFlight = (async () => {
        try {
            const resp = await fetch(`${EFFECTIVE_NODE_API_BASE}/api/conversations/${cid}/participants`, {
                credentials: 'include'
            });
            const data = await safeJson(resp);
            if (data && !data.error && Array.isArray(data.participants)) {
                const next = {};
                data.participants.forEach((p) => {
                    const id = Number(p.user_id);
                    if (!id) return;
                    const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User';
                    next[id] = { name, image: p.image || '' };
                });
                window.conversationParticipantsById = next;
                window.isCollaborativeChat = Object.keys(next).length > 1;
                setMicButtonVisible(!!window.isCollaborativeChat);
                if (!window.isCollaborativeChat) {
                    disableCollabVoice();
                } else {
                    // Auto-join in LISTEN mode so audio works immediately.
                    // No mic permission prompt in listen mode.
                    enableCollabVoiceListen(cid);
                }
                refreshCollaboratorLabels();
            }
        } catch (e) {
            // best-effort only
        } finally {
            participantsFetchInFlight = null;
        }
    })();

    return participantsFetchInFlight;
}

function getCollaboratorNameById(userId) {
    const id = Number(userId);
    if (!id) return '';
    return window.conversationParticipantsById?.[id]?.name || `User ${id}`;
}

function refreshCollaboratorLabels() {
    document.querySelectorAll('.message.collab-message[data-sender-user-id]').forEach((el) => {
        const senderId = Number(el.dataset.senderUserId);
        if (!senderId) return;
        const label = el.querySelector('.collab-name');
        if (!label) return;
        const name = getCollaboratorNameById(senderId);
        const isBot = el.classList.contains('bot-message');
        label.textContent = isBot ? `Apilageai replies for ${name}` : name;
    });
}

// === Smooth Streaming State ===
const streamingState = {
    buffer: '',           // Full content received from backend
    displayedLength: 0,   // Characters already displayed
    animationFrame: null, // RAF ID for smooth animation
    lastRenderTime: 0,    // Timestamp of last render
    charsPerFrame: 3,     // Characters to render per frame (adjustable for speed)
    minFrameTime: 16,     // Minimum ms between frames (~60fps)
    isAnimating: false,
    messageId: null
};

// === Global DOM References (declared early to avoid ReferenceError) ===
const fileInput = document.getElementById("fileInput");
const previewWrapper = document.querySelector(".preview-wrapper");

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
            s.textContent = '.message.streaming .message-icons{opacity:0 !important;transform:translateY(2px) !important;pointer-events:none !important;}';
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

        const senderUserId = Number(messageData.sender_user_id || messageData.senderUserId || messageData.u_id || messageData.user_id || 0);
        const myUserId = Number(window.userData?.id || 0);
        const isCollaboratorMessage = !!(senderUserId && myUserId && senderUserId !== myUserId);

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

        if (isCollaboratorMessage) {
            messageWrapper.classList.add('collab-message');
            messageWrapper.dataset.senderUserId = String(senderUserId);
                messageWrapper.dataset.messageType = String(messageType);
        } else {
            messageWrapper.classList.remove('collab-message');
            delete messageWrapper.dataset.senderUserId;
                delete messageWrapper.dataset.messageType;
        }

        // Generate message content
        let content = this.generateMessageContent(messageData, {
            isStreaming,
            streamingContent,
            finalizeStreaming
        });

        // Collaborator label
        if (isCollaboratorMessage) {
            const displayName = getCollaboratorNameById(senderUserId);
            const labelText = isUserMessage ? displayName : `Apilageai replies for ${displayName}`;
            content = `<div class="collab-name">${labelText}</div>` + content;
        }

        // Note: thinking-status / thinking-status-final intentionally not shown.

        messageWrapper.innerHTML = content;

        // (streamStart tracking removed along with thinking-status UI)

        // Add to DOM if it's a new message
        if (isNewMessage) {
            this.insertMessageInOrder(messageWrapper, messageId);
            // Update input position when first message is added
            if (this.chatContainer.children.length === 1) {
                updateChatInputPosition();
            }
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
            if (icons) {
                // Smoothly reveal icons when streaming completes.
                icons.style.opacity = '0';
                icons.style.transform = 'translateY(2px)';
                icons.style.pointerEvents = 'none';
                requestAnimationFrame(() => {
                    icons.style.opacity = '';
                    icons.style.transform = '';
                    icons.style.pointerEvents = '';
                });
            }
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
                processedText = escapeHtml(processedText);
                processedText = highlightCollaboratorMentionsInText(processedText);
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
        const hideAttr = hideIcons ? ' style="opacity:0;transform:translateY(2px);pointer-events:none;"' : '';
        const attachment = messageData.attachment || messageData.a || '';

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
            const hasImage = (messageText && messageText.includes("<img")) || (attachment && attachment !== "");
            const modelUsed = messageData.model_used || '';
            const userMessageId = messageData.user_message_id || '';
            const conversationId = messageData.conversation_id || '';
            
            // Get display name for model
            const modelDisplayName = modelUsed ? getModelDisplayName(modelUsed) : '';
            const modelBadgeClass = modelUsed ? `model-badge-${modelUsed}` : '';
            
            return `
                <div class="message-icons"${hideAttr}>
                    <a href="#" class="report-bug-link">
                        <button style="background: none; border: none; padding-left: 10px; padding-right: 20px; cursor: pointer;">
                            <i class="fa fa-exclamation-triangle" aria-hidden="true" style="color: #8B0000;"></i>
                        </button>
                    </a>
                    ${modelDisplayName ? `<span class="model-used-badge ${modelBadgeClass}" title="Generated with ${modelDisplayName}">${modelDisplayName}</span>` : ''}
                    <button class="message-regenerate icon-button" data-message-id="${messageId}" data-user-message-id="${userMessageId}" data-conversation-id="${conversationId}" title="Regenerate response">
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
                    ${hasImage ? `
                    <button class="message-download icon-button" data-message-id="${messageId}">
                        <i class="fa fa-download"></i>
                    </button>` : ""}
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

    // Update streaming message content with smooth typewriter animation
    updateStreamingMessage(messageId, content) {
        const streamingElement = this.streamingElements.get(messageId);
        if (!streamingElement) return;

        // Remove streaming indicator if it exists
        const streamingIndicator = streamingElement.querySelector('.streaming-indicator');
        if (streamingIndicator) {
            streamingIndicator.remove();
        }

        // Update buffer with new content
        streamingState.buffer = content;
        streamingState.messageId = messageId;

        // Start smooth animation if not already running
        if (!streamingState.isAnimating) {
            streamingState.isAnimating = true;
            this.animateStreaming(streamingElement);
        }
    }

    // Smooth typewriter animation for streaming
    animateStreaming(streamingElement) {
        const animate = (timestamp) => {
            // Check if we should continue animating
            if (!streamingState.isAnimating || streamingState.displayedLength >= streamingState.buffer.length) {
                // If we've caught up to buffer but stream isn't complete, keep animating
                if (currentStreamingMessage && streamingState.displayedLength >= streamingState.buffer.length) {
                    streamingState.animationFrame = requestAnimationFrame(animate);
                    return;
                }
                streamingState.isAnimating = false;
                return;
            }

            // Throttle frame rate for smoother animation
            if (timestamp - streamingState.lastRenderTime < streamingState.minFrameTime) {
                streamingState.animationFrame = requestAnimationFrame(animate);
                return;
            }

            streamingState.lastRenderTime = timestamp;

            // Calculate how many characters to add this frame
            // Speed up if we're far behind, slow down if we're caught up
            const remaining = streamingState.buffer.length - streamingState.displayedLength;
            let charsToAdd = Math.min(remaining, streamingState.charsPerFrame);
            
            // Dynamic speed: render faster if buffer is getting too far ahead
            if (remaining > 50) {
                charsToAdd = Math.min(remaining, Math.ceil(remaining / 10));
            } else if (remaining > 20) {
                charsToAdd = Math.min(remaining, 5);
            }

            // Add characters
            streamingState.displayedLength += charsToAdd;
            const displayContent = streamingState.buffer.substring(0, streamingState.displayedLength);

            // Process and render with markdown
            const processedContent = this.processMessageText(displayContent);
            streamingElement.innerHTML = processedContent + '<span class="streaming-cursor"></span>';

            // Allow MathJax and Prism rendering during streaming but skip Mermaid
            if (window.MathJax?.typesetPromise) {
                MathJax.typesetPromise([streamingElement]).catch(err => console.error('MathJax error:', err));
            }
            if (window.Prism) {
                Prism.highlightAllUnder(streamingElement);
            }

            // Continue animation
            streamingState.animationFrame = requestAnimationFrame(animate);
        };

        streamingState.animationFrame = requestAnimationFrame(animate);
    }

    // Reset streaming state
    resetStreamingState() {
        streamingState.buffer = '';
        streamingState.displayedLength = 0;
        streamingState.isAnimating = false;
        streamingState.messageId = null;
        if (streamingState.animationFrame) {
            cancelAnimationFrame(streamingState.animationFrame);
            streamingState.animationFrame = null;
        }
    }

    // Finalize streaming message
    finalizeStreamingMessage(messageId, finalContent, extraData = {}) {
        // Stop animation and reset state
        this.resetStreamingState();

        const messageWrapper = document.querySelector(`[data-m-id="${messageId}"]`);
        if (messageWrapper) {
            // Remove streaming cursor
            const cursor = messageWrapper.querySelector('.streaming-cursor');
            if (cursor) {
                cursor.remove();
            }

            // Remove streaming class and update content
            messageWrapper.classList.remove('streaming');

            // Update with final content including model_used info
            this.createOrUpdateBubble({
                message_id: messageId,
                text: finalContent,
                type: 2,
                model_used: extraData.model_used || '',
                user_message_id: extraData.user_message_id || '',
                conversation_id: extraData.conversation_id || '',
                citationsHTML: extraData.citationsHTML || ''  // Pass citations HTML
            }, {
                isUpdate: true,
                finalizeStreaming: true
            });
            // Ensure MathJax and code boxes are rendered after refresh
            // Find the updated message wrapper again (in case it was replaced)
            const updatedWrapper = document.querySelector(`[data-m-id="${messageId}"]`);
            if (updatedWrapper) {
                this.processMessageContent(updatedWrapper);
                
                // Append citations HTML AFTER markdown processing (so it doesn't get escaped)
                if (extraData.citationsHTML) {
                    const citationsContainer = document.createElement('div');
                    citationsContainer.innerHTML = extraData.citationsHTML;
                    updatedWrapper.appendChild(citationsContainer.firstElementChild);
                }
            }
        }
    }

    // Process message text (extracted from your existing function)
    processMessageText(text) {
        // Preserve inline citations before markdown parsing
        // Extract and store citation HTML to restore after markdown
        const citationPlaceholders = [];
        
        // Use a unique placeholder that won't be affected by markdown
        text = text.replace(/<sup class="citation-group">[\s\S]*?<\/sup>/g, (match) => {
            const placeholder = `CITATIONPLACEHOLDER${citationPlaceholders.length}ENDCITATION`;
            citationPlaceholders.push(match);
            return placeholder;
        });
        
        // Also preserve inline citation links
        text = text.replace(/<a[^>]*class="inline-citation"[^>]*>[\s\S]*?<\/a>/g, (match) => {
            const placeholder = `CITATIONPLACEHOLDER${citationPlaceholders.length}ENDCITATION`;
            citationPlaceholders.push(match);
            return placeholder;
        });

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
        
        // Restore citation placeholders after markdown parsing
        for (let i = 0; i < citationPlaceholders.length; i++) {
            const placeholder = `CITATIONPLACEHOLDER${i}ENDCITATION`;
            text = text.split(placeholder).join(citationPlaceholders[i]);
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
        navigateToConversation(conversationId);
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

// ==============================
// Networking base (Node backend)
// ==============================
// Production runs Node + Socket.IO on :5001. If you later reverse-proxy it to 443,
// this can be switched to window.location.origin.
const NODE_API_BASE = (() => {
    const host = window.location.hostname;
    const protocol = window.location.protocol;

    if (host === 'apilageai.lk') return 'https://apilageai.lk:5001';
    if (host === 'localhost' || host === '127.0.0.1') return `${protocol}//${host}:5001`;

    // Default: same-origin
    return window.location.origin;
})();

const EFFECTIVE_NODE_API_BASE = (typeof window.NODE_API_BASE === 'string' && window.NODE_API_BASE.trim())
    ? window.NODE_API_BASE.trim()
    : NODE_API_BASE;

const safeJson = async (resp) => {
    const ct = resp.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
        const text = await resp.text();
        throw new Error(`Unexpected response (${resp.status}): ${text.slice(0, 200)}`);
    }
    return resp.json();
};

// Socket.IO connection
const socket = io(EFFECTIVE_NODE_API_BASE, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    path: "/socket.io",
});

socket.on('connect_error', (err) => {
    console.error('Socket.IO connect_error:', err?.message || err, 'NODE_API_BASE=', EFFECTIVE_NODE_API_BASE);
});

const sendButton = document.getElementById("send-button");

// ===============================
// Conversation gallery rendering
// ===============================
let lastConversationsList = [];
let conversationsRefreshTimer = null;
function scheduleConversationsRefresh() {
    if (conversationsRefreshTimer) return;
    conversationsRefreshTimer = setTimeout(() => {
        conversationsRefreshTimer = null;
        try {
            socket.emit('get_conversations');
        } catch (_) {}
    }, 700);
}

function showChatView() {
    const chatArea = document.querySelector('.chat-area-wrapper');
    const gallery = document.getElementById('conversation-gallery');
    if (gallery) gallery.style.display = 'none';
    if (chatArea) chatArea.style.display = '';
}

function showGalleryView() {
    const chatArea = document.querySelector('.chat-area-wrapper');
    const gallery = document.getElementById('conversation-gallery');
    if (chatArea) chatArea.style.display = 'none';
    if (gallery) gallery.style.display = 'block';
}

function ensureHomeChatStartContainer() {
    const main = document.querySelector('.main-content');
    if (!main) return null;

    let start = main.querySelector('.chat-start-container');
    if (!start) {
        start = document.createElement('div');
        start.className = 'y-overflow-auto p-4 chat-start-container';
        const name = String(window.userData?.first_name || '').trim();
        start.innerHTML = `
            <div class="empty-greeting fade-in slide-up">
                <h1 class="fw-medium text-dark text-center"><span class="greeting-text">Welcome </span>${name ? name + ' !' : ''}</h1>
            </div>
            <div style="height: 24px;"></div>
        `;

        const chatWrapper = main.querySelector('.chat-wrapper');
        if (chatWrapper && chatWrapper.parentElement) {
            chatWrapper.parentElement.insertBefore(start, chatWrapper);
        } else {
            main.appendChild(start);
        }
    }
    return start;
}

function navigateToHome({ push = true } = {}) {
    showChatView();

    window.conversationParticipantsById = {};
    window.isCollaborativeChat = false;
    setMicButtonVisible(false);
    disableCollabVoice();

    const messages = document.getElementById('messages-container');
    if (messages) {
        messages.innerHTML = '';
        messages.style.display = 'none';
    }

    const start = ensureHomeChatStartContainer();
    if (start) start.style.display = '';

    try {
        enableMessageInput();
        messageInput.value = '';
    } catch (_) {}

    // Reset/close canvas when leaving a chat
    try { closeCanvas(); } catch (_) {}
    canvasCurrentConversationId = null;
    canvasStrokes = [];
    canvasPendingStrokes = [];

    if (push) {
        const url = new URL(window.location.href);
        url.pathname = '/app';
        url.search = '';
        window.history.pushState({}, '', url.toString());
    }
}

function navigateToConversation(conversationId, { push = true } = {}) {
    const cid = Number(conversationId);
    if (!cid) return;
    showChatView();

    const start = document.querySelector('.chat-start-container');
    if (start) start.style.display = 'none';

    let messages = document.getElementById('messages-container');
    if (!messages) {
        messages = chatBubbleManager.initializeChatContainer(true);
    }
    if (messages) {
        messages.style.display = '';
        messages.innerHTML = '';
    }

    if (push) {
        const url = new URL(window.location.href);
        url.pathname = `/app/chat/${cid}`;
        url.search = '';
        window.history.pushState({}, '', url.toString());
    }

    loadConversation(cid);
    ensureConversationParticipants(cid);
}

// ===============================
// Collaborative canvas (per chat)
// ===============================
let canvasCurrentConversationId = null;
let canvasStrokes = [];
let canvasTexts = [];
let canvasPendingStrokes = [];
let canvasPendingTexts = [];

let canvasDocHtml = '';
let canvasPendingDocHtml = null;
let canvasDocSendTimer = null;
let canvasApplyingRemoteDoc = false;
let canvasTool = 'pen';
let canvasColor = null;
let canvasSize = 16;
let canvasToolSizes = { pen: 3, highlight: 18, eraser: 24, text: 16 };
let canvasIsDrawing = false;
let canvasActiveStroke = null;
let canvasActiveTextEditor = null;
let canvasActiveTextNorm = null;
let canvasTextEditorCreatedAt = 0;
let canvasCursorSendTimer = null;
let lastCursorPayload = null;
const canvasCursorElsByUserId = new Map();
let canvasLocalCursorEl = null;

function getCssVar(name, fallback) {
    try {
        const v = getComputedStyle(document.documentElement).getPropertyValue(name);
        return (v || '').trim() || fallback;
    } catch (_) {
        return fallback;
    }
}

function getCanvasPanel() {
    return document.getElementById('rightsidebar2');
}

function getCanvasEl() {
    return document.getElementById('chat-canvas');
}

function getCanvasDocEl() {
    return document.getElementById('canvas-doc');
}

function getCanvasCtx() {
    const c = getCanvasEl();
    return c ? c.getContext('2d') : null;
}

function getCanvasStage() {
    return document.getElementById('canvas-stage');
}

function isCanvasOpen() {
    const panel = getCanvasPanel();
    return !!panel && panel.classList.contains('active');
}

function setCanvasConversationId(conversationId) {
    const cid = Number(conversationId || 0) || null;
    canvasCurrentConversationId = cid;
    if (cid) {
        socket.emit('canvas_get', { conversation_id: cid });
        flushPendingCanvasStrokes();
        flushPendingCanvasTexts();
        flushPendingCanvasDoc();
    }
}

function ensureCanvasSize() {
    // Document-mode: no canvas bitmap sizing needed.
    redrawCanvas();
}

function canvasNormFromEvent(e) {
    const canvas = getCanvasEl();
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);
    return {
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
    };
}

function drawStroke(ctx, stroke, dprOverride = null) {
    if (!ctx || !stroke || !Array.isArray(stroke.points) || stroke.points.length < 2) return;
    const canvas = ctx.canvas;
    const dpr = Number.isFinite(Number(dprOverride)) ? Number(dprOverride) : (window.devicePixelRatio || 1);

    const tool = String(stroke.tool || 'pen');
    const color = String(stroke.color || '#111');
    const size = Number(stroke.size || 2) || 2;
    const alpha = Number.isFinite(Number(stroke.alpha)) ? Number(stroke.alpha) : (tool === 'highlight' ? 0.25 : 1);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = size * dpr;

    ctx.beginPath();
    const p0 = stroke.points[0];
    ctx.moveTo((p0.x || 0) * canvas.width, (p0.y || 0) * canvas.height);
    for (let i = 1; i < stroke.points.length; i++) {
        const p = stroke.points[i];
        ctx.lineTo((p.x || 0) * canvas.width, (p.y || 0) * canvas.height);
    }
    ctx.stroke();
    ctx.restore();
}

function drawTextEntry(ctx, entry, dprOverride = null) {
    if (!ctx || !entry) return;
    const canvas = ctx.canvas;
    const dpr = Number.isFinite(Number(dprOverride)) ? Number(dprOverride) : (window.devicePixelRatio || 1);

    const x = Number(entry.x);
    const y = Number(entry.y);
    const text = String(entry.text || '');
    if (!Number.isFinite(x) || !Number.isFinite(y) || !text) return;

    const color = String(entry.color || getCssVar('--text-primary', '#111111'));
    const size = Number(entry.size || 16) || 16;
    const lines = text.split(/\r?\n/);

    ctx.save();
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.font = `${Math.max(10, size) * dpr}px system-ui, -apple-system, Segoe UI, Roboto, sans-serif`;

    const startX = x * canvas.width;
    let startY = y * canvas.height;
    const lineH = (Math.max(10, size) * 1.25) * dpr;
    for (const line of lines) {
        ctx.fillText(line, startX, startY);
        startY += lineH;
    }
    ctx.restore();
}

function redrawCanvas() {
    const doc = getCanvasDocEl();
    const hint = document.getElementById('canvas-empty-hint');
    if (hint) {
        const html = (doc?.innerHTML || '').replace(/\s+/g, '').trim();
        hint.style.display = html ? 'none' : 'block';
    }
}

function openCanvas({ fullscreen = false } = {}) {
    const panel = getCanvasPanel();
    if (!panel) return;
    setCanvasTool('pen');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    panel.classList.toggle('fullscreen', !!fullscreen);

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.classList.add('right-sidebar2-active');

    ensureCanvasSize();
    redrawCanvas();

    const cid = Number(getConversationIdFromURL() || 0) || null;
    setCanvasConversationId(cid);

    try {
        document.dispatchEvent(new CustomEvent('canvas_opened'));
    } catch (_) {}

    // Word-like UX: focus the document immediately so the caret blinks and typing works.
    window.setTimeout(() => {
        try {
            const doc = getCanvasDocEl();
            if (!doc) return;
            doc.focus();
            // Place caret at end.
            const sel = window.getSelection?.();
            if (sel) {
                const range = document.createRange();
                range.selectNodeContents(doc);
                range.collapse(false);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        } catch (_) {}
    }, 0);
}

function closeCanvas() {
    const panel = getCanvasPanel();
    if (!panel) return;
    panel.classList.remove('active');
    panel.classList.remove('fullscreen');
    panel.setAttribute('aria-hidden', 'true');

    const appContainer = document.querySelector('.app-container');
    if (appContainer) appContainer.classList.remove('right-sidebar2-active');

    canvasIsDrawing = false;
    canvasActiveStroke = null;

    // Clear remote cursor labels
    const cursors = document.getElementById('canvas-cursors');
    if (cursors) cursors.innerHTML = '';
    canvasCursorElsByUserId.clear();
    canvasLocalCursorEl = null;

    try {
        document.dispatchEvent(new CustomEvent('canvas_closed'));
    } catch (_) {}
}

function setCanvasTool(tool) {
    canvasTool = tool === 'highlight' ? 'highlight' : (tool === 'text' ? 'text' : 'pen');
    const penBtn = document.getElementById('canvas-tool-pen');
    const hlBtn = document.getElementById('canvas-tool-highlight');
    const textBtn = document.getElementById('canvas-tool-text');
    const eraserBtn = document.getElementById('canvas-tool-eraser');

    if (tool === 'eraser') canvasTool = 'eraser';

    if (penBtn) {
        const on = canvasTool === 'pen';
        penBtn.classList.toggle('is-active', on);
        penBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (hlBtn) {
        const on = canvasTool === 'highlight';
        hlBtn.classList.toggle('is-active', on);
        hlBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    if (textBtn) {
        const on = canvasTool === 'text';
        textBtn.classList.toggle('is-active', on);
        textBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    if (eraserBtn) {
        const on = canvasTool === 'eraser';
        eraserBtn.classList.toggle('is-active', on);
        eraserBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }

    const sizeInput = document.getElementById('canvas-size');
    if (sizeInput) {
        const next = Number(canvasToolSizes[canvasTool] || canvasSize || 16) || 16;
        sizeInput.value = String(next);
        canvasSize = next;
    }
}

function getCanvasDocPlainText() {
    const doc = getCanvasDocEl();
    if (!doc) return '';
    return String(doc.innerText || '').trim();
}

function applyStyleToSelection(styleObj) {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!range) return;

    const span = document.createElement('span');
    Object.assign(span.style, styleObj);

    try {
        if (range.collapsed) {
            // Apply style for future typing by inserting a styled span at caret.
            const zwsp = document.createTextNode('\u200B');
            span.appendChild(zwsp);
            range.insertNode(span);
            // Place caret after the zero-width character.
            const r = document.createRange();
            r.setStart(zwsp, 1);
            r.collapse(true);
            sel.removeAllRanges();
            sel.addRange(r);
            return;
        }

        span.appendChild(range.extractContents());
        range.insertNode(span);
        sel.removeAllRanges();
        const r = document.createRange();
        r.selectNodeContents(span);
        r.collapse(false);
        sel.addRange(r);
    } catch (_) {}
}

function removeFormattingFromSelection() {
    try {
        document.execCommand?.('removeFormat');
    } catch (_) {}
}

function scheduleSendCanvasDoc(html) {
    canvasPendingDocHtml = String(html || '');
    if (canvasDocSendTimer) return;
    canvasDocSendTimer = window.setTimeout(() => {
        canvasDocSendTimer = null;
        const cid = Number(canvasCurrentConversationId || 0);
        if (!cid) return;
        if (canvasApplyingRemoteDoc) return;
        socket.emit('canvas_doc', { conversation_id: cid, html: canvasPendingDocHtml || '' });
    }, 300);
}

function flushPendingCanvasDoc() {
    const cid = Number(canvasCurrentConversationId || 0);
    if (!cid) return;
    if (canvasPendingDocHtml == null) return;
    socket.emit('canvas_doc', { conversation_id: cid, html: canvasPendingDocHtml || '' });
    canvasPendingDocHtml = null;
}

function getStrokeStyleForTool(tool) {
    const text = getCssVar('--text-primary', '#111111');
    const primary = getCssVar('--primary-red', '#e53e3e');
    const bg = getCssVar('--bg-color', '#ffffff');
    const chosen = canvasColor || text;

    if (tool === 'eraser') {
        return { color: bg, size: Number(canvasToolSizes.eraser || 24) || 24, alpha: 1 };
    }
    if (tool === 'highlight') {
        return { color: (canvasColor || primary), size: Number(canvasToolSizes.highlight || 18) || 18, alpha: 0.22 };
    }
    return { color: chosen, size: Number(canvasToolSizes.pen || 3) || 3, alpha: 1 };
}

function emitCanvasStroke(stroke) {
    const cid = Number(canvasCurrentConversationId || 0);
    if (!cid) {
        canvasPendingStrokes.push(stroke);
        return;
    }
    socket.emit('canvas_stroke', { conversation_id: cid, stroke });
}

function emitCanvasTextEntry(entry) {
    const cid = Number(canvasCurrentConversationId || 0);
    if (!cid) {
        canvasPendingTexts.push(entry);
        return;
    }
    socket.emit('canvas_text', { conversation_id: cid, entry });
}

function flushPendingCanvasStrokes() {
    const cid = Number(canvasCurrentConversationId || 0);
    if (!cid) return;
    if (!canvasPendingStrokes.length) return;
    const pending = canvasPendingStrokes.slice();
    canvasPendingStrokes = [];
    for (const s of pending) {
        socket.emit('canvas_stroke', { conversation_id: cid, stroke: s });
    }
}

function flushPendingCanvasTexts() {
    const cid = Number(canvasCurrentConversationId || 0);
    if (!cid) return;
    if (!canvasPendingTexts.length) return;
    const pending = canvasPendingTexts.slice();
    canvasPendingTexts = [];
    for (const t of pending) {
        socket.emit('canvas_text', { conversation_id: cid, entry: t });
    }
}

function updateRemoteCursorLabel({ user_id, name, x, y }) {
    const myId = Number(window.userData?.id || 0);
    const uid = Number(user_id || 0);
    if (!uid || uid === myId) return;

    const cursors = document.getElementById('canvas-cursors');
    if (!cursors) return;

    let el = canvasCursorElsByUserId.get(uid);
    if (!el) {
        el = document.createElement('div');
        el.className = 'canvas-cursor-label';
        el.textContent = String(name || 'User');
        cursors.appendChild(el);
        canvasCursorElsByUserId.set(uid, el);
    }

    const stage = getCanvasStage() || cursors.parentElement;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (Number(x) || 0) * rect.width;
    const py = (Number(y) || 0) * rect.height;
    el.style.left = `${px}px`;
    el.style.top = `${py}px`;
}

function updateLocalCursorLabel(x, y) {
    if (!window.isCollaborativeChat) return;
    const cursors = document.getElementById('canvas-cursors');
    if (!cursors) return;
    if (!canvasLocalCursorEl) {
        canvasLocalCursorEl = document.createElement('div');
        canvasLocalCursorEl.className = 'canvas-cursor-label';
        canvasLocalCursorEl.textContent = String(window.userData?.first_name || 'You');
        cursors.appendChild(canvasLocalCursorEl);
    }

    const stage = getCanvasStage() || cursors.parentElement;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (Number(x) || 0) * rect.width;
    const py = (Number(y) || 0) * rect.height;
    canvasLocalCursorEl.style.left = `${px}px`;
    canvasLocalCursorEl.style.top = `${py}px`;
}

function canvasExecCommand(cmd, value = null) {
    try {
        // Ensure commands apply to the document editor.
        const docEl = getCanvasDocEl();
        if (docEl) {
            try { docEl.focus(); } catch (_) {}
        }
        if (typeof value === 'undefined' || value === null) {
            return document.execCommand?.(cmd);
        }
        return document.execCommand?.(cmd, false, value);
    } catch (_) {
        return false;
    }
}

function canvasQueryCommandStateSafe(cmd) {
    try {
        return !!document.queryCommandState?.(cmd);
    } catch (_) {
        return false;
    }
}

function scheduleSendCanvasCursor(payload) {
    lastCursorPayload = payload;
    if (canvasCursorSendTimer) return;
    canvasCursorSendTimer = window.setTimeout(() => {
        canvasCursorSendTimer = null;
        const cid = Number(canvasCurrentConversationId || 0);
        if (!cid || !lastCursorPayload) return;
        socket.emit('canvas_cursor', { conversation_id: cid, ...lastCursorPayload });
    }, 60);
}

function getSelectionOffsetsWithin(rootEl) {
    try {
        const sel = window.getSelection?.();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        if (!range) return null;
        if (!rootEl.contains(range.startContainer) || !rootEl.contains(range.endContainer)) return null;

        const pre = range.cloneRange();
        pre.selectNodeContents(rootEl);
        pre.setEnd(range.startContainer, range.startOffset);
        const start = pre.toString().length;
        pre.setEnd(range.endContainer, range.endOffset);
        const end = pre.toString().length;
        return { start, end };
    } catch (_) {
        return null;
    }
}

function restoreSelectionFromOffsets(rootEl, offsets) {
    try {
        if (!rootEl || !offsets) return;
        const startOffset = Math.max(0, Number(offsets.start) || 0);
        const endOffset = Math.max(0, Number(offsets.end) || 0);

        // Ensure there is at least one text node.
        const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
        let firstText = walker.nextNode();
        if (!firstText) {
            rootEl.appendChild(document.createTextNode(''));
        }

        const locate = (target) => {
            const w = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
            let node = w.nextNode();
            let remaining = target;
            let last = null;
            while (node) {
                last = node;
                const len = (node.nodeValue || '').length;
                if (remaining <= len) {
                    return { node, offset: remaining };
                }
                remaining -= len;
                node = w.nextNode();
            }
            // Clamp to end
            if (last) return { node: last, offset: (last.nodeValue || '').length };
            return { node: rootEl, offset: 0 };
        };

        const a = locate(startOffset);
        const b = locate(endOffset);
        const range = document.createRange();
        range.setStart(a.node, a.offset);
        range.setEnd(b.node, b.offset);
        const sel = window.getSelection?.();
        if (!sel) return;
        sel.removeAllRanges();
        sel.addRange(range);
    } catch (_) {}
}

function getCanvasSnapshotDataUrl() {
    try {
        const hasStrokes = Array.isArray(canvasStrokes) && canvasStrokes.length > 0;
        const hasTexts = Array.isArray(canvasTexts) && canvasTexts.length > 0;
        if (!hasStrokes && !hasTexts) return null;
        // Render from stored normalized coordinates so AI can always see
        // what's on the canvas even if the panel is closed.
        const outW = 1024;
        const outH = 768;
        const off = document.createElement('canvas');
        off.width = outW;
        off.height = outH;
        const ctx = off.getContext('2d');
        if (!ctx) return null;

        // Light background improves readability for the AI.
        ctx.save();
        ctx.fillStyle = getCssVar('--container-bg', '#ffffff');
        ctx.globalAlpha = 1;
        ctx.fillRect(0, 0, outW, outH);
        ctx.restore();

        for (const s of canvasStrokes) drawStroke(ctx, s, 1);
        for (const t of canvasTexts) drawTextEntry(ctx, t, 1);

        return off.toDataURL('image/png');
    } catch (_) {
        return null;
    }
}

function initCanvasUi() {
    const openBtn = document.getElementById('canvas-open-btn');
    const menuBtn = document.getElementById('toggleCanvasBtn');
    const closeBtn = document.getElementById('canvas-close-btn');
    const fsBtn = document.getElementById('canvas-fullscreen-btn');
    const dockBtn = document.getElementById('canvas-dock-btn');
    const fontSizeSel = document.getElementById('canvas-font-size');
    const boldBtn = document.getElementById('canvas-bold-btn');
    const italicBtn = document.getElementById('canvas-italic-btn');
    const underlineBtn = document.getElementById('canvas-underline-btn');
    const highlightBtn = document.getElementById('canvas-highlight-btn');
    const undoBtn = document.getElementById('canvas-undo-btn');
    const redoBtn = document.getElementById('canvas-redo-btn');
    const docEl = getCanvasDocEl();
    const panel = getCanvasPanel();

    openBtn?.addEventListener('click', () => openCanvas({ fullscreen: false }));
    menuBtn?.addEventListener('click', () => {
        if (isCanvasOpen()) closeCanvas();
        else openCanvas({ fullscreen: false });
    });
    closeBtn?.addEventListener('click', () => closeCanvas());
    fsBtn?.addEventListener('click', () => openCanvas({ fullscreen: true }));
    dockBtn?.addEventListener('click', () => openCanvas({ fullscreen: false }));

    // Word-like toolbar actions
    const refreshFormatButtons = () => {
        const boldOn = canvasQueryCommandStateSafe('bold');
        const italicOn = canvasQueryCommandStateSafe('italic');
        const underlineOn = canvasQueryCommandStateSafe('underline');
        if (boldBtn) {
            boldBtn.classList.toggle('is-active', boldOn);
            boldBtn.setAttribute('aria-pressed', boldOn ? 'true' : 'false');
        }
        if (italicBtn) {
            italicBtn.classList.toggle('is-active', italicOn);
            italicBtn.setAttribute('aria-pressed', italicOn ? 'true' : 'false');
        }
        if (underlineBtn) {
            underlineBtn.classList.toggle('is-active', underlineOn);
            underlineBtn.setAttribute('aria-pressed', underlineOn ? 'true' : 'false');
        }
    };

    boldBtn?.addEventListener('click', () => {
        canvasExecCommand('bold');
        refreshFormatButtons();
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });
    italicBtn?.addEventListener('click', () => {
        canvasExecCommand('italic');
        refreshFormatButtons();
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });
    underlineBtn?.addEventListener('click', () => {
        canvasExecCommand('underline');
        refreshFormatButtons();
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });
    highlightBtn?.addEventListener('click', () => {
        // Yellow highlight (Word-like)
        const sel = window.getSelection?.();
        const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
        const collapsed = !range || range.collapsed;
        const yellow = '#ffeb3b';
        if (collapsed) {
            applyStyleToSelection({ backgroundColor: yellow });
        } else {
            const ok = canvasExecCommand('hiliteColor', yellow);
            if (!ok) applyStyleToSelection({ backgroundColor: yellow });
        }
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });

    undoBtn?.addEventListener('click', () => {
        canvasExecCommand('undo');
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });
    redoBtn?.addEventListener('click', () => {
        canvasExecCommand('redo');
        if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
    });

    if (fontSizeSel) {
        fontSizeSel.addEventListener('change', () => {
            const v = Number(fontSizeSel.value || 16) || 16;
            canvasSize = v;
            applyStyleToSelection({ fontSize: `${v}px` });
            if (docEl && !canvasApplyingRemoteDoc) scheduleSendCanvasDoc(docEl.innerHTML || '');
        });
    }

    // Document typing + toolbar actions
    if (docEl) {
        docEl.addEventListener('input', () => {
            if (canvasApplyingRemoteDoc) return;
            canvasDocHtml = docEl.innerHTML || '';
            redrawCanvas();
            scheduleSendCanvasDoc(canvasDocHtml);
        });

        // Cursor-name pointer tracking for collaborative chats
        const onMove = (ev) => {
            if (!window.isCollaborativeChat) return;
            const cid = Number(canvasCurrentConversationId || 0);
            if (!cid) return;
            const stage = getCanvasStage();
            if (!stage) return;
            const rect = stage.getBoundingClientRect();
            if (!rect.width || !rect.height) return;
            const clientX = (ev.touches && ev.touches[0] ? ev.touches[0].clientX : ev.clientX);
            const clientY = (ev.touches && ev.touches[0] ? ev.touches[0].clientY : ev.clientY);
            const nx = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
            const ny = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
            updateLocalCursorLabel(nx, ny);
            scheduleSendCanvasCursor({ x: nx, y: ny });
        };
        docEl.addEventListener('mousemove', onMove);
        docEl.addEventListener('touchmove', onMove, { passive: true });

        // Keep button states in sync with selection
        docEl.addEventListener('keyup', refreshFormatButtons);
        docEl.addEventListener('mouseup', refreshFormatButtons);
        document.addEventListener('selectionchange', () => {
            if (document.activeElement === docEl) refreshFormatButtons();
        });
    }

    // Keep canvas sized
    const stage = getCanvasStage();
    if (stage && 'ResizeObserver' in window) {
        const ro = new ResizeObserver(() => ensureCanvasSize());
        ro.observe(stage);
    } else {
        window.addEventListener('resize', ensureCanvasSize);
    }

    // Document mode: pointer drawing disabled.

    // Socket sync
    socket.on('canvas_state', (msg) => {
        const cid = Number(msg?.conversation_id || 0);
        if (!cid || (canvasCurrentConversationId && cid !== canvasCurrentConversationId)) return;
        const strokes = msg?.data?.strokes;
        const texts = msg?.data?.texts;
        const docHtml = String(msg?.data?.doc_html || msg?.data?.doc || msg?.data?.docHtml || '');
        canvasStrokes = Array.isArray(strokes) ? strokes : [];
        canvasTexts = Array.isArray(texts) ? texts : [];
        canvasDocHtml = docHtml;

        const doc = getCanvasDocEl();
        if (doc) {
            // Apply remote doc without triggering echo.
            canvasApplyingRemoteDoc = true;
            doc.innerHTML = canvasDocHtml || '';
            canvasApplyingRemoteDoc = false;
        }
        ensureCanvasSize();
        redrawCanvas();
    });

    socket.on('canvas_stroke', (msg) => {
        const cid = Number(msg?.conversation_id || 0);
        if (!cid || (canvasCurrentConversationId && cid !== canvasCurrentConversationId)) return;
        const stroke = msg?.stroke;
        if (!stroke) return;
        canvasStrokes.push(stroke);
        const ctx = getCanvasCtx();
        if (ctx) drawStroke(ctx, stroke);
    });

    socket.on('canvas_text', (msg) => {
        const cid = Number(msg?.conversation_id || 0);
        if (!cid || (canvasCurrentConversationId && cid !== canvasCurrentConversationId)) return;
        const entry = msg?.entry;
        if (!entry) return;
        canvasTexts.push(entry);
        const ctx = getCanvasCtx();
        if (ctx) drawTextEntry(ctx, entry);
    });

    socket.on('canvas_doc', (msg) => {
        const cid = Number(msg?.conversation_id || 0);
        if (!cid || (canvasCurrentConversationId && cid !== canvasCurrentConversationId)) return;
        const myId = Number(window.userData?.id || 0);
        const senderId = Number(msg?.sender_user_id || 0);
        if (senderId && myId && senderId === myId) return;
        const html = String(msg?.html || '');
        canvasDocHtml = html;
        const doc = getCanvasDocEl();
        if (!doc) return;

        const wasFocused = (document.activeElement === doc);
        const savedSel = wasFocused ? getSelectionOffsetsWithin(doc) : null;

        canvasApplyingRemoteDoc = true;
        doc.innerHTML = canvasDocHtml || '';
        canvasApplyingRemoteDoc = false;

        if (wasFocused && savedSel) {
            restoreSelectionFromOffsets(doc, savedSel);
        }
        redrawCanvas();
    });

    socket.on('canvas_cursor', (msg) => {
        const cid = Number(msg?.conversation_id || 0);
        if (!cid || (canvasCurrentConversationId && cid !== canvasCurrentConversationId)) return;
        updateRemoteCursorLabel(msg);
    });

    // Close canvas if we navigate home
    if (panel) {
        // no-op; relies on navigateToHome to call closeCanvas if needed
    }
}

function beginCanvasTextEditorAt(normPoint) {
    const stage = getCanvasStage();
    if (!stage) return;

    // Remove existing editor if any
    if (canvasActiveTextEditor && canvasActiveTextEditor.parentNode) {
        canvasActiveTextEditor.parentNode.removeChild(canvasActiveTextEditor);
    }
    canvasActiveTextEditor = document.createElement('textarea');
    canvasActiveTextEditor.className = 'canvas-text-editor';
    canvasActiveTextEditor.setAttribute('aria-label', 'Canvas text');
    canvasActiveTextEditor.placeholder = 'Write anything…';
    canvasTextEditorCreatedAt = Date.now();

    canvasActiveTextNorm = {
        x: Math.min(1, Math.max(0, Number(normPoint?.x) || 0)),
        y: Math.min(1, Math.max(0, Number(normPoint?.y) || 0)),
    };

    const stageRect = stage.getBoundingClientRect();
    const left = (canvasActiveTextNorm.x * stageRect.width);
    const top = (canvasActiveTextNorm.y * stageRect.height);
    canvasActiveTextEditor.style.left = `${Math.max(8, Math.min(stageRect.width - 120, left))}px`;
    canvasActiveTextEditor.style.top = `${Math.max(8, Math.min(stageRect.height - 40, top))}px`;

    stage.appendChild(canvasActiveTextEditor);
    // Focus twice (now + next frame) to ensure a visible blinking caret
    // even when opening from the dropup click.
    try { canvasActiveTextEditor.focus(); } catch (_) {}
    window.requestAnimationFrame(() => {
        try { canvasActiveTextEditor?.focus(); } catch (_) {}
    });

    const commit = () => {
        const text = String(canvasActiveTextEditor?.value || '').trim();
        if (canvasActiveTextEditor && canvasActiveTextEditor.parentNode) {
            canvasActiveTextEditor.parentNode.removeChild(canvasActiveTextEditor);
        }
        canvasActiveTextEditor = null;
        const pos = canvasActiveTextNorm;
        canvasActiveTextNorm = null;
        if (!text || !pos) return;

        const entry = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            x: pos.x,
            y: pos.y,
            text,
            color: (canvasColor || getCssVar('--text-primary', '#111111')),
            size: Number(canvasToolSizes.text || canvasSize || 16) || 16,
        };
        canvasTexts.push(entry);
        redrawCanvas();
        emitCanvasTextEntry(entry);
    };

    const cancel = () => {
        if (canvasActiveTextEditor && canvasActiveTextEditor.parentNode) {
            canvasActiveTextEditor.parentNode.removeChild(canvasActiveTextEditor);
        }
        canvasActiveTextEditor = null;
        canvasActiveTextNorm = null;
    };

    canvasActiveTextEditor.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.preventDefault();
            cancel();
            return;
        }

        // Natural typing: Enter creates a new line.
        // Commit/save with Ctrl/Cmd+Enter.
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            commit();
        }
    });
    canvasActiveTextEditor.addEventListener('blur', () => {
        // If we lose focus immediately after opening (common when opening from a menu click),
        // re-focus so the user sees a blinking caret.
        const age = Date.now() - (canvasTextEditorCreatedAt || 0);
        if (age < 200) {
            window.setTimeout(() => {
                try { canvasActiveTextEditor?.focus(); } catch (_) {}
            }, 0);
            return;
        }

        // Commit only if there is actual content; otherwise cancel.
        const current = String(canvasActiveTextEditor?.value || '').trim();
        if (current) commit();
        else cancel();
    }, { once: true });
}

function hideAppLoadingOverlay() {
    const overlay = document.getElementById('app-loading-overlay');
    if (!overlay) return;
    overlay.classList.add('is-hidden');
    window.setTimeout(() => {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 260);
}

function isEditableTarget(target) {
    if (!target) return false;
    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
    if (target.isContentEditable) return true;
    return false;
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // macOS shortcuts: ⇧⌘O / ⇧⌘K / ⇧⌘S
        if (!e.metaKey || !e.shiftKey || e.altKey || e.ctrlKey) return;
        if (isEditableTarget(e.target)) return;

        const key = String(e.key || '').toLowerCase();
        if (key === 'o') {
            e.preventDefault();
            navigateToHome();
            return;
        }
        if (key === 'k') {
            e.preventDefault();
            const galleryBtn = document.getElementById('open-conversation-gallery');
            if (galleryBtn) {
                galleryBtn.click();
            } else {
                showGalleryView();
                renderConversationGallery(lastConversationsList);
                scheduleConversationsRefresh();
            }
            return;
        }
        if (key === 's') {
            e.preventDefault();
            const shareBtn = document.getElementById('open-share-modal');
            if (shareBtn) shareBtn.click();
            return;
        }
    }, { capture: true });
}

function toFullImageUrl(imagePath) {
    if (!imagePath) return 'https://apilageai.lk/assets/images/user.png';
    if (typeof imagePath !== 'string') return 'https://apilageai.lk/assets/images/user.png';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `https://apilageai.lk${imagePath}`;
}

function getConversationSortMode() {
    const el = document.getElementById('conversation-sort-select');
    return (el && el.value) ? el.value : 'updated_desc';
}

function parseDateMs(value) {
    if (!value) return 0;
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : 0;
}

function renderConversationGallery(conversations) {
    const grid = document.getElementById('conversation-gallery-grid');
    if (!grid) return;

    const q = (document.getElementById('conversation-search-input')?.value || '').trim().toLowerCase();
    const sortMode = getConversationSortMode();

    const list = Array.isArray(conversations) ? conversations.slice() : [];
    const filtered = q
        ? list.filter((c) => {
            const title = String(c?.title || '').toLowerCase();
            const owner = `${c?.owner_first_name || ''} ${c?.owner_last_name || ''}`.trim().toLowerCase();
            return title.includes(q) || owner.includes(q);
        })
        : list;

    const sortKey = (c) => {
        if (sortMode === 'created_desc' || sortMode === 'created_asc') return parseDateMs(c?.created_at);
        return parseDateMs(c?.last_updated || c?.created_at);
    };
    filtered.sort((a, b) => {
        const av = sortKey(a);
        const bv = sortKey(b);
        if (sortMode === 'created_asc') return av - bv;
        return bv - av;
    });

    const shared = [];
    const mine = [];
    for (const c of filtered) {
        const participants = Array.isArray(c?.participants) ? c.participants : [];
        const isShared = participants.length > 1;
        if (isShared) shared.push(c);
        else mine.push(c);
    }

    grid.innerHTML = '';

    const appendGroup = (title, items) => {
        if (!items.length) return;
        const h = document.createElement('div');
        h.className = 'conversation-group-title';
        h.textContent = title;
        grid.appendChild(h);

        for (const conv of items) {
            const id = Number(conv?.conversation_id);
            if (!id) continue;

            const titleText = String(conv?.title || '').trim() || 'Chat';
            const gradientNum = ((id % 6) + 1);
            const isOwner = Number(conv?.is_owner) === 1;

            const ownerName = `${conv?.owner_first_name || ''} ${conv?.owner_last_name || ''}`.trim() || 'User';
            const ownerImage = toFullImageUrl(conv?.owner_image);

            const participants = Array.isArray(conv?.participants) ? conv.participants : [];
            const uniqueParticipants = [];
            const seen = new Set();
            for (const p of participants) {
                const pid = Number(p?.user_id);
                if (!pid || seen.has(pid)) continue;
                seen.add(pid);
                uniqueParticipants.push(p);
            }

            const card = document.createElement('div');
            card.className = 'conversation-card';
            card.addEventListener('click', () => {
                navigateToConversation(id);
            });

            const thumb = document.createElement('div');
            thumb.className = `conversation-thumbnail gradient-${gradientNum}`;
            thumb.innerHTML = `<span>${titleText}</span>`;

            // Delete (existing)
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-btn delete-btn';
            deleteBtn.title = 'Delete';
            deleteBtn.innerHTML = '<i class="fa fa-trash"></i>';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteConversation(String(id));
            });
            thumb.appendChild(deleteBtn);

            // Share (existing)
            const shareBtn = document.createElement('button');
            shareBtn.className = 'icon-btn share-btn';
            shareBtn.title = 'Share';
            shareBtn.innerHTML = '<i class="fa fa-share-alt"></i>';
            shareBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                shareConversation(String(id));
            });
            thumb.appendChild(shareBtn);

            // Rename (owner only)
            if (isOwner) {
                const renameBtn = document.createElement('button');
                renameBtn.className = 'icon-btn rename-btn';
                renameBtn.title = 'Rename';
                renameBtn.innerHTML = '<i class="fa fa-pen"></i>';
                renameBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const next = window.prompt('Rename chat', titleText);
                    if (next === null) return;
                    const trimmed = String(next).trim();
                    if (!trimmed) return;
                    socket.emit('rename_conversation', { conversation_id: id, title: trimmed });
                });
                thumb.appendChild(renameBtn);
            }

            const content = document.createElement('div');
            content.className = 'conversation-card-content';
            content.innerHTML = `
                <div class="conversation-title" title="${titleText.replace(/"/g, '&quot;')}">${titleText}</div>
                <div class="conversation-meta-row">
                    <div class="conversation-owner">
                        <img class="conversation-owner-avatar" src="${ownerImage}" alt="${ownerName.replace(/"/g, '&quot;')}" onerror="this.onerror=null;this.src='https://apilageai.lk/assets/images/user.png';" />
                        <div class="conversation-owner-name">${ownerName}</div>
                    </div>
                    <div class="conversation-participants"></div>
                </div>
            `;

            const avatars = content.querySelector('.conversation-participants');
            if (avatars && uniqueParticipants.length > 1) {
                // Show all members for collaborative chats
                for (const p of uniqueParticipants) {
                    const img = document.createElement('img');
                    img.className = 'conversation-participant-avatar';
                    const name = `${p?.first_name || ''} ${p?.last_name || ''}`.trim() || 'User';
                    img.alt = name;
                    img.title = name;
                    img.src = toFullImageUrl(p?.image);
                    img.onerror = function () {
                        this.onerror = null;
                        this.src = 'https://apilageai.lk/assets/images/user.png';
                    };
                    avatars.appendChild(img);
                }
            }

            card.appendChild(thumb);
            card.appendChild(content);
            grid.appendChild(card);
        }
    };

    appendGroup('Shared Chats', shared);
    appendGroup('My Own Chats', mine);

    if (!grid.children.length) {
        const empty = document.createElement('div');
        empty.className = 'conversation-group-title';
        empty.textContent = q ? 'No conversations match your search.' : 'No conversations yet.';
        grid.appendChild(empty);
    }
}

socket.on("authenticated", (data) => {
    if (data.success) {
        window.userBalance = data.user.balance;
        window.userData = data.user;

        // ===============================
        // Model selection logic - USE MODELS FROM BACKEND
        // ===============================
        // Backend sends: available_models, can_use_images, is_trial, trial_remaining, trial_limits
        // available_models: ['auto', 'free', 'pro', 'super', 'master'] for paying users OR trial users
        // available_models: ['free'] for free users with no trial remaining
        
        // Use models from backend response
        const availableModels = data.available_models || ['free'];
        const canUseImages = data.can_use_images || false;
        const isTrial = data.is_trial || false;
        const trialRemaining = data.trial_remaining || { messages: 0, image_uploads: 0, image_generations: 0 };
        const trialLimits = data.trial_limits || { messages: 5, image_uploads: 3, image_generations: 5 };
        
        // All possible model tokens (for UI display purposes)
        const allModelTokens = ['auto', 'free', 'pro', 'super', 'master'];

        // Set global variables
        window.allowedModels = availableModels;
        window.allModelTokens = allModelTokens;
        window.canUseImages = canUseImages;
        window.isTrial = isTrial;
        window.hasMessageTrial = data.has_message_trial || false;
        window.trialRemaining = trialRemaining;
        window.trialLimits = trialLimits;
        
        // Update sidebar credit display (with small delay to ensure DOM is ready)
        setTimeout(() => {
            if (typeof updateSidebarCredit === 'function') {
                updateSidebarCredit();
            }
        }, 100);
        
        // Default model: 'auto' if available, otherwise first available model
        window.defaultModel = availableModels.includes('auto') ? 'auto' : availableModels[0];

        // Determine selected model: use saved model if available and allowed, else use default
        let savedModel = localStorage.getItem("chatSelectedModel");
        if (savedModel && availableModels.includes(savedModel)) {
            window.selectedModel = savedModel;
        } else {
            window.selectedModel = window.defaultModel;
        }
        // Save the selected model to localStorage for future sessions
        localStorage.setItem("chatSelectedModel", window.selectedModel);

        if (typeof updateModelSwitcherUI === "function") {
            updateModelSwitcherUI();
        }
        
        // Update trial status UI if trial user
        if (isTrial && typeof updateTrialStatusUI === "function") {
            updateTrialStatusUI(trialRemaining, trialLimits);
        }

        // Update UI with user data if needed
        const balanceElements = document.querySelectorAll(".user-balance");
        balanceElements.forEach((el) => {
            el.textContent = data.user.balance;
        });

        // Populate conversation lists (sidebar + gallery)
        try {
            socket.emit('get_conversations');
        } catch (_) {}
    }
});

// ===============================
// Trial Status UI Update
// ===============================
function updateTrialStatusUI(trialRemaining, trialLimits) {
    // Update or create trial status indicator
    let trialIndicator = document.getElementById('trial-status-indicator');
    
    if (!trialIndicator) {
        // Create trial status indicator if it doesn't exist
        trialIndicator = document.createElement('div');
        trialIndicator.id = 'trial-status-indicator';
        trialIndicator.className = 'trial-status-indicator';
        
        // Insert near balance or header area
        const headerArea = document.querySelector('.chat-header') || document.querySelector('header');
        if (headerArea) {
            headerArea.appendChild(trialIndicator);
        }
    }
    
    if (window.isTrial && trialRemaining) {
        trialIndicator.style.display = 'block';
        trialIndicator.innerHTML = `
            <span class="trial-badge">Daily Trial</span>
            <span class="trial-info">
                Messages: ${trialRemaining.messages}/${trialLimits.messages} |
                Uploads: ${trialRemaining.image_uploads}/${trialLimits.image_uploads} |
                Images: ${trialRemaining.image_generations}/${trialLimits.image_generations}
            </span>
        `;
    } else {
        trialIndicator.style.display = 'none';
    }
}

// ===============================
// Sidebar Credit Display Update
// ===============================
function updateSidebarCredit() {
    const creditTextEl = document.getElementById('sidebar-credit-text');
    const creditBarEl = document.getElementById('sidebar-credit-bar');
    
    if (!creditTextEl) {
        console.log('sidebar-credit-text element not found');
        return;
    }
    
    const balance = window.userBalance !== undefined ? window.userBalance : -1;
    const isTrial = window.isTrial || false;
    const hasMessageTrial = window.hasMessageTrial || false;
    const trialRemaining = window.trialRemaining || { messages: 0, image_uploads: 0, image_generations: 0 };
    
    // If balance is still undefined/not set, don't update yet
    if (balance === -1) return;
    
    // Check if user has any trial remaining
    const hasAnyTrialRemaining = trialRemaining.messages > 0 || 
                                  trialRemaining.image_uploads > 0 || 
                                  trialRemaining.image_generations > 0;
    
    if (balance > 0) {
        // Normal user with balance - show real-time balance
        creditTextEl.textContent = `Credit: Rs. ${Math.floor(balance)}`;
        creditTextEl.className = 'user-credit-text';
    } else if (balance <= 0 && (isTrial || hasMessageTrial || hasAnyTrialRemaining)) {
        // User has 0 balance but is in trial mode or has image trials remaining
        creditTextEl.innerHTML = `<span class="trial-badge-small">Trial</span>`;
        creditTextEl.className = 'user-credit-text trial-mode';
    } else {
        // User has 0 balance and all trials ended
        creditTextEl.innerHTML = `<a href="#" class="upgrade-link" onclick="openPreferenceBoxWithBillingTab(); return false;">Upgrade Credit</a>`;
        creditTextEl.className = 'user-credit-text upgrade-mode';
    }
    
    // Update credit bar
    if (creditBarEl) {
        if (balance > 0) {
            const barWidth = Math.min(100, (balance / 50) * 100);
            creditBarEl.style.width = `${barWidth}%`;
            creditBarEl.className = 'credit-bar-fill';
        } else if (isTrial || hasMessageTrial || hasAnyTrialRemaining) {
            // Show trial progress bar based on remaining trials
            const totalTrials = trialRemaining.messages + trialRemaining.image_uploads + trialRemaining.image_generations;
            const maxTrials = 5 + 3 + 5; // messages + uploads + generations
            const trialProgress = (totalTrials / maxTrials) * 100;
            creditBarEl.style.width = `${trialProgress}%`;
            creditBarEl.className = 'credit-bar-fill trial-bar';
        } else {
            creditBarEl.style.width = '0%';
            creditBarEl.className = 'credit-bar-fill empty-bar';
        }
    }
}

// Call updateSidebarCredit when DOM is ready (fallback for timing issues)
document.addEventListener('DOMContentLoaded', () => {
    // Small delay to ensure socket data might be available
    setTimeout(() => {
        if (window.userBalance !== undefined && typeof updateSidebarCredit === 'function') {
            updateSidebarCredit();
        }
    }, 500);
});

// ===============================
// Handle available_models updates from backend
// ===============================
socket.on('available_models', (data) => {
    if (data && data.models) {
        window.allowedModels = data.models;
        window.canUseImages = data.can_use_images || false;
        window.isTrial = data.is_trial || false;
        window.hasMessageTrial = data.has_message_trial || false;
        window.trialRemaining = data.trial_remaining || { messages: 0, image_uploads: 0, image_generations: 0 };
        window.trialLimits = data.trial_limits || { messages: 5, image_uploads: 3, image_generations: 5 };
        
        // Update model switcher UI with new available models
        if (typeof updateModelSwitcherUI === "function") {
            updateModelSwitcherUI();
        }
        
        // Update sidebar credit display
        if (typeof updateSidebarCredit === "function") {
            updateSidebarCredit();
        }
        
        // Update trial status UI
        if (window.isTrial && typeof updateTrialStatusUI === "function") {
            updateTrialStatusUI(window.trialRemaining, window.trialLimits);
        } else {
            // Hide trial indicator if not in trial mode
            const trialIndicator = document.getElementById('trial-status-indicator');
            if (trialIndicator) {
                trialIndicator.style.display = 'none';
            }
        }
        
        // If current selected model is no longer available, switch to default
        if (!data.models.includes(window.selectedModel)) {
            window.selectedModel = data.models.includes('auto') ? 'auto' : data.models[0];
            localStorage.setItem("chatSelectedModel", window.selectedModel);
            if (typeof updateModelSwitcherUI === "function") {
                updateModelSwitcherUI();
            }
        }
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
    const allModels = window.allModelTokens || ['auto', 'free', 'pro', 'super', 'master'];
    const allowedModels = window.allowedModels || ['free'];
    
    allModels.forEach(model => {
        const li = document.createElement("li");
        li.textContent = getModelDisplayName(model);
        li.className = model === window.selectedModel ? "selected" : "";
        
        // Check if model is allowed (from backend)
        const isAllowed = allowedModels.includes(model);
        
        if (!isAllowed) {
            // Model not allowed - gray it out and disable
            li.classList.add('disabled-model');
        } else {
            // Model is allowed - make it clickable
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

    // Inject CSS for disabled-model and model-used-badge if not already present
    if (!document.getElementById("disabled-model-style")) {
        const style = document.createElement("style");
        style.id = "disabled-model-style";
        style.textContent = `
            .disabled-model {
                opacity: 0.5;
                pointer-events: none;
            }
            .model-used-badge {
                display: inline-flex;
                align-items: center;
                padding: 2px 8px;
                font-size: 11px;
                font-weight: 600;
                border-radius: 12px;
                margin-right: 6px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                text-transform: capitalize;
            }
            .model-badge-free {
                background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
            }
            .model-badge-pro {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .model-badge-super {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            }
            .model-badge-master {
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                color: #333;
            }
            .model-badge-auto {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            }
            .message-regenerate:hover {
                color: #007bff;
            }
            .message-regenerate i {
                transition: transform 0.3s ease;
            }
            .message-regenerate:hover i {
                transform: rotate(180deg);
            }
        `;
        document.head.appendChild(style);
    }
}
// ===============================
// Free usage limit and warning handlers
// ===============================
socket.on("free_limit_error", (data) => {
    showDialog("Limit Reached", data.message || "Your free usage limit has been exceeded. Try again after a few hours or upgrade to Pro.");
});

socket.on("free_usage_warning", (data) => {
    showDialog("Notice", data.message || "Your free trial is currently limited. Try again later or upgrade for unlimited access.");
});

// ===============================
// Helper for pretty model names (Custom UI Names)
// ===============================
// Helper to open preference box with billing tab
function openPreferenceBoxWithBillingTab() {
    const preferenceboxOverlay = document.getElementById('preferenceboxOverlay');
    if (preferenceboxOverlay) {
        preferenceboxOverlay.style.display = 'flex';
        preferenceboxOverlay.classList.add('active');
        
        // Click the billing tab
        const billingTabLink = document.querySelector('.preferencebox-tab-link[data-tab="billing"]');
        if (billingTabLink) {
            billingTabLink.click();
        }
    }
}

function getModelDisplayName(model) {
    // Expect frontend token values: 'auto', 'free', 'pro', 'super', 'master'
    switch (model) {
        case 'auto':
            return "Auto";
        case 'free':
            return "Free";
        case 'pro':
            return "Pro";
        case 'super':
            return "Super";
        case 'master':
            return "Apilage‑Master";
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

// Generate citations HTML from Google Search grounding metadata
function generateCitationsHTML(grounding) {
    // No longer showing sources section - inline citations are enough
    return '';
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

    // Keep conversation cards (updated sort) fresh
    scheduleConversationsRefresh();
});

// Sender-only balance updates (shared chats)
socket.on("balance_update", (data) => {
    try {
        if (!window.userData) return;
        const targetUserId = Number(data?.user_id);
        const myUserId = Number(window.userData?.id);
        if (targetUserId && myUserId && targetUserId !== myUserId) {
            return;
        }

        if (typeof data?.balance_after === 'number') {
            window.userData.balance = data.balance_after;
        } else if (typeof data?.cost === 'number') {
            window.userData.balance = (Number(window.userData.balance) || 0) - data.cost;
        }
        window.userBalance = window.userData.balance;
        updateBalanceDisplay();
    } catch (e) {
        console.warn('balance_update handler failed:', e);
    }
});

// Global input lock while a collaborator is streaming
socket.on("conversation_lock", (data) => {
    const currentConversationId = getConversationIdFromURL();
    if (!currentConversationId) return;
    if (Number(data?.conversation_id) !== Number(currentConversationId)) return;

    const locked = !!data?.locked;
    const byUserId = Number(data?.by_user_id);
    const myUserId = Number(window.userData?.id);

    if (locked && byUserId && myUserId && byUserId !== myUserId) {
        disableMessageInput();
    }
    if (!locked) {
        enableMessageInput();
    }
});

socket.on("stream_error", (data) => {
    handleStreamError(data);
});

// 🔍 Show when apilageai is searching the web
socket.on("stream_searching", (data) => {
    // data = { conversation_id, message_id, message }
    // Update the thinking-status element in the message bubble
    const messageWrapper = document.querySelector(`[data-m-id="${data.message_id}"]`);
    if (messageWrapper) {
        const statusEl = messageWrapper.querySelector('.thinking-status');
        if (statusEl) {
            statusEl.innerHTML = `
                <span class="status-icon">🔍</span>
                <span class="status-text">${data.message || "Searching the web..."}</span>
            `;
        }
    }
});

// 🤔 Show when apilageai is thinking
socket.on("stream_thinking", (data) => {
    // data = { conversation_id, message_id, chunk }
    const messageWrapper = document.querySelector(`[data-m-id="${data.message_id}"]`);
    if (messageWrapper) {
        const statusEl = messageWrapper.querySelector('.thinking-status');
        if (statusEl) {
            // Show truncated thinking text
            const thinkingPreview = (data.chunk || '').substring(0, 50) + (data.chunk?.length > 50 ? '...' : '');
            statusEl.innerHTML = `
                <span class="status-icon">🤔</span>
                <span class="status-text">Thinking... ${thinkingPreview}</span>
            `;
        }
    }
});

// 📚 Handle grounding metadata (citations from Google Search)
socket.on("stream_grounding", (data) => {
    // data = { conversation_id, message_id, grounding: { searchEntryPoint, chunks, supports, queries } }
    // Store grounding data for later use when finalizing the message
    if (!window.groundingData) window.groundingData = {};
    window.groundingData[data.message_id] = data.grounding;
});

socket.on("user_message_saved", (data) => {
    const cid = Number(data?.conversation_id || 0);
    const senderId = Number(data?.sender_user_id || 0);
    const myUserId = Number(window.userData?.id || 0);
    if (cid && senderId && myUserId && senderId !== myUserId) {
        ensureConversationParticipants(cid);
    }
    chatBubbleManager.createOrUpdateBubble(data);

    // Update conversation cards in realtime (last_updated)
    scheduleConversationsRefresh();
});

// When participants change (share/accept/remove), update locally so mic appears without refresh
socket.on('conversation_participants_updated', (data) => {
    const cid = Number(data?.conversation_id || 0);
    const current = Number(getConversationIdFromURL() || 0);
    if (cid && current && cid === current) {
        ensureConversationParticipants(cid);
    }

    // Participants can change whether a chat is "shared"
    scheduleConversationsRefresh();
});

socket.on('conversation_summary_updated', (data) => {
    if (data && data.conversation_id) {
        scheduleConversationsRefresh();
    }
});

socket.on("conversations_list", (conversations) => {
    updateConversationsList(conversations);
});

socket.on('conversation_renamed', (result) => {
    if (result && !result.error) {
        scheduleConversationsRefresh();
    }
});

socket.on("conversation_data", (data) => {
    handleConversationData(data);
});

socket.on("conversation_deleted", (result) => {
    if (!result.error) {
        const deletedId = Number(result?.conversation_id || 0);
        if (deletedId) {
            lastConversationsList = (lastConversationsList || []).filter((c) => Number(c?.conversation_id) !== deletedId);
            renderConversationGallery(lastConversationsList);
        }

        const currentConversationId = Number(getConversationIdFromURL() || 0);
        if (deletedId && currentConversationId === deletedId) {
            navigateToHome();
        } else {
            scheduleConversationsRefresh();
        }
    } else {
        showDialog("Error", result.message || "Failed to delete conversation");
    }
});

socket.on("error", (error) => {
    showDialog("Error", error.message || "Connection error occurred");
});

// ===============================
// Image Public Option Listener
// ===============================
socket.on("image_public_option", (data) => {
  const chatContainer = document.getElementById("messages-container") || document.querySelector(".chat-area-wrapper");
  if (!chatContainer) return;
  const wrapper = document.createElement("div");
  wrapper.className = "image-public-option";
  wrapper.style.margin = "12px 0";
    const safeImageUrl = escapeHtml(String(data?.image_url || ''));
    const safeMsg = escapeHtml(String(data?.message || ''));
  wrapper.innerHTML = `
    <div style="border:1px solid #ccc;padding:12px;border-radius:8px;">
            <img src="${safeImageUrl}" alt="Generated Image" style="max-width:200px;border-radius:8px;margin-bottom:8px;display:block;">
            <p style="font-weight:500;">${safeMsg}</p>
      <label style="margin-right:10px;display:inline-flex;align-items:center;gap:3px;">
        <input type="radio" name="public_choice" value="yes"> Yes
      </label>
      <label style="display:inline-flex;align-items:center;gap:3px;">
        <input type="radio" name="public_choice" value="no" checked> No
      </label>
      <br>
      <button id="submitPublicChoice" style="margin-top:8px;background:#007bff;color:white;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">Submit</button>
    </div>
  `;
  chatContainer.appendChild(wrapper);
  const btn = wrapper.querySelector("#submitPublicChoice");
  btn.addEventListener("click", () => {
    const choice = wrapper.querySelector('input[name="public_choice"]:checked').value;
    const makePublic = choice === "yes";
    socket.emit("update_image_public", { image_url: data.image_url, make_public: makePublic });
    wrapper.innerHTML = `<p style="color:#555;">Updating visibility...</p>`;
  });
});

// ===============================
// Image Public Updated Result Listener
// ===============================
socket.on("image_public_updated", (res) => {
  const chatContainer = document.getElementById("messages-container");
  const info = document.createElement("div");
  info.style.margin = "6px 0";
  info.style.fontSize = "14px";
  if (res.success) {
    info.style.color = "#28a745";
    info.textContent = res.public ? "✅ Image is now public!" : "🔒 Image kept private.";
  } else {
    info.style.color = "#ff4444";
    info.textContent = "❌ Failed to update image visibility.";
  }
  chatContainer?.appendChild(info);
});

// STREAMING HANDLERS
function handleStreamStart(data) {
    // Stop any existing loading animations
    clearTimeout(typingTimeout);
    clearInterval(stageInterval);

    // Hide any previous thinking-status immediately
    clearThinkingTexts();

    // Reset smooth streaming state for new stream
    chatBubbleManager.resetStreamingState();

    // Keep input disabled during streaming
    messageInput.disabled = true;
    sendButton.disabled = true;
sendButton.classList.add("text-muted");
sendButton.classList.remove("text-primary");
    messageInput.style.background = "";
    messageInput.value = data.is_regeneration ? "Regenerating..." : "Sending...";

    // Create streaming message using optimized system
    currentStreamingMessage = {
        conversation_id: data.conversation_id,
        message_id: data.message_id,
        user_message_id: data.user_message_id,
        content: '',
        is_new: data.is_new,
        is_regeneration: data.is_regeneration,
        isImage: !!data.is_image_request
    };

    if (data && data.conversation_id) {
        setCanvasConversationId(data.conversation_id);
        flushPendingCanvasStrokes();
    }

    // For regeneration, find any existing streaming bubble and reset it
    if (data.is_regeneration) {
        // Try to find an existing bubble that's in streaming state
        const existingBubbles = document.querySelectorAll('.chat-bubble.streaming');
        existingBubbles.forEach(b => b.classList.remove('streaming'));
    }

    // Use chatBubbleManager to create or update the bubble
    let bubble = chatBubbleManager.createOrUpdateBubble({
        message_id: data.message_id,
        type: 2,
        is_new: data.is_new,
        sender_user_id: data.sender_user_id
    }, {
        isStreaming: true
    });

    // If this is an image request, show a placeholder
    if (data.is_image_request && bubble) {
        const sc = bubble.querySelector('.streaming-content');
        if (sc) {
            sc.innerHTML = `<span class="image-processing-placeholder" style="color: #888888; font-style: italic;">Image is processing...</span>`;
        } else {
            bubble.insertAdjacentHTML('afterbegin', `<div class="image-processing-placeholder" style="color: #888888; font-style: italic;">Image is processing...</div>`);
        }
    }
    streamingMessageElement = bubble?.querySelector('.streaming-content') || bubble;
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

        // Get grounding data (citations) if available
        const groundingData = data.grounding || (window.groundingData && window.groundingData[data.message_id]);
        let finalContent = data.final_content;
        
        // Generate citations HTML (will be added after markdown processing)
        let citationsHTML = '';
        if (groundingData && !currentStreamingMessage.isImage) {
            citationsHTML = generateCitationsHTML(groundingData);
        }
        
        // Clean up stored grounding data
        if (window.groundingData && window.groundingData[data.message_id]) {
            delete window.groundingData[data.message_id];
        }

        chatBubbleManager.finalizeStreamingMessage(data.message_id, finalContent, {
            model_used: data.model_used,
            user_message_id: data.user_message_id,
            conversation_id: data.conversation_id,
            citationsHTML: currentStreamingMessage.isImage ? '' : citationsHTML,
        });
        
        // Store model info on the message element for future reference
        const bubble = document.querySelector(`#message-${data.message_id}`);
        if (bubble) {
            bubble.dataset.modelUsed = data.model_used || '';
            bubble.dataset.userMessageId = data.user_message_id || '';
            bubble.dataset.conversationId = data.conversation_id || '';
        }

        // Update user balance display (sender-only in shared chats)
        const isSender = !data.sender_user_id || (window.userData && Number(data.sender_user_id) === Number(window.userData.id));
        if (isSender && data.cost && window.userData) {
            window.userData.balance -= data.cost;
            window.userBalance = window.userData.balance;
            updateBalanceDisplay();
        }
        
        // If this was a trial message, request updated models/trial status
        if (data.is_trial) {
            socket.emit('get_available_models');
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
    // Reset smooth streaming state
    chatBubbleManager.resetStreamingState();

    // If error object from socket stream (error: true, message: ...)
    if (data && data.error && data.message) {
        showErrorBanner(data.message);
        // Also clear streaming state etc. as below
        currentStreamingMessage = null;
        streamingMessageElement = null;
        enableMessageInput();
        clearAttachments();
        messageInput.value = "";
        return;
    }

    const messageWrapper = document.querySelector(`[data-m-id="${data.message_id}"]`);
    if (messageWrapper) {
        messageWrapper.innerHTML = `
            <div class="error-message" style="color: #ff4444; padding: 10px; border: 1px solid #ff4444; border-radius: 8px; margin: 10px 0;">
                <i class="fas fa-exclamation-triangle"></i>
                ${data.message || 'An error occurred while streaming the message.'}
            </div>
        `;
    }

    // Show error dialog for free usage limit errors as well
    if (
        data &&
        typeof data.message === "string" &&
        (
            data.message.toLowerCase().includes("free usage limit") ||
            data.message.toLowerCase().includes("free trial") ||
            data.message.toLowerCase().includes("limit exceeded") ||
            data.message.toLowerCase().includes("usage limit")
        )
    ) {
        showDialog("Limit Reached", data.message);
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

// Helper to show or update error banner above chat input
function showErrorBanner(message) {
    let banner = document.getElementById("errorTag");
    if (!banner) {
        const chatWrapper = document.querySelector(".chat-wrapper");
        if (!chatWrapper) return;
        banner = document.createElement("div");
        banner.id = "errorTag";
        banner.className = "error-banner";
        banner.innerHTML = `
            <span class="error-icon"><i class="fa fa-exclamation-triangle"></i></span>
            <span class="error-text">${message}</span>
            <div class="error-buttons">
                <a id="btnUpgrade" class="btn-upgrade">Upgrade</a>
                <button id="btnCloseBanner" class="btn-close">Close</button>
            </div>
        `;
        chatWrapper.parentNode.insertBefore(banner, chatWrapper);
    } else {
        banner.querySelector(".error-text").innerText = message;
        banner.style.display = "flex";
    }
    // Bind button actions
    const closeBtn = banner.querySelector("#btnCloseBanner");
    const upgradeBtn = banner.querySelector("#btnUpgrade");
    closeBtn.onclick = () => banner.style.display = "none";
    upgradeBtn.onclick = () => {
        openPreferenceBoxWithBillingTab();
    };
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
    
    // Also update sidebar credit display
    if (typeof updateSidebarCredit === 'function') {
        updateSidebarCredit();
    }
}

function enableMessageInput() {
    messageInput.disabled = false;
    messageInput.style.background = "";
    messageInput.focus();

    const isStreaming = !!currentStreamingMessage;
    sendButton.disabled = (messageInput.value.trim() === "" || isStreaming);
    sendButton.classList.toggle("text-muted", sendButton.disabled);
    sendButton.classList.toggle("text-primary", !sendButton.disabled);
}

function disableMessageInput() {
    messageInput.disabled = true;
    sendButton.disabled = true;
    sendButton.classList.add("text-muted");
    sendButton.classList.remove("text-primary");
}

// --- SEND MESSAGE LOGIC PATCH: include model in payload ---
// (This logic is now handled in sendMessage below, so this old handler is not needed.)

const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get("q");

const messageInput = document.getElementById("message-input");
if (messageInput) {
    messageInput.value = query;
    messageInput.focus();
}

const removeBtn = document.getElementById("removeImage");

// Extend clearAttachments to also clear the input field and preview
function clearAttachmentsPreview() {
    const fileInputEl = document.getElementById("fileInput");
    const previewWrapperEl = document.querySelector(".preview-wrapper");

    if (previewWrapperEl) {
        previewWrapperEl.innerHTML = "";
        previewWrapperEl.style.display = "none";
    }
    if (fileInputEl) fileInputEl.value = "";
    window.uploadedAttachment = null;
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
                        <div class="preview-item" style="display:flex;align-items:center;gap:10px;position:relative;">
                            <img src="https://apilageai.lk/uploads/${result.filename}" 
                                 alt="Uploaded image"
                                 style="max-width:120px;border-radius:8px;display:block;">
                            <button class="remove-upload" 
                                    style="
                                        position:absolute;
                                        top:4px;
                                        right:4px;
                                        background:rgba(255,255,255,0.8);
                                        border:none;
                                        color:#ff4444;
                                        font-size:18px;
                                        cursor:pointer;
                                        border-radius:50%;
                                        width:26px;
                                        height:26px;
                                        display:flex;
                                        align-items:center;
                                        justify-content:center;
                                        box-shadow:0 2px 6px rgba(0,0,0,0.15);
                                    ">✖</button>
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
// (clearAttachmentsPreview already defined above)

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
    let emoji = "";

    if (hour >= 3 && hour < 12) {
        greeting = "Good morning";
        emoji = "🌻";
    } else if (hour >= 12 && hour < 16) {
        greeting = "Good afternoon";
        emoji = "🌞";
    } else if (hour >= 16 && hour < 20) {
        greeting = "Good evening";
        emoji = "🌥️";
    } else if (hour >= 20 && hour < 24) {
        greeting = "Happy late night";
        emoji = "🌙";
    } else {
        greeting = "A new day";
        emoji = "🌅"; // 12am to 3am
    }

    const greetingElement = document.querySelector(".greeting-text");
    if (greetingElement) {
        greetingElement.innerHTML = `${greeting} <span class="animated-emoji">${emoji}</span>`;
    }
}

// Add emoji animation styles if not already present
if (!document.getElementById("emoji-animation-style")) {
    const style = document.createElement("style");
    style.id = "emoji-animation-style";
    style.textContent = `
        @keyframes float-bounce {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
            }
            25% {
                transform: translateY(-8px) rotate(-5deg);
            }
            50% {
                transform: translateY(-12px) rotate(0deg);
            }
            75% {
                transform: translateY(-8px) rotate(5deg);
            }
        }
        
        .animated-emoji {
            display: inline-block;
            animation: float-bounce 2s ease-in-out infinite;
            transform-origin: center;
        }
    `;
    document.head.appendChild(style);
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
            navigateToConversation(response.conversation_id);
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
    const fileInputEl = document.getElementById("fileInput");
    const previewWrapperEl = document.querySelector(".preview-wrapper");

    if (typeof clearAttachmentsPreview === "function") {
        clearAttachmentsPreview();
    }

    if (fileInputEl) fileInputEl.value = "";
    if (previewWrapperEl) {
        previewWrapperEl.innerHTML = "";
        previewWrapperEl.style.display = "none";
    }
    window.uploadedAttachment = null;
}

function handleConversationData(data) {
    if (data.error) {
        showDialog("Error", data.message);
    } else {
        (async () => {
            const cid = getConversationIdFromURL();
            await ensureConversationParticipants(cid || data?.conversation?.c_id);
            updateChatContainer(data.messages);

            // Load canvas state for this chat (even if canvas panel is closed)
            setCanvasConversationId(cid || data?.conversation?.c_id);
        })();
        // Remove loading spinner if exists
        const loading = document.getElementById("conversation-loading");
        if (loading) loading.remove();
    }
}

function updateConversationsList(conversations) {
    lastConversationsList = Array.isArray(conversations) ? conversations : [];

    // Update sidebar with conversations list
    const sidebarContainer = document.querySelector(".conversations-list");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = "";
        conversations.forEach((conv) => {
            const convElement = createConversationElement(conv);
            sidebarContainer.appendChild(convElement);
        });
    }

    renderConversationGallery(lastConversationsList);
}

function createConversationElement(conversation) {
    const id = conversation.conversation_id;
    const wrapper = document.createElement("div");
    wrapper.className = "sidebar-item-wrapper";
    wrapper.style.display = "block";

    wrapper.innerHTML = `
        <div class="sidebar-item">
            <button type="button" class="sidebar-conv-link" data-conversation-id="${id}">
                <span>${conversation.title}</span>
            </button>
            <button class="menu-toggle" data-menu-id="menu-${id}">⋮</button>
        </div>
        <div class="menu" id="menu-${id}" style="display:none;">
            <button onclick="deleteConversation('${id}')">Delete</button>
        </div>
    `;

    const linkBtn = wrapper.querySelector('.sidebar-conv-link');
    linkBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToConversation(id);
    });
    return wrapper;
}

function getConversationIdFromURL() {
    const url = window.location.href;
    const match = url.match(/(\d+)(?!.*\d)/);
    return match ? parseInt(match[1]) : null;
}

function getShareTokenFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get('share');
    } catch (e) {
        return null;
    }
}

async function acceptShareLink(token) {
    if (!token) return { error: true, message: 'Missing share token' };
    try {
        const response = await fetch(`${EFFECTIVE_NODE_API_BASE}/api/conversations/accept-share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ token })
        });
        const data = await safeJson(response);
        return data;
    } catch (error) {
        console.error('acceptShareLink failed:', error);
        return { error: true, message: 'Unable to accept share link' };
    }
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

            // If we're about to hide the sidebar while focus is inside it,
            // move focus to a safe element first to avoid aria-hidden warnings.
            if (!open) {
                const active = document.activeElement;
                if (active && sidebar.contains(active)) {
                    const messageInput = document.getElementById('message-input');
                    if (messageInput) messageInput.focus();
                    else if (toggleSidebarBtn) toggleSidebarBtn.focus();
                    else document.body.focus?.();
                }
            }

      if (open) {
        sidebar.classList.remove("hidden");
                sidebar.setAttribute("aria-hidden", "false");
                // Allow focus/interaction when visible
                try {
                    sidebar.inert = false;
                } catch (_) {}
        // hide open button (since sidebar is open)
        if (toggleSidebarBtn) toggleSidebarBtn.style.display = "none";
      } else {
        sidebar.classList.add("hidden");
                sidebar.setAttribute("aria-hidden", "true");
                // Prevent focus/interaction while hidden
                try {
                    sidebar.inert = true;
                } catch (_) {}
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

    // Collaborative mic toggle button (register once)
    const collabMicBtn = document.getElementById('collab-mic-toggle');
    if (collabMicBtn) {
        collabMicBtn.addEventListener('click', async () => {
            const cid = getConversationIdFromURL();
            if (!cid || !isCollaborativeChatActive()) return;
            try {
                // Toggle talk <-> listen (stay connected)
                if (!collabVoice.enabled || collabVoice.mode === 'off') {
                    await enableCollabVoiceListen(cid);
                    return;
                }

                if (collabVoice.mode === 'talk') {
                    await enableCollabVoiceListen(cid);
                } else {
                    await enableCollabVoiceTalk(cid);
                }
            } catch (e) {
                showDialog('Mic', e?.message || 'Unable to access microphone');
                await disableCollabVoice();
            }
        });
    }

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

        // Position dropdown above textarea (shared for both suggestion types)
        function positionDropdown() {
            const inputRect = messageInput.getBoundingClientRect();
            const formRect = chatForm.getBoundingClientRect();
            suggestionsDropdown.style.display = "block";
            suggestionsDropdown.style.left = `${inputRect.left - formRect.left}px`;
            suggestionsDropdown.style.top = `${inputRect.top - formRect.top - suggestionsDropdown.offsetHeight - 10}px`;
        }

        // Collaborative @mention suggestions
        if (window.isCollaborativeChat) {
            updateMentionState(messageInput, suggestionsDropdown);
            if (mentionState.active) {
                positionDropdown();
                return;
            }
        }

        // Non-collab: keep existing @ prompt suggestions
        const lastAtIndex = textBeforeCursor.lastIndexOf("@");
        if (lastAtIndex !== -1 && (cursorPos === lastAtIndex + 1 || textBeforeCursor.endsWith("@"))) {
            suggestionsDropdown.innerHTML = "";
            suggestions.forEach((item) => {
                const div = document.createElement("div");
                div.textContent = item;
                div.classList.add("ghost-style");
                div.onclick = () => insertSuggestion(item);
                suggestionsDropdown.appendChild(div);
            });
            positionDropdown();
        } else {
            suggestionsDropdown.style.display = "none";
        }

        function insertSuggestion(text) {
            const cursorPos2 = messageInput.selectionStart;
            const value = messageInput.value;
            const atIndex = value.lastIndexOf("@", cursorPos2);
            const before = value.substring(0, atIndex);
            const after = value.substring(cursorPos2);
            const insertedText = text + " ; ";
            messageInput.value = before + insertedText + after;
            const newPos = (before + insertedText).length;
            messageInput.focus();
            messageInput.setSelectionRange(newPos, newPos);
            suggestionsDropdown.style.display = "none";
        }
    });

    
    messageInput.addEventListener("keydown", function (e) {
        // Handle mention dropdown navigation/selection
        if (isMentionDropdownOpen(suggestionsDropdown)) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                mentionState.selectedIndex = Math.min(mentionState.items.length - 1, mentionState.selectedIndex + 1);
                renderMentionDropdown(suggestionsDropdown);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                mentionState.selectedIndex = Math.max(0, mentionState.selectedIndex - 1);
                renderMentionDropdown(suggestionsDropdown);
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                applySelectedMention();
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                mentionState.active = false;
                suggestionsDropdown.style.display = 'none';
                return;
            }
        }

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
        messageInput.value = "";

        try {
            let didSkipAI = false;

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

            // Collaborative chat rule:
            // - AI NEVER responds in group chats unless the user explicitly mentions @apilageai.
            // - Mentioning collaborators does not trigger AI.
            const mentionedUserIds = currentConversationId ? extractMentionedUserIdsFromText(message) : [];
            const shouldSkipAI = !!currentConversationId && !!window.isCollaborativeChat && !hasApilageAiMention(message);
            const aiText = hasApilageAiMention(message) ? stripApilageAiMention(message) : message;

            if (!currentConversationId) {
                title = await generateTitleWithapilageai(aiText || message);
                if (!title) {
                    throw new Error("Failed to generate conversation title");
                }
            }

            if (shouldSkipAI) {
                // Plain user message, broadcast to collaborators; no AI stream.
                socket.emit('send_user_message', {
                    text: message,
                    attachment: attachment,
                    conversation_id: currentConversationId,
                    mentioned_user_ids: mentionedUserIds,
                });
                didSkipAI = true;
            } else {
                // Determine which model to use
                const selectedModel = window.selectedModel || window.defaultModel || "free";

                const payload = {
                    text: aiText || message,
                    title: title,
                    attachment: attachment,
                    conversation_id: currentConversationId,
                    model: selectedModel
                };

                // Provide canvas snapshot (if any) so AI can read the canvas.
                const canvasImage = getCanvasSnapshotDataUrl();
                if (canvasImage) payload.canvas_image = canvasImage;

                // Provide canvas document text (Word-like canvas) so AI can read it.
                const canvasDocText = getCanvasDocPlainText();
                if (canvasDocText) payload.canvas_doc_text = canvasDocText;

                // Send message via Socket.IO with STREAMING and model info
                socket.emit("new_message_stream", payload);
            }

            // After sending, clear the input and attachment preview fully
            messageInput.value = "";
            clearAttachments();
            if (previewWrapper) {
                previewWrapper.innerHTML = "";
                previewWrapper.style.display = "none";
            }

            // If we skipped AI (mentions), unlock input immediately.
            // Otherwise, AI streaming uses conversation_lock + stream_complete for unlocking.
            if (didSkipAI) {
                enableMessageInput();
            }
        } catch (error) {
            // Clean up UI loading states
            clearTimeout(typingTimeout);
            clearInterval(stageInterval);
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

    messageInput.addEventListener("input", function () {
    const isStreaming = !!currentStreamingMessage;
    sendButton.disabled = (this.value.trim() === "" || isStreaming);
    sendButton.classList.toggle("text-muted", sendButton.disabled);
    sendButton.classList.toggle("text-primary", !sendButton.disabled);
});

    // Handle Enter key for submission
    messageInput.addEventListener("keydown", function (e) {
        if (isMentionDropdownOpen(suggestionsDropdown)) {
            if (e.key === 'Enter') {
                e.preventDefault();
                applySelectedMention();
                return;
            }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                mentionState.selectedIndex = Math.min(mentionState.items.length - 1, mentionState.selectedIndex + 1);
                renderMentionDropdown(suggestionsDropdown);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                mentionState.selectedIndex = Math.max(0, mentionState.selectedIndex - 1);
                renderMentionDropdown(suggestionsDropdown);
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                mentionState.active = false;
                suggestionsDropdown.style.display = 'none';
                return;
            }
        }
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            chatForm.dispatchEvent(new Event("submit"));
        }
    });

    fileAttach.addEventListener("click", () => {
        fileInput.click();
    });

    // Handle shared links and load conversation
    (async () => {
        const shareToken = getShareTokenFromURL();
        const urlConversationId = getConversationIdFromURL();

        if (shareToken) {
            const result = await acceptShareLink(shareToken);
            if (!result.error && result.conversation_id) {
                const nextUrl = new URL(window.location.href);
                nextUrl.searchParams.delete('share');
                nextUrl.pathname = `/app/chat/${result.conversation_id}`;
                window.history.replaceState({}, '', nextUrl.toString());
                navigateToConversation(result.conversation_id, { push: false });
                return;
            }
            showDialog('Share link', result.message || 'Unable to accept share link.');
        }

        if (urlConversationId) {
            loadConversation(urlConversationId);
        }
    })();

    // ===============================
    // Reset input box after sending message
    // ===============================
    if (chatForm && messageInput) {
      chatForm.addEventListener("submit", () => {
        setTimeout(() => {
          messageInput.style.height = "46px"; // Reset to default height
        }, 150);
      });
    }

    // ===============================
    // Truncate long user messages with "Show full" toggle
    // ===============================
    function handleLongUserMessage(bubbleElement) {
      const messageText = bubbleElement.querySelector("p");
      if (!messageText) return;

      // Measure 2 lines of text
      const lineHeight = parseFloat(window.getComputedStyle(messageText).lineHeight);
      const maxHeight = lineHeight * 2;

      if (messageText.scrollHeight > maxHeight + 5) {
        messageText.style.display = "-webkit-box";
        messageText.style.webkitLineClamp = "2";
        messageText.style.webkitBoxOrient = "vertical";
        messageText.style.overflow = "hidden";
        messageText.style.textOverflow = "ellipsis";

        // Create show full button
        const showFullBtn = document.createElement("span");
        showFullBtn.className = "show-full-btn";
        showFullBtn.textContent = "Show full ▼";
        showFullBtn.style.display = "inline-block";
        showFullBtn.style.color = "var(--primary-red)";
        showFullBtn.style.fontSize = "0.85rem";
        showFullBtn.style.marginTop = "4px";
        showFullBtn.style.cursor = "pointer";
        showFullBtn.style.userSelect = "none";

        showFullBtn.addEventListener("click", () => {
          const isExpanded = bubbleElement.classList.toggle("expanded");
          if (isExpanded) {
            messageText.style.webkitLineClamp = "unset";
            messageText.style.overflow = "visible";
            showFullBtn.textContent = "Hide ▲";
          } else {
            messageText.style.webkitLineClamp = "2";
            messageText.style.overflow = "hidden";
            showFullBtn.textContent = "Show full ▼";
          }
        });

        bubbleElement.appendChild(showFullBtn);
      }
    }

    // Hook into chat bubble creation
    const originalCreateOrUpdateBubble = chatBubbleManager.createOrUpdateBubble.bind(chatBubbleManager);
    chatBubbleManager.createOrUpdateBubble = function(messageData, options = {}) {
      const bubble = originalCreateOrUpdateBubble(messageData, options);
      if (bubble && parseInt(messageData.type || messageData.t, 10) === 1) {
        handleLongUserMessage(bubble);
      }
      return bubble;
    };
});

// Update chat container with new messages
function updateChatContainer(messages) {
    // For bot messages, we need to find the corresponding user message ID (the previous user message)
    // Messages are ordered by message_id ASC, so the user message comes before the bot message
    let lastUserMessageId = null;
    
    messages.forEach((messageData, index) => {
        const messageType = parseInt(messageData.type || messageData.t, 10);
        
        // If this is a user message (type 1), track its ID
        if (messageType === 1) {
            lastUserMessageId = messageData.message_id || messageData.m_id;
        }
        // If this is a bot message (type 2), attach the previous user message ID
        else if (messageType === 2 && lastUserMessageId) {
            messageData.user_message_id = lastUserMessageId;
        }
        
        // Also add conversation_id from URL if not present
        if (!messageData.conversation_id) {
            messageData.conversation_id = getConversationIdFromURL();
        }
        
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
    // Preserve inline citations before markdown parsing
    const citationPlaceholders = [];
    
    // Preserve citation groups
    text = text.replace(/<sup class="citation-group">[\s\S]*?<\/sup>/g, (match) => {
        const placeholder = `CITATIONPLACEHOLDER${citationPlaceholders.length}ENDCITATION`;
        citationPlaceholders.push(match);
        return placeholder;
    });
    
    // Also preserve individual inline citation links
    text = text.replace(/<a[^>]*class="inline-citation"[^>]*>[\s\S]*?<\/a>/g, (match) => {
        const placeholder = `CITATIONPLACEHOLDER${citationPlaceholders.length}ENDCITATION`;
        citationPlaceholders.push(match);
        return placeholder;
    });

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
    
    // Restore citation placeholders after markdown parsing
    for (let i = 0; i < citationPlaceholders.length; i++) {
        const placeholder = `CITATIONPLACEHOLDER${i}ENDCITATION`;
        text = text.split(placeholder).join(citationPlaceholders[i]);
    }

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
    // Download button for AI images with watermark
    const downloadBtn = chatBubble.querySelector(".message-download");
    if (downloadBtn) {
        downloadBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (downloadBtn.classList.contains("downloading")) return;
            downloadBtn.classList.add("downloading");

            const imgEl = chatBubble.querySelector("img");
            if (imgEl && imgEl.src) {
                const img = new Image();
                img.crossOrigin = "anonymous";
                img.src = imgEl.src;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = img.width;
                    canvas.height = img.height;

                    // Draw original image
                    ctx.drawImage(img, 0, 0);

                    // Add watermark
                    const fontSize = Math.floor(canvas.width * 0.04); // 4% of width
                    ctx.font = `${fontSize}px Arial`;
                    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
                    ctx.textAlign = "right";
                    ctx.textBaseline = "bottom";
                    ctx.fillText("ApilageAI", canvas.width - 20, canvas.height - 20);

                    // Create download link
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = "ApilageAI_Image.png";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
            }
            setTimeout(() => downloadBtn.classList.remove("downloading"), 800);
        });
    }
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
            const imagePreview = document.getElementById("bugImagePreview");

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

    // Regenerate button (refresh icon)
    const regenerateButton = chatBubble.querySelector(".message-regenerate");
    if (regenerateButton) {
        regenerateButton.addEventListener("click", async () => {
            const messageId = regenerateButton.dataset.messageId;
            const userMessageId = regenerateButton.dataset.userMessageId;
            const conversationId = regenerateButton.dataset.conversationId || getConversationIdFromURL();
            
            if (!conversationId) {
                showDialog("Error", "Cannot regenerate: conversation not found.");
                return;
            }

            try {
                // Get the user message text from the previous message
                const userMessageEl = document.querySelector(`[data-m-id="${userMessageId}"]`);
                let userText = '';
                if (userMessageEl) {
                    const textEl = userMessageEl.querySelector('p');
                    if (textEl) {
                        userText = textEl.textContent || textEl.innerText || '';
                    }
                }
                
                if (!userText) {
                    showDialog("Error", "Cannot regenerate: original message not found.");
                    return;
                }

                // Show regenerating state
                chatBubble.classList.add('streaming');
                chatBubble.innerHTML = `
                    <div class="thinking-status" style="color: #888888; font-size: 13px; margin-bottom: 2px;">Regenerating...</div>
                    <p class="streaming-content">
                        <img src="https://apilageai.lk/assets/images/blinker.gif" alt="typing cursor" style="width: 15px; height: auto; vertical-align: bottom; margin-right: 5px;" />
                    </p>
                `;
                
                // Emit regenerate request to backend
                socket.emit('regenerate_message', {
                    conversation_id: conversationId,
                    message_id: messageId,
                    user_message_id: userMessageId,
                    text: userText,
                    model: window.selectedModel || 'auto'
                });

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

            const questions = await analyzeWithapilageai(
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

// Share modal logic
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('share-modal');
    if (!modal) return;

    const SHARE_API_BASE = EFFECTIVE_NODE_API_BASE;

    const searchInput = document.getElementById('share-search-input');
    const searchResults = document.getElementById('share-search-results');
    const participantsBox = document.getElementById('share-participants');
    const linkRow = document.getElementById('share-link-row');
    const linkInput = document.getElementById('share-link-input');
    const copyBtn = document.getElementById('copy-share-link-btn');
    const statusEl = document.getElementById('share-modal-status');
    const closeBtn = document.getElementById('share-modal-close');
    const openSidebarBtn = document.getElementById('open-share-modal');

    const shareState = { conversationId: null };
    let viewerIsOwner = false;
    let searchTimer = null;

    const setStatus = (message = '', type = 'info') => {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.dataset.type = type;
    };

    const clearStatus = () => setStatus('');

    const renderParticipants = (participants = []) => {
        if (!participantsBox) return;
        if (!participants.length) {
            participantsBox.innerHTML = '<div class="share-empty">Not shared yet.</div>';
            return;
        }

        const pills = participants.map((p) => {
            const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'User';
            const role = (p.role || 'collaborator').toLowerCase();
            const avatar = p.image ? `https://apilageai.lk${p.image}` : 'https://apilageai.lk/assets/images/user.png';

            const canRemove = viewerIsOwner && role !== 'owner' && window.userData && Number(p.user_id) !== Number(window.userData.id);
            return `
                <div class="share-pill" title="${name}">
                    <img src="${avatar}" alt="${name}" onerror="this.src='https://apilageai.lk/assets/images/user.png';" />
                    <div class="share-pill-meta">
                        <div class="share-pill-name">${name}</div>
                        <div class="share-pill-role">${role}</div>
                    </div>
                    ${canRemove ? `<button type="button" class="share-remove-btn" data-remove-user="${p.user_id}" title="Remove">Remove</button>` : ''}
                </div>
            `;
        });
        participantsBox.innerHTML = pills.join('');
    };

    const removeParticipant = async (targetUserId) => {
        if (!shareState.conversationId) return;
        setStatus('Removing collaborator...', 'info');
        try {
            const resp = await fetch(`${SHARE_API_BASE}/api/conversations/${shareState.conversationId}/participants/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ target_user_id: Number(targetUserId) })
            });
            const data = await safeJson(resp);
            if (data.error) {
                setStatus(data.message || 'Unable to remove collaborator.', 'error');
                return;
            }
            setStatus('Collaborator removed.', 'success');
            loadParticipants();
        } catch (e) {
            console.error('removeParticipant error:', e);
            setStatus('Unable to remove collaborator.', 'error');
        }
    };

    const renderResults = (users = []) => {
        if (!searchResults) return;
        if (!users.length) {
            searchResults.innerHTML = '<div class="share-empty">No users found.</div>';
            return;
        }

        const items = users.map((u) => {
            const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User';
            const avatar = u.image ? `https://apilageai.lk${u.image}` : 'https://apilageai.lk/assets/images/user.png';
            return `
                <div class="share-result" data-share-user="${u.id}" data-share-name="${name}">
                    <div class="share-result-left">
                        <img src="${avatar}" alt="${name}" onerror="this.src='https://apilageai.lk/assets/images/user.png';" />
                        <div class="share-result-text">
                            <div class="share-name">${name}</div>
                            <div class="share-email">${u.email || ''}</div>
                        </div>
                    </div>
                    <button type="button" class="share-add-btn" data-share-user="${u.id}" data-share-name="${name}">Share</button>
                </div>
            `;
        });
        searchResults.innerHTML = items.join('');
    };

    const setShareLink = async (link) => {
        if (!linkRow || !linkInput) return;
        linkInput.value = link;
        linkRow.classList.remove('hidden');
        try {
            await navigator.clipboard.writeText(link);
            setStatus('Link copied to clipboard.', 'success');
        } catch (err) {
            console.warn('Clipboard copy failed:', err);
        }
    };

    const loadParticipants = async () => {
        if (!shareState.conversationId) return;
        try {
            const resp = await fetch(`${SHARE_API_BASE}/api/conversations/${shareState.conversationId}/participants`, {
                credentials: 'include'
            });
            const data = await safeJson(resp);
            if (data.error) {
                setStatus(data.message || 'Unable to load participants.', 'error');
                return;
            }
            viewerIsOwner = !!data.viewer_is_owner;
            renderParticipants(data.participants || []);
        } catch (error) {
            console.error('loadParticipants error:', error);
            setStatus('Unable to load participants.', 'error');
        }
    };

    const searchUsers = async (term) => {
        if (!term) {
            searchResults.innerHTML = '';
            return;
        }
        if (!shareState.conversationId) {
            setStatus('Open a chat first to share it.', 'error');
            return;
        }
        try {
            const resp = await fetch(`${SHARE_API_BASE}/api/users/search?q=${encodeURIComponent(term)}`, {
                credentials: 'include'
            });
            const data = await safeJson(resp);
            renderResults(data.users || []);
        } catch (error) {
            console.error('searchUsers error:', error);
            setStatus('Search failed. Try again.', 'error');
        }
    };

    const shareWithUser = async (userId, userName = 'user') => {
        if (!shareState.conversationId) {
            setStatus('Open a chat first to share it.', 'error');
            return;
        }
        setStatus('Sharing...', 'info');
        try {
            const resp = await fetch(`${SHARE_API_BASE}/api/conversations/${shareState.conversationId}/share`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ target_user_id: Number(userId) })
            });
            const data = await safeJson(resp);
            if (data.error) {
                setStatus(data.message || 'Unable to share this chat.', 'error');
                return;
            }
            if (data.share_link) await setShareLink(data.share_link);
            setStatus(`Shared with ${userName}.`, 'success');
            loadParticipants();
        } catch (error) {
            console.error('shareWithUser error:', error);
            setStatus('Unable to share this chat.', 'error');
        }
    };

    const openModal = (conversationId = null) => {
        const resolvedId = conversationId || getConversationIdFromURL();
        shareState.conversationId = resolvedId;
        linkRow?.classList.add('hidden');
        if (linkInput) linkInput.value = '';
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.innerHTML = '';
        clearStatus();

        if (!resolvedId) {
            setStatus('Open or select a chat to share.', 'error');
        } else {
            loadParticipants();
        }

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        searchInput?.focus();
    };

    const closeModal = () => {
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
    };

    window.shareConversation = (conversationId = null) => openModal(conversationId);
    openSidebarBtn?.addEventListener('click', () => openModal());
    closeBtn?.addEventListener('click', closeModal);

    searchInput?.addEventListener('input', () => {
        clearTimeout(searchTimer);
        const term = searchInput.value.trim();
        searchTimer = setTimeout(() => searchUsers(term), 220);
    });

    searchResults?.addEventListener('click', (e) => {
        const target = e.target.closest('[data-share-user]');
        if (!target) return;
        const userId = target.dataset.shareUser;
        const userName = (target.dataset.shareName || '').trim() || 'user';
        shareWithUser(userId, userName);
    });

    participantsBox?.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-remove-user]');
        if (!btn) return;
        const targetUserId = btn.dataset.removeUser;
        if (!targetUserId) return;
        removeParticipant(targetUserId);
    });

    copyBtn?.addEventListener('click', async () => {
        if (!linkInput || !linkInput.value) return;
        try {
            await navigator.clipboard.writeText(linkInput.value);
            setStatus('Link copied to clipboard.', 'success');
        } catch (error) {
            console.error('Copy failed:', error);
            setStatus('Copy failed. Try selecting and copying manually.', 'error');
        }
    });
});

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

// ===== Voice signaling events =====
socket.on('voice_peers', async (data) => {
    if (!collabVoice.enabled) return;
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const peers = Array.isArray(data?.peers) ? data.peers : [];
    for (const p of peers) {
        const sid = p?.socket_id;
        const uid = Number(p?.user_id || 0);
        if (!sid) continue;
        const entry = await ensurePeerConnection(sid);
        if (!entry) continue;
        entry.remoteUserId = uid || entry.remoteUserId;
        entry.polite = isPolitePeer(uid, sid);
        if (shouldInitiateOffer(uid, sid)) {
            await createOfferTo(sid);
        }
    }
});

socket.on('voice_peer_joined', async (data) => {
    if (!collabVoice.enabled) return;
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const sid = data?.socket_id;
    const uid = Number(data?.user_id || 0);
    if (!sid) return;
    const entry = await ensurePeerConnection(sid);
    if (!entry) return;
    entry.remoteUserId = uid || entry.remoteUserId;
    entry.polite = isPolitePeer(uid, sid);
    if (shouldInitiateOffer(uid, sid)) {
        await createOfferTo(sid);
    }
});

socket.on('voice_peer_left', (data) => {
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const sid = data?.socket_id;
    if (!sid) return;
    closePeer(sid);
});

socket.on('voice_offer', async (data) => {
    if (!collabVoice.enabled) return;
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const fromSid = data?.from_socket_id;
    const fromUid = Number(data?.from_user_id || 0);
    if (!fromSid || !data?.sdp) return;
    const entry = await ensurePeerConnection(fromSid);
    if (!entry) return;

    entry.remoteUserId = fromUid || entry.remoteUserId;
    entry.polite = isPolitePeer(entry.remoteUserId, fromSid);

    try {
        const desc = new RTCSessionDescription(data.sdp);
        const offerCollision = desc.type === 'offer' && (entry.makingOffer || entry.pc.signalingState !== 'stable');
        entry.ignoreOffer = !entry.polite && offerCollision;
        if (entry.ignoreOffer) return;

        if (offerCollision) {
            // Rollback our local offer so we can accept theirs
            try {
                await entry.pc.setLocalDescription({ type: 'rollback' });
            } catch (_) {
                // ignore
            }
        }

        await entry.pc.setRemoteDescription(desc);

        // Apply any queued ICE now that remote description exists
        if (entry.pendingCandidates?.length) {
            const queued = entry.pendingCandidates.slice();
            entry.pendingCandidates.length = 0;
            for (const c of queued) {
                try {
                    await entry.pc.addIceCandidate(c);
                } catch (_) {}
            }
        }

        const answer = await entry.pc.createAnswer();
        await entry.pc.setLocalDescription(answer);
        socket.emit('voice_answer', {
            conversation_id: collabVoice.conversationId,
            to_socket_id: fromSid,
            sdp: entry.pc.localDescription,
        });
    } catch (_) {
        // ignore
    }
});

socket.on('voice_answer', async (data) => {
    if (!collabVoice.enabled) return;
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const fromSid = data?.from_socket_id;
    const fromUid = Number(data?.from_user_id || 0);
    if (!fromSid || !data?.sdp) return;
    const entry = collabVoice.peers.get(fromSid);
    if (!entry) return;

    entry.remoteUserId = fromUid || entry.remoteUserId;
    entry.polite = isPolitePeer(entry.remoteUserId, fromSid);

    // Only apply an answer if we're actually expecting one.
    if (entry.pc.signalingState !== 'have-local-offer') return;
    try {
        await entry.pc.setRemoteDescription(new RTCSessionDescription(data.sdp));

        // Apply any queued ICE now that remote description exists
        if (entry.pendingCandidates?.length) {
            const queued = entry.pendingCandidates.slice();
            entry.pendingCandidates.length = 0;
            for (const c of queued) {
                try {
                    await entry.pc.addIceCandidate(c);
                } catch (_) {}
            }
        }
    } catch (_) {
        // ignore
    }
});

socket.on('voice_ice', async (data) => {
    if (!collabVoice.enabled) return;
    if (Number(data?.conversation_id) !== Number(collabVoice.conversationId)) return;
    const fromSid = data?.from_socket_id;
    if (!fromSid || !data?.candidate) return;
    const entry = collabVoice.peers.get(fromSid);
    if (!entry) return;
    try {
        const cand = new RTCIceCandidate(data.candidate);
        if (!entry.pc.remoteDescription) {
            entry.pendingCandidates = entry.pendingCandidates || [];
            entry.pendingCandidates.push(cand);
            return;
        }
        await entry.pc.addIceCandidate(cand);
    } catch (_) {}
});

socket.on('voice_speaking', (data) => {
    const cid = Number(data?.conversation_id);
    if (!cid || cid !== Number(getConversationIdFromURL())) return;
    const userId = Number(data?.user_id);
    if (!userId) return;
    const speaking = !!data?.speaking;
    if (speaking) collabVoice.speakingUsers.add(userId);
    else collabVoice.speakingUsers.delete(userId);
    updateSpeakingIndicator();
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

// Theme toggle (improved version with class, attribute, icon, and persistence)
document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.getElementById("theme-toggle");
    if (!themeToggle) return;

    const lightIcon = themeToggle.querySelector(".light-icon");
    const darkIcon = themeToggle.querySelector(".dark-icon");
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    // Determine initial theme
    const savedTheme = localStorage.getItem("theme") || (prefersDarkScheme.matches ? "dark" : "light");

    function applyTheme(theme) {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.setAttribute("data-theme", "dark");
            lightIcon.style.display = "inline";
            darkIcon.style.display = "none";
        } else {
            document.documentElement.classList.remove("dark");
            document.documentElement.setAttribute("data-theme", "light");
            lightIcon.style.display = "none";
            darkIcon.style.display = "inline";
        }
        localStorage.setItem("theme", theme);
    }

    applyTheme(savedTheme);

    themeToggle.addEventListener("click", function (e) {
        e.preventDefault();
        const currentTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
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

// apilageai integration functions
async function analyzeWithapilageai(prompt, context) {
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

// Title generation with apilageai
async function generateTitleWithapilageai(message) {
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
// Switch between tabs
// ==================================================
document.getElementById("open-conversation-gallery")?.addEventListener("click", () => {
    showGalleryView();

    renderConversationGallery(lastConversationsList);
    scheduleConversationsRefresh();
});

document.getElementById('conversation-search-input')?.addEventListener('input', () => {
    renderConversationGallery(lastConversationsList);
});

document.getElementById('conversation-sort-select')?.addEventListener('change', () => {
    renderConversationGallery(lastConversationsList);
});

window.addEventListener('popstate', () => {
    const path = window.location.pathname || '';
    const m = path.match(/\/app\/chat\/(\d+)/);
    if (m) {
        navigateToConversation(Number(m[1]), { push: false });
    } else {
        navigateToHome({ push: false });
    }
});

document.querySelectorAll('.new-chat-btn').forEach((el) => {
    el.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToHome();
    });
});

(function initAppUxEnhancements() {
    const init = () => {
        // Let the UI paint once, then fade out overlay.
        window.setTimeout(hideAppLoadingOverlay, 0);
        setupKeyboardShortcuts();
        try { initCanvasUi(); } catch (e) { console.error('initCanvasUi failed', e); }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
// ==================================================
// Q and A in sidebar
// ==================================================

async function analyzeWithapilageai(prompt, context) {
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
    if (!sidebar) return;

    // If rightsidebar2 is the canvas, delegate to canvas open/close to avoid double-toggles.
    if (sidebar.classList.contains('canvas-sidebar')) {
        if (isCanvasOpen()) closeCanvas();
        else openCanvas({ fullscreen: false });
        return;
    }

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
    const sidebar2 = document.getElementById('rightsidebar2');
    const isCanvasSidebar = !!sidebar2 && sidebar2.classList.contains('canvas-sidebar');
    if (isCanvasSidebar) return;

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

    document.getElementById('analyzeWithapilageai')?.addEventListener('click', async function () {
        const textarea = document.getElementById('blankSheetTextarea');
        const content = textarea.value.trim();

        if (content) {
            textarea.value = "Generating questions...";
            const questions = await analyzeWithapilageai("", content);
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
        const sidebar2 = document.getElementById('rightsidebar2');
        if (sidebar2 && sidebar2.classList.contains('canvas-sidebar')) {
            openCanvas({ fullscreen: false });
            return;
        }

        const button = e.target.closest('.message-note');
        const message = decodeURIComponent(button.dataset.message);

        const sidebar = document.getElementById('rightsidebar2');
        if (!sidebar.classList.contains('active')) {
            toggleSidebar2();
        }

        switchTab('questions');

        const questionsTab = document.querySelector('#rightsidebar2 #generatedQuestions');
        questionsTab.innerHTML = '<div class="loading">Generating questions...</div>';

        const questions = await analyzeWithapilageai("Generate study questions based on this content:", message);

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


// ===============================
// search option and filter box
// ===============================
 const convSearchInput = document.getElementById('conversation-search-input');
        const convCards = document.querySelectorAll('.conversation-card');

        convSearchInput.addEventListener('input', () => {
            const query = convSearchInput.value.toLowerCase().trim();

            convCards.forEach(card => {
                const title = card.querySelector('.conversation-title').textContent.toLowerCase();

                if (title.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
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

// ==================================================
// Feature Badge Toggle Functionality
// ==================================================
document.addEventListener('DOMContentLoaded', function() {
    const enableThinkBtn = document.getElementById('enebleThink');
    const toggleGraphBtn = document.getElementById('toggleGraphBtn');
    const toggleCanvasBtn = document.getElementById('toggleCanvasBtn');
    const featurePlaceholder = document.getElementById('selected-feature-placeholder');
    
    let activeFeature = null;
    
    const features = {
        deepthink: {
            id: 'deepthink',
            name: 'DeepThink',
            icon: 'fas fa-flask',
            btn: enableThinkBtn
        },
        graph: {
            id: 'graph',
            name: 'Graph',
            icon: 'fas fa-chart-line',
            btn: toggleGraphBtn
        },
        canvas: {
            id: 'canvas',
            name: 'Canvas',
            icon: 'fa-solid fa-pen-to-square',
            btn: toggleCanvasBtn
        }
    };
    
    function createFeatureBadge(feature) {
        const badge = document.createElement('button');
        badge.className = 'feature-badge';
        badge.type = 'button';
        badge.innerHTML = `<i class="${feature.icon}"></i><span class="feature-badge-text">${feature.name}</span>`;
        badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            disableFeature();
        };
        return badge;
    }
    
    function enableFeature(featureKey) {
        // If the same feature is clicked, disable it
        if (activeFeature === featureKey) {
            disableFeature();
            return;
        }
        
        // Disable previous feature if any
        if (activeFeature) {
            disableFeature();
        }
        
        // Enable new feature
        activeFeature = featureKey;
        const feature = features[featureKey];
        featurePlaceholder.innerHTML = '';
        featurePlaceholder.appendChild(createFeatureBadge(feature));
        
        // Add visual indication to button
        feature.btn.style.backgroundColor = 'rgba(229, 57, 53, 0.1)';
        feature.btn.style.color = 'var(--primary-red)';

        if (featureKey === 'canvas') {
            try { if (!isCanvasOpen()) openCanvas({ fullscreen: false }); } catch (_) {}
        }
    }
    
    function disableFeature() {
        if (!activeFeature) return;

        const key = activeFeature;
        const feature = features[key];
        if (feature?.btn) {
            feature.btn.style.backgroundColor = '';
            feature.btn.style.color = '';
        }

        featurePlaceholder.innerHTML = '';
        activeFeature = null;

        if (key === 'canvas') {
            try { if (isCanvasOpen()) closeCanvas(); } catch (_) {}
        }
    }
    
    // Add click listeners to feature buttons
    enableThinkBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        enableFeature('deepthink');
    });
    
    toggleGraphBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        enableFeature('graph');
    });

    toggleCanvasBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        enableFeature('canvas');
    });

    // If canvas is opened/closed from elsewhere, keep the badge in sync.
    document.addEventListener('canvas_opened', () => {
        if (activeFeature !== 'canvas') enableFeature('canvas');
    });
    document.addEventListener('canvas_closed', () => {
        if (activeFeature === 'canvas') disableFeature();
    });
});

// ================================================
// ChatGPT-Style Input Positioning
// ================================================
function updateChatInputPosition() {
    const chatAreaWrapper = document.querySelector('.chat-area-wrapper');
    const messagesContainer = document.getElementById('messages-container');
    const chatStartContainer = document.querySelector('.chat-start-container');
    
    if (!chatAreaWrapper) return;
    
    // Check if there are actual messages or if we're viewing an empty chat
    const hasMessages = messagesContainer && messagesContainer.children.length > 0;
    const showingStartContainer = chatStartContainer && chatStartContainer.offsetParent !== null;
    
    // Empty state = either showing greeting or no messages
    const isEmptyState = showingStartContainer || !messagesContainer;
    
    if (isEmptyState) {
        chatAreaWrapper.classList.add('empty-state');
        chatAreaWrapper.classList.remove('has-messages');
    } else if (hasMessages) {
        chatAreaWrapper.classList.remove('empty-state');
        chatAreaWrapper.classList.add('has-messages');
    }
}

// Initialize position on load
document.addEventListener('DOMContentLoaded', () => {
    updateChatInputPosition();
    
    // Watch for changes in messages
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
        const observer = new MutationObserver(() => {
            updateChatInputPosition();
        });
        observer.observe(messagesContainer, { childList: true, subtree: true });
    }
    
    // Also watch for chat-start-container visibility changes
    const chatStartContainer = document.querySelector('.chat-start-container');
    if (chatStartContainer) {
        const startObserver = new MutationObserver(() => {
            updateChatInputPosition();
        });
        startObserver.observe(chatStartContainer, { attributes: true, style: true });
    }
});

// Also update when page becomes visible
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        updateChatInputPosition();
    }
});
