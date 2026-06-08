// ========== الإعدادات ==========
const API_URL = 'https://cashcam-api.onrender.com/api'; // غيّر هذا لاحقاً بعد نشر الخادم
let token = localStorage.getItem('token');
let currentUser = null;
let currentVideoId = null;

// ========== دوال مساعدة ==========
function showToast(msg, isError = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = msg;
    toast.style.background = isError ? 'rgba(200,50,50,0.9)' : 'rgba(0,0,0,0.8)';
    toast.style.borderRight = `3px solid ${isError ? '#ff6666' : '#ffd966'}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

// ========== المصادقة عبر Pi SDK (محاكاة حالياً – ستستبدلها لاحقاً) ==========
async function loginWithPi() {
    // هنا مؤقتاً نستخدم دخول وهمي لتجربة التطبيق
    const piUserId = 'user_' + Math.floor(Math.random() * 10000);
    const username = 'Pioneer_' + piUserId.slice(-4);
    try {
        const res = await fetch(`${API_URL}/auth/pi`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ piUserId, username })
        });
        const data = await res.json();
        token = data.token;
        currentUser = data.user;
        localStorage.setItem('token', token);
        showToast(`مرحباً ${currentUser.username}`);
        loadFeed();
    } catch (err) {
        showToast('فشل الاتصال بالخادم', true);
    }
}

// ========== تحميل الفيديوهات ==========
async function loadFeed() {
    try {
        const res = await fetch(`${API_URL}/videos/feed`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const videos = await res.json();
        renderShorts(videos);
    } catch (err) {
        showToast('خطأ في تحميل الفيديوهات', true);
    }
}

// ========== عرض الفيديوهات ==========
function renderShorts(videos) {
    const container = document.getElementById('shorts-container');
    if (!container) return;
    container.innerHTML = '';
    videos.forEach(video => {
        const user = video.userId || { username: 'مستخدم', level: 'Bronze Pioneer' };
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <video src="${video.url}" muted loop playsinline></video>
            <div class="video-info">
                <div class="user-details">
                    <div class="username">
                        @${user.username}
                        <span class="level-badge">${user.level}</span>
                    </div>
                    <div class="caption">${video.caption || '✨ فيديو جديد ✨'}</div>
                    <div style="display:flex; gap:10px; margin-top:5px;">
                        <span>❤️ ${video.likes.length}</span>
                        <span>💬 ${video.comments.length}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="action-btn like-btn" data-id="${video._id}">
                        <span class="material-icons">favorite_border</span>
                        <span>${video.likes.length}</span>
                    </button>
                    <button class="action-btn comment-btn" data-id="${video._id}">
                        <span class="material-icons">chat_bubble_outline</span>
                        <span>تعليق</span>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    attachVideoEvents();
    attachInteractionEvents();
}

function attachVideoEvents() {
    document.querySelectorAll('.video-card video').forEach((video, idx) => {
        const card = video.closest('.video-card');
        const likeBtn = card.querySelector('.like-btn');
        const videoId = likeBtn?.dataset.id;
        let watchReported = false;
        video.addEventListener('play', async () => {
            if (!watchReported && videoId) {
                watchReported = true;
                await reportWatch(videoId);
            }
        });
    });
}

async function reportWatch(videoId) {
    try {
        const res = await fetch(`${API_URL}/videos/${videoId}/watch`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.showAd) {
            showAd();
        }
        updatePointsInUI(data.points);
    } catch (err) {}
}

function attachInteractionEvents() {
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const videoId = btn.dataset.id;
            try {
                const res = await fetch(`${API_URL}/videos/${videoId}/like`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                btn.querySelector('span:last-child').innerText = data.likes;
                btn.querySelector('.material-icons').innerText = 'favorite';
                btn.disabled = true;
                updatePointsInUI(data.points);
            } catch (err) {}
        };
    });

    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const videoId = btn.dataset.id;
            openCommentsModal(videoId);
        };
    });
}

// ========== التعليقات ==========
async function openCommentsModal(videoId) {
    // سنقوم بجلب الفيديو الحالي من الخادم لعرض التعليقات – تبسيطاً نستخدم fetch مباشر
    try {
        const res = await fetch(`${API_URL}/videos/feed`, { headers: { 'Authorization': `Bearer ${token}` } });
        const videos = await res.json();
        const video = videos.find(v => v._id === videoId);
        if (!video) return;
        const modal = document.getElementById('comments-modal');
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';
        video.comments.forEach(c => {
            const div = document.createElement('div');
            div.className = 'comment-item';
            div.innerHTML = `<strong>${c.userId?.username || 'مستخدم'}</strong>: ${c.text}`;
            commentsList.appendChild(div);
        });
        modal.style.display = 'flex';
        document.getElementById('send-comment').onclick = async () => {
            const input = document.getElementById('new-comment');
            const text = input.value.trim();
            if (!text) return;
            // إضافة تعليق – هنا تحتاج API خاص للإضافة، لكن للتطبيق الكامل سنضيفها لاحقاً
            showToast('سيتم إضافة التعليق قريباً', false);
            input.value = '';
        };
        document.querySelector('.close-comments').onclick = () => modal.style.display = 'none';
    } catch (err) {}
}

// ========== رفع فيديو ==========
function openUploadModal() {
    document.getElementById('upload-modal').style.display = 'flex';
}
function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}
async function publishVideo() {
    const file = document.getElementById('video-upload').files[0];
    const caption = document.getElementById('video-caption').value;
    if (!file) { showToast('اختر فيديو أولاً', true); return; }
    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption);
    try {
        const res = await fetch(`${API_URL}/videos/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        showToast(`تم النشر! +${data.points} نقطة`);
        closeUploadModal();
        loadFeed();
    } catch (err) {
        showToast('فشل الرفع', true);
    }
}

