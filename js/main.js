// DevFest Menorca 2026 - Main Application Logic

let currentLang = localStorage.getItem('dfm_lang') || 'ca';

// Event date: Friday, 18 December 2026 at 16:15 CET
const EVENT_DATE = new Date('2026-12-18T16:15:00+01:00').getTime();

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initCountdown();
  renderAgenda();
  initFAQ();
  initModal();
  initMobileNav();
  initCalendarLink();
  checkExistingTicket();
});

// ----------------------------------------------------
// 1. Language Localization System
// ----------------------------------------------------
function initLanguage() {
  updateLanguage(currentLang);

  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selected = e.currentTarget.getAttribute('data-lang');
      if (selected && selected !== currentLang) {
        currentLang = selected;
        localStorage.setItem('dfm_lang', selected);
        updateLanguage(currentLang);
      }
    });
  });
}

function updateLanguage(lang) {
  const dict = translations[lang] || translations.ca;
  
  // Update static text elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keyPath = el.getAttribute('data-i18n').split('.');
    let value = dict;
    for (const key of keyPath) {
      if (value && value[key] !== undefined) {
        value = value[key];
      } else {
        value = null;
        break;
      }
    }
    if (value !== null && typeof value === 'string') {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });

  // Update HTML title
  document.title = lang === 'ca' 
    ? "DevFest Menorca 2026 • Divendres 18 de Desembre • GDG Menorca"
    : (lang === 'es' 
      ? "DevFest Menorca 2026 • Viernes 18 de Diciembre • GDG Menorca"
      : "DevFest Menorca 2026 • Friday December 18 • GDG Menorca");

  // Update active state on language pills
  document.querySelectorAll('.lang-btn').forEach(btn => {
    const isSelected = btn.getAttribute('data-lang') === lang;
    btn.classList.toggle('font-semibold', isSelected);
    btn.classList.toggle('bg-blue-50', isSelected);
    btn.classList.toggle('text-blue-700', isSelected);
    btn.classList.toggle('font-medium', !isSelected);
    btn.classList.toggle('text-gray-600', !isSelected);
  });

  // Re-render dynamic sections
  renderAgenda();
  renderFAQ();
}

