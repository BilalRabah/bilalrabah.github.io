const translations = {
    ar: {
        app_name: "كاش كام",
        home: "الرئيسية",
        friends: "الأصدقاء",
        upload: "نشر",
        inbox: "الوارد",
        profile: "ملفي",
        points: "نقطة",
        redeem: "💎 حول نقاطك إلى Pi 💎",
        watch_ad: "📺 شاهد إعلان +5",
        upload_video: "رفع فيديو جديد",
        drag_drop: "اسحب الفيديو أو اضغط للاختيار",
        caption_placeholder: "اكتب وصفاً جذاباً...",
        publish_btn: "نشر الفيديو +20 نقطة",
        comments: "التعليقات",
        add_comment: "أضف تعليقاً...",
        send: "إرسال",
        toast_watch_complete: "مشاهدة فيديو كاملة",
        toast_like: "إعجاب",
        toast_comment: "كتابة تعليق",
        toast_upload: "تم النشر! +20 نقطة",
        toast_redeem_success: "تم تحويل النقاط إلى Pi بنجاح",
        toast_redeem_fail_points: "تحتاج 500 نقطة على الأقل",
        toast_redeem_fail_videos: "تحتاج 3 فيديوهات على الأقل",
        ad_title: "إعلان قصير",
        ad_watch: "شاهد الإعلان 5 ثوانٍ",
        ad_skip: "تخطي",
        level_bronze: "برونز",
        level_silver: "فضي",
        level_gold: "ذهبي",
        level_diamond: "ألماس",
    },
    en: {
        app_name: "CashCam",
        home: "Home",
        friends: "Friends",
        upload: "Upload",
        inbox: "Inbox",
        profile: "Profile",
        points: "points",
        redeem: "💎 Redeem to Pi 💎",
        watch_ad: "📺 Watch Ad +5",
        upload_video: "Upload Video",
        drag_drop: "Drag video or click to select",
        caption_placeholder: "Write a catchy caption...",
        publish_btn: "Publish Video +20 points",
        comments: "Comments",
        add_comment: "Add a comment...",
        send: "Send",
        toast_watch_complete: "Watched full video",
        toast_like: "Liked",
        toast_comment: "Commented",
        toast_upload: "Video published! +20 points",
        toast_redeem_success: "Points converted to Pi successfully",
        toast_redeem_fail_points: "Need at least 500 points",
        toast_redeem_fail_videos: "Need at least 3 videos",
        ad_title: "Short Ad",
        ad_watch: "Watch ad for 5 seconds",
        ad_skip: "Skip",
        level_bronze: "Bronze",
        level_silver: "Silver",
        level_gold: "Gold",
        level_diamond: "Diamond",
    },
    fr: {
        app_name: "CashCam",
        home: "Accueil",
        friends: "Amis",
        upload: "Publier",
        inbox: "Boîte",
        profile: "Profil",
        points: "points",
        redeem: "💎 Échanger en Pi 💎",
        watch_ad: "📺 Voir pub +5",
        upload_video: "Publier une vidéo",
        drag_drop: "Glisser ou cliquer pour sélectionner",
        caption_placeholder: "Écris une description...",
        publish_btn: "Publier +20 points",
        comments: "Commentaires",
        add_comment: "Ajouter un commentaire...",
        send: "Envoyer",
        toast_watch_complete: "Vidéo regardée",
        toast_like: "J'aime",
        toast_comment: "Commenté",
        toast_upload: "Vidéo publiée ! +20 points",
        toast_redeem_success: "Points convertis en Pi avec succès",
        toast_redeem_fail_points: "500 points requis",
        toast_redeem_fail_videos: "3 vidéos requises",
        ad_title: "Publicité courte",
        ad_watch: "Regardez 5 secondes",
        ad_skip: "Passer",
        level_bronze: "Bronze",
        level_silver: "Argent",
        level_gold: "Or",
        level_diamond: "Diamant",
    }
};

let currentLang = localStorage.getItem('lang') || 'ar';

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    if (typeof applyTranslationsToPage === 'function') applyTranslationsToPage();
    else location.reload();
}

window.t = t;
window.setLanguage = setLanguage;
