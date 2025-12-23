const tg = window.Telegram?.WebApp;

if (!tg) {
  document.body.innerHTML = "<p>Open via Telegram</p>";
  throw new Error("Not Telegram");
}

tg.ready();
tg.expand();

// ─────────────────────────────
// DEADLINE — НЕ ТРОГАЕМ
// ─────────────────────────────
const DEADLINE = new Date("2026-01-24T23:59:59+03:00").getTime();

function isDeadlinePassed() {
  return Date.now() > DEADLINE;
}

// ─────────────────────────────
// DATA
// ─────────────────────────────
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
  { id: 11, weight: "Women's Flyweight", f1: "Natália Silva", f2: "Rose Namajunas" },
  { id: 12, weight: "Heavyweight", f1: "Josh Hokit", f2: "Denzel Freeman" },
  { id: 13, weight: "Bantamweight", f1: "Ricky Turcios", f2: "Cameron Smotherman" }
];

// ─────────────────────────────
// STATE
// ─────────────────────────────
const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");
const fightCard = document.getElementById("fightCard");

let nickname = localStorage.getItem("nickname");
let picks = JSON.parse(localStorage.getItem("picks") || "{}");

// ─────────────────────────────
// HELPERS
// ─────────────────────────────
function selectedStyle(active) {
  return active
    ? 'style="background:#2f80ed;color:#fff;border-color:#2f80ed"'
    : '';
}

// ─────────────────────────────
// NICKNAME
// ─────────────────────────────
function showNicknameForm() {
  app.innerHTML = `
    <div class="card">
      <h3>Create nickname</h3>
      <input id="nickInput" placeholder="nickname"
        style="width:100%;padding:12px;border-radius:10px;border:none;margin:12px 0;background:#2a2a2a;color:#fff;" />
      <button onclick="saveNickname()">Continue</button>
      <div id="error" style="color:#ff6b6b;font-size:13px;margin-top:8px"></div>
    </div>
  `;
}

window.saveNickname = () => {
  const value = document.getElementById("nickInput").value.trim();
  const error = document.getElementById("error");

  if (!/^[a-zA-Z0-9_]{3,15}$/.test(value)) {
    error.textContent = "Only a-z, 0-9, _, min 3 chars";
    return;
  }

  localStorage.setItem("nickname", value);
  nickname = value;
  renderMain();
};

// ─────────────────────────────
// MAIN
// ─────────────────────────────
function renderMain() {
  nicknameEl.innerHTML = `<span id="myPicksBtn" style="cursor:pointer">My picks</span>`;

  const hasPicks = Object.keys(picks).length > 0;
  const closed = isDeadlinePassed();

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster" />
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
      <p style="opacity:.7;font-size:14px">25 January</p>

      <button id="enterPrediction" ${closed ? "disabled" : ""}>
        ${closed ? "PREDICTIONS CLOSED" : hasPicks ? "CHANGE MY PICKS" : "ENTER PREDICTION"}
      </button>
    </div>
  `;

  document.getElementById("enterPrediction").onclick = () => {
    if (isDeadlinePassed()) {
      tg.showPopup({
        title: "Predictions closed",
        message: "Predictions are locked for this event",
        buttons: [{ type: "ok" }]
      });
      return;
    }
    showFightCard();
  };

  document.getElementById("myPicksBtn").onclick = showMyPicks;
}

// ─────────────────────────────
// FIGHT CARD
// ─────────────────────────────
function hideFightCard() {
  fightCard.classList.remove("show");
  tg.BackButton.hide();
  tg.BackButton.offClick(hideFightCard);
}

function showFightCard() {
  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>Fight Card</h3>
      <span style="cursor:pointer;font-size:20px" id="closeCard">✕</span>
    </div>
  `;

  fights.forEach(f => {
    const pick = picks[f.id] || {};

    html += `
      <div class="fight">
        <strong>${f.f1} vs ${f.f2}</strong>
        <span>${f.weight}</span>

        <div style="display:flex;gap:6px;margin-top:8px">
          <button onclick="pickWinner(${f.id}, 'f1')" ${selectedStyle(pick.winner === 'f1')}>F1</button>
          <button onclick="pickWinner(${f.id}, 'f2')" ${selectedStyle(pick.winner === 'f2')}>F2</button>
        </div>

        <div style="display:flex;gap:6px;margin-top:6px">
          ${["KO/TKO","SUB","Decision"].map(m => `
            <button onclick="pickMethod(${f.id}, '${m}')" ${selectedStyle(pick.method === m)}>
              ${m}
            </button>
          `).join("")}
        </div>
      </div>
    `;
  });

  html += `<button style="margin-top:12px" onclick="savePicks()">Save</button>`;

  fightCard.innerHTML = html;
  fightCard.classList.add("show");

  document.getElementById("closeCard").onclick = hideFightCard;
  tg.BackButton.show();
  tg.BackButton.onClick(hideFightCard);
}

// ─────────────────────────────
// PICKS LOGIC
// ─────────────────────────────
window.pickWinner = (id, who) => {
  picks[id] = picks[id] || {};
  picks[id].winner = who;
  showFightCard();
};

window.pickMethod = (id, method) => {
  picks[id] = picks[id] || {};
  picks[id].method = method;
  showFightCard();
};

window.savePicks = () => {
  if (isDeadlinePassed()) {
    alert("Predictions are closed");
    return;
  }

  localStorage.setItem("picks", JSON.stringify(picks));
  hideFightCard();
  renderMain();
};

// ─────────────────────────────
// MY PICKS
// ─────────────────────────────
function showMyPicks() {
  let html = `<div class="card"><h3>My Picks</h3>`;

  if (Object.keys(picks).length === 0) {
    html += `<p>No picks yet</p>`;
  } else {
    Object.entries(picks).forEach(([id, p]) => {
      const f = fights.find(x => x.id == id);
      html += `
        <div style="margin-bottom:10px">
          <strong>${f.f1} vs ${f.f2}</strong><br>
          <small>${p.winner === "f1" ? f.f1 : f.f2} — ${p.method}</small>
        </div>
      `;
    });
  }

  html += `</div>`;
  app.innerHTML = html;
}

// ─────────────────────────────
// INIT
// ─────────────────────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}
