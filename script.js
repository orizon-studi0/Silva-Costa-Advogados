const WHATSAPP_NUMBER = '5511999998888';

/* --------------------------------------------------------------------------
   FUNÇÕES PURAS (FORMATAÇÃO, VALIDAÇÃO, SLIDES E WHATSAPP)
   -------------------------------------------------------------------------- */
export function formatBrPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '').slice(0, 11);
  if (digits.length > 6) {
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
  }
  if (digits.length > 2) {
    return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
  }
  if (digits.length > 0) {
    return '(' + digits;
  }
  return '';
}

export function validateContactFields(nome, telefone) {
  const cleanName = String(nome || '').trim();
  const phoneDigits = String(telefone || '').replace(/\D/g, '');
  return {
    nomeValid: cleanName.length >= 3,
    telefoneValid: phoneDigits.length >= 10,
    cleanName: cleanName,
    phoneDigits: phoneDigits,
  };
}

export function buildWhatsAppUrl(data) {
  const msgVal =
    data.mensagem && String(data.mensagem).trim()
      ? String(data.mensagem).trim()
      : 'Solicito agendamento de consulta inicial.';

  const textoCompleto =
    'Olá! Gostaria de agendar uma consulta inicial com a Silva & Costa Advogados.\n\n' +
    '*Nome:* ' + data.nome + '\n' +
    '*Telefone:* ' + data.telefone + '\n' +
    '*Área de Interesse:* ' + (data.area || 'Geral') + '\n' +
    '*Mensagem:* ' + msgVal;

  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(textoCompleto);
}

export function wrapSlideIndex(index, total) {
  if (!total || total <= 0) return 0;
  return ((index % total) + total) % total;
}

