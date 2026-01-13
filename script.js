// --- CONFIGURATION ---
const WA_NUMBER = "6285166370226";
const TG_USER = "Regalsenpai";
const LOGO_SOUND_URL = "https://raw.githubusercontent.com/gataubroicape-droid/dat1/main/uploads/38a36e-1767904344266.mp3";
let currentItem = "";
let currentInvoice = "";

// Pakasir config
const PAKASIR_SLUG = 'regal-shop';        // ganti dengan slug Anda
const PAKASIR_KEY  = '9tOQaJudPr2faNpAAu0irRq43v4xR2cO'; // ganti dengan Server-Key

/* ========== CART & QRIS LOGIC ========== */
let cart = JSON.parse(localStorage.getItem('regalCart')) || [];

function toggleCart() {
  const bar = document.getElementById('cartSidebar');
  bar.classList.toggle('translate-x-full');
  renderCart();
}

function addToCart(name, price) {
  cart.push({name, price: +price, id: Date.now()});
  saveCart();
  renderCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('regalCart', JSON.stringify(cart));
}

function renderCart() {
  const list = document.getElementById('cartList');
  const totalEl = document.getElementById('cartTotal');
  list.innerHTML = '';
  let total = 0;
  cart.forEach((it, idx) => {
    total += it.price;
    list.innerHTML += `
      <div class="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/10">
        <div>
          <div class="text-[11px] font-bold">${it.name}</div>
          <div class="text-[10px] text-blue-400">Rp${it.price.toLocaleString('id-ID')}</div>
        </div>
        <button onclick="removeCartItem(${idx})" class="text-red-400 hover:text-red-300"><i class="fas fa-trash text-xs"></i></button>
      </div>`;
  });
  totalEl.textContent = 'Rp' + total.toLocaleString('id-ID');
}

function removeCartItem(idx) {
  cart.splice(idx, 1);
  saveCart();
  renderCart();
  updateCartBadge();
}

function checkoutCart() {
  if (!cart.length) return alert('Keranjang kosong!');
  const items = cart.map(x => x.name).join(', ');
  const total = cart.reduce((a, b) => a + b.price, 0);
  cart = []; // kosongkan
  saveCart();
  updateCartBadge();
  toggleCart();
  openCheckout(items, total);
}

function updateCartBadge() {
  document.getElementById('cartBadge').textContent = cart.length;
}

/* ========== QRIS IN-PAGE ========== */
let qrisPoll = null;

function openQrisModal(item, price) {
  console.log('[QRIS] Buka modal, price:', price, 'item:', item);
  document.getElementById('qrisItem').textContent = item;
  document.getElementById('qrisModal').classList.remove('hidden');

  // Kosongkan canvas sebelumnya
  document.getElementById('qrisCanvas').innerHTML = '';

  const qrString = `00020101021238IDPAYMU.COM010893600916${PAKASIR_SLUG}0215${price}5303704540${price}5802ID5914REGAL SHOP6006JAKARTA6304`;
  console.log('[QRIS] QR string:', qrString);

  const qr = new QRCodeStyling({
    width: 200,
    height: 200,
    data: qrString,
    dotsOptions: { color: "#3b82f6", type: "rounded" },
    backgroundOptions: { color: "transparent" }
  });
  qr.append(document.getElementById('qrisCanvas'));
  console.log('[QRIS] QR appended');

  const orderId = `CART-${Date.now()}`;
  qrisPoll = setInterval(async () => {
    try {
      const res = await fetch(`https://api.pakasir.com/transaction/${orderId}/status`, {
        headers: { 'X-API-KEY': PAKASIR_KEY }
      }).then(r => r.json());
      console.log('[QRIS] Status check:', res.status);
      if (res.status === 'paid') {
        clearInterval(qrisPoll);
        document.getElementById('qrisStatus').textContent = 'Berhasil!';
        closeQrisModal();
        showSuccessModal();
      }
    } catch (e) {
      console.warn('[QRIS] Status pending / error:', e);
    }
  }, 3000);
}

function closeQrisModal() {
  clearInterval(qrisPoll);
  document.getElementById('qrisModal').classList.add('hidden');
  document.getElementById('qrisCanvas').innerHTML = '';
  document.getElementById('qrisStatus').textContent = 'Menunggu...';
}

function showSuccessModal() {
  document.getElementById('successModal').classList.remove('hidden');
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.add('hidden');
  closeOrderPage();
}

