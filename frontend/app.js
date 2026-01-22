/**
 * Chatbot IA - Frontend Application
 * Professional grade chat interface
 * @version 1.0.0
 */

// ============================================
// Configuration & State Management
// ============================================

const CONFIG = {
    API_URL: 'http://localhost:8000',
    MAX_MESSAGE_LENGTH: 2000,
    AUTO_SCROLL: true,
    SOUND_ENABLED: true,
    THEME: 'dark',
    STORAGE_KEY: 'chatbot-ia-settings',
};

const state = {
    currentConversationId: null,
    conversations: [],
    messages: [],
    isLoading: false,
    isTyping: false,
    apiStatus: 'checking',
};

// ============================================
// DOM Elements
// ============================================

const elements = {
    // Sidebar
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    conversationsList: document.getElementById('conversationsList'),
    refreshConversations: document.getElementById('refreshConversations'),
    statusIndicator: document.getElementById('statusIndicator'),
    settingsBtn: document.getElementById('settingsBtn'),

    // Main Content
    chatTitle: document.getElementById('chatTitle'),
    chatSubtitle: document.getElementById('chatSubtitle'),
    welcomeScreen: document.getElementById('welcomeScreen'),
    messagesContainer: document.getElementById('messagesContainer'),
    chatContainer: document.getElementById('chatContainer'),

    // Input
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    charCount: document.getElementById('charCount'),

    // Header Actions
    exportBtn: document.getElementById('exportBtn'),
    deleteBtn: document.getElementById('deleteBtn'),

    // Modals
    settingsModal: document.getElementById('settingsModal'),
    deleteModal: document.getElementById('deleteModal'),
    closeSettings: document.getElementById('closeSettings'),
    closeDelete: document.getElementById('closeDelete'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings'),
    cancelDelete: document.getElementById('cancelDelete'),
    confirmDelete: document.getElementById('confirmDelete'),

    // Settings Form
    apiUrl: document.getElementById('apiUrl'),
    soundEnabled: document.getElementById('soundEnabled'),
    autoScroll: document.getElementById('autoScroll'),
    themeOptions: document.querySelectorAll('.theme-option'),

    // Misc
    toastContainer: document.getElementById('toastContainer'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    featureCards: document.querySelectorAll('.feature-card'),
};

// ============================================
// API Service
// ============================================

const api = {
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_URL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                ...options,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `HTTP Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Não foi possível conectar ao servidor');
            }
            throw error;
        }
    },

    async checkHealth() {
        return this.request('/health');
    },

    async sendMessage(content, conversationId = null) {
        return this.request('/chat', {
            method: 'POST',
            body: JSON.stringify({
                content,
                conversation_id: conversationId,
            }),
        });
    },

    async getConversation(conversationId) {
        return this.request(`/conversation/${conversationId}`);
    },

    async deleteConversation(conversationId) {
        return this.request(`/conversation/${conversationId}`, {
            method: 'DELETE',
        });
    },

    async resetConversation(conversationId) {
        return this.request(`/conversation/${conversationId}/reset`, {
            method: 'POST',
        });
    },
};

// ============================================
// Storage Service
// ============================================

const storage = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save to localStorage:', e);
        }
    },

    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.warn('Failed to load from localStorage:', e);
            return defaultValue;
        }
    },

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('Failed to remove from localStorage:', e);
        }
    },
};

// ============================================
// UI Utilities
// ============================================

const ui = {
    showLoading(show = true) {
        elements.loadingOverlay.classList.toggle('active', show);
        state.isLoading = show;
    },

    showToast(type, title, message = '', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                ${this.getToastIcon(type)}
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            <button class="toast-close" aria-label="Fechar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.removeToast(toast));

        elements.toastContainer.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.removeToast(toast), duration);
        }

        return toast;
    },

    removeToast(toast) {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 300);
    },

    getToastIcon(type) {
        const icons = {
            success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
            error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        };
        return icons[type] || icons.info;
    },

    openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    },

    formatTime(date) {
        return new Date(date).toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
        });
    },

    formatDate(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoje';
        if (days === 1) return 'Ontem';
        if (days < 7) return `${days} dias atrás`;
        
        return d.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
        });
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    parseMarkdown(text) {
        // Basic markdown parsing
        let html = this.escapeHtml(text);
        
        // Code blocks
        html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        
        // Italic
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Line breaks
        html = html.replace(/\n/g, '<br>');
        
        return html;
    },

    scrollToBottom(smooth = true) {
        if (!CONFIG.AUTO_SCROLL) return;
        
        requestAnimationFrame(() => {
            elements.chatContainer.scrollTo({
                top: elements.chatContainer.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto',
            });
        });
    },

    playSound(type) {
        if (!CONFIG.SOUND_ENABLED) return;
        
        // Create audio context for notification sounds
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            if (type === 'send') {
                oscillator.frequency.value = 800;
                gainNode.gain.value = 0.1;
            } else {
                oscillator.frequency.value = 600;
                gainNode.gain.value = 0.1;
            }

            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Audio not available
        }
    },
};

// ============================================
// Chat Functions
// ============================================

const chat = {
    async init() {
        await this.checkApiStatus();
        this.loadSettings();
        this.setupEventListeners();
        this.loadConversationsFromStorage();
        
        // Check API status periodically
        setInterval(() => this.checkApiStatus(), 30000);
    },

    async checkApiStatus() {
        try {
            const health = await api.checkHealth();
            state.apiStatus = health.ai_model_ready ? 'online' : 'degraded';
            this.updateStatusIndicator();
        } catch (error) {
            state.apiStatus = 'offline';
            this.updateStatusIndicator();
        }
    },

    updateStatusIndicator() {
        const indicator = elements.statusIndicator;
        indicator.className = `status-indicator ${state.apiStatus}`;
        
        const statusTexts = {
            online: 'API Online',
            offline: 'API Offline',
            degraded: 'IA Indisponível',
            checking: 'Verificando...',
        };
        
        indicator.querySelector('.status-text').textContent = statusTexts[state.apiStatus];
    },

    loadSettings() {
        const saved = storage.load(CONFIG.STORAGE_KEY, {});
        
        CONFIG.API_URL = saved.apiUrl || CONFIG.API_URL;
        CONFIG.SOUND_ENABLED = saved.soundEnabled ?? CONFIG.SOUND_ENABLED;
        CONFIG.AUTO_SCROLL = saved.autoScroll ?? CONFIG.AUTO_SCROLL;
        CONFIG.THEME = saved.theme || CONFIG.THEME;

        elements.apiUrl.value = CONFIG.API_URL;
        elements.soundEnabled.checked = CONFIG.SOUND_ENABLED;
        elements.autoScroll.checked = CONFIG.AUTO_SCROLL;

        this.applyTheme(CONFIG.THEME);
    },

    saveSettings() {
        CONFIG.API_URL = elements.apiUrl.value || 'http://localhost:8000';
        CONFIG.SOUND_ENABLED = elements.soundEnabled.checked;
        CONFIG.AUTO_SCROLL = elements.autoScroll.checked;

        const activeTheme = document.querySelector('.theme-option.active');
        CONFIG.THEME = activeTheme?.dataset.theme || 'dark';

        storage.save(CONFIG.STORAGE_KEY, {
            apiUrl: CONFIG.API_URL,
            soundEnabled: CONFIG.SOUND_ENABLED,
            autoScroll: CONFIG.AUTO_SCROLL,
            theme: CONFIG.THEME,
        });

        this.applyTheme(CONFIG.THEME);
        ui.showToast('success', 'Configurações salvas');
        ui.closeModal(elements.settingsModal);
    },

    resetSettings() {
        elements.apiUrl.value = 'http://localhost:8000';
        elements.soundEnabled.checked = true;
        elements.autoScroll.checked = true;
        
        elements.themeOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === 'dark');
        });

        ui.showToast('info', 'Configurações restauradas');
    },

    applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }

        elements.themeOptions.forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === theme);
        });
    },

    loadConversationsFromStorage() {
        state.conversations = storage.load('chatbot-conversations', []);
        this.renderConversationsList();
    },

    saveConversationsToStorage() {
        storage.save('chatbot-conversations', state.conversations);
    },

    async sendMessage(content) {
        if (!content.trim() || state.isLoading) return;

        // Check API status
        if (state.apiStatus === 'offline') {
            ui.showToast('error', 'API Offline', 'Não foi possível conectar ao servidor');
            return;
        }

        // Add user message to UI
        this.addMessage('user', content);
        this.showTypingIndicator();
        
        // Clear input
        elements.messageInput.value = '';
        this.updateCharCount();
        this.updateSendButton();

        // Play send sound
        ui.playSound('send');

        state.isLoading = true;
        elements.sendBtn.classList.add('loading');

        try {
            const response = await api.sendMessage(content, state.currentConversationId);
            
            // Update conversation ID
            if (!state.currentConversationId) {
                state.currentConversationId = response.conversation_id;
                this.addConversation({
                    id: response.conversation_id,
                    title: content.slice(0, 50),
                    createdAt: new Date().toISOString(),
                    messageCount: 1,
                });
            }

            // Hide typing indicator and show response
            this.hideTypingIndicator();
            this.addMessage('ai', response.ai_response, response.timestamp);

            // Update header
            elements.chatTitle.textContent = content.slice(0, 30) + (content.length > 30 ? '...' : '');
            elements.chatSubtitle.textContent = `${state.messages.length} mensagens`;

            // Play receive sound
            ui.playSound('receive');

        } catch (error) {
            this.hideTypingIndicator();
            ui.showToast('error', 'Erro ao enviar', error.message);
            
            // Add error message to chat
            this.addMessage('ai', `Desculpe, ocorreu um erro: ${error.message}. Por favor, tente novamente.`);
        } finally {
            state.isLoading = false;
            elements.sendBtn.classList.remove('loading');
        }
    },

    addMessage(type, content, timestamp = new Date().toISOString()) {
        const message = { type, content, timestamp, id: Date.now() };
        state.messages.push(message);

        // Hide welcome screen, show messages container
        elements.welcomeScreen.classList.add('hidden');
        elements.messagesContainer.classList.add('active');

        // Render message
        const messageEl = this.createMessageElement(message);
        elements.messagesContainer.appendChild(messageEl);

        ui.scrollToBottom();
    },

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.type}`;
        div.dataset.id = message.id;

        const avatarIcon = message.type === 'user' 
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>';

        div.innerHTML = `
            <div class="message-avatar">${avatarIcon}</div>
            <div class="message-content">
                <div class="message-bubble">${ui.parseMarkdown(message.content)}</div>
                <div class="message-meta">
                    <span class="message-time">${ui.formatTime(message.timestamp)}</span>
                    <div class="message-actions">
                        <button class="message-action-btn copy-btn" title="Copiar" aria-label="Copiar mensagem">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Copy button handler
        const copyBtn = div.querySelector('.copy-btn');
        copyBtn.addEventListener('click', () => this.copyMessage(message.content));

        return div;
    },

    async copyMessage(content) {
        try {
            await navigator.clipboard.writeText(content);
            ui.showToast('success', 'Copiado!', 'Mensagem copiada para a área de transferência');
        } catch (error) {
            ui.showToast('error', 'Erro ao copiar', 'Não foi possível copiar a mensagem');
        }
    },

    showTypingIndicator() {
        state.isTyping = true;
        
        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typingIndicator';
        indicator.innerHTML = `
            <div class="typing-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                    <circle cx="12" cy="10" r="3"/>
                    <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/>
                </svg>
            </div>
            <div class="typing-dots">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;

        elements.messagesContainer.appendChild(indicator);
        ui.scrollToBottom();
    },

    hideTypingIndicator() {
        state.isTyping = false;
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    },

    addConversation(conversation) {
        // Check if already exists
        const existing = state.conversations.find(c => c.id === conversation.id);
        if (!existing) {
            state.conversations.unshift(conversation);
            this.saveConversationsToStorage();
            this.renderConversationsList();
        }
    },

    renderConversationsList() {
        if (state.conversations.length === 0) {
            elements.conversationsList.innerHTML = `
                <div class="empty-conversations">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    <p>Nenhuma conversa ainda</p>
                </div>
            `;
            return;
        }

        elements.conversationsList.innerHTML = state.conversations.map(conv => `
            <div class="conversation-item ${conv.id === state.currentConversationId ? 'active' : ''}" data-id="${conv.id}">
                <div class="conversation-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                </div>
                <div class="conversation-info">
                    <div class="conversation-title">${ui.escapeHtml(conv.title)}</div>
                    <div class="conversation-meta">
                        <span>${ui.formatDate(conv.createdAt)}</span>
                    </div>
                </div>
                <button class="conversation-delete" data-id="${conv.id}" aria-label="Excluir conversa">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </div>
        `).join('');

        // Add click handlers
        elements.conversationsList.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.closest('.conversation-delete')) return;
                this.loadConversation(item.dataset.id);
            });
        });

        elements.conversationsList.querySelectorAll('.conversation-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.confirmDeleteConversation(btn.dataset.id);
            });
        });
    },

    async loadConversation(conversationId) {
        ui.showLoading(true);

        try {
            const conversation = await api.getConversation(conversationId);
            
            state.currentConversationId = conversationId;
            state.messages = [];

            // Clear and hide welcome screen
            elements.welcomeScreen.classList.add('hidden');
            elements.messagesContainer.classList.add('active');
            elements.messagesContainer.innerHTML = '';

            // Render messages
            conversation.messages.forEach(msg => {
                this.addMessage('user', msg.user_message, msg.timestamp);
                this.addMessage('ai', msg.ai_response, msg.timestamp);
            });

            // Update header
            const firstMessage = conversation.messages[0];
            elements.chatTitle.textContent = firstMessage ? firstMessage.user_message.slice(0, 30) : 'Conversa';
            elements.chatSubtitle.textContent = `${conversation.total_messages * 2} mensagens`;

            // Update sidebar
            this.renderConversationsList();

            // Close sidebar on mobile
            elements.sidebar.classList.remove('open');

        } catch (error) {
            ui.showToast('error', 'Erro ao carregar', error.message);
        } finally {
            ui.showLoading(false);
        }
    },

    startNewChat() {
        state.currentConversationId = null;
        state.messages = [];

        elements.welcomeScreen.classList.remove('hidden');
        elements.messagesContainer.classList.remove('active');
        elements.messagesContainer.innerHTML = '';

        elements.chatTitle.textContent = 'Nova Conversa';
        elements.chatSubtitle.textContent = 'Inicie uma conversa com o assistente';

        this.renderConversationsList();
        elements.messageInput.focus();

        // Close sidebar on mobile
        elements.sidebar.classList.remove('open');
    },

    confirmDeleteConversation(conversationId) {
        state.deleteTargetId = conversationId;
        ui.openModal(elements.deleteModal);
    },

    async deleteConversation() {
        const conversationId = state.deleteTargetId;
        if (!conversationId) return;

        ui.closeModal(elements.deleteModal);
        ui.showLoading(true);

        try {
            await api.deleteConversation(conversationId);

            // Remove from local state
            state.conversations = state.conversations.filter(c => c.id !== conversationId);
            this.saveConversationsToStorage();

            // If we deleted the current conversation, start new chat
            if (state.currentConversationId === conversationId) {
                this.startNewChat();
            }

            this.renderConversationsList();
            ui.showToast('success', 'Conversa excluída');

        } catch (error) {
            ui.showToast('error', 'Erro ao excluir', error.message);
        } finally {
            ui.showLoading(false);
            state.deleteTargetId = null;
        }
    },

    exportConversation() {
        if (state.messages.length === 0) {
            ui.showToast('warning', 'Nada para exportar', 'Inicie uma conversa primeiro');
            return;
        }

        const content = state.messages.map(msg => {
            const role = msg.type === 'user' ? 'Você' : 'Assistente';
            return `[${ui.formatTime(msg.timestamp)}] ${role}:\n${msg.content}\n`;
        }).join('\n---\n\n');

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `conversa-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);

        ui.showToast('success', 'Conversa exportada');
    },

    updateCharCount() {
        const length = elements.messageInput.value.length;
        elements.charCount.textContent = `${length}/${CONFIG.MAX_MESSAGE_LENGTH}`;
        
        elements.charCount.classList.remove('warning', 'error');
        if (length > CONFIG.MAX_MESSAGE_LENGTH * 0.9) {
            elements.charCount.classList.add('error');
        } else if (length > CONFIG.MAX_MESSAGE_LENGTH * 0.75) {
            elements.charCount.classList.add('warning');
        }
    },

    updateSendButton() {
        const hasContent = elements.messageInput.value.trim().length > 0;
        const withinLimit = elements.messageInput.value.length <= CONFIG.MAX_MESSAGE_LENGTH;
        elements.sendBtn.disabled = !hasContent || !withinLimit || state.isLoading;
    },

    autoResizeTextarea() {
        const textarea = elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    },

    setupEventListeners() {
        // Sidebar toggle
        elements.sidebarToggle.addEventListener('click', () => {
            elements.sidebar.classList.toggle('collapsed');
        });

        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('open');
        });

        // New chat
        elements.newChatBtn.addEventListener('click', () => this.startNewChat());

        // Refresh conversations
        elements.refreshConversations.addEventListener('click', async () => {
            elements.refreshConversations.classList.add('spinning');
            await this.checkApiStatus();
            setTimeout(() => {
                elements.refreshConversations.classList.remove('spinning');
            }, 1000);
        });

        // Settings
        elements.settingsBtn.addEventListener('click', () => {
            ui.openModal(elements.settingsModal);
        });

        elements.closeSettings.addEventListener('click', () => {
            ui.closeModal(elements.settingsModal);
        });

        elements.saveSettings.addEventListener('click', () => this.saveSettings());
        elements.resetSettings.addEventListener('click', () => this.resetSettings());

        // Theme selection
        elements.themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                elements.themeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
            });
        });

        // Delete modal
        elements.deleteBtn.addEventListener('click', () => {
            if (state.currentConversationId) {
                this.confirmDeleteConversation(state.currentConversationId);
            } else {
                ui.showToast('warning', 'Nenhuma conversa', 'Não há conversa para excluir');
            }
        });

        elements.closeDelete.addEventListener('click', () => {
            ui.closeModal(elements.deleteModal);
        });

        elements.cancelDelete.addEventListener('click', () => {
            ui.closeModal(elements.deleteModal);
        });

        elements.confirmDelete.addEventListener('click', () => this.deleteConversation());

        // Export
        elements.exportBtn.addEventListener('click', () => this.exportConversation());

        // Message input
        elements.messageInput.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
            this.autoResizeTextarea();
        });

        elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (!elements.sendBtn.disabled) {
                    this.sendMessage(elements.messageInput.value);
                }
            }
        });

        elements.sendBtn.addEventListener('click', () => {
            this.sendMessage(elements.messageInput.value);
        });

        // Feature cards
        elements.featureCards.forEach(card => {
            card.addEventListener('click', () => {
                const prompt = card.dataset.prompt;
                if (prompt) {
                    elements.messageInput.value = prompt;
                    this.updateCharCount();
                    this.updateSendButton();
                    elements.messageInput.focus();
                }
            });
        });

        // Close modals on overlay click
        [elements.settingsModal, elements.deleteModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    ui.closeModal(modal);
                }
            });
        });

        // Close modals on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ui.closeModal(elements.settingsModal);
                ui.closeModal(elements.deleteModal);
            }
        });

        // System theme change
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (CONFIG.THEME === 'system') {
                this.applyTheme('system');
            }
        });

        // Close sidebar on mobile when clicking outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!elements.sidebar.contains(e.target) && !elements.mobileMenuBtn.contains(e.target)) {
                    elements.sidebar.classList.remove('open');
                }
            }
        });
    },
};

// ============================================
// Initialize Application
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    chat.init();
});
