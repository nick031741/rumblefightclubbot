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
const isDeadlinePassed = () => Date.now() > DEADLINE;

const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");
const fightCard = document.getElementById("fightCard");
const myPicksBtn = document.getElementById("myPicksBtn");
const leaderboardBtn = document.getElementById("leaderboardBtn");
const quizBtn = document.getElementById("quizBtn");

let nickname = localStorage.getItem("nickname");
let picks = JSON.parse(localStorage.getItem("picks") || "{}");

function showNicknameForm() {
  app.innerHTML = `
    <div class="card">
      <h3>Create nickname</h3>
      <input id="nickInput" placeholder="nickname" style="width:100%;padding:12px;border-radius:10px;border:none;margin:12px 0;background:#2a2a2a;color:#fff;" />
      <button onclick="saveNickname()">Continue</button>
    </div>
  `;
}

window.saveNickname = () => {
  const value = document.getElementById("nickInput").value.trim();
  if (!/^[a-zA-Z0-9_]{3,15}$/.test(value)) return;
  localStorage.setItem("nickname", value);
  nickname = value;
  renderMain();
};

function renderMain() {
  nicknameEl.innerHTML = `<span>${nickname || ''}</span>`;
  const hasPicks = Object.keys(picks).length > 0;
  const closed = isDeadlinePassed();

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster" />
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
      <p style="opacity:.6; font-size: 12px; margin-top: 4px;">Deadline: 25 January</p>
      <button id="enterPrediction" ${closed ? "disabled" : ""} style="margin-top: 16px;">
        ${closed ? "PREDICTIONS CLOSED" : hasPicks ? "CHANGE MY PICKS" : "ENTER PREDICTION"}
      </button>
    </div>
  `;

  document.getElementById("enterPrediction").onclick = () => { if (!isDeadlinePassed()) showFightCard(); };

  // Навигация
  myPicksBtn.onclick = showMyPicks;
  leaderboardBtn.onclick = () => showComingSoon("Leaderboard");
  quizBtn.onclick = () => showComingSoon("Quiz");
}

function closeSheet() {
  fightCard.classList.remove("show");
  tg?.BackButton.hide();
}

function showComingSoon(title) {
  fightCard.innerHTML = `
    <div class="sheet-header">
      <h3>${title}</h3>
      <span class="close-x" onclick="closeSheet()">✕</span>
    </div>
    <div class="coming-soon">COMING SOON</div>
  `;
  fightCard.classList.add("show");
  tg?.BackButton.show();
  tg?.BackButton.onClick(closeSheet);
}

function showFightCard() {
  const scroll = fightCard.scrollTop;
  let html = `
    <div class="sheet-header">
      <h3>Fight Card</h3>
      <span class="close-x" onclick="closeSheet()">✕</span>
    </div>
  `;
  fights.forEach(f => {
    const p = picks[f.id] || {};
    html += `
      <div class="fight">
        <strong>${f.f1} vs ${f.f2}</strong><br>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button onclick="pickWinner(${f.id},'f1')" style="${p.winner==='f1'?'background:#444':''}">F1</button>
          <button onclick="pickWinner(${f.id},'f2')" style="${p.winner==='f2'?'background:#444':''}">F2</button>
        </div>
        <div style="display:flex;gap:6px;margin-top:6px">
          ${["KO/TKO","SUB","Decision"].map(m =>
            `<button onclick="pickMethod(${f.id},'${m}')" style="${p.method===m?'background:#444':''}">${m}</button>`
          ).join("")}
        </div>
      </div>
    `;
  });
  html += `<button onclick="savePicks()" style="margin-top:12px">Save</button>`;
  fightCard.innerHTML = html;
  fightCard.classList.add("show");
  fightCard.scrollTop = scroll;
  tg?.BackButton.show();
  tg?.BackButton.onClick(closeSheet);
}

function showMyPicks() {
  let html = `
    <div class="sheet-header">
      <h3>My Picks</h3>
      <span class="close-x" onclick="closeSheet()">✕</span>
    </div>
  `;
  if (!Object.keys(picks).length) html += `<p style="text-align:center; padding:20px; opacity:0.5;">No picks yet</p>`;
  else {
    Object.entries(picks).forEach(([id, p]) => {
      const f = fights.find(x => x.id == id);
      html += `<div class="fight"><strong>${f.f1} vs ${f.f2}</strong><br>${p.winner==='f1'?f.f1:f.f2} - ${p.method}</div>`;
    });
  }
  fightCard.innerHTML = html;
  fightCard.classList.add("show");
  tg?.BackButton.show();
  tg?.BackButton.onClick(closeSheet);
}

window.pickWinner = (id, w) => {
  picks[id]=picks[id]||{}; picks[id].winner=w;
  showFightCard();
};
window.pickMethod = (id, m) => {
  picks[id]=picks[id]||{}; picks[id].method=m;
  showFightCard();
};
window.savePicks = () => { localStorage.setItem("picks", JSON.stringify(picks)); closeSheet(); renderMain(); };

if (!nickname) showNicknameForm();
else renderMain();