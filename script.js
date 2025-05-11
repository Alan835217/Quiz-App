let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let category = '9'; // Default category
let difficulty = 'easy'; // Default difficulty
let timer;
let timeLeft;

const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const startBtn = document.getElementById('start-btn');
const selectionBox = document.getElementById('selection');
const quizBox = document.getElementById('quiz');
const resultBox = document.getElementById('result');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const progressEl = document.getElementById('progress');
const finalScoreEl = document.getElementById('final-score');
const timerEl = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Start Quiz
startBtn.addEventListener('click', () => {
  category = categorySelect.value;
  difficulty = difficultySelect.value;
  fetchQuestions();
  selectionBox.classList.add('hidden');
  quizBox.classList.remove('hidden');
});

// Fetch questions from API
async function fetchQuestions() {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=multiple`);
    const data = await res.json();
    quizData = data.results.map(item => ({
      question: item.question,
      options: shuffleArray([...item.incorrect_answers, item.correct_answer]),
      answer: item.correct_answer,
    }));
    loadQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
  }
}

// Shuffle options randomly
function shuffleArray(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

// Load current question
function loadQuestion() {
  const currentData = quizData[currentQuestionIndex];
  questionEl.innerHTML = currentData.question;

  optionsEl.innerHTML = currentData.options.map(option => `
    <button class="option-btn" onclick="checkAnswer('${option}')">${option}</button>
  `).join('');

  progressEl.innerHTML = `Question ${currentQuestionIndex + 1} of 10`;

  setTimer();
}

// Set timer based on difficulty
function setTimer() {
  clearInterval(timer);

  if (difficulty === 'easy') {
    timeLeft = 30;
  } else if (difficulty === 'medium') {
    timeLeft = 20;
  } else {
    timeLeft = 10;
  }

  timerEl.innerHTML = `⏳ Time Left: ${timeLeft}s`;

  timer = setInterval(() => {
    timeLeft--;
    timerEl.innerHTML = `⏳ Time Left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timer);
      autoMoveNext();
    }
  }, 1000);
}

// Auto move to next question when time up
function autoMoveNext() {
  const correctAnswer = quizData[currentQuestionIndex].answer;

  userAnswers.push({
    question: quizData[currentQuestionIndex].question,
    selected: "No Answer",
    correct: correctAnswer,
    isCorrect: false
  });

  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

// Check user's selected answer
function checkAnswer(selectedAnswer) {
  clearInterval(timer);

  const correctAnswer = quizData[currentQuestionIndex].answer;

  if (selectedAnswer === correctAnswer) {
    score++;
    userAnswers.push({
      question: quizData[currentQuestionIndex].question,
      selected: selectedAnswer,
      correct: correctAnswer,
      isCorrect: true
    });
  } else {
    userAnswers.push({
      question: quizData[currentQuestionIndex].question,
      selected: selectedAnswer,
      correct: correctAnswer,
      isCorrect: false
    });
  }

  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResults();
  }
}

// Show result after quiz ends
function showResults() {
  quizBox.classList.add('hidden');
  resultBox.classList.remove('hidden');
  finalScoreEl.innerHTML = `<h2>You scored ${score} out of ${quizData.length}</h2>`;

  userAnswers.forEach((answer, index) => {
    finalScoreEl.innerHTML += `
      <div class="answer-review">
        <p><strong>Q${index + 1}:</strong> ${answer.question}</p>
        <p><span class="${answer.isCorrect ? 'correct' : 'wrong'}">Your Answer: ${answer.selected}</span></p>
        <p><span class="correct-answer">Correct Answer: ${answer.correct}</span></p>
        <hr>
      </div>
    `;
  });
}

// Restart the quiz
restartBtn.addEventListener('click', () => {
  score = 0;
  currentQuestionIndex = 0;
  userAnswers = [];
  resultBox.classList.add('hidden');
  selectionBox.classList.remove('hidden');
});
