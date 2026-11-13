const WHATSAPP_NUMBER = '5511999998888';
export const CAROUSEL_INTERVAL_MS = 4000;

/* ==========================================================================
   FUNÇÕES PURAS (HORÁRIO, CARROSSEL 4S E UTILITÁRIOS TESTÁVEIS)
   ========================================================================== */
export function getSaoPauloWeekdayHour(date) {
  const d = date instanceof Date ? date : new Date();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Sao_Paulo',
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    }).formatToParts(d);
    const wdMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const wdStr = parts.find((p) => p.type === 'weekday')?.value || 'Mon';
    const hrStr = parts.find((p) => p.type === 'hour')?.value || '9';
    return {
      day: wdMap[wdStr] ?? d.getDay(),
      hour: parseInt(hrStr, 10) % 24,
    };
  } catch {
    return { day: d.getDay(), hour: d.getHours() };
  }
}

export function getOfficeStatus(date) {
  const { day, hour } = getSaoPauloWeekdayHour(date);
  if (day >= 1 && day <= 5) {
    if (hour >= 9 && hour < 18) {
      return { isOpen: true, label: 'Aberto agora', weekdayIndex: day };
    }
    if (hour < 9) {
      return { isOpen: false, label: 'Fechado, abre hoje às 9h', weekdayIndex: day };
    }
    if (day < 5) {
      return { isOpen: false, label: 'Fechado, abre amanhã às 9h', weekdayIndex: day };
    }
    return { isOpen: false, label: 'Fechado, abre segunda às 9h', weekdayIndex: day };
  }
  if (day === 0) {
    return { isOpen: false, label: 'Fechado, abre amanhã às 9h', weekdayIndex: day };
  }
  return { isOpen: false, label: 'Fechado, abre segunda às 9h', weekdayIndex: day };
}

