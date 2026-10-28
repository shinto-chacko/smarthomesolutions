// Interactive smart home device toggle simulation
document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      if (navLinks.style.display === 'flex') {
        navLinks.style.display = 'none';
      } else {
        navLinks.style.display = 'flex';
        navLinks.style.flexDirection = 'column';
        navLinks.style.position = 'absolute';
        navLinks.style.top = '80px';
        navLinks.style.left = '0';
        navLinks.style.width = '100%';
        navLinks.style.background = 'rgba(10, 14, 23, 0.98)';
        navLinks.style.padding = '24px';
        navLinks.style.borderBottom = '1px solid var(--border-color)';
      }
    });
  }

  // Device Cards Toggle in Hero Smart Hub
  const deviceCards = document.querySelectorAll('.device-card');
  deviceCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('active');
      const statusP = card.querySelector('.device-bottom p');
      if (card.classList.contains('active')) {
        if (card.dataset.type === 'light') statusP.textContent = '80% Warm Glow';
        else if (card.dataset.type === 'climate') statusP.textContent = 'Cooling to 71°F';
        else if (card.dataset.type === 'security') statusP.textContent = 'Armed & Secure';
        else if (card.dataset.type === 'entertainment') statusP.textContent = 'Dolby Atmos Playing';
      } else {
        statusP.textContent = 'Powered Off';
      }
    });
  });

  // Product Category Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Interactive Voice Demo Simulation
  const voicePills = document.querySelectorAll('.voice-command-pill');
  const alexaFeedback = document.getElementById('alexaVoiceFeedback');

  voicePills.forEach(pill => {
    pill.addEventListener('click', () => {
      const command = pill.querySelector('.voice-text').innerText;
      if (alexaFeedback) {
        alexaFeedback.innerText = `Responding: Executing "${command.replace(/"/g, '')}"...`;
        alexaFeedback.style.color = 'var(--accent-alexa)';
        setTimeout(() => {
          alexaFeedback.innerText = `Command completed successfully.`;
          alexaFeedback.style.color = '#10b981';
        }, 1500);
      }
    });
  });

  // Clean URL navigation: Smooth scroll without changing address bar hash (#hero, #features, etc.)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
          // Ensure URL stays clean without hash
          if (window.history && window.history.replaceState) {
            window.history.replaceState(null, null, window.location.pathname);
          }
        }
      }
    });
  });

  // If page is loaded with a hash, remove it immediately
  if (window.location.hash) {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, null, window.location.pathname);
    }
  }
});
