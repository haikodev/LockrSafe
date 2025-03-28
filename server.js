import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import path from 'path';
import { promises as fs } from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;
const VAULT_PATH = './vault.json';

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

function generateSalt() {
  return crypto.randomBytes(16);
}

function generateIV() {
  return crypto.randomBytes(16);
}

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
}

function encrypt(data, password) {
  const salt = generateSalt();
  const iv = generateIV();
  const key = deriveKey(password, salt);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex')
  };
}

function decrypt(encrypted, salt, iv, password) {
  const key = deriveKey(password, Buffer.from(salt, 'hex'));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function createVault(entries = []) {
  return { entries };
}

async function saveVault(vault, password) {
  const { encrypted, salt, iv } = encrypt(JSON.stringify(vault), password);
  await fs.writeFile(VAULT_PATH, JSON.stringify({ encrypted, salt, iv }));
}

async function loadVault(password) {
  const data = JSON.parse(await fs.readFile(VAULT_PATH, 'utf8'));
  const decrypted = decrypt(data.encrypted, data.salt, data.iv, password);
  return JSON.parse(decrypted);
}

app.post('/api/unlock', async (req, res) => {
  const { masterPassword } = req.body;
  if (!masterPassword) return res.status(400).json({ success: false, message: 'Missing password' });

  try {
    const exists = await fs.access(VAULT_PATH).then(() => true).catch(() => false);

    if (!exists) {
      const newVault = createVault();
      await saveVault(newVault, masterPassword);
      return res.json({ success: true, entries: [], isNewVault: true });
    }

    const vault = await loadVault(masterPassword);
    res.json({ success: true, entries: vault.entries });
  } catch (err) {
    res.json({ success: false, message: 'Invalid master password' });
  }
});

app.post('/api/entries', async (req, res) => {
  const { entry } = req.body;
  const masterPassword = req.headers.masterpassword;
  if (!entry || !masterPassword) return res.status(400).json({ success: false });

  try {
    const vault = await loadVault(masterPassword);
    vault.entries.push(entry);
    await saveVault(vault, masterPassword);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: 'Invalid master password' });
  }
});

app.put('/api/entries/:index', async (req, res) => {
  const index = parseInt(req.params.index);
  const { entry } = req.body;
  const masterPassword = req.headers.masterpassword;

  try {
    const vault = await loadVault(masterPassword);
    if (index < 0 || index >= vault.entries.length) throw new Error('Invalid index');
    vault.entries[index] = entry;
    await saveVault(vault, masterPassword);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: 'Failed to update entry' });
  }
});

app.delete('/api/entries/:index', async (req, res) => {
  const index = parseInt(req.params.index);
  const masterPassword = req.headers.masterpassword;

  try {
    const vault = await loadVault(masterPassword);
    if (index < 0 || index >= vault.entries.length) throw new Error('Invalid index');
    vault.entries.splice(index, 1);
    await saveVault(vault, masterPassword);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: 'Failed to delete entry' });
  }
});

app.post('/api/export', async (req, res) => {
  const masterPassword = req.headers.masterpassword;

  try {
    const vault = await loadVault(masterPassword);
    res.json({ success: true, data: { entries: vault.entries } });
  } catch {
    res.json({ success: false, message: 'Invalid master password' });
  }
});

app.post('/api/import', async (req, res) => {
  const { data } = req.body;
  const masterPassword = req.headers.masterpassword;

  try {
    if (!data || !Array.isArray(data.entries)) {
      return res.json({ success: false, message: 'Invalid import format' });
    }

    const vault = await loadVault(masterPassword);
    const combined = [...vault.entries, ...data.entries];
    const seen = new Map();
    combined.forEach(e => seen.set(`${e.name}|${e.username}`, e));
    vault.entries = Array.from(seen.values());

    await saveVault(vault, masterPassword);
    res.json({ success: true });
  } catch {
    res.json({ success: false, message: 'Failed to import vault' });
  }
});

app.listen(port, () => {
  console.log(`🔐 LockrSafe running at http://localhost:${port}`);
});