/* ========== ORIGINAL FUNCTIONS ========== */
// --- TYPING EFFECT ---
const typingText = "NEXT GEN";
let charIndex = 0;
function typeWriter() {
  if (charIndex < typingText.length) {
    document.getElementById("typing-text").innerHTML += typingText.charAt(charIndex);
    charIndex++;
    setTimeout(typeWriter, 200);
  }
}

// --- LANDING FUNCTIONS ---
function enterSite() {
  const landing = document.getElementById('landing-hero');
  const actualSite = document.getElementById('actual-site');
  landing.classList.add('landing-hide');
  actualSite.style.opacity = "1";
  actualSite.style.transform = "translateY(0)";
  document.getElementById('bgMusic').play().catch(()=>{});
  document.getElementById('mainVideo').play().catch(()=>{});
}

// --- LOGO SURPRISE ---
function logoSurprise() {
  const logo = document.getElementById('main-logo');
  const span = document.getElementById('logo-span');
  const audio = new Audio(LOGO_SOUND_URL);
  audio.play().catch(()=>{});
  logo.classList.add('logo-mega-anim');
  span.style.color = "white";
  setTimeout(() => {
    logo.classList.remove('logo-mega-anim');
    span.style.color = "";
  }, 2000);
}

// --- INITIAL LOAD ---
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.style.opacity = '0';
    loader.style.visibility = 'hidden';
    // typeWriter();  // sementara dimatikan karena elemen tidak ada
  }, 1000);
});

// --- NAVIGATION ---
function toggleSidebar() { document.getElementById('sidebar').classList.toggle('active'); }
function toggleOwner() { 
  const m = document.getElementById('ownerModal');
  m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}
function showPage(id) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (document.getElementById('sidebar').classList.contains('active')) toggleSidebar();
  window.scrollTo({top: 0, behavior: 'smooth'});
}

// --- CHECKOUT & ORDER ---
function openCheckout(item, price) {
  currentItem = item;
  currentInvoice = `INV-${Date.now()}`;
  window._lastPrice = price;
  document.getElementById('actual-site').classList.add('hidden');
  document.getElementById('order-page').classList.remove('hidden');
  document.getElementById('order-item-name').innerText = item;
  document.getElementById('order-invoice').innerText = currentInvoice;
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function closeOrderPage() {
  document.getElementById('order-page').classList.add('hidden');
  document.getElementById('actual-site').classList.remove('hidden');
}

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert("Berhasil disalin: " + text);
  }).catch(err => {
    console.error('Gagal menyalin: ', err);
  });
}

function sendOrder(type) {
  const items = currentItem.replace(/,/g, ' | ');
  const msg = `Halo Regal Shop,\n\nSaya ingin beli:\n📦 ${items}\n🧾 Invoice: ${currentInvoice}\n\nAkan segera kirim bukti transfer.`;
  if(type === 'wa') window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`);
  else window.open(`https://t.me/${TG_USER}?text=${encodeURIComponent(msg)}`);
}

// --- RENDER PRODUCTS ---
const panels = [
  {n: "1GB", p: "3.000", r: "1.5GB", d: "3GB", c: "100%"},
  {n: "2GB", p: "5.000", r: "3.5GB", d: "6GB", c: "190%"},
  {n: "3GB", p: "7.000", r: "4GB", d: "7GB", c: "250%"},
  {n: "4GB", p: "9.000", r: "5GB", d: "9GB", c: "290%"},
  {n: "5GB", p: "11.000", r: "6GB", d: "13GB", c: "330%"},
  {n: "6GB", p: "13.000", r: "7GB", d: "15GB", c: "450%"},
  {n: "7GB", p: "15.000", r: "8GB", d: "17GB", c: "500%"},
  {n: "Premium", p: "25.000", r: "Unlimited", d: "25GB", c: "Unlimited"}
];
const botPrices = ["1 Bulan — Rp10.000", "2 Bulan — Rp20.000", "3 Bulan — Rp30.000", "4 Bulan — Rp40.000", "5 Bulan — Rp50.000"];
const premPrices = ["1 Bulan — Rp5.000", "2 Bulan — Rp10.000", "3 Bulan — Rp15.000", "4 Bulan — Rp20.000", "5 Bulan — Rp25.000"];

