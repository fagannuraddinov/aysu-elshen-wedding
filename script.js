/**
 * Aysu & Elşən - Toy Dəvətnaməsi Script
 */

// ==========================================================================
// TƏNZİMLƏMƏLƏR (CONFIGURATIONS)
// ==========================================================================
const TOY_TARIXI = "2026-08-19T18:00:00"; // Toyun başlama tarixi və saatı
const WHATSAPP_NOMRE = "994773070753"; // RSVP üçün nömrə (heç bir boşluq və ya + simvolu olmadan)
const WHATSAPP_MESAJ = "Salam Aysu və Elşən. Dəvətnamənizi aldıq, toy gününüz münasibətilə sizi ürəkdən təbrik edir və toyunuzda iştirak edəcəyimizi böyük məmnuniyyətlə təsdiqləyirik! ✨";

// ZƏRF AÇILARKƏN DÜŞƏN KÖLGƏ EFEKTİ
// Əgər açılış zamanı kartın üzərinə düşən kölgəni ləğv etmək istəyirsinizsə, aşağıdakı dəyəri false edin:
const ENABLE_OPENING_SHADOW = true; 

// ==========================================================================
// ELEMENT SELEKTORLARI & ILKIN DEYISENLER
// ==========================================================================
const body = document.body;
const envelopeWrapper = document.getElementById("envelope-wrapper");
const openEnvelopeBtn = document.getElementById("open-envelope-btn");
const mainContent = document.getElementById("main-content");
const musicControl = document.getElementById("music-control");
const bgMusic = document.getElementById("bg-music");
const whatsappBtn = document.getElementById("whatsapp-btn");

// Zərf bağlı olarkən skrolu deaktiv edirik
body.classList.add("envelope-closed");

if (ENABLE_OPENING_SHADOW) {
    envelopeWrapper.classList.add("envelope-shadow-effect");
}

// Təqvim Xatırladıcısı elementləri
const addToCalendarBtn = document.getElementById("add-to-calendar-btn");
const googleCalendarBtn = document.getElementById("google-calendar-btn");

