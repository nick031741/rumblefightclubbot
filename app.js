const tg = window.Telegram?.WebApp;
if (!tg) {
  document.body.innerHTML = "<p>Open via Telegram</p>";
  throw new Error("Not Telegram");
}

tg.ready();
tg.expand();

// DEADLINE — НЕ ТРОГАЕМ
const DEADLINE = new Date("2026-01-24T23:59:59+03:00").getTime();
const isDeadlinePassed = () => Date.now() > DEADLINE;

// DATA
const fights = [
  { id: 1, weight: "Lightweight", f1: "Justin Gaethje", f2: "Paddy Pimblett" },
  { id: 2, weight: "Women's Bantamweight", f1: "Kayla Harrison", f2: "Amanda Nunes" },
  { id: 3, weight: "Bantamweight", f1: "Sean O'Malley", f2: "Song Yadong" },
  { id: 4, weight: "Heavyweight", f1: "Waldo Cortes-Acosta", f2: "Derrick Lewis" }
];

// STATE
const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");
const fightCard = document.getElementById("fightCard");

let nickname = localStorage.getItem("nickname");
let picks = JSON.parse(localStorage.getItem("picks") || "{}");

// NICKNAME
function showNicknameForm() {
  app.innerHTML = `
    <div class="card">
      <h3>Create nickname</h3>
      <input id="nickInput" placeholder="nickname"
        style="width:100%;padding:12px;border-radius:10px;border:none;margin:12px 0;background:#2a2a2a;color:#fff;" />
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

// MAIN
function renderMain() {
  nicknameEl.textContent = nickname;

  const hasPicks = Object.keys(picks).length > 0;
  const closed = isDeadlinePassed();

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster" />
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
      <p style="opacity:.6">25 January</p>

      <button id="enterPrediction" ${closed ? "disabled" : ""}>
        ${closed ? "PREDICTIONS CLOSED" : hasPicks ? "CHANGE MY PICKS" : "ENTER PREDICTION"}
      </button>
    </div>
  `;

  document.getElementById("enterPrediction").onclick = () => {
    if (!isDeadlinePassed()) showFightCard();
  };

  document.getElementById("myPicksBtn").onclick = showMyPicks;
}

// BOTTOM SHEET CORE
function closeBottomSheet() {
  fightCard.classList.remove("show");
  tg.BackButton.hide();
  tg.BackButton.offClick(closeBottomSheet);
}

// FIGHT CARD
function showFightCard() {
  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>Fight Card</h3>
      <span style="cursor:pointer;font-size:20px" id="closeSheet">✕</span>
    </div>
  `;

  fights.forEach(f => {
    const p = picks[f.id] || {};
    html += `
      <div class="fight">
        <strong>${f.f1} vs ${f.f2}</strong>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button onclick="pickWinner(${f.id},'f1')" style="${p.winner==='f1'?'background:#444':''}">F1</button>
          <button onclick="pickWinner(${f.id},'f2')" style="${p.winner==='f2'?'background:#444':''}">F2</button>
        </div>
      </div>
    `;
  });

  html += `<button style="margin-top:12px" onclick="savePicks()">Save</button>`;

  fightCard.innerHTML = html;
  fightCard.classList.add("show");

  document.getElementById("closeSheet").onclick = closeBottomSheet;
  tg.BackButton.show();
  tg.BackButton.onClick(closeBottomSheet);
}

// MY PICKS
function showMyPicks() {
  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>MY PICKS</h3>
      <span style="cursor:pointer;font-size:20px" id="closeSheet">✕</span>
    </div>
  `;

  if (!Object.keys(picks).length) {
    html += `<p>No picks yet</p>`;
  } else {
    Object.entries(picks).forEach(([id, p]) => {
      const f = fights.find(x => x.id == id);
      html += `<p>${f.f1} vs ${f.f2}</p>`;
    });
  }

  fightCard.innerHTML = html;
  fightCard.classList.add("show");

  document.getElementById("closeSheet").onclick = closeBottomSheet;
  tg.BackButton.show();
  tg.BackButton.onClick(closeBottomSheet);
}

// PICKS
window.pickWinner = (id, w) => {
  picks[id] = { winner: w };
  showFightCard();
};

window.savePicks = () => {
  localStorage.setItem("picks", JSON.stringify(picks));
  closeBottomSheet();
  renderMain();
};

// INIT
if (!nickname) showNicknameForm();
else renderMain();
