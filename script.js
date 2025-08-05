document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const setupScreen = document.getElementById('setup-screen');
    const testScreen = document.getElementById('test-screen');
    const resultsScreen = document.getElementById('results-screen');
	

    const numQuestionsInput = document.getElementById('num-questions');
    const numChoicesInput = document.getElementById('num-choices');
    const startTestBtn = document.getElementById('start-test-btn');

    const questionsContainer = document.getElementById('questions-container');
    const submitTestBtn = document.getElementById('submit-test-btn');

    const confidenceScoreSpan = document.getElementById('confidence-score-percent');
    const finalScoreSpan = document.getElementById('final-score-percent');
	const cockinessIndexSpan = document.getElementById('cockiness-index-percent');
    const resultsContainer = document.getElementById('results-container');
    const calculateScoreBtn = document.getElementById('calculate-score-btn');
    const resetBtn = document.getElementById('reset-btn'); // NEW: Reset button element

    // --- App State ---
    let testData = [];
    let totalQuestions = 0;

    // --- Functions ---
    const generateLetter = (index) => String.fromCharCode(65 + index);

    // --- Event Listeners ---

    // 1. Start the Test
    startTestBtn.addEventListener('click', () => {
        totalQuestions = parseInt(numQuestionsInput.value, 10);
        const numChoices = parseInt(numChoicesInput.value, 10);

        if (totalQuestions > 0 && numChoices > 1) {
            createTest(totalQuestions, numChoices);
            setupScreen.classList.add('hidden');
            testScreen.classList.remove('hidden');
        } else {
            alert('Please enter a valid number of questions and choices.');
        }
    });

    // 2. Submit the Test for Grading
    submitTestBtn.addEventListener('click', () => {
        saveAnswers();
        displayResults();
        testScreen.classList.add('hidden');
        resultsScreen.classList.remove('hidden');
    });

    // 3. Calculate Final Score
    calculateScoreBtn.addEventListener('click', () => {
        calculateFinalScore();
        resetBtn.classList.remove('hidden'); // CHANGED: Show reset button
    });
    
    // NEW: 4. Reset the application
    resetBtn.addEventListener('click', () => {
        resetApp();
    });

    // --- Core Logic ---

    function createTest(questions, choices) {
        questionsContainer.innerHTML = '';
        for (let i = 1; i <= questions; i++) {
            let choicesHTML = '';
            for (let j = 0; j < choices; j++) {
                const letter = generateLetter(j);
                choicesHTML += `
                    <label>
                        <input type="checkbox" name="q${i}" value="${letter}">
                        ${letter}
                    </label>
                `;
            }

            const questionHTML = `
                <div class="question-row" id="question-${i}">
                    <span class="question-number">${i}.</span>
                    <div class="choices">${choicesHTML}</div>
                    <div class="confidence-check">
                        <input type="checkbox" class="confidence-box">
                        <span class="confident-text"></span>
                    </div>
                </div>
            `;
            questionsContainer.insertAdjacentHTML('beforeend', questionHTML);
        }

        document.querySelectorAll('.confidence-box').forEach(box => {
            box.addEventListener('change', (e) => {
                const textSpan = e.target.nextElementSibling;
                textSpan.textContent = e.target.checked ? 'CONFIDENT' : '';
            });
        });
    }

    function saveAnswers() {
        testData = [];
        for (let i = 1; i <= totalQuestions; i++) {
            const questionRow = document.getElementById(`question-${i}`);
            const selectedChoices = [];
            questionRow.querySelectorAll('input[type="checkbox"]:not(.confidence-box):checked').forEach(c => {
                selectedChoices.push(c.value);
            });

            const isConfident = questionRow.querySelector('.confidence-box').checked;

            testData.push({
                question: i,
                selected: selectedChoices,
                isConfident: isConfident
            });
        }
    }

    function displayResults() {
        resultsContainer.innerHTML = '';

        const confidentCount = testData.filter(d => d.isConfident).length;
        const confidencePercent = totalQuestions > 0 ? ((confidentCount / totalQuestions) * 100).toFixed(0) : 0;
        confidenceScoreSpan.textContent = confidencePercent;

        const numChoices = parseInt(numChoicesInput.value, 10);

        testData.forEach(data => {
            let correctAnswerChoicesHTML = '';
            for (let j = 0; j < numChoices; j++) {
                const letter = generateLetter(j);
                correctAnswerChoicesHTML += `
                    <label>
                        <input type="radio" name="correct-q${data.question}" value="${letter}">
                        ${letter}
                    </label>
                `;
            }

            const resultHTML = `
                <div class="question-row">
                    <span class="question-number">${data.question}.</span>
                    <div class="user-answers">Your Answer(s): ${data.selected.join(', ') || 'None'}</div>
                    <div class="correct-answer-choices">${correctAnswerChoicesHTML}</div>
                    <div class="confidence-check">
                        ${data.isConfident ? '<span class="confident-text">CONFIDENT</span>' : ''}
                    </div>
                </div>
            `;
            resultsContainer.insertAdjacentHTML('beforeend', resultHTML);
        });
    }

// Replace your old function with this new one
function calculateFinalScore() {
    let correctCount = 0;
    // NEW: Counters for the Cockiness Index
    let confidentAndWrong = 0;
    let totalConfident = 0;

    for (let i = 1; i <= totalQuestions; i++) {
        const questionData = testData[i - 1];
        const correctAnswerInput = document.querySelector(`input[name="correct-q${i}"]:checked`);
        
        // NEW: Check if this question was marked confident
        if (questionData.isConfident) {
            totalConfident++;
        }

        if (correctAnswerInput) {
            const correctAnswer = correctAnswerInput.value;
            const userAnswers = questionData.selected;
            
            if (userAnswers.includes(correctAnswer)) {
                correctCount++;
            } else {
                // NEW: If the answer is wrong, check if it was marked confident
                if (questionData.isConfident) {
                    confidentAndWrong++;
                }
            }
        } else {
            // NEW: An unanswered question is also wrong. Check for confidence.
             if (questionData.isConfident) {
                confidentAndWrong++;
            }
        }
    }
    
    // Calculate and display Final Score
    const finalScorePercent = totalQuestions > 0 ? ((correctCount / totalQuestions) * 100).toFixed(0) : 0;
    finalScoreSpan.textContent = finalScorePercent;

    // NEW: Calculate and display Cockiness Index
    let cockinessIndex = 0;
    if (totalConfident > 0) {
        cockinessIndex = ((confidentAndWrong / totalConfident) * 100).toFixed(0);
    }
    cockinessIndexSpan.textContent = cockinessIndex;
}
    
    // NEW: Function to reset the entire application state
    // Replace your old function with this new one
function resetApp() {
    testData = [];
    totalQuestions = 0;

    // Reset displays
    finalScoreSpan.textContent = '--';
    confidenceScoreSpan.textContent = '--';
    cockinessIndexSpan.textContent = '--'; // NEW: Reset the Cockiness Index display
    
    // Reset screens
    resultsScreen.classList.add('hidden');
    resetBtn.classList.add('hidden');
    setupScreen.classList.remove('hidden');

    // Reset initial inputs to default values
    numQuestionsInput.value = '10';
    numChoicesInput.value = '4';
}
});