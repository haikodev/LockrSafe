# 🔐 LockrSafe – Secure, Local-First Password Manager (CLI)

**LockrSafe** is a secure, offline password manager built in Node.js.  
It stores your passwords **encrypted locally** and runs entirely in your terminal.  
Perfect for privacy-conscious users and developers who want to learn encryption, CLI, and clean code structure.

---

## ✨ Features

- 🔐 AES-256 encrypted vault (`vault.json`)
- 🔑 Master password for unlocking your vault
- 📋 Copy password to clipboard (auto-clears in 30 seconds)
- 🧹 Auto-logout after 5 min of inactivity
- 🔁 Import/export vault as JSON
- 🔍 Search, edit, and delete saved credentials
- ⚠️ Lock after 3 failed login attempts
- 🧪 Random strong password generator
- 🛠️ Easy to customize and extend (100% local, no server)

---

## 📦 Tech Stack

- Node.js (with native `crypto` module)
- CLI interface with `readline-sync`
- Clipboard management with `clipboardy`
- Modular codebase for easy hacking

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

---

## 🗂️ Project Structure

```
lockrsafe/
├── index.js             # Main app logic
├── vault.json           # Encrypted vault (created after first use)
├── lib/
│   ├── crypto.js        # AES encryption / decryption
│   ├── storage.js       # Read/write vault + backups
│   └── ui.js            # CLI input/output and features
├── backup/              # Auto-generated encrypted backups
├── package.json
└── README.md
```

---

## 🛡️ Encryption Details

| Feature         | Method              |
|----------------|---------------------|
| Cipher          | AES-256-CBC         |
| Key Derivation  | PBKDF2 + SHA-256    |
| Vault Format    | Encrypted JSON file |
| Clipboard       | Clears after 30s    |

---

## 📌 Roadmap

- ✅ Secure CLI vault with full features
- 🔜 GUI interface with Electron
- 🔜 Mobile version (Capacitor or React Native)
- 🔜 Browser extension (auto-fill support)

---

## 🤝 Contribute

Pull requests, forks and suggestions are welcome!  
Use LockrSafe to learn cryptography and CLI tools in Node.js, or make it your daily tool.  
Let's build privacy-first software, one project at a time 💪

---

## 📄 License

MIT License © 2024 [Haiko]
