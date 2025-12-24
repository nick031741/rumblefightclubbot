const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();

const fights = [
  { id: 1, weight: "Lightweight", f1: "Justin Gaethje", f2: "Paddy Pimblett" },
  { id: 2, weight: "Women's Bantamweight", f1: "Kayla Harrison", f2: "Amanda Nunes" },
  { id: 3, weight: "Bantamweight", f1: "Sean O'Malley", f2: "Song Yadong" },
  { id: 4, weight: "Heavyweight", f1: "Waldo Cortes-Acosta", f2: "Derrick Lewis" },
  { id: 5, weight: "Featherweight", f1: "Arnold Allen", f2: "Jean Silva" },
  { id: 6, weight: "Lightweight", f1: "Michael Johnson", f2: "Alexander Hernandez" },
  { id: 7, weight: "Light Heavyweight", f1: "Nikita Krylov", f2: "Modestas Bukauskas" },
  { id: 8, weight: "Bantamweight", f1: "Umar Nurmagomedov", f2: "Deiveson Figueiredo" },
  { id: 9, weight: "Middleweight", f1: "Ateba Gautier", f2: "Andrey Pulyaev" },
  { id: 10, weight: "Flyweight", f1: "Alex Perez", f2: "Charles Johnson" },
  { id: 11, weight: "Women's Flyweight", f1: "Natalía Silva", f2: "Rose Namajunas" },
  { id: 12, weight: "Heavyweight", f1: "Josh Hokit", f2: "Denzel Freeman" },
  { id: 13, weight: "Bantamweight", f1: "Ricky Turcios", f2: "Cameron Smotherman" }
];

const DEADLINE = new Date("2026-01-24T23:59:59+03:00").getTime();
let picks = JSON.parse(localStorage.getItem("picks") || "{}");
let nickname = localStorage.getItem("nickname");

const app = document.getElementById("app");
const sideMenu = document.getElementById("sideMenu");
const overlay = document.getElementById("overlay");
const sheet = document.getElementById("sheet");

// --- ЛОГИКА МЕНЮ ---
document.getElementById("btnMenu").onclick = () => {
  sideMenu.classList.add("open");
  overlay.style.display = "block";
};

overlay.onclick = () => {
  sideMenu.classList.remove("open");
  overlay.style.display = "none";
};

// --- ФУНКЦИИ ---
function comingSoon(name) {
  alert(name + " Coming Soon!"); // Временная заглушка
}

function showHTP() {
  sheet.innerHTML = `
    <div class="sheet-header"><h3>How to Play</h3><span class="close-x" onclick="closeSheet()">✕</span></div>
    <div class="htp-row"><div class="htp-icon">🥊</div><div class="htp-text"><strong>Pick the Winner</strong><p>Choose who you think will win the fight.</p></div></div>
    <div class="htp-row"><div class="htp-icon">🎯</div><div class="htp-text"><strong>Predict the Method</strong><p>Guess how they win: KO, Submission, or Decision.</p></div></div>
    <div class="htp-row"><div class="htp-icon">🏆</div><div class="htp-text"><strong>Earn Points</strong><p>Score points and climb the global Leaderboard.</p></div></div>
    <div class="htp-row"><div class="htp-icon">⏱️</div><div class="htp-text"><strong>Beat the Clock</strong><p>Make your picks before the first fight starts!</p></div></div>
  `;
  sheet.classList.add("show");
}

function renderMain() {
  document.getElementById("menuUser").innerText = nickname || "USER";
  const hasPicks = Object.keys(picks).length > 0;
  const closed = Date.now() > DEADLINE;

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster">
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
      <p style="opacity:0.5; font-size:12px;">Deadline: 25 January</p>
      <button onclick="showFightCard()" ${closed ? "disabled" : ""} style="margin-top:10px">
        ${closed ? "CLOSED" : hasPicks ? "CHANGE MY PICKS" : "ENTER PREDICTION"}
      </button>
    </div>
  `;
}

function showFightCard() {
  let html = `<div class="sheet-header"><h3>Fight Card</h3><span class="close-x" onclick="closeSheet()">✕</span></div>`;
  fights.forEach(f => {
    const p = picks[f.id] || {};
    html += `
      <div class="fight">
        <div style="margin-bottom:8px"><strong>${f.f1} vs ${f.f2}</strong></div>
        <div style="display:flex;gap:5px;margin-bottom:5px">
          <button onclick="pick(${f.id},'winner','f1')" style="padding:8px; background:${p.winner==='f1'?'#444':''}">F1</button>
          <button onclick="pick(${f.id},'winner','f2')" style="padding:8px; background:${p.winner==='f2'?'#444':''}">F2</button>
        </div>
        <div style="display:flex;gap:5px">
          ${["KO/TKO","SUB","Decision"].map(m => `<button onclick="pick(${f.id},'method','${m}')" style="padding:8px; font-size:11px; background:${p.method===m?'#444':''}">${m}</button>`).join("")}
        </div>
      </div>
    `;
  });
  html += `<button onclick="savePicks()" style="margin-top:15px">SAVE PICKS</button>`;
  sheet.innerHTML = html;
  sheet.classList.add("show");
}

function showMyPicks() {
  sideMenu.classList.remove("open");
  overlay.style.display = "none";
  let html = `<div class="sheet-header"><h3>My Picks</h3><span class="close-x" onclick="closeSheet()">✕</span></div>`;
  if (!Object.keys(picks).length) html += "<p>No picks yet.</p>";
  else {
    Object.entries(picks).forEach(([id, p]) => {
      const f = fights.find(x => x.id == id);
      html += `<div class="fight"><strong>${f.f1} vs ${f.f2}</strong><br>${p.winner==='f1'?f.f1:f.f2} (${p.method || '-'})</div>`;
    });
  }
  sheet.innerHTML = html;
  sheet.classList.add("show");
}

window.pick = (id, type, val) => { picks[id] = picks[id] || {}; picks[id][type] = val; showFightCard(); };
window.savePicks = () => { localStorage.setItem("picks", JSON.stringify(picks)); closeSheet(); renderMain(); };
window.closeSheet = () => sheet.classList.remove("show");

document.getElementById("btnHTP").onclick = showHTP;
document.getElementById("btnLB").onclick = () => comingSoon('Leaderboard');
document.getElementById("menuMyPicks").onclick = showMyPicks;

// Регистрация
if (!nickname) {
  app.innerHTML = `<div class="card"><h3>Nickname</h3><input id="ni" style="width:100%; padding:10px; margin:10px 0; background:#222; color:#fff; border:1px solid #333; border-radius:8px;"><button onclick="sN()">START</button></div>`;
  window.sN = () => {
    const v = document.getElementById("ni").value.trim();
    if(v.length > 2) { localStorage.setItem("nickname", v); nickname = v; renderMain(); }
  };
} else {
  renderMain();
}