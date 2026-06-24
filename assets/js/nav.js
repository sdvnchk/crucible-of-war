(async function () {
  /* Определяем базовый путь из тега <base> */
  const base = document.querySelector('base')?.href ?? './';

  async function include(id, url) {
    const el = document.getElementById(id);
    if (!el) return;
    try {
      const r = await fetch(url);
      if (r.ok) el.innerHTML = await r.text();
    } catch {
      /* В offline-режиме (file://) fetch не работает */
    }
  }

  await Promise.all([
    include('header-placeholder', base + 'components/header.html'),
    include('footer-placeholder', base + 'components/footer.html'),
  ]);

  /* Подсвечиваем активную ссылку */
  const page = document.body.dataset.page;
  if (page) {
    document.querySelectorAll(`[data-navkey="${page}"]`)
      .forEach(el => el.classList.add('active'));
  }
}());

/* Глобальные функции дравера — нужны до вставки header.html */
function openDrawer() {
  document.getElementById('mobile-drawer')?.classList.add('open');
  document.getElementById('drawer-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  document.getElementById('mobile-drawer')?.classList.remove('open');
  document.getElementById('drawer-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}
