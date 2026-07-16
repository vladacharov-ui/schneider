# Schneider Weisse Brauhaus Website

This repository contains the premium, responsive website for the Schneider Weisse Brauhaus restaurant (Rostov-on-Don), including:
- Interactive booking modal with automatic form validation.
- Secure backend server API routing table bookings directly to the owner's Telegram channel.
- RF legal documents compliance suite (Privacy Policy, Data Consent, User Agreement, and Marketing consent).
- Dynamic Google Fonts typography, GSAP animations, Lenis smooth scrolling, and Yandex Maps interactive widgets.

---

## Local Development & Startup

To run the project locally on your machine:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables (optional)**:
   Create a `.env` file or set environment variables:
   ```bash
   TELEGRAM_BOT_TOKEN="your_bot_token"
   TELEGRAM_CHAT_ID="your_chat_id"
   PORT=8081
   ```

3. **Start the local server**:
   ```bash
   npm start
   ```
   Open [http://localhost:8081](http://localhost:8081) in your browser.

---

## Production Deployment on Vercel

The project is fully configured for zero-setup deployment on [Vercel](https://vercel.com):

1. **Push your code to GitHub/GitLab/Bitbucket**.
2. **Log into Vercel** and select **New Project** -> **Import** your repository.
3. **Configure Environment Variables**:
   Under the project **Settings** -> **Environment Variables**, add:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
4. **Deploy!** Vercel will automatically build the static assets and deploy `/api/book` as a secure Node.js serverless function.
