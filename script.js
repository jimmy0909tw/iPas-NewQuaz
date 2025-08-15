let quizData = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let wrongAnswerIds = [];

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i].trim();
    });
    return obj;
  });
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

function showQuestion() {
  const question = quizData[currentQuestionIndex];
  document.getElementById('question').textContent = question.question;
  const optionsContainer = document.getElementById('options');
  optionsContainer.innerHTML = '';

  ['A', 'B', 'C', 'D'].forEach(letter => {
    const optionText = question[letter];
    if (optionText) {
      const button = document.createElement('button');
      button.textContent = `${letter}. ${optionText}`;
      button.onclick = () => selectAnswer(letter);
      optionsContainer.appendChild(button);
    }
  });
}

function selectAnswer(letter) {
  userAnswers.push({ id: quizData[currentQuestionIndex].id, answer: letter });
  currentQuestionIndex++;
  if (currentQuestionIndex < quizData.length) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  let correctCount = 0;
  wrongAnswerIds = [];

  userAnswers.forEach((entry, i) => {
    const correct = quizData[i].correct;
    if (entry.answer === correct) {
      correctCount++;
    } else {
      wrongAnswerIds.push(entry.id);
    }
  });

  document.getElementById('result').innerHTML = `
    <p>答對 ${correctCount} 題 / 共 ${quizData.length} 題</p>
    <p>錯題 ID：${wrongAnswerIds.join(', ')}</p>
    <button onclick="startSecondQuiz()">錯題優先重考</button>
    <button onclick="clearWrongAnswers()">清除錯題記錄</button>
  `;

  saveWrongAnswers(wrongAnswerIds);
}

function saveWrongAnswers(wrongIds) {
  localStorage.setItem('wrongIds', JSON.stringify(wrongIds));
}

function getWrongAnswers() {
  const data = localStorage.getItem('wrongIds');
  return data ? JSON.parse(data) : [];
}

function clearWrongAnswers() {
  localStorage.removeItem('wrongIds');
  alert('錯題記錄已清除');
}

function generateSecondQuiz(allQuestions, totalCount = 100) {
  const wrongIds = getWrongAnswers();
  const wrongQuestions = allQuestions.filter(q => wrongIds.includes(q.id));
  const remainingQuestions = allQuestions.filter(q => !wrongIds.includes(q.id));
  const neededCount = totalCount - wrongQuestions.length;
  const newQuestions = shuffleArray(remainingQuestions).slice(0, neededCount);
  const finalQuiz = shuffleArray([...wrongQuestions, ...newQuestions]);
  return finalQuiz;
}

function startQuiz() {
  fetch('questions3.csv')
    .then(response => response.text())
    .then(csvText => {
      const allQuestions = parseCSV(csvText);
      quizData = shuffleArray(allQuestions).slice(0, 100);
      currentQuestionIndex = 0;
      userAnswers = [];
      showQuestion();
    });
}

function startSecondQuiz() {
  fetch('questions3.csv')
    .then(response => response.text())
    .then(csvText => {
      const allQuestions = parseCSV(csvText);
      quizData = generateSecondQuiz(allQuestions, 100);
      currentQuestionIndex = 0;
      userAnswers = [];
      showQuestion();
    });
}
