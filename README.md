# 🔐 LockrSafe – Secure, Local-First Password Manager (Web + CLI)

**LockrSafe** is a secure, offline-first password manager built with Node.js. It encrypts and stores your vault locally and now comes with a slick web interface — all running on your own machine.

> Perfect for privacy-conscious users and developers learning encryption, secure UX, and fullstack modularity.

---

## ✨ Features

- 🔐 AES-256 encrypted vault (`vault.json`)
- 🔑 Master password-protected access
- 🌐 Web UI (localhost) + CLI support
- 📋 Copy passwords to clipboard (via browser)
- 🧪 Strong password generator + strength meter
- 🔍 Search, edit, delete entries easily
- 🔁 Import/export vault as JSON
- 🧹 Auto-lock on logout or password mismatch
- 🛠️ 100% local, open-source, no account needed

---

## 📦 Tech Stack

- Node.js backend (Express)
- Native `crypto` module for encryption
- HTML/CSS/JS frontend
- FontAwesome icons, clipboard API

---

## 🚀 Getting Started

### 1. Clone the project
```bash
git clone https://github.com/yourusername/lockrsafe.git
cd lockrsafe
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the app
```bash
npm start
```

> Then go to: [http://localhost:3000](http://localhost:3000)

---

## 🗂️ Project Structure

```
lockrsafe/
├── server.js            # Express API backend
├── vault.json           # Encrypted vault (auto-generated)
├── public/              # Frontend static files
│   ├── index.html       # Main UI layout
│   ├── style.css        # Styles
│   └── app.js           # App logic (frontend)
├── package.json
└── README.md
```

---

## 🛡️ Encryption Details

| Feature         | Method              |
|----------------|---------------------|
| Cipher         | AES-256-CBC         |
| Key Derivation | PBKDF2 + SHA-256    |
| Vault Format   | Encrypted JSON file |
| Passwords      | Stored securely in browser memory |

---

## 📌 Roadmap

- ✅ Full-featured local password manager
- ✅ Web-based interface with UI/UX polish
- 🔜 PWA/mobile support
- 🔜 Browser extension for auto-fill
- 🔜 Biometric unlock (where supported)

---

## 🤝 Contribute

Suggestions and PRs welcome! LockrSafe is built to teach and empower — fork it, extend it, and make it yours. Privacy-first by design 💪

---

## 📄 License

MIT License © 2025 [Haiko]
