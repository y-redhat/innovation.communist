document.addEventListener('DOMContentLoaded', function() {
  // スクロールアニメーション
  const handleScroll = () => {
      const sections = document.querySelectorAll('section');
      sections.forEach(section => {
          const sectionTop = section.getBoundingClientRect().top;
          if (sectionTop < window.innerHeight * 0.8) {
              section.classList.add('visible');
          }
      });
  };

  // スクロールイベントの最適化
  let isScrolling;
  window.addEventListener('scroll', function() {
      window.clearTimeout(isScrolling);
      isScrolling = setTimeout(handleScroll, 100);
  });

  // 初期表示時にすべてのセクションを表示
  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop < window.innerHeight * 0.8) {
          section.classList.add('visible');
      }
  });
});
