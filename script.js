document.addEventListener('DOMContentLoaded', async () => {

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
       4) AES + ナップザック暗号化 / 復号関数
    ============================================================ */
    const cryptoKey = 'secureKey123'; // AESキー
    const publicKey = [2, 3, 7, 14, 30, 57, 120, 251]; // ナップザック公開鍵
    const privateKey = [1, 2, 4, 8, 16, 32, 64, 128]; // ナップザック秘密鍵

    // AES暗号化
    const aesEncrypt = async (key, plaintext) => {
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const cipher = new TextEncoder().encode(plaintext);
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(key),
            { name: 'AES-CFB' },
            false,
            ['encrypt']
        );
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-CFB', iv }, cryptoKey, cipher);
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);
        return combined;
    };

    // AES復号
    const aesDecrypt = async (key, ciphertext) => {
        const iv = ciphertext.slice(0, 16);
        const encrypted = ciphertext.slice(16);
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(key),
            { name: 'AES-CFB' },
            false,
            ['decrypt']
        );
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-CFB', iv }, cryptoKey, encrypted);
        return new TextDecoder().decode(decrypted);
    };

    // ナップザック暗号化
    const knapsackEncrypt = (publicKey, plaintext) => {
        return [...plaintext].reduce((sum, char, i) => sum + publicKey[i % publicKey.length] * char.charCodeAt(0), 0);
    };

    // ナップザック復号
    const knapsackDecrypt = (privateKey, ciphertext) => {
        let plaintext = '';
        for (let i = privateKey.length - 1; i >= 0; i--) {
            if (ciphertext >= privateKey[i]) {
                plaintext = String.fromCharCode(1) + plaintext;
                ciphertext -= privateKey[i];
            } else {
                plaintext = String.fromCharCode(0) + plaintext;
            }
        }
        return plaintext;
    };

    // エンコード
    const encode = async (key, publicKey, plaintext) => {
        const aesCiphertext = await aesEncrypt(key, plaintext);
        return knapsackEncrypt(publicKey, new TextDecoder().decode(aesCiphertext));
    };

    // デコード
    const decode = async (key, privateKey, ciphertext) => {
        const knapsackPlaintext = knapsackDecrypt(privateKey, ciphertext);
        return aesDecrypt(key, new TextEncoder().encode(knapsackPlaintext));
    };



    /* ============================================================
       5) ログイン機能（AES + ナップザック暗号対応）
    ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const decryptConfidentialData = async () => {
        const encryptedData = '暗号化された機密情報'; // 例: AES + ナップザック暗号化されたデータ
        return await decode(cryptoKey, privateKey, encryptedData);
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // パスワードをAES + ナップザック暗号化
            const encryptedPassword = await encode(cryptoKey, publicKey, password);

            if (email === 'test' && encryptedPassword === 'AAABBBCCC') { // 例: 暗号化されたパスワード
                alert('ログイン成功');
                const confidentialData = await decryptConfidentialData();
                alert('機密情報: ' + confidentialData);
            } else {
                alert('認証失敗');
            }
        });
    }



    /* ============================================================
       6) お問い合わせフォーム（AES + ナップザック暗号対応）
    ============================================================ */
    const contactForm = document.getElementById('contactForm');

    const updateContactList = async () => {
        const list = document.getElementById('contact-list-items');
        const encryptedData = localStorage.getItem('contacts') || '[]';
        const decryptedData = await decode(cryptoKey, privateKey, encryptedData);
        const data = JSON.parse(decryptedData);
        if (list)
            list.innerHTML = data.map(c =>
                `<li><strong>${c.name}</strong> (${c.email}) : ${c.message}</li>`
            ).join('');
    };

    if (contactForm) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            const entry = {
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value
            };

            const encryptedData = localStorage.getItem('contacts') || '[]';
            const decryptedData = await decode(cryptoKey, privateKey, encryptedData);
            const contacts = JSON.parse(decryptedData);
            contacts.push(entry);
            const newEncryptedData = await encode(cryptoKey, publicKey, JSON.stringify(contacts));
            localStorage.setItem('contacts', newEncryptedData);

            alert("お問い合わせ完了！");
            await updateContactList();
        });
    }

    updateContactList(); // 初期描画
});