// ========== الإعلانات ==========
async function showAd() {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.position = 'fixed'; modal.style.top = '0'; modal.style.left = '0';
        modal.style.width = '100%'; modal.style.height = '100%'; modal.style.background = 'rgba(0,0,0,0.95)';
        modal.style.zIndex = '3000'; modal.style.display = 'flex'; modal.style.flexDirection = 'column';
        modal.style.justifyContent = 'center'; modal.style.alignItems = 'center';
        modal.innerHTML = `
            <div style="background: linear-gradient(135deg,#ffd966,#b8860b); padding:20px; border-radius:40px; text-align:center;">
                <span class="material-icons" style="font-size:48px;">play_circle_filled</span>
                <h3>إعلان قصير</h3>
                <p>شاهد الإعلان 5 ثوانٍ</p>
                <div id="adTimer" style="font-size:32px; margin:10px;">5</div>
                <button id="skipAd" style="background:gold; border:none; padding:8px 20px; border-radius:30px;">تخطي</button>
            </div>
        `;
        document.body.appendChild(modal);
        let countdown = 5;
        const timerDiv = modal.querySelector('#adTimer');
        const interval = setInterval(() => {
            countdown--;
            timerDiv.innerText = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                modal.remove();
                resolve(true);
            }
        }, 1000);
        modal.querySelector('#skipAd').onclick = () => {
            clearInterval(interval);
            modal.remove();
            resolve(false);
        };
    });
}

// ========== تحويل النقاط ==========
async function redeemPoints() {
    try {
        const res = await fetch(`${API_URL}/redeem`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.error) {
            showToast(data.error, true);
        } else {
            showToast(`تم تحويل ${data.piAmount} Pi بنجاح!`);
            updatePointsInUI(0);
        }
    } catch (err) {
        showToast('فشل التحويل', true);
    }
}

function updatePointsInUI(points) {
    const profileBtn = document.querySelector('[data-page="profile"]');
    if (profileBtn) profileBtn.querySelector('span:last-child').innerHTML = `${points} <span style="font-size:10px;">نقطة</span>`;
}

// ========== التنقل ==========
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const page = btn.dataset.page;
            if (page === 'upload') openUploadModal();
            else if (page === 'profile') showProfile();
            else if (page === 'home') loadFeed();
            else if (page === 'friends') showToast('✨ قريباً: عالم الأصدقاء ✨');
            else if (page === 'inbox') showToast('📬 صندوق الوارد سيظهر قريباً');
        });
    });
}

async function showProfile() {
    try {
        const res = await fetch(`${API_URL}/videos/feed`, { headers: { 'Authorization': `Bearer ${token}` } });
        // لا يوجد API للملف الشخصي مباشرة، نعرض بيانات وهمية من localStorage
        alert(`👑 ${currentUser.username}\n🏅 المستوى: ${currentUser.level}\n⭐ النقاط: ${currentUser.points}`);
    } catch (err) {}
}

// ========== بدء التطبيق ==========
window.onload = async () => {
    document.getElementById('main-content').style.display = 'flex';
    document.getElementById('splash').style.display = 'none';
    if (!token) {
        await loginWithPi();
    } else {
        await loadFeed();
    }
    setupNavigation();
    document.querySelector('.close')?.addEventListener('click', closeUploadModal);
    document.getElementById('publish-video')?.addEventListener('click', publishVideo);
    document.getElementById('upload-area')?.addEventListener('click', () => document.getElementById('video-upload').click());

    // إضافة زر تحويل النقاط
    const redeemBtn = document.createElement('button');
    redeemBtn.id = 'redeemBtn';
    redeemBtn.innerText = '💎 حول نقاطك إلى Pi 💎';
    redeemBtn.onclick = redeemPoints;
    document.body.appendChild(redeemBtn);

    // زر إعلان يدوي
    const adManual = document.createElement('button');
    adManual.id = 'adManualBtn';
    adManual.innerText = '📺 شاهد إعلان +5';
    adManual.onclick = () => showAd();
    document.body.appendChild(adManual);
};
