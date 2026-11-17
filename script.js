const navigationEntry = window.performance.getEntriesByType('navigation')[0];
if (navigationEntry && navigationEntry.type === 'reload') {
  const previousScrollRestoration = window.history.scrollRestoration;
  window.history.scrollRestoration = 'manual';

  if (window.location.hash) {
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}`
    );
  }

  window.addEventListener('pageshow', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      window.history.scrollRestoration = previousScrollRestoration;
    });
  }, { once: true });
}

document.addEventListener('DOMContentLoaded', () => {
  const deviceCards = document.querySelectorAll('.device-card');
  deviceCards.forEach(card => {
    card.addEventListener('click', () => {
      const isActive = card.classList.toggle('active');
      card.setAttribute('aria-pressed', String(isActive));
      const status = card.querySelector('.device-state');
      if (!status) return;

      if (!isActive) {
        status.textContent = 'Powered off';
      } else if (card.dataset.type === 'light') {
        status.textContent = '80% Warm glow';
      } else if (card.dataset.type === 'climate') {
        status.textContent = 'Set to 24°C';
      } else if (card.dataset.type === 'security') {
        status.textContent = 'Armed & secure';
      } else if (card.dataset.type === 'entertainment') {
        status.textContent = 'Movie scene ready';
      } else {
        status.textContent = 'Connected';
      }
    });
  });

  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');
  const productCarousel = document.getElementById('productsCarousel');
  const previousProducts = document.getElementById('productsPrev');
  const nextProducts = document.getElementById('productsNext');
  const productPagination = document.getElementById('productsPagination');
  let productScrollPositions = [];
  let productPositionSignature = '';

  function getProductScrollPositions() {
    if (!productCarousel) return [];

    const visibleCards = Array.from(productCards).filter(card => !card.hidden);
    if (visibleCards.length === 0) return [];

    const maxScroll = Math.max(0, productCarousel.scrollWidth - productCarousel.clientWidth);
    const scrollPadding = parseFloat(window.getComputedStyle(productCarousel).scrollPaddingLeft) || 0;
    const carouselLeft = productCarousel.getBoundingClientRect().left;
    const positions = [0];

    visibleCards.forEach(card => {
      const cardLeft = card.getBoundingClientRect().left;
      const position = Math.min(
        maxScroll,
        Math.max(0, productCarousel.scrollLeft + cardLeft - carouselLeft - scrollPadding)
      );
      if (position > positions[positions.length - 1] + 1) positions.push(position);
    });

    return positions;
  }

  function scrollToProductPosition(index) {
    if (!productCarousel || !Number.isFinite(productScrollPositions[index])) return;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    productCarousel.scrollTo({ left: productScrollPositions[index], behavior });
  }

  function updateProductPagination() {
    if (!productPagination || !productCarousel) return;

    productScrollPositions = getProductScrollPositions();
    const positionSignature = productScrollPositions.map(Math.round).join(',');

    if (positionSignature !== productPositionSignature) {
      productPagination.replaceChildren();
      productScrollPositions.forEach((position, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-controls', 'productsCarousel');
        dot.setAttribute('aria-label', `Go to product scroll position ${index + 1} of ${productScrollPositions.length}`);
        dot.setAttribute('aria-current', 'false');
        dot.addEventListener('click', () => scrollToProductPosition(index));
        productPagination.append(dot);
      });
      productPositionSignature = positionSignature;
    }

    productPagination.hidden = productScrollPositions.length < 2;
    const activeIndex = productScrollPositions.reduce((closestIndex, position, index) => {
      const currentDistance = Math.abs(position - productCarousel.scrollLeft);
      const closestDistance = Math.abs(productScrollPositions[closestIndex] - productCarousel.scrollLeft);
      return currentDistance < closestDistance ? index : closestIndex;
    }, 0);

    Array.from(productPagination.children).forEach((dot, index) => {
      dot.setAttribute('aria-current', index === activeIndex ? 'page' : 'false');
    });
  }

  function updateProductNavigation() {
    if (!productCarousel || !previousProducts || !nextProducts) return;
    const maxScroll = productCarousel.scrollWidth - productCarousel.clientWidth;
    previousProducts.disabled = productCarousel.scrollLeft <= 1;
    nextProducts.disabled = maxScroll <= 1 || maxScroll - productCarousel.scrollLeft <= 3;
    updateProductPagination();
  }

  function scrollProducts(direction) {
    if (!productCarousel) return;
    const firstVisibleCard = Array.from(productCards).find(card =>
      !card.hidden && card.getBoundingClientRect().right > productCarousel.getBoundingClientRect().left + 1
    );
    if (!firstVisibleCard) return;

    const gap = parseFloat(window.getComputedStyle(productCarousel).columnGap) || 0;
    const distance = firstVisibleCard.getBoundingClientRect().width + gap;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    productCarousel.scrollBy({ left: direction * distance, behavior });
  }

  if (productCarousel) {
    productCarousel.addEventListener('scroll', updateProductNavigation, { passive: true });
    window.addEventListener('resize', updateProductNavigation);
    if (previousProducts) previousProducts.addEventListener('click', () => scrollProducts(-1));
    if (nextProducts) nextProducts.addEventListener('click', () => scrollProducts(1));
    window.requestAnimationFrame(updateProductNavigation);
  }

  const solutionsSlides = document.getElementById('solutionsSlides');
  const previousSolutions = document.getElementById('solutionsPrev');
  const nextSolutions = document.getElementById('solutionsNext');
  const solutionsPagination = document.getElementById('solutionsPagination');
  const solutionDots = solutionsPagination ? Array.from(solutionsPagination.querySelectorAll('.carousel-dot')) : [];
  const solutionsCarousel = solutionsSlides ? solutionsSlides.closest('.solutions-carousel') : null;
  const solutionsFeatureGrid = solutionsSlides ? solutionsSlides.querySelector('.solutions-overview .features-grid') : null;
  const solutionsRoomBoard = solutionsSlides ? solutionsSlides.querySelector('.room-board') : null;
  let userSolutionNavigation = false;

  function isShowingRoomIdeas() {
    return Boolean(solutionsSlides && solutionsSlides.scrollLeft > solutionsSlides.clientWidth / 2);
  }

  function updateSolutionsPagination() {
    const activeIndex = isShowingRoomIdeas() ? 1 : 0;
    solutionDots.forEach((dot, index) => {
      dot.setAttribute('aria-current', index === activeIndex ? 'page' : 'false');
    });
  }

  function updateSolutionsArrowPosition() {
    if (!solutionsCarousel || !solutionsSlides || !solutionsFeatureGrid || !solutionsRoomBoard) return;

    const carouselTop = solutionsCarousel.getBoundingClientRect().top;
    const featureGrid = solutionsFeatureGrid.getBoundingClientRect();
    const roomBoard = solutionsRoomBoard.getBoundingClientRect();
    const maxScroll = solutionsSlides.scrollWidth - solutionsSlides.clientWidth;
    const progress = maxScroll > 1
      ? Math.max(0, Math.min(1, solutionsSlides.scrollLeft / maxScroll))
      : 0;
    const featureCenter = featureGrid.top + featureGrid.height / 2 - carouselTop;
    const roomCenter = roomBoard.top + roomBoard.height / 2 - carouselTop;
    const arrowCenter = featureCenter + (roomCenter - featureCenter) * progress;

    solutionsCarousel.style.setProperty('--solutions-arrow-center', `${arrowCenter}px`);
  }

  function updateSolutionsNavigation() {
    if (!solutionsSlides || !previousSolutions || !nextSolutions) return;
    const maxScroll = solutionsSlides.scrollWidth - solutionsSlides.clientWidth;
    previousSolutions.disabled = solutionsSlides.scrollLeft <= 1;
    nextSolutions.disabled = maxScroll <= 1 || solutionsSlides.scrollLeft >= maxScroll - 1;
    updateSolutionsArrowPosition();
    updateSolutionsPagination();
  }

  function scrollSolutions(direction) {
    if (!solutionsSlides) return;
    userSolutionNavigation = true;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    solutionsSlides.scrollBy({ left: direction * solutionsSlides.clientWidth, behavior });
  }

  function scrollToSolutionsPanel(index) {
    if (!solutionsSlides) return;
    userSolutionNavigation = true;
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    solutionsSlides.scrollTo({ left: index * solutionsSlides.clientWidth, behavior });
  }

  if (solutionsSlides) {
    solutionsSlides.addEventListener('scroll', () => {
      updateSolutionsNavigation();
      if (!userSolutionNavigation) return;
      const activeHash = isShowingRoomIdeas() ? '#rooms' : '#features';
      if (window.location.hash !== activeHash) {
        window.history.replaceState(window.history.state, '', activeHash);
      }
    }, { passive: true });
    solutionsSlides.addEventListener('pointerdown', () => { userSolutionNavigation = true; });
    window.addEventListener('resize', updateSolutionsNavigation);
    if (previousSolutions) previousSolutions.addEventListener('click', () => scrollSolutions(-1));
    if (nextSolutions) nextSolutions.addEventListener('click', () => scrollSolutions(1));
    solutionDots.forEach((dot, index) => {
      dot.addEventListener('click', () => scrollToSolutionsPanel(index));
    });
    if (window.location.hash === '#rooms') {
      window.requestAnimationFrame(() => {
        solutionsSlides.scrollLeft = solutionsSlides.clientWidth;
        const featuresSection = document.getElementById('features');
        if (featuresSection) featuresSection.scrollIntoView({ block: 'start', behavior: 'instant' });
        updateSolutionsNavigation();
      });
    }
    window.requestAnimationFrame(updateSolutionsNavigation);
  }

  const societyBill = document.getElementById('societyBill');
  const societySavings = document.getElementById('societySavings');
  const societyCurrency = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  });

  function updateSocietySavings() {
    if (!societyBill || !societySavings) return;
    const enteredBill = societyBill.value.trim();
    const monthlyBill = Number(enteredBill);

    if (!enteredBill || !Number.isFinite(monthlyBill) || monthlyBill <= 0) {
      societySavings.textContent = enteredBill
        ? 'Enter an amount greater than ₹0 to see the estimate.'
        : 'Enter a bill above ₹0 to see an illustrative 30–40% range.';
      return;
    }

    const lowerPotentialSaving = monthlyBill * 0.3;
    const upperPotentialSaving = monthlyBill * 0.4;
    societySavings.textContent = `At an illustrative 30–40% reduction, that could mean ${societyCurrency.format(lowerPotentialSaving)}–${societyCurrency.format(upperPotentialSaving)} per month in potential electricity savings.`;
  }

  if (societyBill && societySavings) {
    societyBill.addEventListener('input', updateSocietySavings);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(filterBtn => {
        filterBtn.classList.remove('active');
        filterBtn.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.category !== filter;
      });
      if (productCarousel) productCarousel.scrollLeft = 0;
      window.requestAnimationFrame(updateProductNavigation);
    });
  });

  const productDetails = {
    hubs: {
      category: 'Controllers',
      title: 'Smart hubs',
      intro: 'A smart hub can coordinate compatible devices, platforms, and routines in your home.',
      features: [
        'Bring supported devices into one control platform.',
        'Link compatible devices into scenes and routines.',
        'Compare protocols, voice-assistant support, and internet requirements before choosing.'
      ],
      benefits: [
        'Simplify everyday control across compatible devices.',
        'Coordinate several actions in a single routine.',
        'Check ecosystem compatibility before investing in hardware.'
      ]
    },
    lighting: {
      category: 'Lighting',
      title: 'Smart lights & dimmers',
      intro: 'A lighting plan can combine compatible bulbs, dimmers, and switches to suit each room.',
      features: [
        'Adjust brightness or color temperature when supported.',
        'Schedule lights or group them into room scenes.',
        'Use app or voice controls with compatible equipment.'
      ],
      benefits: [
        'Set lighting for reading, relaxing, or arriving home.',
        'Automate repeated lighting changes.',
        'Keep familiar wall controls where the chosen setup allows.'
      ]
    },
    switches: {
      category: 'Switches',
      title: 'Smart switch panels',
      intro: 'Smart switches pair familiar wall controls with supported app, voice, or routine controls.',
      features: [
        'Control connected circuits from a wall panel.',
        'Schedule or include supported circuits in routines.',
        'Check wiring, load, and switch type before selecting.'
      ],
      benefits: [
        'Retain physical controls while adding automation.',
        'Coordinate lights and appliances in a room scene.',
        'Choose an approach suited to the home wiring.'
      ]
    },
    curtains: {
      category: 'Curtains',
      title: 'Curtain controls',
      intro: 'Compatible curtain motors can be scheduled or included in room scenes.',
      features: [
        'Schedule opening or closing with compatible motors.',
        'Use supported app or voice controls.',
        'Coordinate curtains with lights or other scene actions.'
      ],
      benefits: [
        'Reduce repeated manual adjustments.',
        'Add a consistent start-of-day or wind-down routine.',
        'Plan around curtain type, motor, and power availability.'
      ]
    },
    climate: {
      category: 'Climate',
      title: 'AC & fan controllers',
      intro: 'The right control approach depends on the air conditioner or fan model and compatible controller.',
      features: [
        'Use schedules or routines with compatible equipment.',
        'Adjust supported units through app or voice controls.',
        'Check model and controller support before planning integration.'
      ],
      benefits: [
        'Make routine comfort adjustments simpler.',
        'Coordinate climate with arrival or bedtime scenes.',
        'Choose a control method that fits the existing equipment.'
      ]
    },
    safety: {
      category: 'Sensors',
      title: 'Motion & door sensors',
      intro: 'Compatible sensors can report movement or door events and trigger supported actions.',
      features: [
        'Detect movement or an open/closed state, depending on the sensor.',
        'Trigger supported lights, routines, or notifications.',
        'Choose placement and sensitivity to suit the room.'
      ],
      benefits: [
        'Automate simple actions without reaching for a switch.',
        'Receive useful alerts in compatible setups.',
        'Add awareness to routines while avoiding unnecessary notifications.'
      ]
    }
  };

  const productDialog = document.getElementById('productDetailsDialog');
  const productDialogCategory = document.getElementById('productDialogCategory');
  const productDialogTitle = document.getElementById('productDialogTitle');
  const productDialogIntro = document.getElementById('productDialogIntro');
  const productDialogFeatures = document.getElementById('productDialogFeatures');
  const productDialogBenefits = document.getElementById('productDialogBenefits');

  function populateProductDetailsList(list, entries) {
    list.replaceChildren(...entries.map(entry => {
      const item = document.createElement('li');
      item.textContent = entry;
      return item;
    }));
  }

  document.querySelectorAll('.product-details-trigger').forEach(button => {
    button.addEventListener('click', () => {
      const details = productDetails[button.dataset.productDetails];
      if (!details) {
        console.error(`Missing product details for "${button.dataset.productDetails}".`);
        return;
      }

      if (!productDialog || typeof productDialog.showModal !== 'function') {
        console.error('Product details dialog is unavailable in this browser.');
        return;
      }

      productDialogCategory.textContent = details.category;
      productDialogTitle.textContent = details.title;
      productDialogIntro.textContent = details.intro;
      populateProductDetailsList(productDialogFeatures, details.features);
      populateProductDetailsList(productDialogBenefits, details.benefits);
      productDialog.showModal();
    });
  });

  if (productDialog) {
    const closeButton = productDialog.querySelector('.product-dialog-close');
    const planLink = productDialog.querySelector('.product-dialog-cta');

    if (closeButton) closeButton.addEventListener('click', () => productDialog.close());
    if (planLink) planLink.addEventListener('click', () => productDialog.close());
    productDialog.addEventListener('click', event => {
      if (event.target === productDialog) productDialog.close();
    });
  }

  const sidebar = document.getElementById('siteNav');
  const sidebarToggle = document.getElementById('sidebarToggle');
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navBackdrop = document.getElementById('navBackdrop');
  const mobileNavQuery = window.matchMedia('(max-width: 768px)');

  const isMobileNav = () => mobileNavQuery.matches;

  function updateDesktopSidebarState() {
    if (!sidebar || isMobileNav()) return;
    const expanded = sidebar.classList.contains('is-pinned')
      || sidebar.matches(':hover')
      || sidebar.contains(document.activeElement);
    sidebar.setAttribute('aria-expanded', String(expanded));
  }

  function setMobileNavOpen(open, restoreFocus) {
    if (!sidebar || !isMobileNav()) return;
    sidebar.classList.toggle('is-open', open);
    sidebar.inert = !open;
    document.body.classList.toggle('nav-open', open);
    if (navBackdrop) navBackdrop.hidden = !open;
    if (mobileNavToggle) {
      mobileNavToggle.setAttribute('aria-expanded', String(open));
      mobileNavToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      const icon = mobileNavToggle.querySelector('i');
      if (icon) icon.className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
    }
    sidebar.setAttribute('aria-expanded', String(open));
    if (!open && restoreFocus && mobileNavToggle) mobileNavToggle.focus();
  }

  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const pinned = sidebar.classList.toggle('is-pinned');
      sidebarToggle.setAttribute('aria-pressed', String(pinned));
      sidebarToggle.setAttribute('aria-label', pinned ? 'Allow navigation to collapse' : 'Keep navigation expanded');
      const label = sidebarToggle.querySelector('.nav-label');
      if (label) label.textContent = pinned ? 'Allow auto-collapse' : 'Keep open';
      updateDesktopSidebarState();
    });

    sidebar.addEventListener('mouseenter', updateDesktopSidebarState);
    sidebar.addEventListener('mouseleave', updateDesktopSidebarState);
    sidebar.addEventListener('focusin', updateDesktopSidebarState);
    sidebar.addEventListener('focusout', () => window.setTimeout(updateDesktopSidebarState, 0));
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', () => {
      setMobileNavOpen(!sidebar.classList.contains('is-open'), false);
    });
  }

  if (navBackdrop) {
    navBackdrop.addEventListener('click', () => setMobileNavOpen(false, true));
  }

  if (sidebar) {
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (isMobileNav()) setMobileNavOpen(false, false);
      });
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && sidebar && sidebar.classList.contains('is-open')) {
      setMobileNavOpen(false, true);
    }
  });

  mobileNavQuery.addEventListener('change', event => {
    if (!sidebar) return;
    if (event.matches) {
      sidebar.classList.remove('is-pinned');
      if (sidebarToggle) sidebarToggle.setAttribute('aria-pressed', 'false');
      setMobileNavOpen(false, false);
    } else {
      sidebar.classList.remove('is-open');
      sidebar.inert = false;
      document.body.classList.remove('nav-open');
      if (navBackdrop) navBackdrop.hidden = true;
      updateDesktopSidebarState();
    }
  });

  const navLinks = sidebar ? Array.from(sidebar.querySelectorAll('.nav-link')) : [];
  const navSections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  let userScrollIntent = false;

  function updateActiveNavLink() {
    let activeSection = navSections[0];
    navSections.forEach(section => {
      if (section.getBoundingClientRect().top <= window.innerHeight * 0.35) {
        activeSection = section;
      }
    });
    if (!activeSection) return;
    navLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${activeSection.id}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    const activeSubLink = sidebar.querySelector('.nav-link-sub.active');
    if (activeSubLink) {
      const navGroup = activeSubLink.closest('.nav-group');
      const parentLink = navGroup
        ? navGroup.querySelector('.nav-link:not(.nav-link-sub)')
        : null;
      if (parentLink) parentLink.classList.add('active');
    }
    return activeSection;
  }

  window.addEventListener('wheel', () => { userScrollIntent = true; }, { passive: true });
  window.addEventListener('touchstart', () => { userScrollIntent = true; }, { passive: true });
  window.addEventListener('pointerdown', () => { userScrollIntent = true; }, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) || event.code === 'Space') {
      userScrollIntent = true;
    }
  });
  window.addEventListener('scroll', () => {
    const activeSection = updateActiveNavLink();
    if (!userScrollIntent || !activeSection) return;
    const activeHash = activeSection.id === 'features' && isShowingRoomIdeas()
      ? '#rooms'
      : `#${activeSection.id}`;
    if (window.location.hash !== activeHash) {
      window.history.replaceState(window.history.state, '', activeHash);
    }
  }, { passive: true });
  updateActiveNavLink();
  if (sidebar && isMobileNav()) {
    sidebar.inert = true;
    sidebar.setAttribute('aria-expanded', 'false');
  }

  const voicePills = document.querySelectorAll('.voice-command-pill');
  const alexaFeedback = document.getElementById('alexaVoiceFeedback');
  let feedbackTimer;

  voicePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const command = pill.querySelector('.voice-text').textContent.replace(/[“”"]/g, '');
      if (alexaFeedback) {
        window.clearTimeout(feedbackTimer);
        alexaFeedback.textContent = `Previewing routine: ${command}`;
        alexaFeedback.style.color = 'var(--accent-alexa)';
        feedbackTimer = window.setTimeout(() => {
          alexaFeedback.textContent = 'Preview complete. Connect Alexa to run this routine.';
          alexaFeedback.style.color = 'var(--text-muted)';
        }, 1500);
      }
    });
  });

  const contactForm = document.getElementById('smartContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const statusBox = document.getElementById('contactStatus');
      const formData = new FormData(contactForm);
      const subject = `Smart home inquiry from ${formData.get('name')}`;
      const homeType = formData.get('homeType');
      const body = [
        `Name: ${formData.get('name')}`,
        `Email: ${formData.get('email')}`,
        ...(homeType ? [`Home type: ${homeType}`] : []),
        '',
        String(formData.get('message'))
      ].join('\n');
      if (statusBox) statusBox.textContent = 'Opening your email app with your inquiry. Your message is sent only when you choose Send.';
      window.location.href = `mailto:contact@digitalminds.homes?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());
});
