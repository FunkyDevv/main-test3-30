// customer-service.js
function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-btn');
  const chatbotContainer = document.getElementById('chatbot-container');
  const createCaseBtn = document.getElementById('create-case-btn');
  const chatMessages = document.getElementById('chat-messages');

  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');

  // Optional fields on the page
  const buyerNameField = document.getElementById('buyer-name');
  const itemField = document.getElementById('item');
  const problemField = document.getElementById('problem');
  const statusField = document.getElementById('status');
  const nextActionField = document.getElementById('next-action');

  // Initialize session
  let sessionId = localStorage.getItem('csSessionId');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('csSessionId', sessionId);
  }

  // Close button
  if (closeBtn && chatbotContainer) {
    closeBtn.addEventListener('click', () => {
      chatbotContainer.style.display = 'none';
    });
  }

  // Helpers
  function appendMessage(sender, text) {
    if (!chatMessages) return;
    const div = document.createElement('div');
    div.classList.add('message');
    div.classList.add(sender === 'bot' ? 'bot-message' : 'user-message');
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  async function loadCurrentCase() {
    try {
      const res = await fetch(`http://localhost:3000/api/cases/current?sessionId=${encodeURIComponent(sessionId)}`);
      const data = await res.json();
      if (data && data.case) {
        appendMessage('bot', `Loaded current case for ${data.case.buyerName} — Item: ${data.case.item}, Problem: ${data.case.problem}, Status: ${data.case.status}`);
      } else {
        appendMessage('bot', 'No current case found. Create one to get started.');
      }
    } catch (err) {
      console.error('loadCurrentCase error:', err);
      appendMessage('bot', '⚠️ Failed to load current case.');
    }
  }

  async function sendMessage() {
    if (!messageInput) return;
    const text = messageInput.value.trim();
    if (!text) return;

    appendMessage('user', text);

    // Typing indicator
    const typing = document.createElement('div');
    typing.classList.add('message', 'bot-message');
    typing.textContent = 'Typing...';
    chatMessages && chatMessages.appendChild(typing);
    chatMessages && (chatMessages.scrollTop = chatMessages.scrollHeight);

    try {
      const payload = {
        message: text,
        chatHistory: '',         // hook up if you keep history
        buyerName: buyerNameField ? buyerNameField.value.trim() : '',
        sellerName: 'Seller',
        sellerLanguageCode: 'en' // or bind to a real selector if present
      };

      const res = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      typing.remove();

      if (data.sellerReply) appendMessage('bot', data.sellerReply);
      if (data.englishReply) appendMessage('bot', data.englishReply);
      if (!data.sellerReply && !data.englishReply && data.reply) appendMessage('bot', data.reply);
      if (!data.sellerReply && !data.englishReply && !data.reply) appendMessage('bot', '⚠️ Unexpected response format');
    } catch (err) {
      console.error('sendMessage error:', err);
      typing.remove();
      appendMessage('bot', '⚠️ Error connecting to server');
    } finally {
      messageInput.value = '';
      messageInput.focus();
    }
  }

  // Wire message send
  if (sendButton && messageInput) {
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    });
  }

  // Create case
  if (createCaseBtn) {
    createCaseBtn.addEventListener('click', async () => {
      const buyerName = buyerNameField ? buyerNameField.value.trim() : '';
      const item = itemField ? itemField.value.trim() : '';
      const problem = problemField ? problemField.value.trim() : '';
      const status = (statusField && statusField.value.trim()) || 'Open';
      const nextAction = (nextActionField && nextActionField.value.trim()) || 'Investigate issue';

      if (!buyerName || !item || !problem) {
        alert('Please fill in all required fields: Buyer Name, Item, and Problem.');
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/cases', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ buyerName, item, problem, status, nextAction, sessionId })
        });

        if (!response.ok) throw new Error(`Failed to create case (${response.status})`);

        const data = await response.json();
        const caseId = data.caseId;

        appendMessage('bot', `✅ Case created: ${caseId} for ${buyerName}. Status: ${status}. Next action: ${nextAction}`);
      } catch (err) {
        console.error('create case error:', err);
        appendMessage('bot', '⚠️ Failed to create case');
      }
    });
  }

  // Load existing case on page load
  loadCurrentCase();
});
