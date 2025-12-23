const tg = window.Telegram?.WebApp;

if (!tg) {
  document.body.innerHTML = "<p>Open via Telegram</p>";
  throw new Error("Not Telegram");
}

tg.ready();
tg.expand();

const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");
const fightCard = document.getElementById("fightCard");

let nickname = localStorage.getItem("nickname");

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
      <div id="error" style="color:#aaa;font-size:13px;margin-top:8px"></div>
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
// MAIN SCREEN
// ─────────────────────────────
function renderMain() {
  nicknameEl.textContent = nickname;

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster" />
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
      <button id="enterPrediction">ENTER PREDICTION</button>
    </div>
  `;

  document.getElementById("enterPrediction").onclick = showFightCard;
}

// ─────────────────────────────
// FIGHT CARD
// ─────────────────────────────
function showFightCard() {
  const fights = [
    { id: 1, weight: "Lightweight", f1: "Gaethje", f2: "Pimblett" },
    { id: 2, weight: "Women's Bantamweight", f1: "Harrison", f2: "Nunes" },
    { id: 3, weight: "Bantamweight", f1: "O'Malley", f2: "Yadong" },
    { id: 4, weight: "Heavyweight", f1: "Cortes-Acosta", f2: "Lewis" },
    { id: 5, weight: "Featherweight", f1: "Allen", f2: "Silva" },
    { id: 6, weight: "Lightweight", f1: "Johnson", f2: "Hernandez" },
    { id: 7, weight: "Light Heavyweight", f1: "Krylov", f2: "Bukauskas" },
    { id: 8, weight: "Bantamweight", f1: "Nurmagomedov", f2: "Figueiredo" },
    { id: 9, weight: "Middleweight", f1: "Gautier", f2: "Pulyaev" },
    { id: 10, weight: "Flyweight", f1: "Perez", f2: "Johnson" },
    { id: 11, weight: "Women's Flyweight", f1: "Silva", f2: "Namajunas" },
    { id: 12, weight: "Heavyweight", f1: "Hokit", f2: "Freeman" },
    { id: 13, weight: "Bantamweight", f1: "Turcios", f2: "Smotherman" }
  ];

  fightCard.innerHTML = `
    <h3 style="margin-bottom:12px">Fight Card</h3>

    ${fights.map(f => `
      <div class="fight" data-id="${f.id}">
        <div class="fight-title">${f.f1} vs ${f.f2}</div>
        <div class="weight">${f.weight}</div>

        <div class="row">
          <div class="pick" data-pick="F1">F1</div>
          <div class="pick" data-pick="F2">F2</div>
        </div>

        <div class="row">
          <div class="method" data-method="KO/TKO">KO/TKO</div>
          <div class="method" data-method="SUB">SUB</div>
          <div class="method" data-method="DEC">DEC</div>
        </div>
      </div>
    `).join("")}

    <button id="savePredictions">SAVE</button>
  `;

  fightCard.classList.add("show");

  tg.BackButton.show();
  tg.BackButton.onClick(hideFightCard);

  initPredictionLogic();
}

function hideFightCard() {
  fightCard.classList.remove("show");
  tg.BackButton.hide();
  tg.BackButton.offClick(hideFightCard);
}

// ─────────────────────────────
// LOGIC
// ─────────────────────────────
function initPredictionLogic() {
  document.querySelectorAll(".fight").forEach(fight => {
    const picks = fight.querySelectorAll(".pick");
    const methods = fight.querySelectorAll(".method");

    picks.forEach(p => {
      p.onclick = () => {
        picks.forEach(x => x.classList.remove("active"));
        p.classList.add("active");
      };
    });

    methods.forEach(m => {
      m.onclick = () => {
        methods.forEach(x => x.classList.remove("active"));
        m.classList.add("active");
      };
    });
  });

  document.getElementById("savePredictions").onclick = savePredictions;
}

// ─────────────────────────────
// SAVE
// ─────────────────────────────
function savePredictions() {
  const result = [];

  document.querySelectorAll(".fight").forEach(fight => {
    const id = fight.dataset.id;
    const pick = fight.querySelector(".pick.active")?.dataset.pick || null;
    const method = fight.querySelector(".method.active")?.dataset.method || null;

    result.push({ fightId: id, pick, method });
  });

  localStorage.setItem("predictions", JSON.stringify(result));

  tg.showPopup({
    title: "Saved",
    message: "Predictions saved 👊",
    buttons: [{ type: "ok", text: "OK" }]
  });
}

// ─────────────────────────────
// INIT
// ─────────────────────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}
