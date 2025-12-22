// ─────────────────────────────────────
// TELEGRAM WEB APP INIT
// ─────────────────────────────────────
const tg = window.Telegram?.WebApp;

if (!tg) {
  document.body.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#0f0f0f;
      color:#fff;
      font-family:sans-serif;
      text-align:center;
    ">
      <div>
        <h2>🥊 RUMBLE FIGHT CLUB</h2>
        <p>Please open via Telegram bot</p>
      </div>
    </div>
  `;
  throw new Error("Not Telegram WebApp");
}

tg.ready();
tg.expand();

// ─────────────────────────────────────
// ELEMENTS & STATE
// ─────────────────────────────────────
const app = document.getElementById("app");
const nicknameEl = document.getElementById("nickname");

let nickname = localStorage.getItem("nickname");

// ─────────────────────────────────────
// NICKNAME SCREEN
// ─────────────────────────────────────
function showNicknameForm() {
  app.innerHTML = `
    <div class="card">
      <h3>Create your nickname</h3>
      <input id="nickInput" placeholder="nickname" />
      <button id="saveNick">Continue</button>
      <div class="error" id="error"></div>
    </div>
  `;

  document.getElementById("saveNick").onclick = saveNickname;
}

function saveNickname() {
  const input = document.getElementById("nickInput");
  const error = document.getElementById("error");
  const value = input.value.trim();

  if (!/^[a-zA-Z0-9_]{3,15}$/.test(value)) {
    error.textContent = "Only a-z, 0-9, _, 3–15 chars";
    return;
  }

  localStorage.setItem("nickname", value);
  nickname = value;
  renderMain();
}

// ─────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────
function renderMain() {
  nicknameEl.textContent = nickname;

  app.innerHTML = `
    <div class="card tournament" id="tournament">
      <img src="images/ufc324_official.jpg" class="poster" />
      <span>Nearest tournament</span>
      <h3>UFC 324</h3>
      <p>Gaethje vs Pimblett</p>
    </div>
  `;

  document.getElementById("tournament").onclick = () => {
    tg.showPopup({
      title: "UFC 324",
      message: "Predictions coming soon 👊",
      buttons: [{ type: "ok", text: "OK" }]
    });
  };
}

// ─────────────────────────────────────
// INIT
// ─────────────────────────────────────
if (!nickname) {
  showNicknameForm();
} else {
  renderMain();
}
