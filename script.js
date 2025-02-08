document.addEventListener('DOMContentLoaded', () => {
    // العناصر الأساسية
    const messagesContainer = document.getElementById('messagesContainer');
    const messageInput = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');
    const emojiPicker = document.getElementById('emojiPicker');
    const themeToggle = document.querySelector('.theme-toggle');
    const notificationSound = document.getElementById('notificationSound');
    const typingIndicator = document.getElementById('typingIndicator');

    // البيانات والمتغيرات
    let messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    let typingTimer;

    const emojiCategories = {
        faces: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'],
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
        objects: ['⌚', '📱', '💻', '⌨️', '🖨️', '🖱️', '📷', '🎥'],
        symbols: ['❤️', '✨', '🔥', '🌟', '💯', '🎉', '👍', '👎']
    };

    // تهيئة التطبيق
    const initApp = () => {
        loadMessages();
        setupEventListeners();
        detectSystemTheme();
        buildEmojiPicker();
    };

    // إعداد مستمعي الأحداث
    const setupEventListeners = () => {
        document.querySelector('button[onclick="sendMessage()"]').addEventListener('click', sendMessage);
        document.querySelector('button[onclick="toggleEmojiPicker()"]').addEventListener('click', toggleEmojiPicker);
        themeToggle.addEventListener('click', toggleTheme);
        messageInput.addEventListener('input', handleTyping);
        messageInput.addEventListener('keypress', handleEnter);
        fileInput.addEventListener('change', handleFileUpload);
    };

    // تحميل الرسائل
    const loadMessages = () => {
        messagesContainer.innerHTML = messages.map((msg, index) => `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                ${sanitizeInput(msg.text)}
                ${msg.file ? `<img src="${msg.file}" class="message-file" onclick="zoomImage(this)">` : ''}
                <div class="reactions-container">
                    ${(msg.reactions || []).map(r => `
                        <div class="reaction" onclick="addReaction('${r}', ${index})">${r}</div>
                    `).join('')}
                </div>
                <small>${msg.timestamp} ${msg.status || ''}</small>
            </div>
        `).join('');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // إرسال الرسالة
    const sendMessage = () => {
        const text = sanitizeInput(messageInput.value.trim());
        const file = fileInput.files[0];

        if (!text && !file) return;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => processMessage(text, e.target.result);
            reader.readAsDataURL(file);
        } else {
            processMessage(text);
        }
    };

    const processMessage = (text, fileUrl) => {
        const newMessage = {
            text,
            file: fileUrl,
            sent: true,
            timestamp: getFormattedTime(),
            status: '✔️'
        };

        messages.push(newMessage);
        saveToLocalStorage();
        clearInputs();
        loadMessages();
        showNotification();
        playNotificationSound();
    };

    // الميزات المساعدة
    const getFormattedTime = () => {
        return new Date().toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const saveToLocalStorage = () => {
        localStorage.setItem('chatMessages', JSON.stringify(messages));
    };

    const clearInputs = () => {
        messageInput.value = '';
        fileInput.value = '';
    };

    // نظام الإيموجيات
    const buildEmojiPicker = () => {
        emojiPicker.innerHTML = Object.entries(emojiCategories)
            .map(([category, emojis]) => `
                <div class="emoji-category">
                    <h4>${category}</h4>
                    ${emojis.map(emoji => `
                        <button class="emoji-btn" onclick="insertEmoji('${emoji}')">${emoji}</button>
                    `).join('')}
                </div>
            `).join('');
    };

    const toggleEmojiPicker = () => {
        emojiPicker.style.display = emojiPicker.style.display === 'flex' ? 'none' : 'flex';
    };

    const insertEmoji = (emoji) => {
        messageInput.value += emoji;
        toggleEmojiPicker();
    };

    // التفاعلات
    const addReaction = (emoji, index) => {
        if (!messages[index].reactions) messages[index].reactions = [];
        if (!messages[index].reactions.includes(emoji)) {
            messages[index].reactions.push(emoji);
            saveToLocalStorage();
            loadMessages();
        }
    };

    // نظام الثيمات
    const toggleTheme = () => {
        document.body.setAttribute('data-theme',
            document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
        );
    };

    const detectSystemTheme = () => {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
        }
    };

    // إدارة الملفات
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            // يمكن إضافة معالجة إضافية هنا
        }
    };

    // المؤشرات والإشعارات
    const handleTyping = () => {
        typingIndicator.style.display = 'block';
        clearTimeout(typingTimer);
        typingTimer = setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 1000);
    };

    const showNotification = () => {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = 'رسالة جديدة!';
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    };

    const playNotificationSound = () => {
        notificationSound.play().catch(error => {
            console.error('فشل تشغيل الصوت:', error);
        });
    };

    // الأمان
    const sanitizeInput = (text) => {
        const temp = document.createElement('div');
        temp.textContent = text;
        return temp.innerHTML;
    };

    // الأحداث العامة
    const handleEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const zoomImage = (img) => {
        img.style.transform = img.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
    };

    // بدء التشغيل
    initApp();
});

