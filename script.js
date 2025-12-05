document.addEventListener('DOMContentLoaded', function() {
  // スクロールアニメーション
  document.addEventListener('scroll', function() {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
          const sectionTop = section.getBoundingClientRect().top;
          if (sectionTop < window.innerHeight * 0.8) {
              section.classList.add('visible');
          }
      });
  });

  // 初期表示時に最初のセクションを表示
  document.querySelector('section').classList.add('visible');
});
