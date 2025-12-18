const mountains = [
    { id: 1, name: "Mount Everest", height: "8,848 m", location: "Nepal / China" },
    { id: 2, name: "Aconcagua", height: "6,961 m", location: "Argentina" },
    { id: 3, name: "Denali", height: "6,190 m", location: "United States" },
    { id: 4, name: "Mount Kilimanjaro", height: "5,895 m", location: "Tanzania" },
    { id: 5, name: "Mount Elbrus", height: "5,642 m", location: "Russia" },
    { id: 6, name: "Mount Vinson", height: "4,892 m", location: "Antarctica" },
    { id: 7, name: "Puncak Jaya", height: "4,884 m", location: "Indonesia" },
    { id: 8, name: "Mont Blanc", height: "4,807 m", location: "France / Italy" },
    { id: 9, name: "Mount Fuji", height: "3,776 m", location: "Japan" },
    { id: 10, name: "Mount Cook", height: "3,724 m", location: "New Zealand" }
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

const mountainsList = document.getElementById('mountains-list');
const locationsList = document.getElementById('locations-list');
const historyList = document.getElementById('history-list');
const noHistoryMsg = document.getElementById('no-history-msg');
const matchesCountEl = document.getElementById('matches-count');
const movesCountEl = document.getElementById('moves-count');
const finalScoreEl = document.getElementById('final-score');
const resultMessageEl = document.getElementById('result-message');

let matches = 0;
let moves = 0;
let selectedMountain = null;
let selectedLocation = null;
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
    selectedMountain = null;
    selectedLocation = null;
    updateStats();

    renderLists();
    showScreen(quizScreen);
}

function renderLists() {
    mountainsList.innerHTML = '';
    locationsList.innerHTML = '';

    // Render Mountains (Left Side - Ordered by rank/height usually, but let's keep array order)
    mountains.forEach(m => {
        const el = document.createElement('div');
        el.classList.add('match-item');
        el.dataset.id = m.id;
        el.dataset.type = 'mountain';
        el.innerHTML = `<span class="badge">${m.id}</span> ${m.name}`;
        el.onclick = () => handleSelection(el, 'mountain');
        mountainsList.appendChild(el);
    });

    // Render Locations (Right Side - Shuffled)
    const shuffledLocations = [...mountains].sort(() => Math.random() - 0.5);
    shuffledLocations.forEach(m => {
        const el = document.createElement('div');
        el.classList.add('match-item');
        el.dataset.id = m.id; // Correct ID to match with mountain
        el.dataset.type = 'location';
        el.textContent = m.location;
        el.onclick = () => handleSelection(el, 'location');
        locationsList.appendChild(el);
    });
}

function handleSelection(el, type) {
    // Ignore if already matched or disabled
    if (el.classList.contains('matched')) return;

    // Handle Mountain Selection
    if (type === 'mountain') {
        if (selectedMountain) {
            selectedMountain.classList.remove('selected');
        }
        selectedMountain = el;
        el.classList.add('selected');
    }

    // Handle Location Selection
    if (type === 'location') {
        if (selectedLocation) {
            selectedLocation.classList.remove('selected');
        }
        selectedLocation = el;
        el.classList.add('selected');
    }

    // Check for match attempt
    if (selectedMountain && selectedLocation) {
        moves++;
        updateStats();
        checkMatch();
    }
}

function checkMatch() {
    const mountainId = selectedMountain.dataset.id;
    const locationId = selectedLocation.dataset.id;

    if (mountainId === locationId) {
        // Correct Match
        selectedMountain.classList.remove('selected');
        selectedLocation.classList.remove('selected');

        selectedMountain.classList.add('matched');
        selectedLocation.classList.add('matched');

        matches++;
        updateStats();

        selectedMountain = null;
        selectedLocation = null;

        if (matches === mountains.length) {
            setTimeout(endQuiz, 500);
        }
    } else {
        // Wrong Match
        selectedMountain.classList.add('error');
        selectedLocation.classList.add('error');

        // Disable interaction temporarily
        const tempM = selectedMountain;
        const tempL = selectedLocation;

        selectedMountain = null;
        selectedLocation = null;

        setTimeout(() => {
            // Only remove 'selected' if it's not the currently selected item (user re-selected it)
            if (tempM) {
                tempM.classList.remove('error');
                if (tempM !== selectedMountain) {
                    tempM.classList.remove('selected');
                }
            }
            if (tempL) {
                tempL.classList.remove('error');
                if (tempL !== selectedLocation) {
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