function initApp() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* --------------------------------------------------------------------------
     1. BARRA DE PROGRESSO & HEADER INTELIGENTE
     -------------------------------------------------------------------------- */
  const progressEl = document.getElementById('readingProgress');
  const siteChrome = document.getElementById('siteChrome');
  let lastScrollY = window.scrollY;

  function updateScrollChrome() {
    const currentY = window.scrollY;
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressEl && totalScrollable > 0) {
      const ratio = Math.min(Math.max(currentY / totalScrollable, 0), 1);
      progressEl.style.transform = 'scaleX(' + ratio + ')';
    }

    if (siteChrome) {
      if (currentY > 40) {
        siteChrome.classList.add('is-scrolled');
      } else {
        siteChrome.classList.remove('is-scrolled');
      }

      const drawerOpen = document.getElementById('mobileDrawer')?.classList.contains('is-open');
      if (!drawerOpen && currentY > 160 && currentY > lastScrollY + 4) {
        siteChrome.classList.add('is-hidden');
      } else if (currentY < lastScrollY - 4 || currentY <= 160) {
        siteChrome.classList.remove('is-hidden');
      }
    }

    lastScrollY = currentY;
  }

  window.addEventListener('scroll', updateScrollChrome, { passive: true });
  updateScrollChrome();

  /* --------------------------------------------------------------------------
     2. MENU MOBILE FULLSCREEN
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');

  function setDrawerOpen(open) {
    if (!mobileDrawer || !menuToggle) return;
    mobileDrawer.classList.toggle('is-open', open);
    mobileDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    menuToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';

    if (open && drawerClose) {
      drawerClose.focus();
    } else if (!open) {
      menuToggle.focus();
    }
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mobileDrawer.classList.contains('is-open');
      setDrawerOpen(!isOpen);
    });

    if (drawerClose) {
      drawerClose.addEventListener('click', function () {
        setDrawerOpen(false);
      });
    }

    mobileDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        setDrawerOpen(false);
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        setDrawerOpen(false);
      }
    });
  }

  /* --------------------------------------------------------------------------
     3. LINK ATIVO NA NAVEGAÇÃO
     -------------------------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-desktop .nav-link');
  const observedSections = document.querySelectorAll('main section[id]');

  if ('IntersectionObserver' in window && navLinks.length > 0) {
    const navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === '#' + id);
          });
        });
      },
      { rootMargin: '-25% 0px -65% 0px' }
    );
    observedSections.forEach(function (sec) {
      navObserver.observe(sec);
    });
  }

  /* --------------------------------------------------------------------------
     4. DISCLOSURE "LER MAIS" NA SEÇÃO SOBRE
     -------------------------------------------------------------------------- */
  const sobreBtn = document.getElementById('sobreDisclosureBtn');
  const sobreBody = document.getElementById('sobreDisclosureBody');
  if (sobreBtn && sobreBody) {
    sobreBtn.addEventListener('click', function () {
      const isOpen = sobreBody.classList.toggle('is-open');
      sobreBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const label = sobreBtn.querySelector('.disclosure-label');
      if (label) {
        label.textContent = isOpen ? 'Recolher texto' : 'Ler mais sobre o escritório';
      }
    });
  }

  /* --------------------------------------------------------------------------
     5. ÁREAS DE ATUAÇÃO — ÍNDICE EXPANSÍVEL / ACORDEÃO
     -------------------------------------------------------------------------- */
  const practiceItems = document.querySelectorAll('.practice-item');
  practiceItems.forEach(function (item) {
    const trigger = item.querySelector('.practice-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      const willOpen = !item.classList.contains('is-open');

      practiceItems.forEach(function (other) {
        other.classList.remove('is-open');
        const otherBtn = other.querySelector('.practice-trigger');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --------------------------------------------------------------------------
     6. EQUIPE — BIO POR TOQUE NO MOBILE & NAVEGAÇÃO DO CARROSSEL SNAP
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.team-bio-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const card = btn.closest('.team-card');
      if (!card) return;
      const isOpen = card.classList.toggle('is-bio-open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      btn.textContent = isOpen ? 'Ocultar perfil' : 'Ver formação';
    });
  });

  const teamCarousel = document.getElementById('teamCarousel');
  const teamPrev = document.getElementById('teamPrev');
  const teamNext = document.getElementById('teamNext');

  if (teamCarousel && teamPrev && teamNext) {
    function scrollTeam(direction) {
      const step = Math.round(teamCarousel.clientWidth * 0.85);
      teamCarousel.scrollBy({
        left: direction * step,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
    teamPrev.addEventListener('click', function () {
      scrollTeam(-1);
    });
    teamNext.addEventListener('click', function () {
      scrollTeam(1);
    });
  }

  /* --------------------------------------------------------------------------
     7. ORIENTAÇÕES — LEITOR DE ARTIGO (CAPAS EDITORIAIS)
     -------------------------------------------------------------------------- */
  const ARTICLES_DATA = {
    laboral: {
      category: 'Relações de Trabalho',
      title: 'A Importância da Documentação Laboral',
      paragraphs: [
        'Manter comprovantes de pagamento, registros de ponto, comunicações formais e termos de rescisão organizados ajuda trabalhadores e empregadores a prevenirem conflitos e a demonstrarem, com objetividade, o cumprimento das obrigações contratuais.',
        'Na rotina empresarial ou no encerramento do vínculo, a ausência de recibos assinados, aditivos de função ou controles claros de jornada costuma ser o ponto central de divergências em reclamações trabalhistas.',
        'Para o trabalhador, guardar holerites, extratos do FGTS, cópias de contratos e comunicações escritas permite que uma eventual conferência jurídica seja feita com base documental precisa, sem depender apenas de memória ou relatos verbais.'
      ],
      waUrl:
        'https://wa.me/5511999998888?text=' +
        encodeURIComponent(
          'Olá! Li a orientação sobre Documentação Laboral e gostaria de tirar dúvidas.'
        ),
    },
    inventario: {
      category: 'Família & Patrimônio',
      title: 'Inventário: Vantagens da Via Extrajudicial',
      paragraphs: [
        'Quando todos os herdeiros são maiores, capazes e estão de acordo quanto à divisão dos bens, o inventário pode ser formalizado por escritura pública diretamente em tabelionato de notas, mediante assistência de advogado.',
        'Em comparação ao processo judicial, a via extrajudicial costuma tramitar em prazo consideravelmente menor e com menor desgaste emocional para os familiares, permitindo que a regularização patrimonial ocorra de forma organizada.',
        'Antes de iniciar o procedimento, é necessário levantar certidões dos imóveis, extratos bancários, eventuais dívidas do espólio e calcular o ITCMD devido no estado competente.'
      ],
      waUrl:
        'https://wa.me/5511999998888?text=' +
        encodeURIComponent(
          'Olá! Gostaria de orientações sobre inventário extrajudicial.'
        ),
    },
    contratos: {
      category: 'Negócios & Contratos',
      title: 'Cláusulas Essenciais em Contratos Comerciais',
      paragraphs: [
        'Definir com precisão o objeto do serviço ou fornecimento, os prazos de entrega, os critérios de reajuste, as multas por descumprimento e o foro de eleição protege o equilíbrio da relação comercial.',
        'Cláusulas genéricas ou modelos copiados sem adaptação à realidade da operação frequentemente deixam lacunas sobre responsabilidade civil, confidencialidade, propriedade intelectual e hipóteses de rescisão antecipada.',
        'Uma revisão jurídica prévia à assinatura identifica ambiguidades e garante que as condições negociadas verbalmente estejam refletidas com segurança no instrumento contratual.'
      ],
      waUrl:
        'https://wa.me/5511999998888?text=' +
        encodeURIComponent(
          'Olá! Gostaria de orientações sobre contratos comerciais.'
        ),
    },
  };

  const articleModal = document.getElementById('articleModal');
  const articleModalCategory = document.getElementById('articleModalCategory');
  const articleModalTitle = document.getElementById('articleModalTitle');
  const articleModalBody = document.getElementById('articleModalBody');
  const articleModalWa = document.getElementById('articleModalWa');
  const articleModalClose = document.getElementById('articleModalClose');
  let lastFocusedEl = null;

  function openArticleModal(articleId) {
    const article = ARTICLES_DATA[articleId];
    if (!article || !articleModal) return;

    lastFocusedEl = document.activeElement;
    if (articleModalCategory) articleModalCategory.textContent = article.category;
    if (articleModalTitle) articleModalTitle.textContent = article.title;
    if (articleModalBody) {
      articleModalBody.innerHTML = '';
      article.paragraphs.forEach(function (text) {
        const p = document.createElement('p');
        p.textContent = text;
        articleModalBody.appendChild(p);
      });
    }
    if (articleModalWa) articleModalWa.setAttribute('href', article.waUrl);

    articleModal.classList.add('is-open');
    articleModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (articleModalClose) articleModalClose.focus();
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('is-open');
    articleModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  document.querySelectorAll('.article-read-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openArticleModal(btn.getAttribute('data-article'));
    });
  });

  if (articleModalClose) {
    articleModalClose.addEventListener('click', closeArticleModal);
  }
  if (articleModal) {
    articleModal.addEventListener('click', function (e) {
      if (e.target === articleModal) closeArticleModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && articleModal.classList.contains('is-open')) {
        closeArticleModal();
      }
    });
  }

  /* --------------------------------------------------------------------------
     8. FAQ — ACORDEÃO COM ÍCONE + GIRANDO
     -------------------------------------------------------------------------- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', function () {
      const willOpen = !item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        const btn = other.querySelector('.faq-trigger');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });

      if (willOpen) {
        item.classList.add('is-open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --------------------------------------------------------------------------
     9. AMBIENTE — SLIDER LARGO (01 / 06, SWIPE, AUTO PAUSA HOVER/TOQUE)
     -------------------------------------------------------------------------- */
  const SLIDES_META = [
    {
      title: 'Recepção',
      desc: 'Ambiente de chegada planejado para acolher clientes com discrição e conforto no Centro de Campinas.',
    },
    {
      title: 'Biblioteca e Acervo Jurídico',
      desc: 'Espaço reservado à pesquisa doutrinária e jurisprudencial para fundamentação de pareceres.',
    },
    {
      title: 'Sala de Reuniões & Consultas',
      desc: 'Sala privativa destinada a atendimentos presenciais, alinhamentos e mediações.',
    },
    {
      title: 'Sala do Sócio',
      desc: 'Gabinete reservado para atendimento individualizado e análise técnica de documentos.',
    },
    {
      title: 'Corredor & Acessos Privativos',
      desc: 'Circulação silenciosa com isolamento acústico entre os ambientes de atendimento.',
    },
    {
      title: 'Detalhes do Escritório',
      desc: 'Cuidado cotidiano com o ambiente de trabalho e os instrumentos de atendimento.',
    },
  ];

  const galleryStage = document.getElementById('galleryStage');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryCounter = document.getElementById('galleryCounter');
  const galleryCaptionTitle = document.getElementById('galleryCaptionTitle');
  const galleryCaptionDesc = document.getElementById('galleryCaptionDesc');
  const galleryPrev = document.getElementById('galleryPrev');
  const galleryNext = document.getElementById('galleryNext');
  const galleryThumbs = document.querySelectorAll('.gallery-thumb');

  let currentSlide = 0;
  const totalSlides = SLIDES_META.length;
  let galleryAutoTimer = null;
  let isGalleryPaused = false;

  function goToSlide(index) {
    currentSlide = wrapSlideIndex(index, totalSlides);
    if (galleryTrack) {
      galleryTrack.style.transform = 'translateX(-' + currentSlide * 100 + '%)';
    }
    if (galleryCounter) {
      galleryCounter.textContent = '0' + (currentSlide + 1) + ' / 0' + totalSlides;
    }
    const meta = SLIDES_META[currentSlide];
    if (galleryCaptionTitle) galleryCaptionTitle.textContent = meta.title;
    if (galleryCaptionDesc) galleryCaptionDesc.textContent = meta.desc;

    galleryThumbs.forEach(function (thumb, idx) {
      const isCurrent = idx === currentSlide;
      thumb.classList.toggle('is-active', isCurrent);
      thumb.setAttribute('aria-current', isCurrent ? 'true' : 'false');
    });
  }

  function startGalleryAuto() {
    stopGalleryAuto();
    if (prefersReducedMotion || isGalleryPaused) return;
    galleryAutoTimer = window.setInterval(function () {
      goToSlide(currentSlide + 1);
    }, 5500);
  }

  function stopGalleryAuto() {
    if (galleryAutoTimer) {
      clearInterval(galleryAutoTimer);
      galleryAutoTimer = null;
    }
  }

  if (galleryTrack) {
    goToSlide(0);
    startGalleryAuto();

    if (galleryPrev) {
      galleryPrev.addEventListener('click', function () {
        goToSlide(currentSlide - 1);
        startGalleryAuto();
      });
    }
    if (galleryNext) {
      galleryNext.addEventListener('click', function () {
        goToSlide(currentSlide + 1);
        startGalleryAuto();
      });
    }

    galleryThumbs.forEach(function (thumb, idx) {
      thumb.addEventListener('click', function () {
        goToSlide(idx);
        startGalleryAuto();
      });
    });

    if (galleryStage) {
      galleryStage.addEventListener('mouseenter', function () {
        isGalleryPaused = true;
        stopGalleryAuto();
      });
      galleryStage.addEventListener('mouseleave', function () {
        isGalleryPaused = false;
        startGalleryAuto();
      });

      // Swipe no mobile
      let touchStartX = 0;
      let touchStartY = 0;
      galleryStage.addEventListener(
        'touchstart',
        function (e) {
          isGalleryPaused = true;
          stopGalleryAuto();
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        },
        { passive: true }
      );
      galleryStage.addEventListener(
        'touchend',
        function (e) {
          const dx = e.changedTouches[0].clientX - touchStartX;
          const dy = e.changedTouches[0].clientY - touchStartY;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
            goToSlide(dx < 0 ? currentSlide + 1 : currentSlide - 1);
          }
          window.setTimeout(function () {
            isGalleryPaused = false;
            startGalleryAuto();
          }, 4000);
        },
        { passive: true }
      );
    }
  }

  /* --------------------------------------------------------------------------
     10. BARRA FIXA MOBILE (OCULTA QUANDO O FORMULÁRIO ESTÁ VISÍVEL)
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');
  const mobileStickyBar = document.getElementById('mobileStickyBar');

  if (contactForm && mobileStickyBar && 'IntersectionObserver' in window) {
    const formObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          mobileStickyBar.classList.toggle('is-hidden-by-form', entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    formObserver.observe(contactForm);
  }

  /* --------------------------------------------------------------------------
     11. FORMULÁRIO DE CONTATO COM MÁSCARA, VALIDAÇÃO E WHATSAPP
     -------------------------------------------------------------------------- */
  const nomeInput = document.getElementById('formNome');
  const telInput = document.getElementById('formTelefone');
  const areaSelect = document.getElementById('formArea');
  const msgInput = document.getElementById('formMensagem');
  const erroNome = document.getElementById('erroNome');
  const erroTelefone = document.getElementById('erroTelefone');

  if (nomeInput) {
    nomeInput.addEventListener('input', function () {
      const check = validateContactFields(nomeInput.value, telInput ? telInput.value : '');
      if (check.nomeValid) {
        nomeInput.classList.remove('is-invalid');
        nomeInput.setAttribute('aria-invalid', 'false');
        if (erroNome) erroNome.classList.remove('is-visible');
      }
    });
  }

  if (telInput) {
    telInput.addEventListener('input', function (e) {
      e.target.value = formatBrPhone(e.target.value);
      const check = validateContactFields(nomeInput ? nomeInput.value : '', e.target.value);
      if (check.telefoneValid) {
        telInput.classList.remove('is-invalid');
        telInput.setAttribute('aria-invalid', 'false');
        if (erroTelefone) erroTelefone.classList.remove('is-visible');
      }
    });
  }

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const result = validateContactFields(
        nomeInput ? nomeInput.value : '',
        telInput ? telInput.value : ''
      );

      if (nomeInput) {
        nomeInput.classList.toggle('is-invalid', !result.nomeValid);
        nomeInput.setAttribute('aria-invalid', !result.nomeValid ? 'true' : 'false');
      }
      if (erroNome) {
        erroNome.classList.toggle('is-visible', !result.nomeValid);
      }

      if (telInput) {
        telInput.classList.toggle('is-invalid', !result.telefoneValid);
        telInput.setAttribute('aria-invalid', !result.telefoneValid ? 'true' : 'false');
      }
      if (erroTelefone) {
        erroTelefone.classList.toggle('is-visible', !result.telefoneValid);
      }

      if (!result.nomeValid || !result.telefoneValid) {
        if (!result.nomeValid && nomeInput) nomeInput.focus();
        else if (!result.telefoneValid && telInput) telInput.focus();
        return;
      }

      const url = buildWhatsAppUrl({
        nome: result.cleanName,
        telefone: telInput ? telInput.value.trim() : result.phoneDigits,
        area: areaSelect ? areaSelect.value : 'Geral',
        mensagem: msgInput ? msgInput.value : '',
      });

      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  /* --------------------------------------------------------------------------
     12. MOVIMENTO SÓBRIO: LENIS (DESKTOP) + GSAP / SCROLLTRIGGER + FALLBACKS
     -------------------------------------------------------------------------- */
  function revealAllImmediately() {
    document.querySelectorAll('.reveal-item').forEach(function (el) {
      el.classList.add('is-visible');
    });
    document.querySelectorAll('.img-curtain').forEach(function (el) {
      el.classList.add('is-revealed');
    });
    document.querySelectorAll('.section-rule').forEach(function (el) {
      el.classList.add('is-drawn');
    });
    document.querySelectorAll('.timeline-step').forEach(function (el) {
      el.classList.add('is-lit');
    });
    const tProg = document.getElementById('timelineProgress');
    if (tProg) tProg.style.transform = 'scale(1)';
  }

  if (prefersReducedMotion) {
    revealAllImmediately();
    return;
  }

  // Lenis apenas no desktop (>= 1024px)
  let lenis = null;
  if (window.innerWidth >= 1024 && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) {
        return Math.min(1, 1.001 - Math.pow(2, -10 * t));
      },
      smoothWheel: true,
    });

    function rafLenis(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLenis);
    }
    requestAnimationFrame(rafLenis);

    // Âncoras suaves respeitando Lenis
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const targetEl = document.querySelector(targetId);
        if (targetEl && lenis) {
          e.preventDefault();
          lenis.scrollTo(targetEl, { offset: -70 });
        }
      });
    });
  }

  // GSAP + ScrollTrigger se disponível, com fallback garantido via IntersectionObserver
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  if (hasGsap) {
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update);
    }

    // Revelação em cascata por grupo/seção (fade + 20px, 70ms stagger)
    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      const items = group.querySelectorAll('.reveal-item');
      if (items.length === 0) return;

      gsap.from(items, {
        opacity: 0,
        y: 20,
        duration: 0.65,
        stagger: 0.07,
        ease: 'power3.out',
        immediateRender: false,
        clearProps: 'opacity,transform',
        scrollTrigger: {
          trigger: group,
          start: 'top 92%',
          once: true,
        },
        onComplete: function () {
          items.forEach(function (el) {
            el.classList.add('is-visible');
          });
        },
      });
    });

    // Cortina vertical para fotografias
    document.querySelectorAll('.img-curtain').forEach(function (curtain) {
      if (curtain.classList.contains('is-revealed')) return;
      const img = curtain.querySelector('img');
      if (!img) return;

      gsap.fromTo(
        img,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.85,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'clipPath',
          scrollTrigger: {
            trigger: curtain,
            start: 'top 92%',
            once: true,
          },
          onComplete: function () {
            curtain.classList.add('is-revealed');
          },
        }
      );
    });

    // Linhas finas entre seções se desenhando
    document.querySelectorAll('.section-rule').forEach(function (rule) {
      ScrollTrigger.create({
        trigger: rule,
        start: 'top 92%',
        once: true,
        onEnter: function () {
          rule.classList.add('is-drawn');
        },
      });
    });

    // Parallax leve (máx. 6%) no Hero e Slider
    const heroParallaxImg = document.getElementById('heroParallaxImg');
    if (heroParallaxImg) {
      gsap.fromTo(
        heroParallaxImg,
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: '#inicio',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    const galleryStageEl = document.getElementById('galleryStage');
    if (galleryStageEl) {
      gsap.fromTo(
        galleryStageEl.querySelectorAll('img'),
        { yPercent: -3 },
        {
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: galleryStageEl,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }

    // Linha do tempo Como Funciona (cresce no scroll e acende I..IV)
    const timelineWrap = document.getElementById('timelineWrap');
    const timelineProgress = document.getElementById('timelineProgress');
    const timelineSteps = document.querySelectorAll('.timeline-step');

    if (timelineWrap && timelineProgress) {
      ScrollTrigger.create({
        trigger: timelineWrap,
        start: 'top 78%',
        once: true,
        onEnter: function () {
          timelineProgress.style.transform = 'scale(1)';
          timelineSteps.forEach(function (step, idx) {
            window.setTimeout(function () {
              step.classList.add('is-lit');
            }, idx * 140);
          });
        },
      });
    }

    // Contador real: 5 áreas
    const areasCounter = document.getElementById('areasCounter');
    if (areasCounter) {
      const targetNum = parseInt(areasCounter.getAttribute('data-count') || '5', 10);
      const obj = { val: 1 };
      gsap.to(obj, {
        val: targetNum,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: function () {
          areasCounter.textContent = String(Math.round(obj.val));
        },
      });
    }
  } else if ('IntersectionObserver' in window) {
    // Fallback limpo sem GSAP
    const io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (el.classList.contains('reveal-item')) el.classList.add('is-visible');
          if (el.classList.contains('img-curtain')) el.classList.add('is-revealed');
          if (el.classList.contains('section-rule')) el.classList.add('is-drawn');
          if (el.id === 'timelineWrap') {
            const prog = document.getElementById('timelineProgress');
            if (prog) prog.style.transform = 'scale(1)';
            el.querySelectorAll('.timeline-step').forEach(function (step, idx) {
              window.setTimeout(function () {
                step.classList.add('is-lit');
              }, idx * 120);
            });
          }
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );

    document
      .querySelectorAll('.reveal-item, .img-curtain, .section-rule, #timelineWrap')
      .forEach(function (node) {
        io.observe(node);
      });
  } else {
    revealAllImmediately();
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp();
}
