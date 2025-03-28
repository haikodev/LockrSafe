let masterPassword = '';
let entries = [];

// Apply saved theme
if (localStorage.getItem('lockrsafe-theme') === 'light') {
  document.body.classList.add('light-mode');
}

// DOM Elements
const loginSection = document.getElementById('login-section');
const vaultSection = document.getElementById('vault-section');
const masterPasswordInput = document.getElementById('master-password');
const unlockBtn = document.getElementById('unlock-btn');
const addBtn = document.getElementById('add-btn');
const importBtn = document.getElementById('import-btn');
const exportBtn = document.getElementById('export-btn');
const searchInput = document.getElementById('search');
const entriesList = document.getElementById('entries-list');
const entryModal = document.getElementById('entry-modal');
const entryForm = document.getElementById('entry-form');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');
const generatePasswordBtn = document.getElementById('generate-password');
const togglePasswordBtn = document.getElementById('toggle-password');
const entryPassword = document.getElementById('entry-password');
const notificationsContainer = document.getElementById('notifications');
const passwordStrength = document.getElementById('password-strength');
const confirmDeleteModal = document.getElementById('confirm-delete-modal');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

let deleteIndex = null;

// Event Listeners
unlockBtn.addEventListener('click', unlockVault);
addBtn.addEventListener('click', () => showModal('add'));
importBtn.addEventListener('click', importVault);
exportBtn.addEventListener('click', exportVault);
searchInput.addEventListener('input', filterEntries);
entryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('entry-name');
  const username = document.getElementById('entry-username');
  const password = document.getElementById('entry-password');

  let isValid = true;
  [name, username, password].forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('invalid');
      isValid = false;
    } else {
      input.classList.remove('invalid');
    }
  });

  if (!isValid) {
    entryForm.classList.add('shake');
    setTimeout(() => entryForm.classList.remove('shake'), 500);
    showNotification('All fields are required', 'error');
    return;
  }

  handleEntrySubmit(e);
});

