/**
 * Aura AI - Frontend Core Logic
 * Focus: Streaming, UX Excellence, and Performance.
 */

const state = {
    conversations: [],
    currentId: null,
    isStreaming: false,
    messages: []
};

// --- DOM References ---
const ui = {
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn'),
    chatContainer: document.getElementById('chatContainer'),
    messagesList: document.getElementById('messagesList'),
    welcomeView: document.getElementById('welcomeView'),
    convList: document.getElementById('conversationsList'),
    currentTitle: document.getElementById('currentChatTitle'),
    chatMeta: document.getElementById('chatMeta'),
    sidebar: document.getElementById('sidebar'),
    menuBtn: document.getElementById('menuBtn')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    setupEventListeners();
    autoResizeTextarea();
    
    // Auto-focus input
    ui.userInput.focus();
});

function setupEventListeners() {
    ui.userInput.addEventListener('input', () => {
        autoResizeTextarea();
        ui.sendBtn.disabled = !ui.userInput.value.trim() || state.isStreaming;
    });

    ui.userInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    ui.sendBtn.addEventListener('click', sendMessage);
    
    document.getElementById('newChatBtn').addEventListener('click', startNewChat);
    document.getElementById('resetChat').addEventListener('click', () => {
        if(state.currentId) loadConversation(state.currentId);
    });

    ui.menuBtn.addEventListener('click', () => ui.sidebar.classList.add('open'));
    document.getElementById('sidebarClose').addEventListener('click', () => ui.sidebar.classList.remove('open'));
}

// --- Core Actions ---

async function sendMessage() {
    const content = ui.userInput.value.trim();
    if (!content || state.isStreaming) return;

    // Reset UI for messaging
    ui.userInput.value = '';
    ui.sendBtn.disabled = true;
    ui.welcomeView.style.display = 'none';
    autoResizeTextarea();

    // Create User Message in UI
    appendMessage('user', content);
    
    // Setup AI response placeholder
    const aiMsgId = `ai-${Date.now()}`;
    const aiBubble = appendMessage('ai', '', aiMsgId);
    setStreaming(true);

    try {
        const response = await fetch('/chat/stream', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content,
                conversation_id: state.currentId
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6));
                        
                        if (data.type === 'setup') {
                            if (!state.currentId) {
                                state.currentId = data.conversation_id;
                                updateURL(state.currentId);
                                loadConversations(); // Refresh list
                            }
                        } else if (data.type === 'content') {
                            fullContent += data.content;
                            updateAiBubble(aiMsgId, fullContent);
                        } else if (data.type === 'done') {
                            setStreaming(false);
                        }
                    } catch (e) {
                        console.error('Error parsing SSE:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Chat Error:', error);
        updateAiBubble(aiMsgId, 'Erro ao conectar com a Aura. Verifique se o servidor está ativo.');
        setStreaming(false);
    }
}

async function loadConversations() {
    try {
        const res = await fetch('/conversations');
        const data = await res.json();
        state.conversations = data.conversations;
        renderConvList();
    } catch (e) {
        console.error('Fail to load conversations');
    }
}

async function loadConversation(id) {
    state.currentId = id;
    ui.welcomeView.style.display = 'none';
    ui.messagesList.innerHTML = '<div class="loader">Carregando conversa...</div>';
    
    try {
        const res = await fetch(`/conversation/${id}`);
        const data = await res.json();
        
        ui.messagesList.innerHTML = '';
        data.messages.forEach(msg => {
            appendMessage('user', msg.user_message);
            appendMessage('ai', msg.ai_response);
        });
        
        state.messages = data.messages;
        ui.currentTitle.innerText = data.messages[0]?.user_message.slice(0, 30) + '...' || 'Conversa';
        ui.chatMeta.innerText = `${data.total_messages} mensagens`;
        scrollToBottom();
        renderConvList(); // Refresh active state
    } catch (e) {
        ui.messagesList.innerHTML = 'Houve um problema ao carregar esta conversa.';
    }
}

function startNewChat() {
    state.currentId = null;
    state.messages = [];
    ui.messagesList.innerHTML = '';
    ui.welcomeView.style.display = 'flex';
    ui.currentTitle.innerText = 'Aura AI';
    ui.chatMeta.innerText = 'Novo chat';
    ui.userInput.focus();
    renderConvList();
}

// --- UI Helpers ---

function appendMessage(role, content, id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    if (id) msgDiv.id = id;
    
    const icon = role === 'user' ? 'user' : 'bot';
    
    msgDiv.innerHTML = `
        <div class="avatar"><i data-lucide="${icon}"></i></div>
        <div class="bubble">${marked.parse(content)}</div>
    `;
    
    ui.messagesList.appendChild(msgDiv);
    lucide.createIcons();
    scrollToBottom();
    return msgDiv;
}

function updateAiBubble(id, content) {
    const bubble = document.querySelector(`#${id} .bubble`);
    if (bubble) {
        bubble.innerHTML = marked.parse(content);
        // Apply syntax highlighting
        bubble.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });
        scrollToBottom();
    }
}

function renderConvList() {
    ui.convList.innerHTML = state.conversations.map(c => `
        <div class="conversation-item ${c.id === state.currentId ? 'active' : ''}" onclick="loadConversation('${c.id}')">
            <i data-lucide="message-square" class="conv-icon"></i>
            <span class="conv-title">${c.title}</span>
        </div>
    `).join('');
    lucide.createIcons();
}

function setStreaming(isStreaming) {
    state.isStreaming = isStreaming;
    ui.sendBtn.disabled = isStreaming;
    if (isStreaming) {
        ui.sendBtn.innerHTML = '<div class="typing"><span></span><span></span><span></span></div>';
    } else {
        ui.sendBtn.innerHTML = '<i data-lucide="send"></i>';
        lucide.createIcons();
    }
}

function scrollToBottom() {
    ui.chatContainer.scrollTop = ui.chatContainer.scrollHeight;
}

function autoResizeTextarea() {
    ui.userInput.style.height = 'auto';
    ui.userInput.style.height = (ui.userInput.scrollHeight) + 'px';
}

function setPrompt(text) {
    ui.userInput.value = text;
    ui.userInput.focus();
    autoResizeTextarea();
    ui.sendBtn.disabled = false;
}

function updateURL(id) {
    const url = new URL(window.location);
    url.searchParams.set('c', id);
    window.history.pushState({}, '', url);
}

function closeModal() {
    document.getElementById('confirmModal').style.display = 'none';
}
