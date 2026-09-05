/* ==========================================================================
   GURU VANDANAM - JAVASCRIPT CONTROLLER
   Audio Synthesizer, Live Countdown, Petal Physics, AI Chat, Wall & Certs
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initAudioPlayer();
  initPetalPhysics();
  initCarousel();
  initModals();
  initCertificate();
  initTheme();
  initVideoCanvas();
});

/* ==========================================================================
   1. LIVE COUNTDOWN TIMER
   ========================================================================== */
function initCountdown() {
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  function update() {
    const now = new Date();
    const currentYear = now.getFullYear();
    // Teachers' Day in India: September 5
    let target = new Date(currentYear, 8, 5, 0, 0, 0); // Month 8 is Sept (0-indexed)

    // If today is Sept 5, celebrate till midnight
    const endOfToday = new Date(currentYear, 8, 5, 23, 59, 59);
    let diff = target - now;

    if (now >= target && now <= endOfToday) {
      // Celebrating TODAY!
      diff = endOfToday - now;
    } else if (diff < 0) {
      // Next year's Teachers' Day
      target = new Date(currentYear + 1, 8, 5, 0, 0, 0);
      diff = target - now;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    if (cdDays) cdDays.textContent = String(d).padStart(2, '0');
    if (cdHours) cdHours.textContent = String(h).padStart(2, '0');
    if (cdMinutes) cdMinutes.textContent = String(m).padStart(2, '0');
    if (cdSeconds) cdSeconds.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. REAL AUDIO PLAYER - GURU VANDANAM (Teachers' Day Hymn)
   ========================================================================== */
let isAudioPlaying = false;

function initAudioPlayer() {
  const audioBtn = document.getElementById('audio-play-btn');
  const nextBtn = document.getElementById('audio-next-btn');
  const audioPill = document.getElementById('audio-pill');
  const visualizer = document.getElementById('visualizer');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');
  const trackName = document.getElementById('audio-track-name');
  const statusSub = document.getElementById('audio-status-sub');
  const audioEl = document.getElementById('guru-audio');

  // Only one real song file for now - hide the "switch track" button
  if (nextBtn) nextBtn.style.display = 'none';

  function updateAudioUI(playing) {
    if (trackName) trackName.textContent = 'गुरुर्ब्रह्मा गुरुर्विष्णुः 🪷';

    if (playing) {
      if (visualizer) visualizer.classList.add('playing');
      if (audioPill) {
        audioPill.classList.add('playing');
        audioPill.classList.remove('pulse-ready');
      }
      if (playIcon) playIcon.style.display = 'none';
      if (pauseIcon) pauseIcon.style.display = 'block';
      if (statusSub) statusSub.innerHTML = '🎶 बज रहा है • Guru Vandanam';
    } else {
      if (visualizer) visualizer.classList.remove('playing');
      if (audioPill) {
        audioPill.classList.remove('playing');
        audioPill.classList.add('pulse-ready');
      }
      if (playIcon) playIcon.style.display = 'block';
      if (pauseIcon) pauseIcon.style.display = 'none';
      if (statusSub) statusSub.innerHTML = '▶️ बजाएं / Play';
    }
  }

  window.toggleAudio = function (forceState) {
    if (!audioEl) return;

    const shouldPlay = (forceState !== undefined) ? !!forceState : !isAudioPlaying;

    if (shouldPlay) {
      const playPromise = audioEl.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isAudioPlaying = true;
          updateAudioUI(true);
        }).catch(() => {
          // Autoplay blocked by browser until a real user gesture happens
          isAudioPlaying = false;
          updateAudioUI(false);
        });
      } else {
        isAudioPlaying = true;
        updateAudioUI(true);
      }
    } else {
      audioEl.pause();
      isAudioPlaying = false;
      updateAudioUI(false);
    }
  };

  if (audioBtn) {
    audioBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.toggleAudio();
    });
  }

  if (audioPill) {
    audioPill.addEventListener('click', (e) => {
      window.toggleAudio();
    });
  }

  if (audioEl) {
    audioEl.addEventListener('ended', () => {
      isAudioPlaying = false;
      updateAudioUI(false);
    });
  }

  // Auto-start music on first user gesture anywhere (browsers block true autoplay)
  const startAudioOnFirstGesture = () => {
    if (!isAudioPlaying) {
      window.toggleAudio(true);
    }
    ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'].forEach(evt => {
      document.removeEventListener(evt, startAudioOnFirstGesture);
    });
  };

  ['click', 'touchstart', 'scroll', 'keydown', 'pointerdown'].forEach(evt => {
    document.addEventListener(evt, startAudioOnFirstGesture, { once: true, passive: true });
  });

  // Attempt instant play on load (will silently fail until user gesture, which is expected)
  window.toggleAudio(true);
}