closeModalBtn.addEventListener('click', hideModal);
generatePasswordBtn.addEventListener('click', () => {
  generatePassword();
  updateStrength(entryPassword.value);
});
togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
entryPassword.addEventListener('input', () => updateStrength(entryPassword.value));
confirmDeleteBtn.addEventListener('click', confirmDeleteEntry);
cancelDeleteBtn.addEventListener('click', () => {
  confirmDeleteModal.classList.add('hidden');
  deleteIndex = null;
});

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    ${message}
  `;
  notificationsContainer.appendChild(notification);
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

async function unlockVault() {
  const password = masterPasswordInput.value;
  if (!password) return showNotification('Please enter a master password', 'error');
  try {
    const res = await fetch('/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ masterPassword: password })
    });
    const data = await res.json();
    if (data.success) {
      masterPassword = password;
      entries = data.entries;
      loginSection.classList.add('hidden');
      vaultSection.classList.remove('hidden');
      renderEntries();
      showNotification(data.isNewVault ? 'New vault created!' : 'Vault unlocked');
    } else {
      showNotification(data.message, 'error');
    }
  } catch {
    showNotification('Unlock failed', 'error');
  }
}

function renderEntries(list = entries) {
  entriesList.innerHTML = '';
  if (!list.length) return entriesList.innerHTML = '<p class="no-entries">No entries yet.</p>';
  list.forEach((entry, i) => {
    const card = document.createElement('div');
    card.className = 'entry-card';
    card.innerHTML = `
      <div class="entry-info">
        <h4>${entry.name}</h4>
        <p>${entry.username}</p>
      </div>
      <div class="entry-actions">
        <button onclick="copyPassword(${i})" title="Copy"><i class="fas fa-copy"></i></button>
        <button onclick="editEntry(${i})" title="Edit"><i class="fas fa-edit"></i></button>
        <button onclick="promptDelete(${i})" title="Delete"><i class="fas fa-trash"></i></button>
      </div>
    `;
    entriesList.appendChild(card);
  });
}

async function handleEntrySubmit(e) {
  e.preventDefault();
  const name = document.getElementById('entry-name').value.trim();
  const username = document.getElementById('entry-username').value.trim();
  const password = document.getElementById('entry-password').value.trim();

  if (!name || !username || !password) {
    showNotification('All fields are required', 'error');
    return;
  }

  const entry = { name, username, password };
  const isEdit = entryForm.dataset.editIndex !== undefined;
  const method = isEdit ? 'PUT' : 'POST';
  const url = isEdit ? `/api/entries/${entryForm.dataset.editIndex}` : '/api/entries';
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'masterPassword': masterPassword
      },
      body: JSON.stringify({ entry })
    });
    const data = await res.json();
    if (data.success) {
      if (isEdit) entries[entryForm.dataset.editIndex] = entry;
      else entries.push(entry);
      hideModal();
      renderEntries();
      showNotification(isEdit ? 'Entry updated' : 'Entry added');
    } else {
      showNotification(data.message || 'Error saving entry', 'error');
    }
  } catch {
    showNotification('Failed to save entry', 'error');
  }
}

function editEntry(index) {
  const e = entries[index];
  document.getElementById('entry-name').value = e.name;
  document.getElementById('entry-username').value = e.username;
  document.getElementById('entry-password').value = e.password;
  updateStrength(e.password);
  entryForm.dataset.editIndex = index;
  modalTitle.textContent = 'Edit Entry';
  entryModal.classList.remove('hidden');
}

function promptDelete(index) {
  deleteIndex = index;
  confirmDeleteModal.classList.remove('hidden');
}

async function confirmDeleteEntry() {
  try {
    const res = await fetch(`/api/entries/${deleteIndex}`, {
      method: 'DELETE',
      headers: { 'masterPassword': masterPassword }
    });
    const data = await res.json();
    if (data.success) {
      entries.splice(deleteIndex, 1);
      renderEntries();
      showNotification('Entry deleted');
    } else {
      showNotification(data.message || 'Failed to delete', 'error');
    }
  } catch {
    showNotification('Delete failed', 'error');
  }
  confirmDeleteModal.classList.add('hidden');
  deleteIndex = null;
}

function filterEntries() {
  const q = searchInput.value.toLowerCase();
  const filtered = entries.filter(e =>
    e.name.toLowerCase().includes(q) || e.username.toLowerCase().includes(q)
  );
  renderEntries(filtered);
}

function showModal(mode) {
  entryForm.reset();
  delete entryForm.dataset.editIndex;
  modalTitle.textContent = mode === 'add' ? 'Add Entry' : 'Edit Entry';
  updateStrength('');
  entryModal.classList.remove('hidden');
}

function hideModal() {
  entryModal.classList.add('hidden');
  entryForm.reset();
  updateStrength('');
  delete entryForm.dataset.editIndex;
}

function generatePassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  entryPassword.value = password;
  updateStrength(password);
  showNotification('Password generated');
}

function togglePasswordVisibility() {
  const type = entryPassword.type === 'password' ? 'text' : 'password';
  entryPassword.type = type;
  togglePasswordBtn.innerHTML = `<i class="fas fa-eye${type === 'password' ? '' : '-slash'}"></i>`;
}

function updateStrength(password) {
  let strength = 0;
  if (password.length > 6) strength++;
  if (password.length > 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const levels = ['very-weak', 'weak', 'medium', 'strong', 'very-strong'];
  passwordStrength.className = `strength ${levels[strength] || ''}`;
  passwordStrength.textContent = password ? levels[strength].replace('-', ' ') : '';
}

async function copyPassword(index) {
  try {
    await navigator.clipboard.writeText(entries[index].password);
    showNotification('Password copied');
  } catch {
    showNotification('Copy failed', 'error');
  }
}

async function exportVault() {
  try {
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'masterPassword': masterPassword }
    });
    const data = await res.json();
    if (data.success) {
      const blob = new Blob([JSON.stringify(data.data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'vault-backup.json';
      a.click();
      URL.revokeObjectURL(url);
      showNotification('Vault exported');
    } else {
      showNotification(data.message || 'Export failed', 'error');
    }
  } catch {
    showNotification('Export error', 'error');
  }
}

async function importVault() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';
  input.onchange = async e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        const imported = JSON.parse(e.target.result);
        const res = await fetch('/api/import', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'masterPassword': masterPassword
          },
          body: JSON.stringify({ data: imported })
        });
        const data = await res.json();
        if (data.success) {
          entries = imported.entries;
          renderEntries();
          showNotification('Vault imported');
        } else {
          showNotification(data.message || 'Import failed', 'error');
        }
      } catch {
        showNotification('Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}