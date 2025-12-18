const shaktiPithas = [
    { id: 1, name: "Kamakhya", place: "Assam" },
    { id: 2, name: "Varanasi", place: "Uttar Pradesh" },
    { id: 3, name: "Kalighat", place: "Kolkata" },
    { id: 4, name: "Jwala Ji", place: "Himachal Pradesh" },
    { id: 5, name: "Chamundeshwari", place: "Mysore" },
    { id: 6, name: "Amarnath", place: "Jammu & Kashmir" },
    { id: 7, name: "Kanyakumari", place: "Tamil Nadu" },
    { id: 8, name: "Hinglaj", place: "Pakistan" },
    { id: 9, name: "Sugandha", place: "Bangladesh" },
    { id: 10, name: "Mahalaxmi", place: "Kolhapur" }
];

const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');
const historyScreen = document.getElementById('history-screen');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const historyBtn = document.getElementById('history-btn');
const backHomeBtn = document.getElementById('back-home-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const usernameInput = document.getElementById('username-input');

const pithasList = document.getElementById('mountains-list');
const placesList = document.getElementById('locations-list');
const historyList = document.getElementById('history-list');
const noHistoryMsg = document.getElementById('no-history-msg');
const matchesCountEl = document.getElementById('matches-count');
const movesCountEl = document.getElementById('moves-count');
const finalScoreEl = document.getElementById('final-score');
const resultMessageEl = document.getElementById('result-message');

let matches = 0;
let moves = 0;
let selectedPitha = null;
let selectedPlace = null;
let currentUser = '';
let quizHistory = JSON.parse(localStorage.getItem('peakKnowledgeHistory')) || [];

function startQuiz() {
    const name = usernameInput.value.trim();
    if (!name) {
        alert("Please enter your name to start!");
        return;
    }
    currentUser = name;
    matches = 0;
    moves = 0;
    selectedPitha = null;
    selectedPlace = null;
    updateStats();

    renderLists();
    showScreen(quizScreen);
}

function renderLists() {
    pithasList.innerHTML = '';
    placesList.innerHTML = '';

    // Render Pithas (Left Side)
    shaktiPithas.forEach(m => {
        const el = document.createElement('div');
        el.classList.add('match-item');
        el.dataset.id = m.id;
        el.dataset.type = 'pitha';
        el.innerHTML = `<span class="badge">${m.id}</span> ${m.name}`;
        el.onclick = () => handleSelection(el, 'pitha');
        pithasList.appendChild(el);
    });

    // Render Places (Right Side - Shuffled)
    const shuffledPlaces = [...shaktiPithas].sort(() => Math.random() - 0.5);
    shuffledPlaces.forEach(m => {
        const el = document.createElement('div');
        el.classList.add('match-item');
        el.dataset.id = m.id; // Correct ID to match with pitha
        el.dataset.type = 'place';
        el.textContent = m.place;
        el.onclick = () => handleSelection(el, 'place');
        placesList.appendChild(el);
    });
}

function handleSelection(el, type) {
    // Ignore if already matched or disabled
    if (el.classList.contains('matched')) return;

    // Handle Pitha Selection
    if (type === 'pitha') {
        if (selectedPitha) {
            selectedPitha.classList.remove('selected');
        }
        selectedPitha = el;
        el.classList.add('selected');
    }

    // Handle Place Selection
    if (type === 'place') {
        if (selectedPlace) {
            selectedPlace.classList.remove('selected');
        }
        selectedPlace = el;
        el.classList.add('selected');
    }

    // Check for match attempt
    if (selectedPitha && selectedPlace) {
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    const pithaId = selectedPitha.dataset.id;
    const placeId = selectedPlace.dataset.id;

    if (pithaId === placeId) {
        // Correct Match
        selectedPitha.classList.remove('selected');
        selectedPlace.classList.remove('selected');

        selectedPitha.classList.add('matched');
        selectedPlace.classList.add('matched');

        matches++;
        updateStats();

        selectedPitha = null;
        selectedPlace = null;

        if (matches === shaktiPithas.length) {
            setTimeout(endQuiz, 500);
        }
    } else {
        // Wrong Match
        selectedPitha.classList.add('error');
        selectedPlace.classList.add('error');

        // Disable interaction temporarily
        const tempP = selectedPitha;
        const tempL = selectedPlace;

        selectedPitha = null;
        selectedPlace = null;

        setTimeout(() => {
            // Only remove 'selected' if it's not the currently selected item (user re-selected it)
            if (tempP) {
                tempP.classList.remove('error');
                if (tempP !== selectedPitha) {
                    tempP.classList.remove('selected');
                }
            }
            if (tempL) {
                tempL.classList.remove('error');
                if (tempL !== selectedPlace) {
                    tempL.classList.remove('selected');
                }
            }
        }, 400);
    }
}

function updateStats() {
    matchesCountEl.textContent = matches;
    movesCountEl.textContent = moves;
}

function endQuiz() {
    // Calculate score based on moves (Perfect score = 10 moves)
    // Simple scoring: 100 - (moves - 10) * 5. Minimum 0.
    let score = Math.max(0, 100 - (moves - 10) * 5);

    finalScoreEl.textContent = score;

    if (score === 100) {
        resultMessageEl.textContent = "Perfect! You matched them all in minimum moves!";
    } else if (score >= 80) {
        resultMessageEl.textContent = "Excellent work! Almost perfect.";
    } else if (score >= 50) {
        resultMessageEl.textContent = "Good job! You know your geography.";
    } else {
        resultMessageEl.textContent = "Keep practicing! You'll get better.";
    }

    showScreen(resultScreen);
    saveScore(score);
}

function saveScore(score) {
    const entry = {
        date: new Date().toISOString(),
        name: currentUser,
        score: score,
        moves: moves
    };

    quizHistory.push(entry);
    localStorage.setItem('peakKnowledgeHistory', JSON.stringify(quizHistory));
}

function showHistory() {
    renderHistory();
    showScreen(historyScreen);
}

function renderHistory() {
    historyList.innerHTML = '';

    // Filter by current user if we wanted to, but requirement implies seeing improvement, 
    // usually for the user. Let's show all for now or filter by user if input has value.
    // Let's show all history sorted by date descending.

    const sortedHistory = [...quizHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (sortedHistory.length === 0) {
        noHistoryMsg.classList.remove('hidden');
        document.getElementById('history-table').classList.add('hidden');
        return;
    }

    noHistoryMsg.classList.add('hidden');
    document.getElementById('history-table').classList.remove('hidden');

    // Calculate improvement for same user
    // We need to find the previous game for this user to compare.
    // Since we are iterating, we can look ahead or pre-process.
    // Simpler: For each entry, find the *next* entry in time (which is previous in sorted list) for same user.

    sortedHistory.forEach((entry, index) => {
        const row = document.createElement('tr');

        // Date formatting
        const dateObj = new Date(entry.date);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Improvement calculation
        let improvementHtml = '<span class="improvement-neutral">-</span>';

        // Find previous attempt for THIS user
        // Search in the part of array *after* this index (older entries)
        const previousEntry = sortedHistory.slice(index + 1).find(h => h.name === entry.name);

        if (previousEntry) {
            const diff = entry.score - previousEntry.score;
            if (diff > 0) {
                improvementHtml = `<span class="improvement-positive">▲ +${diff}</span>`;
            } else if (diff < 0) {
                improvementHtml = `<span class="improvement-negative">▼ ${diff}</span>`;
            } else {
                improvementHtml = `<span class="improvement-neutral">= 0</span>`;
            }
        }

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
            <td>${improvementHtml}</td>
        `;
        historyList.appendChild(row);
    });
}

function clearHistory() {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
        localStorage.removeItem('peakKnowledgeHistory');
        quizHistory = [];
        renderHistory();
    }
}

function goHome() {
    showScreen(startScreen);
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });

    screen.classList.remove('hidden');
    // Force reflow
    void screen.offsetWidth;
    screen.classList.add('active');
}

// Controls
const pauseBtn = document.getElementById('pause-btn');
const exitBtn = document.getElementById('exit-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseOverlay = document.getElementById('pause-overlay');

function pauseGame() {
    pauseOverlay.classList.remove('hidden');
}

function resumeGame() {
    pauseOverlay.classList.add('hidden');
}

function exitGame() {
    // Confirm exit? Maybe not needed for simple app, but good UX.
    if (confirm("Are you sure you want to exit? Progress will be lost.")) {
        resumeGame(); // Hide overlay if open
        showScreen(startScreen);
    }
}

pauseBtn.addEventListener('click', pauseGame);
resumeBtn.addEventListener('click', resumeGame);
exitBtn.addEventListener('click', exitGame);

startBtn.addEventListener('click', startQuiz);
restartBtn.addEventListener('click', startQuiz);
historyBtn.addEventListener('click', showHistory);
backHomeBtn.addEventListener('click', goHome);
clearHistoryBtn.addEventListener('click', clearHistory);