/* ==========================================================================
   3. PUSHPA VARSHA (FLOWER PETAL SHOWER & CONFETTI ENGINE)
   ========================================================================== */
let petalCanvas, petalCtx;
let petals = [];
let isShowering = false;
let showerAnimationId = null;

function initPetalPhysics() {
  petalCanvas = document.getElementById('flower-shower-canvas');
  if (!petalCanvas) return;
  petalCtx = petalCanvas.getContext('2d');

  function resize() {
    petalCanvas.width = window.innerWidth;
    petalCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
}

class MarigoldPetal {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * petalCanvas.width;
    this.y = initial ? Math.random() * petalCanvas.height * -0.5 : -20;
    this.size = 12 + Math.random() * 14;
    this.speedY = 2.2 + Math.random() * 2.8;
    this.speedX = (Math.random() - 0.5) * 2;
    this.angle = Math.random() * Math.PI * 2;
    this.angularSpeed = (Math.random() - 0.5) * 0.05;
    this.tilt = Math.random() * Math.PI;
    this.tiltSpeed = 0.03 + Math.random() * 0.05;

    // Petal colors: Saffron, Golden Marigold, Crimson Rose
    const colors = [
      '#ffa500', // Marigold orange
      '#ffcc00', // Golden yellow
      '#ff8c00', // Deep saffron
      '#e63946', // Rose petal red
      '#f5d485'  // Pale gold
    ];
    this.color = colors[Math.floor(Math.random() * colors.length)];
    this.opacity = 0.85 + Math.random() * 0.15;
  }

  update() {
    this.y += this.speedY;
    this.x += Math.sin(this.angle) * 1.5 + this.speedX;
    this.angle += this.angularSpeed;
    this.tilt += this.tiltSpeed;

    if (this.y > petalCanvas.height + 20) {
      if (isShowering) {
        this.reset();
      }
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.scale(Math.sin(this.tilt), 1);
    ctx.beginPath();
    // Draw heart/drop petal curve
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(this.size * 0.5, -this.size * 0.6, this.size, -this.size * 0.2, 0, this.size);
    ctx.bezierCurveTo(-this.size, -this.size * 0.2, -this.size * 0.5, -this.size * 0.6, 0, 0);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.shadowColor = 'rgba(230, 183, 92, 0.4)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.restore();
  }
}

window.triggerMarigoldShower = function () {
  if (!petalCanvas || !petalCtx) return;
  petals = [];
  for (let i = 0; i < 90; i++) {
    petals.push(new MarigoldPetal());
  }
  isShowering = true;

  if (showerAnimationId) cancelAnimationFrame(showerAnimationId);

  let showerStartTime = Date.now();

  function render() {
    petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    for (let petal of petals) {
      petal.update();
      petal.draw(petalCtx);
    }

    // Stop spawning new petals after 6 seconds
    if (Date.now() - showerStartTime > 6000) {
      isShowering = false;
    }

    // Check if any petals still on screen
    const activePetals = petals.some(p => p.y < petalCanvas.height);
    if (activePetals || isShowering) {
      showerAnimationId = requestAnimationFrame(render);
    } else {
      petalCtx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);
    }
  }

  render();
};

