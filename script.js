function parseCSVLine(line) {
    const cells = [];
    let re = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
    let match;
    while ((match = re.exec(line)) !== null) {
        let cell = match[1];
        if (cell.startsWith('"') && cell.endsWith('"')) {
            cell = cell.slice(1, -1);
        }
        cells.push(cell.trim());
    }

    const answerLetter = cells[6].toUpperCase();
    const answerIndex = ['A', 'B', 'C', 'D'].indexOf(answerLetter);

    return {
        id: cells[0],
        question: cells[1],
        options: [cells[2], cells[3], cells[4], cells[5]],
        answer: answerIndex,
        explanation: cells[7] || ''
    };
}

let quiz = [];
let userAnswers = [];
let current = 0;

async function loadQuestions() {
    const res = await fetch('questions3.csv');
    const text = await res.text();
    const lines = text.trim().split('\n');
    quiz = lines.slice(1).map(line => parseCSVLine(line)); // ← 全部題目，不隨機
    userAnswers = Array(quiz.length);
    current = 0;
    renderQuestion();
}

function renderQuestion() {
    const q = quiz[current];
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <div class="question">(${current + 1}/${quiz.length}) ${q.question}</div>
        <form id="options-form" class="options">
            ${q.options.map((opt, i) => `
                <label>
                    <input type="radio" name="option" value="${i}" required>
                    ${opt}
                </label>
            `).join('')}
            <div class="button-area">
                <button type="submit">提交答案</button>
            </div>
        </form>
        <div class="explanation" id="explanation" style="display:none;"></div>
    `;
    document.getElementById('options-form').onsubmit = function(e) {
        e.preventDefault();
        const ans = parseInt(e.target.option.value, 10);
        userAnswers[current] = ans;
        showAnswer(q, ans);
    };
}

function showAnswer(q, ans) {
    const exp = document.getElementById('explanation');
    const isCorrect = ans === q.answer;
    exp.style.display = 'block';
    exp.innerHTML = isCorrect
        ? "✔️ 答對了！<br>" + q.explanation
        : `<span class="wrong">❌ 答錯了！</span><br>正確答案：${q.options[q.answer]}<br>${q.explanation}`;

    if (current < quiz.length - 1) {
        if (!document.getElementById('next-btn')) {
            let btn = document.createElement('button');
            btn.id = 'next-btn';
            btn.innerText = '下一題';
            btn.onclick = () => {
                current++;
                renderQuestion();
            };
            exp.parentElement.appendChild(btn);
        }
    } else {
        if (!document.getElementById('finish-btn')) {
            let btn = document.createElement('button');
            btn.id = 'finish-btn';
            btn.innerText = '看成績';
            btn.onclick = showResult;
            exp.parentElement.appendChild(btn);
        }
    }
}

function showResult() {
    document.getElementById('quiz-container').style.display = 'none';
    const result = document.getElementById('result-container');
    let score = 0;
    let wrongList = [];
    for (let i = 0; i < quiz.length; i++) {
        if (userAnswers[i] === quiz[i].answer) score++;
        else wrongList.push({ q: quiz[i], ans: userAnswers[i] });
    }
    result.style.display = 'block';
    result.innerHTML = `
        <div class="score">你的分數：${score} / ${quiz.length}</div>
        ${wrongList.length > 0 ? `
            <div class="wrong-list">
                <strong>你答錯的題目：</strong>
                <ol>
                ${wrongList.map(w => `
                    <li>
                        <div class="question">${w.q.question}</div>
                        <div>你的答案：${w.ans !== undefined ? w.q.options[w.ans] : "(未作答)"}</div>
                        <div>正確答案：${w.q.options[w.q.answer]}</div>
                        <div>說明：${w.q.explanation}</div>
                    </li>
                `).join('')}
                </ol>
            </div>
        ` : `<div>全部答對，太厲害了！</div>`}
    `;
}

window.onload = loadQuestions;
