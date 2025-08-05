const guestForm = document.getElementById('guestForm');
const guestList = document.getElementById('guestList');

// Pagination setup
const entriesPerPage = 10;
let currentPage = 1;

function getEntries() {
  return JSON.parse(localStorage.getItem('guestEntries')) || [];
}

function saveEntries(entries) {
  localStorage.setItem('guestEntries', JSON.stringify(entries));
}

// Render entries for the current page
function renderGuestList() {
  const entries = getEntries();
  guestList.innerHTML = '';

  const start = (currentPage - 1) * entriesPerPage;
  const end = start + entriesPerPage;
  const pageEntries = entries.slice(start, end);

  pageEntries.forEach(entry => addGuestCard(entry));
  renderPagination(entries.length);
}

function renderPagination(totalEntries) {
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const pagination = document.createElement('div');
  pagination.classList.add('pagination');

  // Previous button
  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.onclick = () => {
      currentPage--;
      renderGuestList();
    };
    pagination.appendChild(prevBtn);
  }

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.textContent = i;
    if (i === currentPage) pageBtn.disabled = true;
    pageBtn.onclick = () => {
      currentPage = i;
      renderGuestList();
    };
    pagination.appendChild(pageBtn);
  }

  // Next button
  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => {
      currentPage++;
      renderGuestList();
    };
    pagination.appendChild(nextBtn);
  }

  guestList.appendChild(pagination);
}

guestForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();
  const code = document.getElementById('code').value.trim();

  const bannedWords = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'cunt', 'nigger', 'nigga', 'faggot', 'fag' ];
  const containsProfanity = (text) =>
    bannedWords.some((word) => text.toLowerCase().includes(word));

  if (!/^\d{3}$/.test(code)) {
    alert('Please enter a valid 3-digit code.');
    return;
  }

  if (containsProfanity(name) || containsProfanity(message)) {
    alert('Your message or name contains inappropriate language.');
    return;
  }

  const id = Date.now().toString();
  const entry = { id, name, message, code };

  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);

  guestForm.reset();

  // Go to last page to show new entry
  currentPage = Math.ceil(entries.length / entriesPerPage);
  renderGuestList();
});

function addGuestCard(entry) {
  const { id, name, message, code } = entry;

  const guestCard = document.createElement('div');
  guestCard.classList.add('guest-card');
  guestCard.innerHTML = `
    <h2>${name}</h2>
    <p>${message}</p>
    <button class="delete-btn">delete</button>
  `;

  const deleteBtn = guestCard.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', () => {
    const userCode = prompt('Enter your 3-digit code to delete this message:');
    if (userCode === code) {
      guestCard.remove();
      let entries = getEntries();
      entries = entries.filter((e) => e.id !== id);
      saveEntries(entries);

      // Adjust page if current becomes empty
      const totalPages = Math.ceil(entries.length / entriesPerPage);
      if (currentPage > totalPages) currentPage = totalPages || 1;

      renderGuestList();
    } else {
      alert('Incorrect code. Cannot delete message.');
    }
  });

  guestList.appendChild(guestCard);
}

// Initial load
window.addEventListener('DOMContentLoaded', renderGuestList);