/* ==========================================================================
   4. MEMORIES CAROUSEL SLIDER
   ========================================================================== */
function initCarousel() {
  const track = document.getElementById('carousel-track');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');

  if (!track || !prevBtn || !nextBtn) return;

  let currentIndex = 0;

  function update() {
    const cardWidth = track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 280;
    const gap = 20;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
  }

  nextBtn.addEventListener('click', () => {
    const maxIndex = track.children.length - 1;
    if (currentIndex < maxIndex - 1) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    update();
  });

  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
    } else {
      currentIndex = Math.max(0, track.children.length - 2);
    }
    update();
  });

  // Auto slide every 5 seconds
  setInterval(() => {
    const maxIndex = track.children.length - 1;
    if (currentIndex < maxIndex - 2) {
      currentIndex++;
    } else {
      currentIndex = 0;
    }
    update();
  }, 5000);
}

/* ==========================================================================
   5. AI TUTOR & GURU VANI CHATBOT
   ========================================================================== */
const aiKnowledgeBase = {
  speech: `🎙️ **शिक्षक दिवस पर सर्वश्रेष्ठ भाषण (Hindi Speech):**\n\n"आदरणीय प्रधानाचार्य महोदय, पूज्य गुरुजनों और मेरे प्यारे सहपाठियों!\n\nआज 5 सितंबर है — भारत के महान शिक्षाविद् एवं पूर्व राष्ट्रपति डॉ. सर्वपल्ली राधाकृष्णन जी का जन्मदिवस, जिसे हम 'शिक्षक दिवस' के रूप में मनाते हैं।\n\nकबीरदास जी ने कहा था:\n'गुरु गोविंद दोऊ खड़े, काके लागूं पांय।\nबलिहारी गुरु आपने, गोविंद दियो बताय॥'\n\nशिक्षक वह दीपक हैं जो स्वयं जलकर हमारी राह को ज्ञान के आलोक से भर देते हैं। आज हम अपने सभी शिक्षकों के प्रति नतमस्तक होकर उनका आभार व्यक्त करते हैं। धन्यवाद!"`,

  shloka: `🕉️ **परम पावन गुरु श्लोक व भावार्थ:**\n\n1. **गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः ।\nगुरुः साक्षात् परं ब्रह्म तस्मै श्रीगुरवे नमः ॥**\n👉 *अर्थ:* गुरु ही सृष्टि के निर्माता (ब्रह्मा), पालनकर्ता (विष्णु) और संहारक (महेश) हैं। वे ही साक्षात परब्रह्म हैं, ऐसे गुरु को मेरा वंदन है।\n\n2. **अज्ञानतिमिरान्धस्य ज्ञानाञ्जनशलाकया ।\nचक्षुरुन्मीलितं येन तस्मै श्रीगुरवे नमः ॥**\n👉 *अर्थ:* जिन्होंने ज्ञान रूपी अंजन की शलाका से अज्ञान रूपी अंधकार से अंधे नेत्रों को खोल दिया, उन गुरुवर को प्रणाम है।`,

  poem: `✍️ **शिक्षक के लिए समर्पित हृदयस्पर्शी कविता:**\n\n"मिट्टी को जिसने रूप दिया, वो कुम्हार आप हैं,\nजीवन की कोरी स्लेट पर, ज्ञान का आधार आप हैं।\n\nगिरने लगे हम जब भी कभी, आपने ही हाथ थामा,\nअंधेरे पथ पर जलता हुआ, वो दीप विचार आप हैं।\n\nलाख धन्यवाद भी कम पड़ेंगे, आपके उपकारों के आगे,\nमेरे भविष्य के सच्चे निर्माता, मेरे भगवान आप हैं!" ❤️`,

  radhakrishnan: `📖 **डॉ. सर्वपल्ली राधाकृष्णन का जीवन संदेश:**\n\nडॉ. राधाकृष्णन (1888-1975) भारत के प्रथम उपराष्ट्रपति और द्वितीय राष्ट्रपति थे। वे एक प्रखर दार्शनिक और विश्वप्रसिद्ध प्रोफेसर थे।\n\nजब उनके कुछ शिष्यों ने उनका जन्मदिन मनाने का आग्रह किया, तो उन्होंने कहा — *"मेरा जन्मदिन अलग से मनाने के बजाय यदि इस दिन को शिक्षकों के सम्मान में 'शिक्षक दिवस' के रूप में मनाया जाए, तो यह मेरे लिए सबसे बड़ा गर्व होगा।"*\n\nउनका मानना था कि देश के सर्वश्रेष्ठ मस्तिष्कों को ही शिक्षक होना चाहिए।`
};