// Google Calendar linkini təyin etmək
const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Aysu+%26+El%C5%9F%C9%99nin+Toy+G%C3%BCn%C3%BC&dates=20260819T140000Z/20260819T200000Z&details=Aysu+v%C9%99+El%C5%9F%C9%99nin+Toy+M%C9%99clisin%C9%99+d%C9%99v%C9%99tlisiniz.+Sizi+aram%C4%B1zda+g%C3%B6rm%C9%99kd%C9%99n+sonsuz+%C5%9Fad+olar%C4%B1q!&location=Quba+Fayton+Restoran%C4%B1`;
googleCalendarBtn.href = googleCalendarUrl;

// iCalendar (.ics) fayl yükləmə məntiqi (Telefonda alarm qurmaq üçün)
addToCalendarBtn.addEventListener("click", () => {
    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AysuElshen//WeddingInvitation//AZ",
        "BEGIN:VEVENT",
        "UID:aysuelshentoy20260819",
        "DTSTAMP:20260720T173000Z",
        "DTSTART:20260819T140000Z", // 18:00 AZT (UTC+4)
        "DTEND:20260819T200000Z",   // 00:00 AZT (UTC+4)
        "SUMMARY:Aysu & Elşənin Toy Günü",
        "DESCRIPTION:Aysu və Elşənin Toy Məclisinə dəvətlisiniz. Sizi aramızda görməkdən sonsuz şad olarıq! Məkan: Quba Fayton Restoranı.",
        "LOCATION:Quba Fayton Restoranı",
        "BEGIN:VALARM",
        "TRIGGER:-PT2H", // Toya 2 saat qalmış alarm xəbərdarlığı (16:00-da)
        "ACTION:DISPLAY",
        "DESCRIPTION:Aysu & Elşənin Toy Günü Xatırladıcısı",
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Aysu_Elshen_Toy_Gunu.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// Musiqi Səs Səviyyəsi (0.0 ilə 1.0 arası)
bgMusic.volume = 0.6;

// ==========================================================================
// ZƏRFİN AÇILMASI & İLKİN İNTERAKSİYA
// ==========================================================================
openEnvelopeBtn.addEventListener("click", () => {
    // 1. Zərfi açırıq
    envelopeWrapper.classList.add("opened");
    
    // 2. Skrolu aktiv edirik
    body.classList.remove("envelope-closed");
    
    // 3. Əsas məzmunu göstəririk
    mainContent.classList.remove("hidden");
    setTimeout(() => {
        mainContent.classList.add("visible");
        // Kartları növbə ilə göstərmək üçün çağırırıq
        checkCardsReveal();
    }, 100);
    
    // 4. Musiqini başladırıq
    playMusic();
    
    // 5. Musiqi pleyer butonunu göstəririk
    musicControl.classList.remove("hidden");
    
    // Konfeti yağışını aktiv edirik və 8 saniyə sonra dayandırırıq
    isConfettiActive = true;
    initParticles();
    setTimeout(() => {
        isConfettiActive = false;
        confettis = [];
    }, 8000);
    
    // Zərfin yox olmasından sonra DOM-dan çıxara bilərik ki, performans artsın (1.5s animasiya bitdikdən sonra)
    setTimeout(() => {
        envelopeWrapper.style.display = "none";
    }, 1500);
});

// ==========================================================================
// MUSIQININ IDARE EDILMESI
// ==========================================================================
let isPlaying = false;

function playMusic() {
    // Möbil üçün: əvvəlcə yükləyirik, sonra çalırıq
    bgMusic.load();
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            musicControl.classList.add("playing");
        }).catch(error => {
            // Brauzer bloklandı — istifadəçiyə musiqi ikonunu göstəririk ki özü başlatsın
            isPlaying = false;
            musicControl.classList.remove("playing");
            console.log("Avtomatik musiqi bloklandı, istifadəçi özü başlada bilər:", error);
        });
    }
}

function pauseMusic() {
    bgMusic.pause();
    isPlaying = false;
    musicControl.classList.remove("playing");
}

musicControl.addEventListener("click", () => {
    if (isPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
});

// ==========================================================================
// GERI SAYIM TAYMERI (Countdown)
// ==========================================================================
const targetTime = new Date(TOY_TARIXI).getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const difference = targetTime - now;
    
    // Elementlər
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    
    if (difference < 0) {
        // Toy tarixi artıq keçibsə
        daysEl.innerText = "00";
        hoursEl.innerText = "00";
        minutesEl.innerText = "00";
        secondsEl.innerText = "00";
        return;
    }
    
    // Vaxt hesablamaları
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    
    // Nəticələri elementlərə yazmaq (Rəqəmlər həmişə 2 rəqəmli görünsün)
    daysEl.innerText = days < 10 ? "0" + days : days;
    hoursEl.innerText = hours < 10 ? "0" + hours : hours;
    minutesEl.innerText = minutes < 10 ? "0" + minutes : minutes;
    secondsEl.innerText = seconds < 10 ? "0" + seconds : seconds;
}

// Hər saniyə taymeri yeniləyirik
setInterval(updateCountdown, 1000);
updateCountdown(); // İlk yüklənmədə dərhal çağırırıq

// ==========================================================================
// SCROLL REVEAL (Kartların yavaşca görünməsi)
// ==========================================================================
const cards = document.querySelectorAll(".glass-card");

function checkCardsReveal() {
    const triggerBottom = window.innerHeight * 0.85;
    
    cards.forEach(card => {
        const cardTop = card.getBoundingClientRect().top;
        
        if (cardTop < triggerBottom) {
            card.classList.add("card-show");
        }
    });
}

window.addEventListener("scroll", checkCardsReveal);

// ==========================================================================
// HƏRƏKƏTLİ HİSSƏCİKLƏR (Canvas Particle System)
// ==========================================================================
const canvas = document.getElementById("particle-canvas");
const ctx = canvas.getContext("2d");

let particles = [];
let petals = [];
let scrollYOffset = 0;

// Canvas ölçülərini pəncərəyə görə tənzimləmək
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Hissəcik sinfi (Yumşaq ulduz tozları/parıltılar)
class Particle {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * 0.5 + 0.1;
        this.alpha = Math.random() * 0.6 + 0.2;
        this.color = Math.random() > 0.5 ? "140, 117, 97" : "234, 218, 166"; // Warm Brown / Cream Gold Glow
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Skrol ilə hərəkət (Paralaks effekti)
        this.y -= scrollYOffset * 0.05;
        
        if (this.y < 0) {
            this.y = canvas.height;
        } else if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
        
        if (this.x < 0 || this.x > canvas.width) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color}, 0.5)`;
        ctx.fill();
        ctx.restore();
    }
}