// الدوال العامة
window.toggleEmojiPicker = () => {
    const emojiPicker = document.getElementById('emojiPicker');
    emojiPicker.style.display = emojiPicker.style.display === 'flex' ? 'none' : 'flex';
};

window.insertEmoji = (emoji) => {
    document.getElementById('messageInput').value += emoji;
};

window.addReaction = (emoji, index) => {
    const messages = JSON.parse(localStorage.getItem('chatMessages')) || [];
    if (!messages[index].reactions) messages[index].reactions = [];
    if (!messages[index].reactions.includes(emoji)) {
        messages[index].reactions.push(emoji);
        localStorage.setItem('chatMessages', JSON.stringify(messages));
        document.getElementById('messagesContainer').innerHTML = '';
        loadMessages();
    }
};

window.zoomImage = (img) => {
    img.style.transform = img.style.transform === 'scale(2)' ? 'scale(1)' : 'scale(2)';
};
// تأثيرات صوتية متقدمة
const soundEffects = {
    send: new Audio('send-sound.mp3'),
    receive: new Audio('receive-sound.mp3'),
    notification: new Audio('notification.mp3')
  };
  
  // تحريك الخلفية عند التمرير
  let lastScroll = 0;
  messagesContainer.addEventListener('scroll', () => {
    const currentScroll = messagesContainer.scrollTop;
    const scrollDiff = currentScroll - lastScroll;
    document.body.style.backgroundPosition = `0% ${scrollDiff * 0.5}%`;
    lastScroll = currentScroll;
  });
  
  // تأثيرات الانتقال عند الإرسال
  function sendMessageWithEffects() {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', 'sent');
    messageElement.innerHTML = `
      <div class="message-content">${messageInput.value}</div>
      <div class="message-status">✔️</div>
    `;
    
    // تأثيرات CSS
    messageElement.style.transform = 'translateY(20px)';
    messageElement.style.opacity = '0';
    
    messagesContainer.appendChild(messageElement);
    
    // تحريك العنصر
    requestAnimationFrame(() => {
      messageElement.style.transform = 'translateY(0)';
      messageElement.style.opacity = '1';
      messageElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    // تشغيل التأثيرات الصوتية
    soundEffects.send.play();
  }
  document.addEventListener('DOMContentLoaded', () => {
    // ... [الكود السابق بدون تغيير]

    // تأثيرات صوتية متقدمة (أضف هذا داخل initApp)
    const soundEffects = {
        send: new Audio('send-sound.mp3'),
        receive: new Audio('receive-sound.mp3'),
        notification: notificationSound // استخدام العنصر الموجود في HTML
    };

    // تحريك الخلفية عند التمرير (أضف هذا داخل setupEventListeners)
    messagesContainer.addEventListener('scroll', handleScrollEffect);

    // تأثيرات الانتقال عند الإرسال (استبدل processMessage بهذا)
    const processMessage = (text, fileUrl) => {
        const newMessage = { /* ... [الكود السابق] */ };
        
        // إضافة الرسالة مع تأثيرات
        addMessageWithEffects(newMessage);
        
        // ... [الكود السابق]
    };

    // ========== الإضافات الجديدة ========== //
    
    const handleScrollEffect = () => {
        const currentScroll = messagesContainer.scrollTop;
        const scrollDiff = currentScroll - lastScroll;
        document.documentElement.style.setProperty(
            '--gradient-pos', 
            `${scrollDiff * 0.5}%`
        );
        lastScroll = currentScroll;
    };

    const addMessageWithEffects = (message) => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', message.sent ? 'sent' : 'received');
        messageElement.innerHTML = `
            ${sanitizeInput(message.text)}
            ${message.file ? `<img src="${message.file}" class="message-file">` : ''}
            <small>${message.timestamp}</small>
        `;

        // تأثيرات الظهور
        messageElement.style.transform = 'translateY(20px)';
        messageElement.style.opacity = '0';
        
        messagesContainer.appendChild(messageElement);
        
        requestAnimationFrame(() => {
            messageElement.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            messageElement.style.transform = 'translateY(0)';
            messageElement.style.opacity = '1';
        });

        // تشغيل الصوت المناسب
        const sound = message.sent ? soundEffects.send : soundEffects.receive;
        sound.play().catch(console.error);
    };

    // ... [بقية الكود السابق]
});