window.askAi = function (topic) {
  const content = aiKnowledgeBase[topic];
  if (!content) return;
  appendChatMessage(content, 'bot');
};

function appendChatMessage(text, sender = 'bot') {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble message-${sender}`;
  bubble.innerHTML = text.replace(/\n/g, '<br>');
  chatMessages.appendChild(bubble);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.clearAiChat = function () {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  chatMessages.innerHTML = `
    <div class="message-bubble message-bot">
      नमस्ते! मैं आपका <strong>गुरु वाणी AI सहायक</strong> हूँ। शिक्षक दिवस पर भाषण, श्लोक, बधाई संदेश या प्रेरणादायक कहानियों के लिए मुझसे कुछ भी पूछिए!
    </div>
  `;
};

window.handleChatSubmit = function (e) {
  e.preventDefault();
  const input = document.getElementById('chat-user-input');
  if (!input || !input.value.trim()) return;

  const query = input.value.trim();
  appendChatMessage(query, 'user');
  input.value = '';

  // Generate responsive AI response
  setTimeout(() => {
    let reply = '';
    const q = query.toLowerCase();

    if (q.includes('भाषण') || q.includes('speech')) {
      reply = aiKnowledgeBase.speech;
    } else if (q.includes('श्लोक') || q.includes('shloka') || q.includes('sanskrit')) {
      reply = aiKnowledgeBase.shloka;
    } else if (q.includes('कविता') || q.includes('poem') || q.includes('shayari')) {
      reply = aiKnowledgeBase.poem;
    } else if (q.includes('राधाकृष्णन') || q.includes('history') || q.includes('radhakrishnan')) {
      reply = aiKnowledgeBase.radhakrishnan;
    } else if (q.includes('माँ') || q.includes('mother')) {
      reply = `🧡 **माँ के लिए संदेश:**\n"माँ, आपने मुझे बोलना सिखाया, चलना सिखाया और जीवन जीने के संस्कार दिए। संसार में कोई भी शिक्षक आपकी बराबरी नहीं कर सकता। हैप्पी टीचर्स डे माँ!"`;
    } else {
      reply = `🌸 **गुरु वाणी AI का उत्तर:**\n"${query}" के संदर्भ में — हमारे वेदों में कहा गया है कि शिक्षक वह प्रकाश स्तम्भ हैं जो बिना किसी स्वार्थ के हमें अज्ञानता से ज्ञान की ओर ले जाते हैं।\n\nआप शिक्षक दिवस पर उन्हें एक हस्तनिर्मित कार्ड और हमारा **शिक्षक सम्मान पत्र** भेंट कर सकते हैं!`;
    }

    appendChatMessage(reply, 'bot');
  }, 600);
};

// Text-to-Speech Web Speech API
const speakBtn = document.getElementById('speak-ai-btn');
if (speakBtn) {
  speakBtn.addEventListener('click', () => {
    if (!('speechSynthesis' in window)) {
      alert('Your browser does not support Speech Synthesis.');
      return;
    }

    const chatMessages = document.getElementById('chat-messages');
    const lastBotMsg = chatMessages.querySelector('.message-bot:last-child');
    if (!lastBotMsg) return;

    window.speechSynthesis.cancel();
    const cleanText = lastBotMsg.innerText.replace(/[*_#👉🎙️🕉️✍️📖]/g, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.rate = 0.95;
    utter.lang = 'hi-IN';
    window.speechSynthesis.speak(utter);
  });
}

/* ==========================================================================
   6. WALL OF GRATITUDE ("गुरु दक्षिणा संदेश पटल")
   ========================================================================== */
let selectedTag = '#BestTeacher';

window.selectTag = function (btn, tag) {
  document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedTag = tag;
};

window.submitGratitudeMessage = function (e) {
  e.preventDefault();
  const teacherInput = document.getElementById('form-teacher');
  const studentInput = document.getElementById('form-student');
  const messageInput = document.getElementById('form-message');
  const wall = document.getElementById('messages-wall');

  if (!teacherInput.value.trim() || !studentInput.value.trim() || !messageInput.value.trim()) return;

  const card = document.createElement('div');
  card.className = 'message-note-card';
  card.innerHTML = `
    <div class="message-meta">
      <span class="teacher-tag">To: ${escapeHtml(teacherInput.value)}</span>
      <span class="message-tag-badge">${escapeHtml(selectedTag)}</span>
    </div>
    <p class="message-body">"${escapeHtml(messageInput.value)}"</p>
    <div class="message-footer">
      <span class="student-author">— ${escapeHtml(studentInput.value)}</span>
      <button class="like-btn" onclick="toggleLike(this, 1)">❤️ <span class="like-count">1</span></button>
    </div>
  `;

  // Prepend to wall
  wall.insertBefore(card, wall.firstChild);

  // Trigger celebration shower
  triggerMarigoldShower();

  // Reset form
  teacherInput.value = '';
  studentInput.value = '';
  messageInput.value = '';
};

window.toggleLike = function (btn, initialCount) {
  const countSpan = btn.querySelector('.like-count');
  let count = parseInt(countSpan.textContent, 10);
  if (btn.dataset.liked === 'true') {
    btn.dataset.liked = 'false';
    countSpan.textContent = count - 1;
    btn.style.color = '#ff6b81';
  } else {
    btn.dataset.liked = 'true';
    countSpan.textContent = count + 1;
    btn.style.color = '#ff2a55';
  }
};

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

/* ==========================================================================
   7. ROYAL CERTIFICATE OF HONOR GENERATOR
   ========================================================================== */
function initCertificate() {
  updateCertPreview();
}

window.updateCertPreview = function () {
  const teacher = document.getElementById('cert-input-teacher')?.value || 'आदरणीय गुरुवर';
  const title = document.getElementById('cert-input-title')?.value || 'श्रेष्ठ गुरु सम्मान';
  const student = document.getElementById('cert-input-student')?.value || 'आपका आज्ञाकारी शिष्य';
  const msg = document.getElementById('cert-input-msg')?.value || 'आपके अमूल्य मार्गदर्शन के लिए धन्यवाद।';

  const dispTeacher = document.getElementById('cert-disp-teacher');
  const dispTitle = document.getElementById('cert-disp-title');
  const dispStudent = document.getElementById('cert-disp-student');
  const dispMsg = document.getElementById('cert-disp-msg');

  if (dispTeacher) dispTeacher.textContent = teacher;
  if (dispTitle) dispTitle.textContent = title;
  if (dispStudent) dispStudent.textContent = student;
  if (dispMsg) dispMsg.textContent = `"${msg}"`;
};

window.printCertificate = function () {
  const certFrame = document.getElementById('printable-certificate');
  if (!certFrame) return;

  const printWindow = window.open('', '', 'width=900,height=650');
  printWindow.document.write(`
    <html>
      <head>
        <title>शिक्षक सम्मान पत्र</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          body { background: #fff; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .cert-preview-frame { width: 100%; max-width: 800px; box-shadow: none; }
        </style>
      </head>
      <body>
        ${certFrame.outerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        <\/script>
      </body>
    </html>
  `);
  printWindow.document.close();
};

/* ==========================================================================
   8. MODALS CONTROLLER
   ========================================================================== */
function initModals() {
  // Mother's Tribute Modal
  const motherBtn = document.getElementById('mother-tribute-btn');
  if (motherBtn) {
    motherBtn.addEventListener('click', () => {
      openModal('mother-modal');
    });
  }

  // Video Modal
  const videoBtn = document.getElementById('open-video-modal-btn');
  if (videoBtn) {
    videoBtn.addEventListener('click', () => {
      openModal('video-modal');
    });
  }

  // Close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        backdrop.classList.remove('active');
      }
    });
  });
}

window.openModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('active');
};

window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('active');
};

window.openLightbox = function (imgSrc, title, caption) {
  const modal = document.getElementById('lightbox-modal');
  const img = document.getElementById('lightbox-img');
  const t = document.getElementById('lightbox-title');
  const c = document.getElementById('lightbox-caption');

  if (modal && img && t && c) {
    img.src = imgSrc;
    t.textContent = title;
    c.textContent = caption;
    modal.classList.add('active');
  }
};

window.openPillarModal = function (title, sub, text) {
  const modal = document.getElementById('pillar-modal');
  const t = document.getElementById('pillar-modal-title');
  const s = document.getElementById('pillar-modal-sub');
  const p = document.getElementById('pillar-modal-text');

  if (modal && t && s && p) {
    t.textContent = title;
    s.textContent = sub;
    p.textContent = text;
    modal.classList.add('active');
  }
};

window.shareMotherTribute = function () {
  const text = encodeURIComponent("माँ, तुमने मुझे चलना सिखाया, मेरे पहले शब्द तुम्हारी देन हैं। मेरी पहली और सबसे महान गुरु को शिक्षक दिवस पर मेरा कोटि-कोटि नमन! 🧡 https://guruvandanam.in");
  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
};

/* ==========================================================================
   9. THEME CONTROLLER & MOBILE MENU
   ========================================================================== */
function initTheme() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const sunIcon = document.getElementById('sun-icon');
  const moonIcon = document.getElementById('moon-icon');
  const html = document.documentElement;

  if (!toggleBtn) return;

  const savedTheme = localStorage.getItem('gv_theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcons(savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('gv_theme', next);
    updateThemeIcons(next);
  });

  function updateThemeIcons(theme) {
    if (theme === 'light') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
    }
  }

  // Mobile menu toggle
  const mobileBtn = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
      navMenu.style.flexDirection = 'column';
      navMenu.style.position = 'absolute';
      navMenu.style.top = '100%';
      navMenu.style.left = '0';
      navMenu.style.right = '0';
      navMenu.style.background = 'var(--bg-secondary)';
      navMenu.style.padding = '1rem';
      navMenu.style.borderBottom = '1px solid var(--border-gold)';
    });
  }
}

/* ==========================================================================
   10. INTERACTIVE VIDEO STAGE CANVAS (AI NEURAL MESH & GOLDEN RAYS)
   ========================================================================== */
function initVideoCanvas() {
  const canvas = document.getElementById('video-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let nodes = [];
  for (let i = 0; i < 35; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: 2 + Math.random() * 2
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle dark gradient background
    const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 50, canvas.width / 2, canvas.height / 2, 350);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    grad.addColorStop(1, 'rgba(10, 6, 4, 0.95)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw nodes
    for (let i = 0; i < nodes.length; i++) {
      let n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.fill();

      // Connect lines
      for (let j = i + 1; j < nodes.length; j++) {
        let n2 = nodes[j];
        let dist = Math.hypot(n.x - n2.x, n.y - n2.y);
        if (dist < 90) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.35 * (1 - dist / 90)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}
