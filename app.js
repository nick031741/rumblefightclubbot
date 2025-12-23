const tg = window.Telegram?.WebApp;

tg.ready();
tg.expand();

const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");
const fightCard = document.getElementById("fightCard");

let nickname = localStorage.getItem("nickname");
let predictions = JSON.parse(localStorage.getItem("predictions") || "{}");

// ───────────────
// DEADLINE
// ───────────────
const DEADLINE = new Date(2025, 0, 24, 23, 59); // 24 Jan 23:59

function isDeadlinePassed() {
  return new Date() > DEADLINE;
}

// ───────────────
// NICKNAME
// ───────────────
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

// ───────────────
// MAIN SCREEN
// ───────────────
function renderMain() {
  nicknameEl.innerHTML = `
    <span style="cursor:pointer" id="myPicksBtn">
      ${nickname} · My picks
    </span>
  `;

  const hasPicks = Object.keys(predictions).length > 0;
  const locked = isDeadlinePassed();

  app.innerHTML = `
    <div class="card">
      <img src="images/ufc324_official.jpg" class="poster" />
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>

      <button id="enterPrediction" ${locked ? "disabled" : ""}>
        ${locked
          ? "PREDICTIONS CLOSED"
          : hasPicks
          ? "CHANGE MY PICKS"
          : "ENTER PREDICTION"}
      </button>

      <div style="margin-top:10px;font-size:12px;opacity:.6">
        Deadline: Jan 24 · 23:59
      </div>
    </div>
  `;

  document.getElementById("enterPrediction").onclick = () => {
    if (locked) {
      tg.showPopup({
        title: "Predictions closed",
        message: "The deadline has passed. You can no longer change your picks.",
        buttons: [{ type: "ok" }]
      });
      return;
    }
    showFightCard();
  };

  document.getElementById("myPicksBtn").onclick = showMyPicks;
}

// ───────────────
// FIGHTS
// ───────────────
const fights = [
  { weight: "Lightweight", red: "Justin Gaethje", blue: "Paddy Pimblett" },
  { weight: "Women's Bantamweight", red: "Kayla Harrison", blue: "Amanda Nunes" },
  { weight: "Bantamweight", red: "Sean O'Malley", blue: "Song Yadong" },
  { weight: "Heavyweight", red: "Waldo Cortes-Acosta", blue: "Derrick Lewis" },
  { weight: "Featherweight", red: "Arnold Allen", blue: "Jean Silva" },
  { weight: "Lightweight", red: "Michael Johnson", blue: "Alexander Hernandez" },
  { weight: "Light Heavyweight", red: "Nikita Krylov", blue: "Modestas Bukauskas" },
  { weight: "Bantamweight", red: "Umar Nurmagomedov", blue: "Deiveson Figueiredo" },
  { weight: "Middleweight", red: "Ateba Gautier", blue: "Andrey Pulyaev" },
  { weight: "Flyweight", red: "Alex Perez", blue: "Charles Johnson" },
  { weight: "Women's Flyweight", red: "Natália Silva", blue: "Rose Namajunas" },
  { weight: "Heavyweight", red: "Josh Hokit", blue: "Denzel Freeman" },
  { weight: "Bantamweight", red: "Ricky Turcios", blue: "Cameron Smotherman" }
];

// ───────────────
// FIGHT CARD
// ───────────────
function showFightCard() {
  fightCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>Fight Card</h3>
      <div id="closeCard" style="font-size:22px;cursor:pointer;opacity:.7">✕</div>
    </div>

    ${fights.map((f, i) => `
      <div class="fight">
        <div class="fight-title">${f.red} vs ${f.blue}</div>
        <div class="weight">${f.weight}</div>

        <div class="row">
          <div class="pick" data-fight="${i}" data-winner="${f.red}">F1</div>
          <div class="pick" data-fight="${i}" data-winner="${f.blue}">F2</div>
        </div>

        <div class="row">
          ${["KO/TKO","SUB","Decision"].map(m => `
            <div class="method" data-fight="${i}" data-method="${m}">
              ${m}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("")}

    <button id="savePredictions">SAVE</button>
  `;

  fightCard.classList.add("show");

  tg.BackButton.show();
  tg.BackButton.onClick(hideFightCard);

  document.getElementById("closeCard").onclick = hideFightCard;

  bindPredictionClicks();
}

function hideFightCard() {
  fightCard.classList.remove("show");
  tg.BackButton.hide();
  tg.BackButton.offClick(hideFightCard);
}

// ───────────────
// PICKS LOGIC
// ───────────────
function bindPredictionClicks() {
  if (isDeadlinePassed()) return;

  document.querySelectorAll(".pick").forEach(btn => {
    btn.onclick = () => {
      const fight = btn.dataset.fight;
      document.querySelectorAll(`.pick[data-fight="${fight}"]`)
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      predictions[fight] = predictions[fight] || {};
      predictions[fight].winner = btn.dataset.winner;
    };
  });

  document.querySelectorAll(".method").forEach(btn => {
    btn.onclick = () => {
      const fight = btn.dataset.fight;
      document.querySelectorAll(`.method[data-fight="${fight}"]`)
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      predictions[fight] = predictions[fight] || {};
      predictions[fight].method = btn.dataset.method;
    };
  });

  document.getElementById("savePredictions").onclick = () => {
    if (isDeadlinePassed()) {
      tg.showPopup({
        title: "Too late",
        message: "Deadline has passed. Picks are locked.",
        buttons: [{ type: "ok" }]
      });
      return;
    }

    localStorage.setItem("predictions", JSON.stringify(predictions));
    hideFightCard();
    renderMain();
    tg.HapticFeedback.notificationOccurred("success");
  };
}

// ───────────────
// MY PICKS
// ───────────────
function showMyPicks() {
  if (!Object.keys(predictions).length) {
    tg.showPopup({
      title: "No picks",
      message: "You haven't made any predictions yet.",
      buttons: [{ type: "ok" }]
    });
    return;
  }

  fightCard.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
      <h3>My Picks</h3>
      <div id="closeCard" style="font-size:22px;cursor:pointer;opacity:.7">✕</div>
    </div>

    ${Object.entries(predictions).map(([i, p]) => `
      <div class="fight">
        <div class="fight-title">
          ${fights[i].red} vs ${fights[i].blue}
        </div>
        <div class="weight">
          ${p.winner} · ${p.method || "-"}
        </div>
      </div>
    `).join("")}
  `;

  fightCard.classList.add("show");

  tg.BackButton.show();
  tg.BackButton.onClick(hideFightCard);
  document.getElementById("closeCard").onclick = hideFightCard;
}

// ───────────────
// INIT
// ───────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}
