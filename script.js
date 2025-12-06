document.addEventListener('DOMContentLoaded', async () => {

/* ============================================================
   1) スクロールアニメーション
============================================================ */
const revealSections = document.querySelectorAll('section');
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
},{ threshold: 0.2 });

revealSections.forEach(sec=>{
    sec.style.opacity='0';
    sec.style.transform='translateY(30px)';
    observer.observe(sec);
});


/* ============================================================
   2) 参加ボタン
============================================================ */
const joinBtn=document.querySelector('.join-btn');
if(joinBtn){
    joinBtn.addEventListener('click',()=>{
        alert('登録ページへ移動します');
        //location.href="/register.html";
    });
}


/* ============================================================
   3) サイドバー（スマホ対応）
============================================================ */
const sidebar=document.querySelector('.sidebar');
let sidebarTimeout;

sidebar.addEventListener('mouseenter',()=>{
    clearTimeout(sidebarTimeout);
    sidebar.style.right='0';
});
sidebar.addEventListener('mouseleave',()=>{
    sidebarTimeout=setTimeout(()=>{ sidebar.style.right='-300px'; },400);
});
document.addEventListener('touchstart',e=>{
    if(!sidebar.contains(e.target)) sidebar.style.right='-300px';
});


/* ============================================================
   4) 🔐 Python互換復号JS
============================================================ */
async function decryptPyCipher(b64,password){
    const SALT_LEN=32,NONCE_LEN=24,DK_LEN=96,ITER=200000;

    const raw=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const salt =raw.slice(0,SALT_LEN);
    const nonce=raw.slice(SALT_LEN,SALT_LEN+NONCE_LEN);
    const cipher=raw.slice(SALT_LEN+NONCE_LEN,raw.length-64);
    const tag  =raw.slice(raw.length-64);

    async function pbkdf2(pass,salt,len){
        const key=await crypto.subtle.importKey("raw",
            new TextEncoder().encode(pass),{name:"PBKDF2"},false,["deriveBits"]);
        return crypto.subtle.deriveBits(
            {name:"PBKDF2",salt,iterations:ITER,hash:"SHA-256"}, key,len*8);
    }
    const master=new Uint8Array(await pbkdf2(password,salt,DK_LEN));
    const encKey=master.slice(0,48), macKey=master.slice(48,96);

    const tagCheck = new Uint8Array(await crypto.subtle.sign("HMAC",
        await crypto.subtle.importKey("raw",macKey,{name:"HMAC",hash:"SHA-512"},false,["sign"]),
        new Uint8Array([...salt,...nonce,...cipher])
    ));
    if(!tag.every((v,i)=>v===tagCheck[i])) return null;

    const ks=new Uint8Array(await crypto.subtle.digest("SHA-512",
        new Uint8Array([...encKey,...nonce])));
    return new TextDecoder().decode(cipher.map((v,i)=>v^(ks[i%64])));
}


/* ================================
    🔐 ログイン認証
================================== */
const CIPHER_TEXT="<< Python生成暗号文 >>";

document.getElementById("loginForm")?.addEventListener("submit",async e=>{
    e.preventDefault();
    const inputPass=document.getElementById("password").value;
    const result=await decryptPyCipher(CIPHER_TEXT,inputPass);

    if(result==="ALLOW_LOGIN"){
        alert("✔ 認証成功！");
        location.href="home.html";
    }else alert("❌ パスワードが違います");
});


/* ============================================================
   6) お問い合わせフォーム
============================================================ */
const contactForm=document.getElementById('contactForm');
const updateContactList=async()=>{
    const list=document.getElementById('contact-list-items');
    const encryptedData=localStorage.getItem('contacts')||'[]';

    const decryptedData=await decodeCredentials(encryptedData);
    const data=JSON.parse(decryptedData);

    if(list) list.innerHTML=data.map(c=>
        `<li><strong>${c.name}</strong> (${c.email}) : ${c.message}</li>`).join('');
};

if(contactForm){
    contactForm.addEventListener('submit',async e=>{
        e.preventDefault();
        const entry={
            name:contactForm.name.value,
            email:contactForm.email.value,
            message:contactForm.message.value
        };

        const encryptedData=localStorage.getItem('contacts')||'[]';
        const decryptedData=await decodeCredentials(encryptedData);
        const contacts=JSON.parse(decryptedData);

        contacts.push(entry);
        const newEncryptedData=await encodeCredentials(JSON.stringify(contacts));
        localStorage.setItem('contacts',newEncryptedData);

        alert("送信完了！");
        updateContactList();
    });
}

updateContactList();

});



/* ============================================================
 6) お問い合わせフォーム（あなたの記述そのまま保持）
============================================================ */

// ... (ここは現状でOK)

});



/* ============================================================
   6) お問い合わせフォーム（ここは現状のままでOK）
============================================================ */
...


    


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