// Bənövşəyi/Lavanda Gül Ləçəkləri sinfi
class Petal {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.size = Math.random() * 12 + 8;
        this.speedY = Math.random() * 1 + 0.5;
        this.speedX = Math.random() * 0.6 - 0.3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        this.opacity = Math.random() * 0.4 + 0.2;
        this.swing = Math.random() * 2;
        this.swingSpeed = Math.random() * 0.02 + 0.01;
        this.swingStep = Math.random() * 100;
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.swingStep) * 0.4;
        this.swingStep += this.swingSpeed;
        this.rotation += this.rotationSpeed;
        
        // Skrol ilə hərəkət (Paralaks effekti)
        this.y -= scrollYOffset * 0.08;
        
        if (this.y > canvas.height + 20) {
            this.reset();
            this.y = -20;
        }
        
        if (this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.beginPath();
        
        // Zərif krem-qəhvəyi gül ləçəyi forması çəkirik
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-this.size / 2, -this.size / 2, -this.size, this.size / 3, 0, this.size);
        ctx.bezierCurveTo(this.size, this.size / 3, this.size / 2, -this.size / 2, 0, 0);
        
        // Ləçək rəngi (Bej-Krem və Qəhvəyi gradient)
        const gradient = ctx.createLinearGradient(0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(250, 246, 240, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(176, 153, 132, ${this.opacity * 0.6})`);
        
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.restore();
    }
}

// Konfeti Sinifi (Daimi yağacaq konfetilər)
let isConfettiActive = false;
let confettis = [];

class Confetti {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height; // start scattered across screen
    }
    
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -30;
        this.width = Math.random() * 8 + 6;
        this.height = Math.random() * 14 + 8;
        this.speedY = Math.random() * 2.2 + 1.2;
        this.speedX = Math.random() * 1.2 - 0.6;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.oscillation = Math.random() * 2 * Math.PI;
        this.oscillationSpeed = Math.random() * 0.04 + 0.015;
        // Vibrant Golden, Champagne, Rose Gold & Warm Caramel Confetti
        this.color = ["#d4af37", "#f3e5ab", "#e6c687", "#ffffff", "#b09984", "#5c4a3c"][Math.floor(Math.random() * 6)];
    }
    
    update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.oscillation) * 0.6;
        this.oscillation += this.oscillationSpeed;
        this.rotation += this.rotationSpeed;
        
        if (this.y > canvas.height + 30) {
            this.reset();
        }
        if (this.x < -30 || this.x > canvas.width + 30) {
            this.x = Math.random() * canvas.width;
        }
    }
    
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }
}

// Hissəcikləri yaradan funksiya
function initParticles() {
    particles = [];
    petals = [];
    confettis = [];
    
    // Ekran ölçüsünə görə hissəcik sayını tənzimləyirik
    const particleCount = Math.min(60, Math.floor(window.innerWidth / 15));
    const petalCount = Math.min(25, Math.floor(window.innerWidth / 40));
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }

    if (isConfettiActive) {
        const confettiCount = Math.min(100, Math.floor(window.innerWidth / 7));
        for (let i = 0; i < confettiCount; i++) {
            confettis.push(new Confetti());
        }
    }
}

// Animasiya dövrü
let lastScrollY = window.scrollY;
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Skrol sürətini və istiqamətini izləyirik
    const currentScrollY = window.scrollY;
    scrollYOffset = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;
    
    // Ulduz tozlarını yenilə və çək
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    
    // Gül ləçəklərini yenilə və çək
    petals.forEach(pet => {
        pet.update();
        pet.draw();
    });

    // Konfetiləri yenilə və çək
    if (isConfettiActive) {
        confettis.forEach(c => {
            c.update();
            c.draw();
        });
    }
    
    // Offseti sıfırlayırıq ki, skrol dayananda hərəkət normala dönsün
    scrollYOffset = 0;
    
    requestAnimationFrame(animate);
}

// Başlanğıc
initParticles();
animate();

// Pəncərə ölçüləri dəyişdikdə yenidən başlat
window.addEventListener("resize", () => {
    initParticles();
});

// ==========================================================================
// QONAQ KİTABI - ÜRƏK SÖZLƏRİ & API
// ==========================================================================
const guestbookForm = document.getElementById("guestbook-form");
const guestNameInput = document.getElementById("guest-name");
const guestMessageInput = document.getElementById("guest-message");

// Təhlükəsizlik üçün HTML Escaping funksiyası
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Yeni mesaj yazdıqda form submit handling
if (guestbookForm) {
    guestbookForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const name = guestNameInput ? guestNameInput.value.trim() : "";
        const message = guestMessageInput ? guestMessageInput.value.trim() : "";
        
        if (!name || !message) {
            alert("Zəhmət olmasa ad, soyad və təbrik mesajınızı daxil edin.");
            return;
        }
        
        // Göndərmə düyməsini müvəqqəti deaktiv edirik
        const submitBtn = guestbookForm.querySelector("button[type='submit']");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.style.opacity = "0.7";
        }
        
        fetch('/api/wishes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, message })
        })
        .then(res => res.json())
        .then(data => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
            
            if (data.success) {
                // Formu təmizləyirik
                if (guestNameInput) guestNameInput.value = "";
                if (guestMessageInput) guestMessageInput.value = "";
                
                // Təşəkkür modalını açırıq
                openThankyouModal();
            } else {
                alert("Təbrik göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.");
            }
        })
        .catch(err => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.style.opacity = "1";
            }
            console.error("Təbrik göndərilərkən xəta:", err);
            alert("Serverlə əlaqə qurmaq mümkün olmadı. Zəhmət olmasa internet əlaqənizi yoxlayın.");
        });
    });
}

// ==========================================================================
// TƏŞƏKKÜR MODALI & WHATSAPP RSVP MODALI
// ==========================================================================
const closeModalBtn = document.getElementById("close-modal-btn");
const thankyouModal = document.getElementById("thankyou-modal");
const modalCard = thankyouModal ? thankyouModal.querySelector(".thankyou-modal-card") : null;

function openThankyouModal() {
    if (!thankyouModal) return;
    document.body.appendChild(thankyouModal);

    Object.assign(thankyouModal.style, {
        display:         "flex",
        position:        "fixed",
        top:             "0",
        left:            "0",
        width:           "100vw",
        height:          "100vh",
        background:      "rgba(92, 74, 60, 0.4)",
        backdropFilter:  "blur(15px)",
        webkitBackdropFilter: "blur(15px)",
        justifyContent:  "center",
        alignItems:      "center",
        zIndex:          "2147483647",
        opacity:         "0",
        transition:      "opacity 0.4s ease"
    });

    if (modalCard) {
        Object.assign(modalCard.style, {
            transform:  "scale(0.8)",
            transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        });
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            thankyouModal.style.opacity = "1";
            if (modalCard) modalCard.style.transform = "scale(1)";
        });
    });
}

function closeThankyouModal() {
    if (!thankyouModal) return;
    thankyouModal.style.opacity = "0";
    if (modalCard) modalCard.style.transform = "scale(0.8)";
    setTimeout(() => {
        thankyouModal.style.display = "none";
    }, 420);
}

if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeThankyouModal);
}

if (thankyouModal) {
    thankyouModal.addEventListener("click", (e) => {
        if (e.target === thankyouModal) {
            closeThankyouModal();
        }
    });
}

// ── WHATSAPP RSVP MODAL LOGIC ──
const rsvpModal = document.getElementById("rsvp-modal");
const rsvpModalCard = rsvpModal ? rsvpModal.querySelector(".thankyou-modal-card") : null;
const rsvpModalForm = document.getElementById("rsvp-modal-form");
const rsvpGuestNameInput = document.getElementById("rsvp-guest-name");
const closeRsvpModalBtn = document.getElementById("close-rsvp-modal-btn");

function openRsvpModal() {
    if (!rsvpModal) return;
    document.body.appendChild(rsvpModal);

    Object.assign(rsvpModal.style, {
        display:         "flex",
        position:        "fixed",
        top:             "0",
        left:            "0",
        width:           "100vw",
        height:          "100vh",
        background:      "rgba(92, 74, 60, 0.4)",
        backdropFilter:  "blur(15px)",
        webkitBackdropFilter: "blur(15px)",
        justifyContent:  "center",
        alignItems:      "center",
        zIndex:          "2147483647",
        opacity:         "0",
        transition:      "opacity 0.4s ease"
    });

    if (rsvpModalCard) {
        Object.assign(rsvpModalCard.style, {
            transform:  "scale(0.8)",
            transition: "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
        });
    }

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            rsvpModal.style.opacity = "1";
            if (rsvpModalCard) rsvpModalCard.style.transform = "scale(1)";
            if (rsvpGuestNameInput) rsvpGuestNameInput.focus();
        });
    });
}

function closeRsvpModal() {
    if (!rsvpModal) return;
    rsvpModal.style.opacity = "0";
    if (rsvpModalCard) rsvpModalCard.style.transform = "scale(0.8)";
    setTimeout(() => {
        rsvpModal.style.display = "none";
    }, 420);
}

if (whatsappBtn) {
    whatsappBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openRsvpModal();
    });
}

if (closeRsvpModalBtn) {
    closeRsvpModalBtn.addEventListener("click", closeRsvpModal);
}

if (rsvpModal) {
    rsvpModal.addEventListener("click", (e) => {
        if (e.target === rsvpModal) {
            closeRsvpModal();
        }
    });
}

if (rsvpModalForm) {
    rsvpModalForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = rsvpGuestNameInput ? rsvpGuestNameInput.value.trim() : "";
        if (!name) {
            alert("Zəhmət olmasa ad və soyadınızı daxil edin.");
            return;
        }

        const customMsg = `Salam Aysu və Elşən. Mən ${name}. Dəvətnamənizi aldıq, toy gününüz münasibətilə sizi ürəkdən təbrik edir və toyunuzda iştirak edəcəyimizi böyük məmnuniyyətlə təsdiqləyirik! ✨`;
        const link = `https://api.whatsapp.com/send?phone=${WHATSAPP_NOMRE}&text=${encodeURIComponent(customMsg)}`;

        window.open(link, "_blank");
        closeRsvpModal();
        if (rsvpGuestNameInput) rsvpGuestNameInput.value = "";
    });
}
