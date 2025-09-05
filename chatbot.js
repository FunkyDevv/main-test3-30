document.addEventListener("DOMContentLoaded", () => {
  const chatForm = document.getElementById("chat-form");
  const sellerMessage = document.getElementById("seller-message");
  const chatMessages = document.getElementById("chat-messages");
  const chatbotContainer = document.getElementById("chatbot-container");
  const closeBtn = document.getElementById("close-btn");
  // === Close button ===
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatbotContainer.style.display = "none"; // hide chatbot
      window.parent.postMessage({ type: 'HIDE_CHATBOT_IFRAME' }, '*'); // notify parent to show toggle
    });
  }

  // === Listen for messages from parent ===
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_CHATBOT') {
      chatbotContainer.style.display = "flex"; // show chatbot
    }
  });

  // Hide chatbot container by default to remove ghost container
  if (chatbotContainer) {
    chatbotContainer.style.display = "none";
  }

  // Image upload elements
  const imageInput = document.getElementById("image-upload");
  const uploadBtn = document.getElementById("upload-btn");
  const uploadIcon = document.getElementById("upload-icon");

  let selectedImageFile = null;
  let removeBtn = null;

  // === Image upload preview with close button ===
  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadIcon.style.display = "none";

      const existing = uploadBtn.querySelector("img.preview");
      if (existing) existing.remove();

      const previewImg = document.createElement("img");
      previewImg.src = event.target.result;
      previewImg.classList.add("preview");
      previewImg.alt = "preview";
      uploadBtn.appendChild(previewImg);

      if (!removeBtn) {
        removeBtn = document.createElement("button");
        removeBtn.id = "remove-image";
        removeBtn.type = "button";
        removeBtn.textContent = "✖";
        uploadBtn.appendChild(removeBtn);

        removeBtn.addEventListener("click", () => resetImageUpload());
      }
      removeBtn.style.display = "block";
    };
    reader.readAsDataURL(file);
  });

  function resetImageUpload() {
    selectedImageFile = null;
    imageInput.value = "";
    const previewImg = uploadBtn.querySelector("img.preview");
    if (previewImg) previewImg.remove();
    if (removeBtn) removeBtn.style.display = "none";
    uploadIcon.style.display = "block";
    uploadIcon.src = "src/image.svg";
  }

  // === Enter to send (Shift+Enter = new line) ===
  sellerMessage.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const hasText = sellerMessage.value.trim().length > 0;
      const hasImage = selectedImageFile !== null;
      if (hasText || hasImage) chatForm.requestSubmit();
    }
  });

  // === Submit ===
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = sellerMessage.value.trim();
    if (!text && !selectedImageFile) return;

    addUserMessage(text, selectedImageFile);

    const formData = new FormData();
    formData.append("message", text);
    if (selectedImageFile) formData.append("image", selectedImageFile);

    // Append selected language
    const languageCode = document.getElementById("language-code").value;
    formData.append("seller_language_code", languageCode);

    // Append buyer name if provided
    const buyerName = document.getElementById("buyer-name").value.trim();
    if (buyerName) formData.append("buyer_name", buyerName);

    sellerMessage.value = "";
    resetImageUpload();

    try {
      const response = await fetch("https://eproaichatbotendpoint.onrender.com/chat", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!data || !data.reply) {
        addError("⚠️ Error: No reply from server");
        return;
      }
      addBotBlocksFromReply(data.reply);
    } catch (err) {
      console.error("Chat error:", err);
      addError("⚠️ Server error. Check backend logs.");
    }
  });

  // ===== UI helpers =====
  function addUserMessage(text, imageFile) {
    const wrap = document.createElement("div");
    wrap.className = "user-message message";

    const content = document.createElement("div");
    content.className = "message-content";

    if (text) {
      const p = document.createElement("p");
      p.textContent = text;
      content.appendChild(p);
    }

    if (imageFile) {
      const img = document.createElement("img");
      img.className = "message-image";
      img.src = URL.createObjectURL(imageFile);
      content.appendChild(img);
    }

    wrap.appendChild(content);
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addError(text) {
    const wrap = document.createElement("div");
    wrap.className = "bot-message message";
    wrap.textContent = text;
    chatMessages.appendChild(wrap);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function addBotBlocksFromReply(raw) {
    const englishMatch = raw.match(/```text([\s\S]*?)```/i);
    const englishBlock = englishMatch ? englishMatch[1].trim() : "";

    const summaryMatch = raw.match(/Summary:[\s\S]*?What to answer:[^\n]*/i);
    const summaryBlock = summaryMatch ? summaryMatch[0].trim() : "";

    const sellerLanguageBlock = raw
      .replace(englishMatch?.[0] || "", "")
      .replace(summaryMatch?.[0] || "", "")
      .replace(/\[SUMMARY BLOCK\]|\[SELLER LANGUAGE BLOCK\]|\[ENGLISH VERSION BLOCK\]/gi, "")
      .trim();

    const botMsg = document.createElement("div");
    botMsg.className = "bot-message message";

    // === Image Analysis block (from Summary line) ===
    const imageAnalysisMatch = raw.match(/Summary:\s*(.+)/i);
    const imageAnalysis = imageAnalysisMatch ? imageAnalysisMatch[1].trim() : "";
    if (imageAnalysis) {
      const imgBlock = document.createElement("div");
      imgBlock.className = "image-analysis-block";
      imgBlock.innerHTML = `<strong>IMAGE ANALYSIS</strong><p>${imageAnalysis}</p>`;
      botMsg.appendChild(imgBlock);
    }

    // === Summary block ===
    const s = document.createElement("div");
    s.className = "summary-block";
    s.innerHTML = `<strong>SUMMARY</strong><p>${summaryBlock || "No summary"}</p>`;

    // === Seller language block ===
    const sl = document.createElement("div");
    sl.className = "seller-language-block";
    sl.innerHTML = `<strong>SELLER LANGUAGE</strong><p>${sellerLanguageBlock || "No seller version"}</p>`;

    // === English version block ===
    const en = document.createElement("div");
    en.className = "english-version-block";
    en.innerHTML = `<strong>ENGLISH VERSION</strong><p>${englishBlock || "No English version"}</p>`;

    botMsg.appendChild(s);
    botMsg.appendChild(sl);
    botMsg.appendChild(en);

    chatMessages.appendChild(botMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