export function wrapSlideIndex(index, total) {
  if (!total || total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function shouldAutoRotateCarousel(state) {
  if (!state) return false;
  return Boolean(
    state.isMobile &&
      state.isVisible &&
      !state.isTabHidden &&
      !state.reducedMotion &&
      !state.isInteracting
  );
}

export function findNearestSlideIndex(cardCenters, trackCenter) {
  if (!Array.isArray(cardCenters) || cardCenters.length === 0) return 0;
  let bestIdx = 0;
  let bestDist = Infinity;
  for (let i = 0; i < cardCenters.length; i++) {
    const dist = Math.abs(cardCenters[i] - trackCenter);
    if (dist < bestDist) {
      bestDist = dist;
      bestIdx = i;
    }
  }
  return bestIdx;
}

/* ==========================================================================
   DADOS PARA GAVETAS (<dialog>) DE ÁREAS E ORIENTAÇÕES
   ========================================================================== */
const AREAS_DATA = {
  trabalhista: {
    kicker: '01 · Área de Atuação',
    title: 'Direito Trabalhista',
    paragraphs: [
      'Assessoria em relações individuais e coletivas de trabalho. Análise de contratos, rescisões, horas extras, adicionais, estabilidades e rotinas preventivas para redução de passivos.'
    ],
    services: [
      'Rescisões contratuais e conferência de verbas devidas',
      'Reclamatórias e defesas técnicas na Justiça do Trabalho',
      'Consultoria preventiva para empregadores'
    ],
    waText: 'Olá! Gostaria de orientações sobre Direito Trabalhista.',
    ctaLabel: 'Consultar sobre Direito Trabalhista',
  },
  familia: {
    kicker: '02 · Área de Atuação',
    title: 'Direito de Família e Sucessões',
    paragraphs: [
      'Condução cuidadosa e equilibrada de inventários judiciais e extrajudiciais, planejamento sucessório, divórcios consensuais e litigiosos, pensão alimentícia e regulamentação de guarda.'
    ],
    services: [
      'Inventários em cartório e via judicial',
      'Planejamento sucessório e partilha de bens',
      'Divórcios e reconhecimento de união estável'
    ],
    waText: 'Olá! Gostaria de orientações sobre Direito de Família e Sucessões.',
    ctaLabel: 'Consultar sobre Família',
  },
  previdenciario: {
    kicker: '03 · Área de Atuação',
    title: 'Direito Previdenciário',
    paragraphs: [
      'Planejamento minucioso junto ao INSS. Simulação e contagem de tempo de contribuição, aposentadorias por tempo, idade e especiais, auxílios e revisões administrativas ou judiciais.'
    ],
    services: [
      'Planejamento previdenciário e contagem de contribuições',
      'Requerimentos de aposentadorias e pensões por morte',
      'Recursos administrativos e ações previdenciárias'
    ],
    waText: 'Olá! Gostaria de orientações sobre Direito Previdenciário.',
    ctaLabel: 'Consultar sobre Previdenciário',
  },
  civel: {
    kicker: '04 · Área de Atuação',
    title: 'Direito Cível e Contratos',
    paragraphs: [
      'Redação e revisão de instrumentos contratuais, reparações civis, disputas imobiliárias, cobranças de títulos e resolução de conflitos patrimoniais.'
    ],
    services: [
      'Elaboração e revisão técnica de contratos',
      'Ações indenizatórias e cobranças judiciais',
      'Questões imobiliárias, locações e possessórias'
    ],
    waText: 'Olá! Gostaria de orientações sobre Direito Cível.',
    ctaLabel: 'Consultar sobre Cível',
  },
  empresarial: {
    kicker: '05 · Área de Atuação',
    title: 'Direito Empresarial',
    paragraphs: [
      'Suporte jurídico contínuo para micro, pequenas e médias empresas. Estruturação societária, acordos de sócios, governança preventiva e assessoria em negociações comerciais.'
    ],
    services: [
      'Acordos de quotistas e alterações contratuais',
      'Mitigação de riscos em contratos de fornecimento',
      'Recuperação de créditos e mediação empresarial'
    ],
    waText: 'Olá! Gostaria de orientações sobre Direito Empresarial.',
    ctaLabel: 'Consultar sobre Empresarial',
  },
};

const ORIENTACOES_DATA = {
  laboral: {
    kicker: 'Relações de Trabalho',
    title: 'A Importância da Documentação Laboral',
    paragraphs: [
      'Manter comprovantes de pagamento, registros de ponto, comunicações formais e termos de rescisão organizados ajuda trabalhadores e empregadores a prevenirem conflitos e a demonstrarem, com objetividade, o cumprimento das obrigações contratuais.',
      'Na rotina empresarial ou no encerramento do vínculo, a ausência de recibos assinados, aditivos de função ou controles claros de jornada costuma ser o ponto central de divergências em reclamações trabalhistas.',
      'Para o trabalhador, guardar holerites, extratos do FGTS, cópias de contratos e comunicações escritas permite que a conferência jurídica seja feita com base documental precisa.'
    ],
    services: [],
    waText: 'Olá! Li a orientação sobre Documentação Laboral e gostaria de tirar dúvidas.',
    ctaLabel: 'Tirar dúvidas sobre este tema',
  },
  inventario: {
    kicker: 'Família & Patrimônio',
    title: 'Inventário: Vantagens da Via Extrajudicial',
    paragraphs: [
      'Quando todos os herdeiros são maiores, capazes e estão de acordo quanto à divisão dos bens, o inventário pode ser formalizado por escritura pública diretamente em tabelionato de notas, mediante assistência de advogado.',
      'Em comparação ao processo judicial, a via extrajudicial costuma tramitar em prazo consideravelmente menor e com menor desgaste emocional para os familiares, permitindo que a regularização patrimonial ocorra de forma organizada.',
      'Antes de iniciar o procedimento, é necessário levantar certidões dos imóveis, extratos bancários, eventuais dívidas do espólio e calcular o ITCMD devido no estado competente.'
    ],
    services: [],
    waText: 'Olá! Gostaria de orientações sobre inventário extrajudicial.',
    ctaLabel: 'Tirar dúvidas sobre este tema',
  },
  contratos: {
    kicker: 'Negócios & Contratos',
    title: 'Cláusulas Essenciais em Contratos Comerciais',
    paragraphs: [
      'Definir com precisão o objeto do serviço ou fornecimento, os prazos de entrega, os critérios de reajuste, as multas por descumprimento e o foro de eleição protege o equilíbrio da relação comercial.',
      'Cláusulas genéricas ou modelos copiados sem adaptação à realidade da operação frequentemente deixam lacunas sobre responsabilidade civil, confidencialidade, propriedade intelectual e hipóteses de rescisão antecipada.',
      'Uma revisão jurídica prévia à assinatura identifica ambiguidades e garante que as condições negociadas verbalmente estejam refletidas com segurança no instrumento contratual.'
    ],
    services: [],
    waText: 'Olá! Gostaria de orientações sobre contratos comerciais.',
    ctaLabel: 'Tirar dúvidas sobre este tema',
  },
};

function initApp() {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileQuery = window.matchMedia('(max-width: 767px)');

  /* --------------------------------------------------------------------------
     1. PLANO B DE IMAGENS (Fallback limpo se imagem falhar)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('.media-slot img').forEach(function (img) {
    function markFallback() {
      const slot = img.closest('.media-slot');
      if (slot) slot.classList.add('is-fallback');
    }
    img.addEventListener('error', markFallback);
    if (img.complete && img.naturalWidth === 0) {
      markFallback();
    }
  });

  const heroImg = document.getElementById('heroBgImg');
  if (heroImg) {
    heroImg.addEventListener('error', function () {
      heroImg.style.display = 'none';
    });
  }

  /* --------------------------------------------------------------------------
     2. HEADER TRANSPARENTE -> MARFIM SÓLIDO & STATUS DO EXPEDIENTE
     -------------------------------------------------------------------------- */
  const siteHeader = document.getElementById('siteHeader');
  function updateHeader() {
    if (!siteHeader) return;
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 36);
  }
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  const statusInfo = getOfficeStatus(new Date());
  const statusEl = document.getElementById('officeStatusLabel');
  if (statusEl) {
    statusEl.textContent = statusInfo.label;
  }

  document.querySelectorAll('[data-weekday]').forEach(function (row) {
    const raw = row.getAttribute('data-weekday') || '';
    const days = raw.split(',').map(function (v) {
      return parseInt(v.trim(), 10);
    });
    if (days.indexOf(statusInfo.weekdayIndex) !== -1) {
      row.classList.add('is-today');
      const badge = row.querySelector('.hours-today-tag');
      if (badge) badge.textContent = ' · Hoje';
    }
  });

  /* --------------------------------------------------------------------------
     3. MENU MOBILE (<dialog>)
     -------------------------------------------------------------------------- */
  const menuToggle = document.getElementById('menuToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', function () {
      if (typeof mobileDrawer.showModal === 'function') {
        mobileDrawer.showModal();
      } else {
        mobileDrawer.setAttribute('open', '');
      }
      menuToggle.setAttribute('aria-expanded', 'true');
    });

    function closeDrawer() {
      if (typeof mobileDrawer.close === 'function' && mobileDrawer.open) {
        mobileDrawer.close();
      } else {
        mobileDrawer.removeAttribute('open');
      }
      menuToggle.setAttribute('aria-expanded', 'false');
    }

    if (drawerClose) {
      drawerClose.addEventListener('click', closeDrawer);
    }

    mobileDrawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeDrawer);
    });
  }

  /* --------------------------------------------------------------------------
     4. CARROSSEL SOMENTE NO CELULAR (<768px): TROCA A CADA 4s AO ENTRAR NA SEÇÃO,
        PAUSA AO SAIR DA SEÇÃO OU DA PÁGINA E REINICIA 4s AO RETORNAR
     -------------------------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (shell) {
    const track = shell.querySelector('.carousel-track');
    const cards = Array.from(shell.querySelectorAll('.carousel-card'));
    const dotsContainer = shell.querySelector('.carousel-dots');
    const liveCaptionTitle = shell.querySelector('[data-live-title]');
    const liveCaptionDesc = shell.querySelector('[data-live-desc]');

    if (!track || cards.length === 0) return;

    let activeIdx = 0;
    let isVisible = false;
    let isInteracting = false;
    let autoTimer = null;
    let scrollSyncRaf = null;
    let scrollEndTimer = null;
    let suppressNextClick = false;
    let programmaticUntil = 0;

    const dots = [];
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      cards.forEach(function (_, idx) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Ir para item ' + (idx + 1));
        dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        dot.addEventListener('click', function () {
          scrollToCard(idx);
          restartAutoCountdown();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
    }

    function setActive(idx) {
      activeIdx = idx;
      cards.forEach(function (card, i) {
        card.classList.toggle('is-center', i === idx);
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute('aria-selected', i === idx ? 'true' : 'false');
      });

      const currentCard = cards[idx];
      if (currentCard && liveCaptionTitle && liveCaptionDesc) {
        liveCaptionTitle.textContent = currentCard.getAttribute('data-caption-title') || '';
        liveCaptionDesc.textContent = currentCard.getAttribute('data-caption-desc') || '';
      }
    }

    function syncActiveFromScroll() {
      if (!mobileQuery.matches) return;
      const trackCenter = track.scrollLeft + track.clientWidth / 2;
      const cardCenters = cards.map(function (c) {
        return c.offsetLeft + c.offsetWidth / 2;
      });
      const nearest = findNearestSlideIndex(cardCenters, trackCenter);
      if (nearest !== activeIdx) {
        setActive(nearest);
      }
    }

    function scrollToCard(idx) {
      if (!mobileQuery.matches) return;
      const targetIdx = wrapSlideIndex(idx, cards.length);
      const card = cards[targetIdx];
      if (!card) return;
      programmaticUntil = Date.now() + 650;
      const offset = card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2;
      track.scrollTo({
        left: Math.max(0, offset),
        behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
      });
      setActive(targetIdx);
    }

    setActive(0);

    function stopAuto() {
      if (autoTimer) {
        clearInterval(autoTimer);
        autoTimer = null;
      }
    }

    function restartAutoCountdown() {
      stopAuto();
      const canRun = shouldAutoRotateCarousel({
        isMobile: mobileQuery.matches,
        isVisible: isVisible,
        isTabHidden: document.hidden,
        reducedMotion: reducedMotionQuery.matches,
        isInteracting: isInteracting,
      });
      if (!canRun) return;

      autoTimer = window.setInterval(function () {
        scrollToCard(activeIdx + 1);
      }, CAROUSEL_INTERVAL_MS);
    }

    function beginInteraction() {
      isInteracting = true;
      stopAuto();
    }

    function finishInteraction() {
      isInteracting = false;
      syncActiveFromScroll();
      restartAutoCountdown();
    }

    // Sincronia imediata ao deslizar com o dedo ou mouse + reinício dos 4s após parar
    track.addEventListener(
      'scroll',
      function () {
        if (!mobileQuery.matches || Date.now() < programmaticUntil) return;
        if (!scrollSyncRaf) {
          scrollSyncRaf = window.requestAnimationFrame(function () {
            scrollSyncRaf = null;
            syncActiveFromScroll();
          });
        }
        if (scrollEndTimer) clearTimeout(scrollEndTimer);
        scrollEndTimer = window.setTimeout(function () {
          if (!isInteracting && Date.now() >= programmaticUntil) {
            restartAutoCountdown();
          }
        }, 160);
      },
      { passive: true }
    );

    // Suporte nativo ao toque com o dedo no celular
    track.addEventListener('touchstart', beginInteraction, { passive: true });
    track.addEventListener('touchend', finishInteraction, { passive: true });
    track.addEventListener('touchcancel', finishInteraction, { passive: true });

    // Suporte adicional de arrasto lateral por ponteiro/mouse (útil em simulações e trackpads)
    let isPointerDragging = false;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let dragMoved = false;

    track.addEventListener('pointerdown', function (e) {
      if (!mobileQuery.matches || e.pointerType !== 'mouse' || e.button !== 0) return;
      isPointerDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartScrollLeft = track.scrollLeft;
      track.classList.add('is-dragging');
      beginInteraction();
    });

    window.addEventListener('pointermove', function (e) {
      if (!isPointerDragging) return;
      const dx = e.clientX - dragStartX;
      if (Math.abs(dx) > 6) dragMoved = true;
      track.scrollLeft = dragStartScrollLeft - dx;
    });

    function endMouseDrag() {
      if (!isPointerDragging) return;
      isPointerDragging = false;
      track.classList.remove('is-dragging');
      if (dragMoved) {
        suppressNextClick = true;
        window.setTimeout(function () {
          suppressNextClick = false;
        }, 50);
        syncActiveFromScroll();
        scrollToCard(activeIdx);
      }
      finishInteraction();
    }

    window.addEventListener('pointerup', endMouseDrag);
    window.addEventListener('pointercancel', endMouseDrag);

    track.addEventListener(
      'click',
      function (e) {
        if (suppressNextClick) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      true
    );

    track.addEventListener('keydown', function (e) {
      if (!mobileQuery.matches) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToCard(activeIdx + 1);
        restartAutoCountdown();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToCard(activeIdx - 1);
        restartAutoCountdown();
      }
    });

    if ('IntersectionObserver' in window) {
      const visIo = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            isVisible = entry.isIntersecting;
            if (isVisible) {
              restartAutoCountdown();
            } else {
              stopAuto();
            }
          });
        },
        { threshold: 0.2 }
      );
      visIo.observe(shell);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stopAuto();
      } else {
        restartAutoCountdown();
      }
    });

    window.addEventListener('pagehide', stopAuto);
    window.addEventListener('pageshow', restartAutoCountdown);
    window.addEventListener('blur', stopAuto);
    window.addEventListener('focus', restartAutoCountdown);

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', function () {
        if (mobileQuery.matches) {
          setActive(0);
          restartAutoCountdown();
        } else {
          stopAuto();
          track.scrollLeft = 0;
        }
      });
    }
  });

  /* --------------------------------------------------------------------------
     5. GAVETA INFERIOR (<dialog>) PARA ÁREAS E ORIENTAÇÕES
     -------------------------------------------------------------------------- */
  const sheetDialog = document.getElementById('detailSheet');
  const sheetKicker = document.getElementById('sheetKicker');
  const sheetTitle = document.getElementById('sheetTitle');
  const sheetBody = document.getElementById('sheetBody');
  const sheetServices = document.getElementById('sheetServices');
  const sheetWaBtn = document.getElementById('sheetWaBtn');
  const sheetClose = document.getElementById('sheetClose');

  function openSheet(item) {
    if (!sheetDialog || !item) return;
    if (sheetKicker) sheetKicker.textContent = item.kicker;
    if (sheetTitle) sheetTitle.textContent = item.title;
    if (sheetBody) {
      sheetBody.innerHTML = '';
      item.paragraphs.forEach(function (text) {
        const p = document.createElement('p');
        p.textContent = text;
        sheetBody.appendChild(p);
      });
    }
    if (sheetServices) {
      sheetServices.innerHTML = '';
      if (item.services && item.services.length > 0) {
        sheetServices.style.display = 'block';
        item.services.forEach(function (srv) {
          const li = document.createElement('li');
          li.textContent = srv;
          sheetServices.appendChild(li);
        });
      } else {
        sheetServices.style.display = 'none';
      }
    }
    if (sheetWaBtn) {
      sheetWaBtn.href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(item.waText);
      sheetWaBtn.textContent = item.ctaLabel;
    }

    if (typeof sheetDialog.showModal === 'function') {
      sheetDialog.showModal();
    } else {
      sheetDialog.setAttribute('open', '');
    }
  }

  function closeSheet() {
    if (!sheetDialog) return;
    if (typeof sheetDialog.close === 'function' && sheetDialog.open) {
      sheetDialog.close();
    } else {
      sheetDialog.removeAttribute('open');
    }
  }

  document.querySelectorAll('[data-area-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openSheet(AREAS_DATA[btn.getAttribute('data-area-id')]);
    });
  });

  document.querySelectorAll('[data-orient-id]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openSheet(ORIENTACOES_DATA[btn.getAttribute('data-orient-id')]);
    });
  });

  if (sheetClose) {
    sheetClose.addEventListener('click', closeSheet);
  }
  if (sheetDialog) {
    sheetDialog.addEventListener('click', function (e) {
      if (e.target === sheetDialog) closeSheet();
    });
  }

  /* --------------------------------------------------------------------------
     6. FAQ ACORDEÃO (CSS GRID-ROWS)
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
     7. REVELAÇÃO SÓBRIA POR INTERSECTIONOBSERVER (EXECUÇÃO ÚNICA)
     -------------------------------------------------------------------------- */
  const revealBlocks = document.querySelectorAll('.reveal-block');
  if (!reducedMotionQuery.matches && 'IntersectionObserver' in window && revealBlocks.length > 0) {
    const revIo = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.remove('will-reveal');
            entry.target.classList.add('is-visible');
            revIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    revealBlocks.forEach(function (block) {
      const rect = block.getBoundingClientRect();
      if (rect.top > window.innerHeight * 0.95) {
        block.classList.add('will-reveal');
      }
      revIo.observe(block);
    });
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  initApp();
}
