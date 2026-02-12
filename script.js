// ===================================
// QUIZ DATA
// ===================================

const QUIZ_DATA = [
    {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(2^n)"],
        correct: 1,
        difficulty: "Medium"
    },
    {
        question: "Which of these is NOT a primitive data type in JavaScript?",
        options: ["String", "Number", "Array", "Boolean"],
        correct: 2,
        difficulty: "Easy"
    },
    {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style Sheets", "Cyber Security Standards"],
        correct: 1,
        difficulty: "Easy"
    },
    {
        question: "In Python, what is the output of: print(10 ** 2)?",
        options: ["100", "20", "12", "5"],
        correct: 0,
        difficulty: "Easy"
    },
    {
        question: "What is the most common HTTP status code for a successful request?",
        options: ["400", "404", "200", "500"],
        correct: 2,
        difficulty: "Medium"
    },
    {
        question: "Which data structure follows LIFO (Last In, First Out)?",
        options: ["Queue", "Stack", "Array", "Tree"],
        correct: 1,
        difficulty: "Medium"
    },
    {
        question: "What does REST API stand for?",
        options: [
            "Representational State Transfer API",
            "Remote Execution Software Transfer API",
            "Reactive Electronic Secure Transfer API",
            "Random Exchange State Transfer API"
        ],
        correct: 0,
        difficulty: "Medium"
    },
    {
        question: "Which sorting algorithm has a best case time complexity of O(n)?",
        options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Insertion Sort"],
        correct: 3,
        difficulty: "Hard"
    },
    {
        question: "What is the main purpose of a database index?",
        options: [
            "To encrypt data",
            "To speed up data retrieval",
            "To compress files",
            "To backup databases"
        ],
        correct: 1,
        difficulty: "Hard"
    },
    {
        question: "In OOP, what is the concept of hiding internal implementation details?",
        options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
        correct: 2,
        difficulty: "Hard"
    }
];

const TIME_PER_QUESTION = 30; // seconds

// ===================================
// STATE MANAGEMENT
// ===================================

const State = {
    currentQuestionIndex: 0,
    answers: [],
    score: 0,
    timeTaken: 0,
    startTime: null,
    timeRemaining: TIME_PER_QUESTION,
    timerInterval: null,
    isDarkTheme: localStorage.getItem('quizTheme') === 'dark',
};

// ===================================
// DOM ELEMENTS
// ===================================

