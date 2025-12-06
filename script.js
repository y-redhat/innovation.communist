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
    const KEY_DATA = [
        193,102,88,44,231,99,201, 184,55,12,78,201,
        44,155,211,95,121,12,80, 199,88,192,14,52
    ]; // ← これが Knapsack 生成種 ＋ AES鍵素材

    function deriveKeys(){
        let aesKey = new Uint8Array(KEY_DATA.map(x=> (x*7+13)%256 ));
        let knapsack = KEY_DATA.map((x,i)=> x*(i+2)+17);
        return {aesKey,knapsack};
    }
    const {aesKey,knapsack} = deriveKeys();

    /* ---- Knapsack encrypt ---- */
    function knapsackEncrypt(text){
        return text.split("").map(ch=>{
            let code=ch.charCodeAt(0),sum=0;
            for(let i=0;i<8;i++) if(code&(1<<i)) sum+=knapsack[i];
            return sum.toString(36);
        }).join("-");
    }
    function knapsackDecrypt(encrypted){
        return encrypted.split("-").map(block=>{
            let target=parseInt(block,36),val=0;
            for(let i=7;i>=0;i--) if(target>=knapsack[i]){target-=knapsack[i];val|=(1<<i);}
            return String.fromCharCode(val);
        }).join("");
    }

    /* ---- AES ---- */
    async function aesEncrypt(text,key=aesKey){
        let cryptoKey=await crypto.subtle.importKey("raw",key,{name:"AES-GCM"},false,["encrypt"]);
        let iv=crypto.getRandomValues(new Uint8Array(12));
        let enc=await crypto.subtle.encrypt({name:"AES-GCM",iv},cryptoKey,new TextEncoder().encode(text));
        return btoa([...iv,...new Uint8Array(enc)].map(b=>String.fromCharCode(b)).join(""));
    }
    async function aesDecrypt(encoded,key=aesKey){
        let data=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));
        let iv=data.slice(0,12),cipher=data.slice(12);
        let cryptoKey=await crypto.subtle.importKey("raw",key,{name:"AES-GCM"},false,["decrypt"]);
        let dec=await crypto.subtle.decrypt({name:"AES-GCM",iv},cryptoKey,cipher);
        return new TextDecoder().decode(dec);
    }

    /* === Combined (Encode/Decode) === */
    async function encodeCredentials(mail,pass){
        return await aesEncrypt(knapsackEncrypt(mail+"::"+pass));
    }
    async function decodeCredentials(cipher){
        return knapsackDecrypt(await aesDecrypt(cipher));
    }



    /* ============================================================
       5) ログイン機能（AES + ナップザック暗号対応）
    ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const decryptConfidentialData = async () => {
        const encryptedData = '暗号化された機密情報'; // 例: AES + ナップザック暗号化されたデータ
        return await decodeCredentials(encryptedData);
    };

    if (loginForm) {
        loginForm.addEventListener('submit', async e => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // パスワードをAES + ナップザック暗号化
            const encryptedPassword = await encodeCredentials(email, password);

            // 暗号化された認証情報を使用して認証
            const encryptedEmail = await encodeCredentials(email, '');
            const encryptedPasswordForAuth = await encodeCredentials('', password);

            if (encryptedEmail === '暗号化されたメール' && encryptedPasswordForAuth === '暗号化されたパスワード') {
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
        const decryptedData = await decodeCredentials(encryptedData);
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
            const decryptedData = await decodeCredentials(encryptedData);
            const contacts = JSON.parse(decryptedData);
            contacts.push(entry);
            const newEncryptedData = await encodeCredentials(JSON.stringify(contacts));
            localStorage.setItem('contacts', newEncryptedData);

            alert("お問い合わせ完了！");
            await updateContactList();
        });
    }

    updateContactList(); // 初期描画
});