const panelContainer = document.getElementById('panel-container');
panels.forEach(p => {
  const priceNum = p.p.replace(/\./g,'');
  panelContainer.innerHTML += `
    <div class="glass p-8 rounded-[35px] border-b-4 border-b-blue-600 flex flex-col justify-between h-full hover:scale-[1.02] transition">
      <div>
        <div class="text-blue-500 font-bold text-xs tracking-widest uppercase mb-1">Paket ${p.n}</div>
        <div class="text-2xl font-black mb-6 italic text-white">Rp${p.p}</div>
        <div class="space-y-3 text-[11px] text-gray-400 mb-10 font-bold uppercase">
          <div class="flex justify-between border-b border-white/5 pb-2"><span>RAM</span><span class="text-white">${p.r}</span></div>
          <div class="flex justify-between border-b border-white/5 pb-2"><span>DISK</span><span class="text-white">${p.d}</span></div>
          <div class="flex justify-between border-b border-white/5 pb-2"><span>CPU</span><span class="text-white">${p.c}</span></div>
        </div>
      </div>
      <button onclick="openCheckout('Panel Pterodactyl Paket ${p.n} (Rp${p.p})', ${priceNum})"
              data-price="${priceNum}"
              class="buy-btn text-center py-4 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
        Beli Sekarang
      </button>
      <button onclick="addToCart('Panel Pterodactyl Paket ${p.n}', ${priceNum})"
              class="mt-3 w-full py-2 bg-white/10 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500 transition border border-white/10">
        🛒 Add to Cart
      </button>
    </div>`;
});

const botContainer = document.getElementById('bot-container');
botPrices.forEach(b => {
  const priceNum = b.split('—')[1].replace(/\D/g,'');
  const name = `Sewa Bot Waguri ${b}`;
  botContainer.innerHTML += `
    <div class="w-full p-5 bg-white/5 rounded-2xl flex justify-between items-center hover:bg-blue-600 transition font-bold border border-white/5">
      <span class="text-sm">${b.split(' — ')[0]}</span>
      <span class="text-blue-500">${b.split(' — ')[1]}</span>
      <div class="flex gap-2">
        <button onclick="openCheckout('${name}', ${priceNum})"
                data-price="${priceNum}"
                class="buy-btn text-center px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest">
          Beli
        </button>
        <button onclick="addToCart('${name}', ${priceNum})"
                class="px-3 py-2 bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500 transition border border-white/10">
          🛒
        </button>
      </div>
    </div>`;
});

const premContainer = document.getElementById('premium-container');
premPrices.forEach(p => {
  const priceNum = p.split('—')[1].replace(/\D/g,'');
  const name = `Premium User Waguri ${p}`;
  premContainer.innerHTML += `
    <div class="w-full p-5 bg-white/5 rounded-2xl flex justify-between font-bold hover:bg-blue-500 transition border border-white/5">
      <span>${p.split(' — ')[0]}</span>
      <span class="text-blue-500">${p.split(' — ')[1]}</span>
      <div class="flex gap-2">
        <button onclick="openCheckout('${name}', ${priceNum})"
                data-price="${priceNum}"
                class="buy-btn text-center px-4 py-2 rounded-xl font-bold uppercase text-[10px] tracking-widest">
          Beli
        </button>
        <button onclick="addToCart('${name}', ${priceNum})"
                class="px-3 py-2 bg-white/10 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-blue-500 transition border border-white/10">
          🛒
        </button>
      </div>
    </div>`;
});

// --- CANVAS BACKGROUND ---
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let parts = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.onresize = resize; resize();
class P { constructor() { this.x = Math.random()*canvas.width; this.y = Math.random()*canvas.height; this.vx = (Math.random()-0.5)*0.3; this.vy = (Math.random()-0.5)*0.3; } update() { this.x+=this.vx; this.y+=this.vy; if(this.x<0||this.x>canvas.width)this.vx*=-1; if(this.y<0||this.y>canvas.height)this.vy*=-1; } }
for(let i=0; i<60; i++) parts.push(new P());
function anim() { ctx.clearRect(0,0,canvas.width,canvas.height); parts.forEach((p,i) => { p.update(); parts.slice(i+1).forEach(p2 => { let d = Math.hypot(p.x-p2.x, p.y-p2.y); if(d<150) { ctx.strokeStyle = `rgba(59,130,246,${1-d/150})`; ctx.lineWidth = 0.5; ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); } }); }); requestAnimationFrame(anim); }
anim();

/* ---------- EVENT LISTENER QRIS IN-PAGE ---------- */
document.getElementById('btnQrisInPage').addEventListener('click', () => {
  const item = currentItem;
  const price = window._lastPrice || 10000;
  console.log('[QRIS] Tombol diklik, price:', price, 'item:', item);
  openQrisModal(item, price);
});

// init badge
updateCartBadge();