const DOM = {
    // Screens
    startScreen: document.getElementById('startScreen'),
    quizScreen: document.getElementById('quizScreen'),
    resultsScreen: document.getElementById('resultsScreen'),
    
    // Buttons
    startBtn: document.getElementById('startBtn'),
    nextBtn: document.getElementById('nextBtn'),
    prevBtn: document.getElementById('prevBtn'),
    quitBtn: document.getElementById('quitBtn'),
    restartBtn: document.getElementById('restartBtn'),
    themeToggle: document.getElementById('themeToggle'),
    
    // Quiz Elements
    questionCounter: document.getElementById('questionCounter'),
    questionText: document.getElementById('questionText'),
    optionsContainer: document.getElementById('optionsContainer'),
    progressBar: document.getElementById('progressBar'),
    difficultyBadge: document.getElementById('difficultyBadge'),
    timerText: document.getElementById('timerText'),
    timerBadge: document.getElementById('timerBadge'),
    timerProgress: document.getElementById('timerProgress'),
    
    // Results Elements
    resultsTitle: document.getElementById('resultsTitle'),
    scorePercentage: document.getElementById('scorePercentage'),
    scoreRing: document.getElementById('scoreRing'),
    correctCount: document.getElementById('correctCount'),
    totalCount: document.getElementById('totalCount'),
    timeTaken: document.getElementById('timeTaken'),
    resultMessage: document.getElementById('resultMessage'),
    highScoreAchieved: document.getElementById('highScoreAchieved'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    
    // Confetti
    confettiContainer: document.getElementById('confettiContainer')
};

// ===================================
// INITIALIZATION
// ===================================

function init() {
    setupTheme();
    setupEventListeners();
    displayHighScore();
    createSVGGradients();
}

function setupTheme() {
    if (State.isDarkTheme) {
        document.body.classList.add('dark-theme');
    }
}

function setupEventListeners() {
    DOM.startBtn.addEventListener('click', startQuiz);
    DOM.nextBtn.addEventListener('click', nextQuestion);
    DOM.prevBtn.addEventListener('click', previousQuestion);
    DOM.quitBtn.addEventListener('click', quitQuiz);
    DOM.restartBtn.addEventListener('click', restartQuiz);
    DOM.themeToggle.addEventListener('click', toggleTheme);
}

// ===================================
// THEME TOGGLE
// ===================================

function toggleTheme() {
    State.isDarkTheme = !State.isDarkTheme;
    localStorage.setItem('quizTheme', State.isDarkTheme ? 'dark' : 'light');
    
    if (State.isDarkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// ===================================
// QUIZ FLOW
// ===================================

function startQuiz() {
    State.currentQuestionIndex = 0;
    State.answers = new Array(QUIZ_DATA.length).fill(null);
    State.score = 0;
    State.startTime = Date.now();
    State.timeRemaining = TIME_PER_QUESTION;
    
    showScreen('quiz');
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    const question = QUIZ_DATA[State.currentQuestionIndex];
    
    // Update header
    DOM.questionCounter.textContent = `${State.currentQuestionIndex + 1} / ${QUIZ_DATA.length}`;
    
    // Update progress bar
    const progress = ((State.currentQuestionIndex + 1) / QUIZ_DATA.length) * 100;
    DOM.progressBar.style.width = `${progress}%`;
    
    // Update question
    DOM.questionText.textContent = question.question;
    DOM.difficultyBadge.textContent = question.difficulty;
    DOM.difficultyBadge.className = `question-difficulty difficulty-${question.difficulty.toLowerCase()}`;
    
    // Reset timer
    State.timeRemaining = TIME_PER_QUESTION;
    clearInterval(State.timerInterval);
    startTimer();
    
    // Load options
    renderOptions(question);
    
    // Update button states
    updateNavigationButtons();
    
    // Animate in
    const questionCard = document.getElementById('questionCard');
    questionCard.style.animation = 'none';
    setTimeout(() => {
        questionCard.style.animation = 'slideInDown 0.5s ease-out';
    }, 10);
}

function renderOptions(question) {
    DOM.optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.innerHTML = `
            <label class="option-label">
                <span class="option-text">${option}</span>
            </label>
        `;
        
        // Check if already answered
        if (State.answers[State.currentQuestionIndex] !== null) {
            button.classList.add('disabled');
            
            if (index === State.answers[State.currentQuestionIndex]) {
                button.classList.add('selected');
            }
            
            // Show correct/incorrect
            if (index === question.correct) {
                button.classList.add('correct');
            } else if (index === State.answers[State.currentQuestionIndex]) {
                button.classList.add('incorrect');
            }
        } else {
            button.addEventListener('click', () => selectAnswer(index));
        }
        
        DOM.optionsContainer.appendChild(button);
    });
}

function selectAnswer(optionIndex) {
    const question = QUIZ_DATA[State.currentQuestionIndex];
    
    // Record answer
    State.answers[State.currentQuestionIndex] = optionIndex;
    
    // Update score
    if (optionIndex === question.correct) {
        State.score++;
    }
    
    // Disable all buttons and show feedback
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
        btn.classList.add('disabled');
        
        if (idx === question.correct) {
            btn.classList.add('correct');
        } else if (idx === optionIndex && optionIndex !== question.correct) {
            btn.classList.add('incorrect');
        }
    });
    
    // Auto advance after delay
    setTimeout(() => {
        if (State.currentQuestionIndex < QUIZ_DATA.length - 1) {
            nextQuestion();
        } else {
            // Last question - show next button is active
            DOM.nextBtn.disabled = false;
        }
    }, 1500);
    
    // Enable next button immediately
    DOM.nextBtn.disabled = false;
}

function nextQuestion() {
    if (State.currentQuestionIndex < QUIZ_DATA.length - 1) {
        State.currentQuestionIndex++;
        loadQuestion();
    } else {
        endQuiz();
    }
}

function previousQuestion() {
    if (State.currentQuestionIndex > 0) {
        State.currentQuestionIndex--;
        loadQuestion();
    }
}

function updateNavigationButtons() {
    DOM.prevBtn.disabled = State.currentQuestionIndex === 0;
    DOM.nextBtn.disabled = State.answers[State.currentQuestionIndex] === null;
}

function endQuiz() {
    clearInterval(State.timerInterval);
    State.timeTaken = Math.floor((Date.now() - State.startTime) / 1000);
    
    const percentage = Math.round((State.score / QUIZ_DATA.length) * 100);
    const isNewHighScore = updateHighScore(percentage);
    
    // Show results
    showScreen('results');
    displayResults(percentage, isNewHighScore);
    
    // Confetti for perfect score
    if (State.score === QUIZ_DATA.length) {
        createConfetti();
    }
}

function quitQuiz() {
    if (confirm('Are you sure you want to quit? Your progress will be lost.')) {
        clearInterval(State.timerInterval);
        showScreen('start');
        resetState();
    }
}

function restartQuiz() {
    resetState();
    showScreen('start');
}

function resetState() {
    State.currentQuestionIndex = 0;
    State.answers = [];
    State.score = 0;
    State.timeTaken = 0;
    State.startTime = null;
    State.timeRemaining = TIME_PER_QUESTION;
    clearInterval(State.timerInterval);
}

// ===================================
// TIMER FUNCTION
// ===================================

function startTimer() {
    updateTimerDisplay();
    
    State.timerInterval = setInterval(() => {
        State.timeRemaining--;
        updateTimerDisplay();
        
        if (State.timeRemaining <= 0) {
            clearInterval(State.timerInterval);
            timeExpired();
        }
    }, 1000);
}

