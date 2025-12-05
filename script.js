document.addEventListener('DOMContentLoaded', () => {
  // スクロールアニメーション
  const animateOnScroll = () => {
      const sections = document.querySelectorAll('section');
      const windowHeight = window.innerHeight;
      const triggerPoint = windowHeight * 0.8;

      sections.forEach(section => {
          const sectionTop = section.getBoundingClientRect().top;
          if (sectionTop < triggerPoint) {
              section.style.opacity = '1';
              section.style.transform = 'translateY(0)';
          }
      });
  };

  // スクロールイベントの最適化
  let isScrolling;
  window.addEventListener('scroll', () => {
      clearTimeout(isScrolling);
      isScrolling = setTimeout(animateOnScroll, 50);
  }, { passive: true });

  // 初期アニメーション
  animateOnScroll();

  // 参加ボタンのイベント
  const joinBtn = document.querySelector('.join-btn');
  if (joinBtn) {
      joinBtn.addEventListener('click', () => {
          alert('登録ページへ移動します');
          // 実際にはここで登録ページへリダイレクト
      });
  }

  // サイドバーのインタラクション
  const sidebar = document.querySelector('.sidebar');
  let sidebarTimeout;

  sidebar.addEventListener('mouseenter', () => {
      clearTimeout(sidebarTimeout);
      sidebar.style.right = '0';
  });

  sidebar.addEventListener('mouseleave', () => {
      sidebarTimeout = setTimeout(() => {
          sidebar.style.right = '-300px';
      }, 500);
  });
});




document.addEventListener('DOMContentLoaded', () => {
    // 暗号化関数（例: XOR暗号化）
    const customEncrypt = (input) => {
        const key = 'secureKey123'; // 固定キー（実際はより安全な方法で生成）
        let encrypted = '';
        for (let i = 0; i < input.length; i++) {
            const charCode = input.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            encrypted += String.fromCharCode(charCode);
        }
        return encrypted;
    };

    // 復号化関数
    const customDecrypt = (encrypted) => {
        const key = 'secureKey123'; // 固定キー（実際はより安全な方法で生成）
        let decrypted = '';
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode);
        }
        return decrypted;
    };

    // ログインフォームの処理
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // メールアドレスがtestで、パスワードを暗号化した結果がAAABBBCCCの場合
            if (email === 'test' && customEncrypt(password) === 'AAABBBCCC') {
                alert('ログイン成功');
                // 機密情報をアラートで表示
                alert('機密情報: ' + decryptConfidentialData());
            } else {
                alert('認証失敗');
            }
        });
    }

    // 機密情報の解読
    const decryptConfidentialData = () => {
        const encryptedData = '暗号化された機密情報'; // 実際は動的に生成
        return customDecrypt(encryptedData);
    };

    // お問い合わせフォームの処理
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            const contact = { name, email, message };
            const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
            contacts.push(contact);
            localStorage.setItem('contacts', JSON.stringify(contacts));

            alert('お問い合わせが送信されました');
            updateContactList();
        });
    }

    // お問い合わせリストの更新
    const updateContactList = () => {
        const contactListItems = document.getElementById('contact-list-items');
        const contacts = JSON.parse(localStorage.getItem('contacts')) || [];
        contactListItems.innerHTML = contacts.map(contact => 
            `<li><strong>${contact.name}</strong> (${contact.email}): ${contact.message}</li>`
        ).join('');
    };

    // 初期表示
    updateContactList();
});
