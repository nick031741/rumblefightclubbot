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

// ───────────────
// NICKNAME LOGIC
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
// FIGHT CARD (OPEN/CLOSE)
// ───────────────

// 1. Добавляем функцию закрытия
function hideFightCard() {
  fightCard.classList.remove("show");

  // Скрываем кнопку в интерфейсе ТГ
  tg.BackButton.hide();

  // Обязательно отписываемся от события, чтобы не было дублей
  tg.BackButton.offClick(hideFightCard);
}

function showFightCard() {
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

  fightCard.innerHTML = `
    <h3 style="margin-bottom:12px">Fight Card</h3>
    ${fights.map((f, i) => `
        <div class="fight">
          ${i + 1}. ${f.red} vs ${f.blue}
          <span>${f.weight}</span>
        </div>
      `).join("")}
  `;

  fightCard.classList.add("show");

  // 2. Показываем кнопку "Назад" при открытии карточки
  tg.BackButton.show();

  // 3. Назначаем действие при клике на кнопку "Назад"
  tg.BackButton.onClick(hideFightCard);
}

// ───────────────
// INIT
// ───────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}