function updateTimerDisplay() {
    DOM.timerText.textContent = State.timeRemaining;
    DOM.timerBadge.textContent = State.timeRemaining + 's';
    
    // Update timer circle
    const circumference = 2 * Math.PI * 45; // radius = 45
    const offset = circumference - (State.timeRemaining / TIME_PER_QUESTION) * circumference;
    DOM.timerProgress.style.strokeDasharray = `${circumference}`;
    DOM.timerProgress.style.strokeDashoffset = `${offset}`;
    
    // Change colors based on time
    DOM.timerText.classList.remove('warning', 'danger');
    if (State.timeRemaining <= 5) {
        DOM.timerText.classList.add('danger');
    } else if (State.timeRemaining <= 10) {
        DOM.timerText.classList.add('warning');
    }
}

function timeExpired() {
    const buttons = document.querySelectorAll('.option-btn');
    
    if (!buttons[0].classList.contains('disabled')) {
        // Auto select incorrect answer
        const question = QUIZ_DATA[State.currentQuestionIndex];
        let randomOption = Math.floor(Math.random() * question.options.length);
        while (randomOption === question.correct) {
            randomOption = Math.floor(Math.random() * question.options.length);
        }
        selectAnswer(randomOption);
    }
}

// ===================================
// RESULTS DISPLAY
// ===================================

function displayResults(percentage, isNewHighScore) {
    // Update title
    const title = DOM.resultsTitle;
    if (State.score === QUIZ_DATA.length) {
        title.textContent = "🎉 Perfect Score!";
        title.classList.add('perfect');
    } else if (percentage >= 80) {
        title.textContent = "Excellent!";
    } else if (percentage >= 60) {
        title.textContent = "Good Job!";
    } else if (percentage >= 40) {
        title.textContent = "Not Bad!";
    } else {
        title.textContent = "Keep Practicing!";
    }
    
    // Update score ring
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    DOM.scoreRing.style.strokeDasharray = `${circumference}`;
    DOM.scoreRing.style.strokeDashoffset = `${offset}`;
    
    // Animate score percentage
    animateValue(DOM.scorePercentage, 0, percentage, 1500);
    
    // Update stats
    DOM.correctCount.textContent = State.score;
    DOM.totalCount.textContent = QUIZ_DATA.length;
    DOM.timeTaken.textContent = formatTime(State.timeTaken);
    
    // Update message
    const messageEl = DOM.resultMessage;
    if (percentage >= 80) {
        messageEl.textContent = "You're a quiz master!";
        messageEl.classList.add('excellent');
    } else if (percentage >= 60) {
        messageEl.textContent = "Great effort, keep it up!";
        messageEl.classList.add('good');
    } else {
        messageEl.textContent = "Review the material and try again!";
    }
    
    // High score message
    if (isNewHighScore) {
        DOM.highScoreAchieved.textContent = `🏆 New High Score! ${percentage}%`;
        DOM.highScoreAchieved.style.display = 'block';
    } else {
        DOM.highScoreAchieved.style.display = 'none';
    }
}

function animateValue(element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + '%';
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
}

// ===================================
// HIGH SCORE MANAGEMENT
// ===================================

function updateHighScore(percentage) {
    const highScore = parseInt(localStorage.getItem('quizHighScore') || '0');
    
    if (percentage > highScore) {
        localStorage.setItem('quizHighScore', percentage);
        return true;
    }
    return false;
}

function displayHighScore() {
    const highScore = localStorage.getItem('quizHighScore');
    if (highScore) {
        DOM.highScoreDisplay.textContent = `🏆 High Score: ${highScore}%`;
    }
}

// ===================================
// CONFETTI ANIMATION
// ===================================

function createConfetti() {
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.backgroundColor = color;
        confetti.style.delay = Math.random() * 0.3 + 's';
        confetti.style.animationDuration = (Math.random() * 1.5 + 3) + 's';
        
        DOM.confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => confetti.remove(), 4000);
    }
}

// ===================================
// SCREEN MANAGEMENT
// ===================================

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    switch(screenName) {
        case 'start':
            DOM.startScreen.classList.add('active');
            break;
        case 'quiz':
            DOM.quizScreen.classList.add('active');
            break;
        case 'results':
            DOM.resultsScreen.classList.add('active');
            break;
    }
}

// ===================================
// SVG GRADIENTS
// ===================================

function createSVGGradients() {
    // Create SVG namespace
    const svgNS = "http://www.w3.org/2000/svg";
    
    // Find or create SVG defs section
    let defs = document.querySelector('svg defs');
    if (!defs) {
        // We'll add inline styles instead since we can't modify HTML
        const style = document.createElement('style');
        style.textContent = `
            #timerGradient {
                background: linear-gradient(135deg, #7c3aed, #ec4899);
            }
            #scoreGradient {
                background: linear-gradient(135deg, #7c3aed, #06b6d4);
            }
        `;
        document.head.appendChild(style);
    }
}

// ===================================
// RIPPLE EFFECT ON CLICK
// ===================================

document.addEventListener('click', (e) => {
    const button = e.target.closest('.btn');
    if (button && button.classList.contains('btn-primary')) {
        const ripple = document.createElement('span');
        ripple.classList.add('btn-ripple');
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
});

// ===================================
// START APPLICATION
// ===================================

document.addEventListener('DOMContentLoaded', init);
