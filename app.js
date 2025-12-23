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
let predictions = JSON.parse(localStorage.getItem("predictions") || "{}");

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

// ───────────────
// FIGHT CARD
// ───────────────
function hideFightCard() {
  fightCard.classList.remove("show");
  tg.BackButton.hide();
  tg.BackButton.offClick(hideFightCard);
}

function savePrediction(fightId, data) {
  predictions[fightId] = data;
  localStorage.setItem("predictions", JSON.stringify(predictions));
}

function showFightCard() {
  const fights = [
    { id: 1, weight: "Lightweight", red: "Justin Gaethje", blue: "Paddy Pimblett" },
    { id: 2, weight: "Women's Bantamweight", red: "Kayla Harrison", blue: "Amanda Nunes" },
    { id: 3, weight: "Bantamweight", red: "Sean O'Malley", blue: "Song Yadong" },
    { id: 4, weight: "Heavyweight", red: "Waldo Cortes-Acosta", blue: "Derrick Lewis" },
    { id: 5, weight: "Featherweight", red: "Arnold Allen", blue: "Jean Silva" },
    { id: 6, weight: "Lightweight", red: "Michael Johnson", blue: "Alexander Hernandez" },
    { id: 7, weight: "Light Heavyweight", red: "Nikita Krylov", blue: "Modestas Bukauskas" },
    { id: 8, weight: "Bantamweight", red: "Umar Nurmagomedov", blue: "Deiveson Figueiredo" },
    { id: 9, weight: "Middleweight", red: "Ateba Gautier", blue: "Andrey Pulyaev" },
    { id: 10, weight: "Flyweight", red: "Alex Perez", blue: "Charles Johnson" },
    { id: 11, weight: "Women's Flyweight", red: "Natália Silva", blue: "Rose Namajunas" },
    { id: 12, weight: "Heavyweight", red: "Josh Hokit", blue: "Denzel Freeman" },
    { id: 13, weight: "Bantamweight", red: "Ricky Turcios", blue: "Cameron Smotherman" }
  ];

  fightCard.innerHTML = `
    <h3 style="margin-bottom:12px">Fight Card</h3>
    ${fights.map(f => {
      const saved = predictions[f.id] || {};
      return `
        <div class="fight">
          <div><b>${f.red}</b> vs <b>${f.blue}</b></div>
          <span>${f.weight}</span>

          <div style="margin-top:8px">
            <button class="pick ${saved.winner === 'red' ? 'active' : ''}"
              onclick="pickWinner(${f.id}, 'red', '${f.red}')">${f.red}</button>

            <button class="pick ${saved.winner === 'blue' ? 'active' : ''}"
              onclick="pickWinner(${f.id}, 'blue', '${f.blue}')">${f.blue}</button>
          </div>

          <div style="margin-top:6px">
            ${["KO/TKO", "SUB", "DEC"].map(m => `
              <button class="method ${saved.method === m ? 'active' : ''}"
                onclick="pickMethod(${f.id}, '${m}')">${m}</button>
            `).join("")}
          </div>
        </div>
      `;
    }).join("")}
  `;

  fightCard.classList.add("show");
  tg.BackButton.show();
  tg.BackButton.onClick(hideFightCard);
}

// ───────────────
// PICK HANDLERS
// ───────────────
window.pickWinner = (fightId, side, name) => {
  const current = predictions[fightId] || {};
  savePrediction(fightId, { ...current, winner: side, fighter: name });
  showFightCard();
};

window.pickMethod = (fightId, method) => {
  const current = predictions[fightId] || {};
  savePrediction(fightId, { ...current, method });
  showFightCard();
};

// ───────────────
// INIT
// ───────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}
