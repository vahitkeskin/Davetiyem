/* Davetiyem - Core Logic JS (Vahit KESKİN & Bahar YILGIN) */

// City Data Configuration
const CITY_DATA = {
  mardin: {
    key: "mardin",
    name: "Mardin & Viranşehir",
    title: "Mardin & Şanlıurfa Viranşehir - Evleniyoruz",
    dateStr: "20 Ağustos 2026",
    timeStr: "19:00",
    fullDateTimeStr: "20 Ağustos 2026 - 19:00",
    venueName: "Şanlıurfa Viranşehir Düğün Salonu",
    venueAddress: "Kışla Mah. Ceylanpınar Cad. Viranşehir / Şanlıurfa",
    photo: "assets/couple/mardin.jpg",
    targetDate: new Date("2026-08-20T19:00:00").getTime(),
    googleMapsUrl: "https://maps.google.com/?q=Viran%C5%9Fehir+D%C3%BC%C4%9F%C3%BCn+Salonu+%C5%9Eanl%C4%B1urfa",
    appleMapsUrl: "https://maps.apple.com/?q=Viran%C5%9Fehir+D%C3%BC%C4%9F%C3%BCn+Salonu+%C5%9Eanl%C4%B1urfa",
    badgeText: "MARDİN & VİRANŞEHİR"
  },
  kadin: {
    key: "kadin",
    name: "Damat & Gelin",
    title: "Vahit KESKİN & Bahar YILGIN Özel",
    dateStr: "27 Ağustos 2026",
    timeStr: "19:00",
    fullDateTimeStr: "27 Ağustos 2026 - 19:00",
    venueName: "Viranşehir Saray Kır Bahçesi",
    venueAddress: "Yenişehir Mah. İpek Yolu Üzeri Viranşehir / Şanlıurfa",
    photo: "assets/couple/kadin.jpeg",
    targetDate: new Date("2026-08-27T19:00:00").getTime(),
    googleMapsUrl: "https://maps.google.com/?q=Viran%C5%9Fehir+D%C3%BC%C4%9F%C3%BCn+Salonu+%C5%9Eanl%C4%B1urfa",
    appleMapsUrl: "https://maps.apple.com/?q=Viran%C5%9Fehir+D%C3%BC%C4%9F%C3%BCn+Salonu+%C5%9Eanl%C4%B1urfa",
    badgeText: "VAHİT & BAHAR"
  }
};

let activeCityKey = "mardin";
let audioPlaying = false;
let countdownInterval = null;

// DOM Element References
const splashScreen = document.getElementById("splashScreen");
const mainContent = document.getElementById("mainContent");
const openInvitationBtn = document.getElementById("openInvitationBtn");
const envelopeContainer = document.getElementById("envelopeContainer");
const envelopeFlap = document.getElementById("envelopeFlap");
const envelopeCard = document.getElementById("envelopeCard");
const waxSeal = document.getElementById("waxSeal");

const bgAudio = document.getElementById("bgAudio");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const musicBtnText = document.getElementById("musicBtnText");
const musicIcon = document.getElementById("musicIcon");
const musicPulse = document.getElementById("musicPulse");
const soundBars = document.getElementById("soundBars");

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  setupAudioLogic();
  setupTabSwitching();
  startCountdownTimer();
  updateWhatsAppLink();
  initAmbientCanvas();
});

// A. Açılış / Giriş Ekranı & Zarf Animasyonu
function openInvitation() {
  // Animate 3D Envelope
  if (waxSeal) waxSeal.classList.add("break");
  if (envelopeFlap) envelopeFlap.classList.add("open");
  if (envelopeCard) envelopeCard.classList.add("slide-out");

  // Play Audio
  playAudio();

  // Transition Splash Screen out
  setTimeout(() => {
    splashScreen.classList.add("opacity-0", "pointer-events-none");
    mainContent.classList.remove("opacity-0");
    showToast("✨ Davetiyem - Vahit & Bahar Düğününe Hoş Geldiniz");
  }, 700);
}

if (openInvitationBtn) openInvitationBtn.addEventListener("click", openInvitation);
if (envelopeContainer) envelopeContainer.addEventListener("click", openInvitation);

