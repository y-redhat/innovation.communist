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