// ----------------------------------------------------
// 2. Countdown Timer
// ----------------------------------------------------
function initCountdown() {
  function tick() {
    const now = new Date().getTime();
    const distance = EVENT_DATE - now;

    const daysEl = document.getElementById('countDays');
    const hoursEl = document.getElementById('countHours');
    const minsEl = document.getElementById('countMins');
    const secsEl = document.getElementById('countSecs');

    if (!daysEl) return;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minsEl.textContent = '00';
      secsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(minutes).padStart(2, '0');
    secsEl.textContent = String(seconds).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

// ----------------------------------------------------
// 3. Agenda Rendering (Talks list + Vibecoding sessions list)
// ----------------------------------------------------
const SPEAKER_PHOTOS = {
  'Laura Morillo': 'assets/images/speaker-laura-real.jpg',
  'Joan León': 'assets/images/speaker-joan-real.png',
  'Víctor Carreras': 'assets/images/speaker-victor-real.png',
  'María Sánchez': 'assets/images/speaker-maria-real.jpg'
};

function renderAgenda() {
  const container = document.getElementById('agendaContainer');
  if (!container) return;

  const dict = translations[currentLang] || translations.ca;
  const agenda = dict.agendaSection;
  const talks = agenda.talks || [];
  const vibeSessions = agenda.vibeSessions || [];

  const talkRow = (evt) => {
    const isSocial = evt.category === 'social';
    const photo = SPEAKER_PHOTOS[evt.speaker];
    return `
      <li class="flex flex-col sm:flex-row gap-3 sm:gap-6 p-5 bg-white rounded-2xl border border-gray-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all">
        <div class="sm:w-32 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1">
          <span class="text-sm font-bold ${isSocial ? 'text-green-700' : 'text-blue-700'}">${evt.time}</span>
          <span class="text-xs text-gray-500">${evt.duration}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-base sm:text-lg font-bold text-gray-900">${evt.title}</h4>
          ${evt.speaker ? `
            <p class="text-sm font-semibold text-blue-700 mt-1.5 flex items-center gap-2">
              ${photo ? `<img src="${photo}" alt="${evt.speaker}" class="w-7 h-7 rounded-full object-cover ring-2 ring-blue-100 flex-shrink-0">` : ''}
              ${evt.speaker}
            </p>` : ''}
          <p class="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">${evt.desc}</p>
          <p class="text-xs text-gray-500 mt-2">📍 ${evt.room}</p>
        </div>
      </li>
    `;
  };

  const vibeRow = (evt) => `
    <li class="flex flex-col sm:flex-row gap-3 sm:gap-6 p-5 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 rounded-2xl border-2 border-purple-300 shadow-sm hover:border-purple-500 hover:shadow-md transition-all">
      <div class="sm:w-32 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1">
        <span class="text-sm font-bold text-purple-800">${evt.time}</span>
        <span class="text-xs text-purple-700">${evt.duration}</span>
      </div>
      <div class="flex-1 min-w-0">
        <h4 class="text-base sm:text-lg font-bold text-gray-900">${evt.title}</h4>
        <p class="text-sm font-semibold text-purple-700 mt-1">${evt.speaker}</p>
        <p class="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">${evt.desc}</p>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span class="text-xs text-gray-500">📍 ${evt.room}</span>
          <button onclick="openClosedModal()" class="inline-flex items-center text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors">
            ${agenda.requestTurn}
            <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </li>
  `;

  container.innerHTML = `
    <div>
      <div class="flex items-center gap-2 pb-2 mb-5 border-b-2 border-blue-500">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
        <h3 class="text-sm font-bold text-gray-900 uppercase tracking-wider">${agenda.talksTitle}</h3>
      </div>
      <ul class="space-y-4">${talks.map(talkRow).join('')}</ul>
    </div>

    <div class="mt-14">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 pb-2 mb-5 border-b-2 border-purple-500">
        <span class="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
        <h3 class="text-sm font-bold text-purple-950 uppercase tracking-wider">${agenda.vibeTitle}</h3>
        <span class="text-xs text-gray-500 sm:ml-auto">${agenda.vibeNote}</span>
      </div>
      <ul class="space-y-4">${vibeSessions.map(vibeRow).join('')}</ul>
    </div>
  `;
}

// ----------------------------------------------------
// 4. FAQ Accordion
// ----------------------------------------------------
function initFAQ() {
  renderFAQ();
}

function renderFAQ() {
  const container = document.getElementById('faqContainer');
  if (!container) return;

  const dict = translations[currentLang] || translations.ca;
  const items = dict.faqSection.items || [];

  container.innerHTML = items.map((item, idx) => `
    <div class="faq-item border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm transition-all">
      <button class="w-full px-6 py-4 text-left font-semibold text-gray-900 flex justify-between items-center hover:bg-gray-50 focus:outline-none" onclick="toggleFAQ(${idx})">
        <span class="text-base">${item.q}</span>
        <svg id="faqIcon-${idx}" class="w-5 h-5 text-gray-400 transform transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faqAnswer-${idx}" class="hidden px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100">
        ${item.a}
      </div>
    </div>
  `).join('');
}

window.toggleFAQ = function(index) {
  const ans = document.getElementById(`faqAnswer-${index}`);
  const icon = document.getElementById(`faqIcon-${index}`);
  if (!ans) return;

  const isClosed = ans.classList.contains('hidden');
  
  document.querySelectorAll('[id^="faqAnswer-"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="faqIcon-"]').forEach(el => el.classList.remove('rotate-180'));

  if (isClosed) {
    ans.classList.remove('hidden');
    icon.classList.add('rotate-180');
  }
};

// ----------------------------------------------------
// 5. Registration Modal & Pass System
// ----------------------------------------------------
function initModal() {
  const modal = document.getElementById('regModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const form = document.getElementById('regForm');

  if (closeBtn) closeBtn.addEventListener('click', closeRegisterModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeRegisterModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeRegisterModal();
    });
  }

  const closedModal = document.getElementById('closedModal');
  if (closedModal) {
    closedModal.addEventListener('click', (e) => {
      if (e.target === closedModal) closeClosedModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeRegisterModal();
      closeClosedModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const role = document.getElementById('regRole').value.trim() || 'Attendee';
      const vibe = document.getElementById('regVibe').checked;
      const diet = document.getElementById('regDiet').value.trim();

      const ticketId = Math.floor(1000 + Math.random() * 9000);
      const ticketData = {
        id: `DFM-2026-${ticketId}`,
        name,
        email,
        role,
        vibe,
        diet,
        createdAt: new Date().toISOString()
      };

      try {
        localStorage.setItem('dfm_active_pass', JSON.stringify(ticketData));
        const saved = JSON.parse(localStorage.getItem('dfm_registrations') || '[]');
        saved.push(ticketData);
        localStorage.setItem('dfm_registrations', JSON.stringify(saved));
      } catch (err) {
        console.warn('Storage error', err);
      }

      showTicketConfirmation(ticketData);
      checkExistingTicket();
    });
  }
}

function checkExistingTicket() {
  try {
    const saved = localStorage.getItem('dfm_active_pass');
    const myTicketBtns = document.querySelectorAll('.my-ticket-btn');
    if (saved) {
      myTicketBtns.forEach(btn => btn.classList.remove('hidden'));
    }
  } catch (e) {}
}

window.openMyTicket = function() {
  try {
    const saved = localStorage.getItem('dfm_active_pass');
    if (saved) {
      const ticket = JSON.parse(saved);
      openRegisterModal();
      showTicketConfirmation(ticket);
    } else {
      openRegisterModal();
    }
  } catch (e) {
    openRegisterModal();
  }
};

window.openRegisterModal = function(preferVibecoding = false) {
  const modal = document.getElementById('regModal');
  const formView = document.getElementById('modalFormView');
  const ticketView = document.getElementById('modalTicketView');
  const vibeCheckbox = document.getElementById('regVibe');

  if (!modal) return;

  formView.classList.remove('hidden');
  ticketView.classList.add('hidden');

  if (vibeCheckbox && preferVibecoding) {
    vibeCheckbox.checked = true;
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
};

window.closeRegisterModal = function() {
  const modal = document.getElementById('regModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
};

window.openClosedModal = function() {
  const modal = document.getElementById('closedModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
};

window.closeClosedModal = function() {
  const modal = document.getElementById('closedModal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.style.overflow = '';
};

function showTicketConfirmation(ticket) {
  const formView = document.getElementById('modalFormView');
  const ticketView = document.getElementById('modalTicketView');

  formView.classList.add('hidden');
  ticketView.classList.remove('hidden');

  document.getElementById('ticketAttendeeName').textContent = ticket.name;
  document.getElementById('ticketAttendeeRole').textContent = ticket.role;
  document.getElementById('ticketAttendeeEmail').textContent = ticket.email;
  document.getElementById('ticketNumberCode').textContent = ticket.id;

  const vibeBadge = document.getElementById('ticketVibeBadge');
  if (vibeBadge) {
    if (ticket.vibe) {
      vibeBadge.classList.remove('hidden');
    } else {
      vibeBadge.classList.add('hidden');
    }
  }
}

window.printTicketPass = function() {
  window.print();
};

// ----------------------------------------------------
// 6. Google Calendar Link (Friday 18 Dec 2026)
// ----------------------------------------------------
function initCalendarLink() {
  const calBtn = document.getElementById('addToCalBtn');
  if (!calBtn) return;

  const title = encodeURIComponent("DevFest Menorca 2026 - Google Developer Groups");
  const details = encodeURIComponent(
    "DevFest Menorca al Centre Bit. 4 experts en Cloud, Web, Mobile i Product, Vibecoding Lounge amb Google AI Studio i networking amb càtering."
  );
  const location = encodeURIComponent("Centre Bit Menorca, Carrer Brocal, 1, 07730 Alaior, Illes Balears");
  // Friday 18 Dec 2026 16:15 to 22:30 CET (15:15Z to 21:30Z)
  const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=20261218T151500Z/20261218T213000Z&details=${details}&location=${location}&sf=true&output=xml`;

  calBtn.href = gcalUrl;
  calBtn.target = "_blank";
  calBtn.rel = "noopener noreferrer";
}

// ----------------------------------------------------
// 7. Mobile Navigation Toggle
// ----------------------------------------------------
function initMobileNav() {
  const toggleBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
      } else {
        mobileMenu.classList.add('hidden');
      }
    });

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}
