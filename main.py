import os
import logging
from dotenv import load_dotenv

from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)
from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)

# ─────────────────────────────────────
# LOAD ENV
# ─────────────────────────────────────
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
MINI_APP_URL = os.getenv("MINI_APP_URL")

if not BOT_TOKEN:
    raise RuntimeError("❌ BOT_TOKEN is not set in .env")

if not MINI_APP_URL:
    raise RuntimeError("❌ MINI_APP_URL is not set in .env")

# ─────────────────────────────────────
# LOGGING
# ─────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────
# HANDLERS
# ─────────────────────────────────────
async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    /start command handler
    """
    keyboard = InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton(
                    text="🥊 Open Rumble Fight Club",
                    web_app=WebAppInfo(url=MINI_APP_URL),
                )
            ]
        ]
    )

    await update.message.reply_text(
        "🥊 <b>RUMBLE FIGHT CLUB</b>\n\n"
        "Welcome to the arena!\n"
        "Tap the button below to open the Mini App 👇",
        reply_markup=keyboard,
        parse_mode="HTML",
    )


# ─────────────────────────────────────
# MAIN
# ─────────────────────────────────────
def main():
    logger.info("🚀 Starting Telegram bot...")

    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))

    application.run_polling()


# ─────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────
if __name__ == "__main__":
    main()