// B. Audio Player Controls & Web Audio Fallback Synth
function setupAudioLogic() {
  if (!bgAudio) return;

  bgAudio.volume = 0.5;

  musicToggleBtn.addEventListener("click", () => {
    if (audioPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  });

  bgAudio.addEventListener("ended", () => {
    bgAudio.currentTime = 0;
    bgAudio.play();
  });
}

function playAudio() {
  if (!bgAudio) return;

  const playPromise = bgAudio.play();

  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        audioPlaying = true;
        updateAudioUI(true);
      })
      .catch((error) => {
        console.log("Audio autoplay prevented, using Web Audio Synth fallback:", error);
        playSynthPianoMelody();
        audioPlaying = true;
        updateAudioUI(true);
      });
  }
}

function pauseAudio() {
  if (bgAudio) bgAudio.pause();
  if (synthOscillator) {
    synthOscillator.stop();
    synthOscillator = null;
  }
  audioPlaying = false;
  updateAudioUI(false);
}

function updateAudioUI(isPlaying) {
  if (isPlaying) {
    musicBtnText.textContent = "Piyano Açık";
    musicIcon.src = "assets/icons/music.svg";
    musicPulse.classList.remove("hidden");
    soundBars.classList.remove("hidden");
  } else {
    musicBtnText.textContent = "Piyano Kapalı";
    musicIcon.src = "assets/icons/music-off.svg";
    musicPulse.classList.add("hidden");
    soundBars.classList.add("hidden");
  }
}

// Web Audio API Synthesizer Fallback
let audioCtx = null;
let synthOscillator = null;

function playSynthPianoMelody() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioCtx) audioCtx = new AudioContext();

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const notes = [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00];
    let noteIdx = 0;

    function playNextNote() {
      if (!audioPlaying) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[noteIdx], audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);

      noteIdx = (noteIdx + 1) % notes.length;
      setTimeout(playNextNote, 800);
    }

    playNextNote();
  } catch (e) {
    console.log("Web Audio API not supported", e);
  }
}

// C. Tab Switching
function setupTabSwitching() {
  window.switchCityTab = function(cityKey) {
    if (!CITY_DATA[cityKey]) return;

    activeCityKey = cityKey;
    const data = CITY_DATA[cityKey];

    // Toggle Tab Button Classes
    const btnIstanbul = document.getElementById("tabIstanbulBtn");
    const btnKocaeli = document.getElementById("tabKocaeliBtn");

    if (cityKey === "mardin") {
      btnIstanbul.classList.add("active", "bg-wedding-ivory", "text-wedding-goldDark", "shadow-md", "border-wedding-gold/40");
      btnIstanbul.classList.remove("text-wedding-slate");

      btnKocaeli.classList.remove("active", "bg-wedding-ivory", "text-wedding-goldDark", "shadow-md", "border-wedding-gold/40");
      btnKocaeli.classList.add("text-wedding-slate");
    } else {
      btnKocaeli.classList.add("active", "bg-wedding-ivory", "text-wedding-goldDark", "shadow-md", "border-wedding-gold/40");
      btnKocaeli.classList.remove("text-wedding-slate");

      btnIstanbul.classList.remove("active", "bg-wedding-ivory", "text-wedding-goldDark", "shadow-md", "border-wedding-gold/40");
      btnIstanbul.classList.add("text-wedding-slate");
    }

    // Update Photo with Fade
    const couplePhoto = document.getElementById("couplePhoto");
    if (couplePhoto) {
      couplePhoto.style.opacity = "0.3";
      setTimeout(() => {
        couplePhoto.src = data.photo;
        couplePhoto.style.opacity = "1";
      }, 200);
    }

    // Update Text Fields
    document.getElementById("activeCityBadgeText").textContent = data.badgeText;
    document.getElementById("activeCityTitle").textContent = data.title;
    document.getElementById("activeCityVenueHeader").textContent = data.venueName;

    document.getElementById("countdownHeaderCity").textContent = `${data.name} Düğününe Kalan Zaman`;

    document.getElementById("detailDateTime").textContent = data.fullDateTimeStr;
    document.getElementById("detailVenueName").textContent = data.venueName;
    document.getElementById("detailVenueAddress").textContent = data.venueAddress;

    // Update Map Buttons
    document.getElementById("btnGoogleMaps").href = data.googleMapsUrl;
    document.getElementById("btnAppleMaps").href = data.appleMapsUrl;

    // Update WhatsApp & QR
    updateWhatsAppLink();
    updateQRCode(data);

    // Restart Countdown for selected city
    startCountdownTimer();

    showToast(`📍 ${data.name} Programı Seçildi`);
  };
}

