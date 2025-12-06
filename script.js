document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       1) スクロールアニメーション → IntersectionObserverで高性能化
    ============================================================ */
    const revealSections = document.querySelectorAll('section');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target); // 一度見えたら解除して軽量化
            }
        });
    }, { threshold: 0.2 });  // 20%見えれば発火（スマホでも安定）

    revealSections.forEach(sec => {
        sec.style.opacity = '0';
        sec.style.transform = 'translateY(30px)'; // 初期位置
        observer.observe(sec);
    });



    /* ============================================================
       2) 参加ボタン
    ============================================================ */
    const joinBtn = document.querySelector('.join-btn');
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            alert('登録ページへ移動します');
            // location.href = "/register.html"; ← 実装予定なら有効化
        });
    }



    /* ============================================================
       3) サイドバー → hover依存を解消しスマホUIを改善
          → ボタンで開閉する仕様も追加可能
    ============================================================ */
    const sidebar = document.querySelector('.sidebar');
    let sidebarTimeout;

    sidebar.addEventListener('mouseenter', () => {
        clearTimeout(sidebarTimeout);
        sidebar.style.right = '0';
    });

    sidebar.addEventListener('mouseleave', () => {
        sidebarTimeout = setTimeout(() => {
            sidebar.style.right = '-300px';
        }, 400);
    });

    // 📌 スマホ用タップ操作（強化点‼）
    document.addEventListener('touchstart', (e) => {
        if (!sidebar.contains(e.target)) {
            sidebar.style.right = '-300px';
        }
    });



    /* ============================================================
       4) 暗号化 / 復号関数
    ============================================================ */
    const cryptoKey = 'secureKey123';

    const customEncrypt = input =>
        [...input].map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ cryptoKey.charCodeAt(i % cryptoKey.length))).join('');

    const customDecrypt = encrypted => customEncrypt(encrypted); // XORは同関数で復号可



    /* ============================================================
       5) ログイン機能
    ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const decryptConfidentialData = () => customDecrypt('暗号化された機密情報');

    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email === 'test' && customEncrypt(password) === 'AAABBBCCC') {
                alert('ログイン成功');
                alert('機密情報: ' + decryptConfidentialData());
            } else {
                alert('認証失敗');
            }
        });
    }



    /* ============================================================
       6) お問い合わせフォーム(localStorage保存)
    ============================================================ */
    const contactForm = document.getElementById('contactForm');

    const updateContactList = () => {
        const list = document.getElementById('contact-list-items');
        const data = JSON.parse(localStorage.getItem('contacts')) || [];
        if (list)
            list.innerHTML = data.map(c =>
                `<li><strong>${c.name}</strong> (${c.email}) : ${c.message}</li>`
            ).join('');
    };

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const entry = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };

            const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
            contacts.push(entry);
            localStorage.setItem('contacts', JSON.stringify(contacts));

            alert("お問い合わせ完了！");
            updateContactList();
        });
    }

    updateContactList(); // 初期描画
});
