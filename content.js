// content.js - Injects the floating chatbot into websites
(function() {
  // Create iframe
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('chatbot.html');
  iframe.style.position = 'fixed';
  iframe.style.bottom = '80px';
  iframe.style.right = '20px';
  iframe.style.width = '500px';
  iframe.style.height = '750px';
  iframe.style.border = 'none';
  iframe.style.zIndex = '1000001';
  iframe.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
  iframe.style.borderRadius = '12px';
  iframe.style.display = 'none';
  iframe.id = 'eproai-iframe';

  // Listen for messages from iframe
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'HIDE_CHATBOT_IFRAME') {
      iframe.style.display = 'none';
      toggleBtn.style.display = 'flex';
    }
  });

  // Create toggle button
  const toggleBtn = document.createElement('div');
  toggleBtn.id = 'chat-toggle-btn';
  toggleBtn.title = 'Open ePro AI';
  toggleBtn.style.position = 'fixed';
  toggleBtn.style.bottom = '20px';
  toggleBtn.style.right = '20px';
  toggleBtn.style.width = '50px';
  toggleBtn.style.height = '50px';
  toggleBtn.style.backgroundColor = '#f56400';
  toggleBtn.style.borderRadius = '50%';
  toggleBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toggleBtn.style.cursor = 'pointer';
  toggleBtn.style.zIndex = '1000000';
  toggleBtn.style.display = 'flex';
  toggleBtn.style.alignItems = 'center';
  toggleBtn.style.justifyContent = 'center';
  toggleBtn.style.color = 'white';
  toggleBtn.style.fontSize = '28px';
  toggleBtn.style.userSelect = 'none';
  toggleBtn.style.transition = 'background-color 0.3s ease';
  toggleBtn.innerHTML = `
     <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" width="28" height="28">
      <path d="M20 2H4a2 2 0 0 0-2 2v16l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
    </svg> 
  `;

  toggleBtn.addEventListener('mouseenter', () => {
    toggleBtn.style.backgroundColor = '#e45a00';
  });
  toggleBtn.addEventListener('mouseleave', () => {
    toggleBtn.style.backgroundColor = '#f56400';
  });
  toggleBtn.addEventListener('click', () => {
    if (iframe.style.display === 'none' || !iframe.style.display) {
      iframe.style.display = 'block';
      toggleBtn.style.display = 'none';
      iframe.contentWindow.postMessage({ type: 'SHOW_CHATBOT' }, '*');
    } else {
      iframe.contentWindow.postMessage({ type: 'HIDE_CHATBOT' }, '*');
    }
  });

  document.body.appendChild(iframe);
  document.body.appendChild(toggleBtn);
})();