// E. Live Countdown Timer
function startCountdownTimer() {
  if (countdownInterval) clearInterval(countdownInterval);

  function update() {
    const target = CITY_DATA[activeCityKey].targetDate;
    const now = new Date().getTime();
    const diff = target - now;

    if (diff <= 0) {
      document.getElementById("countDays").textContent = "00";
      document.getElementById("countHours").textContent = "00";
      document.getElementById("countMinutes").textContent = "00";
      document.getElementById("countSeconds").textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById("countDays").textContent = days < 10 ? `0${days}` : days;
    document.getElementById("countHours").textContent = hours < 10 ? `0${hours}` : hours;
    document.getElementById("countMinutes").textContent = minutes < 10 ? `0${minutes}` : minutes;
    document.getElementById("countSeconds").textContent = seconds < 10 ? `0${seconds}` : seconds;
  }

  update();
  countdownInterval = setInterval(update, 1000);
}

// F. QR Code & Sharing
function updateQRCode(data) {
  const qrImg = document.getElementById("qrCodeImg");
  if (!qrImg) return;
  const pageUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl + '#' + data.key)}`;
  qrImg.src = qrUrl;
}

function updateWhatsAppLink() {
  const data = CITY_DATA[activeCityKey];
  const shareText = `Vahit KESKİN & Bahar YILGIN Düğün Davetiyesi 💍\n${data.title}\nTarih: ${data.fullDateTimeStr}\nMekan: ${data.venueName}\nAdres: ${data.venueAddress}\n\nDetaylar & Davetiye Linki:\n${window.location.href}`;
  const waBtn = document.getElementById("btnWhatsAppShare");
  if (waBtn) {
    waBtn.href = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  }
}

function shareInvitation() {
  const data = CITY_DATA[activeCityKey];
  const shareData = {
    title: "Davetiyem - Vahit KESKİN & Bahar YILGIN Düğün Davetiyesi",
    text: `${data.title} - ${data.fullDateTimeStr} @ ${data.venueName}`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(window.location.href);
    showToast("📋 Davetiye bağlantısı panoya kopyalandı!");
  }
}

// Instagram Canvas Generator & Download Modal
function openInstagramModal(type) {
  const modal = document.getElementById("instagramModal");
  const modalTitle = document.getElementById("igModalTitle");
  const canvas = document.getElementById("igShareCanvas");
  const ctx = canvas.getContext("2d");

  const data = CITY_DATA[activeCityKey];

  if (type === "story") {
    modalTitle.textContent = "Instagram Hikaye Kartı (9:16)";
    canvas.width = 1080;
    canvas.height = 1920;
  } else {
    modalTitle.textContent = "Instagram Gönderi Kartı (1:1)";
    canvas.width = 1080;
    canvas.height = 1080;
  }

  // Draw Luxury Template on Canvas
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#FDFBF7");
  gradient.addColorStop(0.5, "#FAF6F0");
  gradient.addColorStop(1, "#F3E5AB");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gold Outer Border
  ctx.strokeStyle = "#D4AF37";
  ctx.lineWidth = 20;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  // Inner Frame
  ctx.strokeStyle = "#B8860B";
  ctx.lineWidth = 4;
  ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

  // Text Styling
  ctx.textAlign = "center";

  ctx.fillStyle = "#B8860B";
  ctx.font = "600 42px 'Montserrat', sans-serif";
  ctx.fillText("EVLENİYORUZ", canvas.width / 2, canvas.height * 0.15);

  ctx.fillStyle = "#2C2C2C";
  ctx.font = "bold 72px 'Playfair Display', serif";
  ctx.fillText("Vahit KESKİN & Bahar YILGIN", canvas.width / 2, canvas.height * 0.25);

  ctx.fillStyle = "#D4AF37";
  ctx.font = "600 48px 'Playfair Display', serif";
  ctx.fillText(data.fullDateTimeStr, canvas.width / 2, canvas.height * 0.35);

  ctx.fillStyle = "#4A4A4A";
  ctx.font = "400 38px 'Montserrat', sans-serif";
  ctx.fillText(data.venueName, canvas.width / 2, canvas.height * 0.42);

  // Draw Couple Photo in Center Frame
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = data.photo;
  img.onload = () => {
    const photoY = canvas.height * 0.48;
    const photoH = canvas.height * (type === "story" ? 0.38 : 0.42);
    const photoW = photoH * 0.8;
    const photoX = (canvas.width - photoW) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoX, photoY, photoW, photoH, 30);
    ctx.clip();
    ctx.drawImage(img, photoX, photoY, photoW, photoH);
    ctx.restore();

    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 8;
    ctx.strokeRect(photoX, photoY, photoW, photoH);

    // Small Footer Copyright Text (Küçük Yazı)
    ctx.fillStyle = "#8C6D27";
    ctx.font = "500 24px 'Montserrat', sans-serif";
    ctx.fillText("© 2026 Davetiyem - Tüm Hakları vahitkeskin'e Aittir.", canvas.width / 2, canvas.height - 90);
  };

  modal.classList.remove("hidden");
}

function closeInstagramModal() {
  document.getElementById("instagramModal").classList.add("hidden");
}

function downloadIGCard() {
  const canvas = document.getElementById("igShareCanvas");
  const image = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.download = `davetiyem-vahit-bahar-${activeCityKey}.png`;
  link.href = image;
  link.click();
  showToast("📥 Instagram görseli cihazınıza indirildi!");
}

// RSVP Form Handler
function handleRSVPSubmit(e) {
  e.preventDefault();
  const name = document.getElementById("rsvpName").value;
  const city = document.getElementById("rsvpCity").value;
  const guests = document.getElementById("rsvpGuests").value;
  const note = document.getElementById("rsvpNote").value;

  const rsvpData = { name, city, guests, note, date: new Date().toISOString() };
  localStorage.setItem("wedding_rsvp_" + Date.now(), JSON.stringify(rsvpData));

  document.getElementById("rsvpForm").reset();
  const successMsg = document.getElementById("rsvpSuccessMsg");
  successMsg.classList.remove("hidden");

  setTimeout(() => {
    successMsg.classList.add("hidden");
  }, 5000);

  showToast(`💌 Teşekkürler ${name}, LCV yanıtınız iletildi!`);
}

// Calendar ICS File Generator
function downloadCalendarInvite() {
  const data = CITY_DATA[activeCityKey];

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Davetiyem//Vahit & Bahar Düğün//TR
BEGIN:VEVENT
SUMMARY:Vahit KESKİN & Bahar YILGIN Düğünü (${data.name})
DESCRIPTION:${data.title} - ${data.venueName}\\nAdres: ${data.venueAddress}
LOCATION:${data.venueName}, ${data.venueAddress}
DTSTART:20260820T160000Z
DTEND:20260820T210000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.setAttribute("download", `davetiyem-vahit-bahar-${activeCityKey}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast("📅 Takvim etkinliği indirildi!");
}

// Toast Feedback Helper
function showToast(msg) {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3500);
}

// Ambient Background Particle Canvas (Golden Dust & Falling Rose Petals)
function initAmbientCanvas() {
  const canvas = document.getElementById("ambientCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = 28;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1,
      speedY: Math.random() * 0.6 + 0.2,
      speedX: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.6 + 0.2,
      isPetal: Math.random() > 0.5
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.3 + p.speedX;

      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }

      ctx.save();
      ctx.globalAlpha = p.opacity;

      if (p.isPetal) {
        // Draw soft rose gold petal
        ctx.fillStyle = "#E8C5C8";
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.size * 2, p.size, Math.PI / 4, 0, 2 * Math.PI);
        ctx.fill();
      } else {
        // Draw glowing golden stardust
        ctx.fillStyle = "#D4AF37";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    requestAnimationFrame(render);
  }

  render();
}
