document.addEventListener('DOMContentLoaded', () => {
  /* ---------- Nav scroll state ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const burger = document.querySelector('.nav-burger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileClose = document.querySelector('.mobile-close');
  const toggleMobile = (open) => {
    if (!mobileNav) return;
    mobileNav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger && burger.addEventListener('click', () => toggleMobile(true));
  mobileClose && mobileClose.addEventListener('click', () => toggleMobile(false));
  mobileNav && mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMobile(false)));

  /* ---------- Active nav link ---------- */
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Stat counters ---------- */
  const counters = document.querySelectorAll('[data-counter]');
  const animateCounter = (el) => {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window && counters.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------- Marquee duplicate for seamless loop ---------- */
  document.querySelectorAll('.marquee').forEach(m => {
    m.innerHTML += m.innerHTML;
  });

  /* ---------- Custom select dropdowns (replaces native picker) ---------- */
  document.querySelectorAll('.field select').forEach((select) => {
    const wrap = document.createElement('div');
    wrap.className = 'custom-select';
    select.parentNode.insertBefore(wrap, select);
    wrap.appendChild(select);
    select.classList.add('native-select-hidden');
    select.setAttribute('tabindex', '-1');
    select.setAttribute('aria-hidden', 'true');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'custom-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');
    if (select.id) trigger.setAttribute('id', select.id + '-trigger');

    const triggerLabel = document.createElement('span');
    trigger.appendChild(triggerLabel);
    const chevron = document.createElement('span');
    chevron.className = 'custom-select-chevron';
    chevron.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
    trigger.appendChild(chevron);

    const menu = document.createElement('ul');
    menu.className = 'custom-select-menu';
    menu.setAttribute('role', 'listbox');

    const options = Array.from(select.options).map((opt) => {
      const li = document.createElement('li');
      li.className = 'custom-select-option';
      li.setAttribute('role', 'option');
      li.tabIndex = -1;
      li.dataset.value = opt.value;
      li.innerHTML = `<span>${opt.textContent}</span><svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
      menu.appendChild(li);
      return li;
    });

    wrap.appendChild(trigger);
    wrap.appendChild(menu);

    const syncFromSelect = () => {
      const selectedOption = select.options[select.selectedIndex];
      triggerLabel.textContent = selectedOption ? selectedOption.textContent : '';
      options.forEach(li => li.classList.toggle('is-selected', li.dataset.value === select.value));
    };
    syncFromSelect();

    const closeMenu = () => {
      wrap.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    };
    const openMenu = () => {
      wrap.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');
      const current = options.find(li => li.classList.contains('is-selected'));
      (current || options[0])?.focus();
    };

    trigger.addEventListener('click', () => {
      wrap.classList.contains('open') ? closeMenu() : openMenu();
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); openMenu(); }
    });

    options.forEach((li) => {
      li.addEventListener('click', () => {
        select.value = li.dataset.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncFromSelect();
        closeMenu();
        trigger.focus();
      });
      li.addEventListener('keydown', (e) => {
        const idx = options.indexOf(li);
        if (e.key === 'ArrowDown') { e.preventDefault(); (options[idx + 1] || options[0]).focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); (options[idx - 1] || options[options.length - 1]).focus(); }
        else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); }
        else if (e.key === 'Escape') { e.preventDefault(); closeMenu(); trigger.focus(); }
        else if (e.key === 'Tab') { closeMenu(); }
      });
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeMenu();
    });
  });

  /* ---------- Toast ---------- */
  let toastTimer;
  const showToast = (message) => {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.innerHTML = `
        <span class="toast-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
        <span class="toast-text"></span>
        <button type="button" class="toast-close" aria-label="Dismiss"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg></button>
      `;
      document.body.appendChild(toast);
      toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        clearTimeout(toastTimer);
      });
    }
    toast.querySelector('.toast-text').textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 5000);
  };

  /* ---------- Contact form (submits to Web3Forms) ---------- */
  const form = document.querySelector('.contact-form');
  if (form) {
    const error = form.querySelector('.form-error');
    const submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      error && error.classList.remove('show');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form)
        });
        const result = await response.json();
        if (response.ok && result.success) {
          form.reset();
          showToast('Thank you — your message has been sent successfully.');
        } else {
          error && error.classList.add('show');
        }
      } catch (err) {
        error && error.classList.add('show');
      } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send Inquiry'; }
      }
    });
  }
});
