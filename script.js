
let words = [];
let secretWord = "";
let guessedLetters = [];
let attempts = 0;
let hints = 0;
let gameOver = true;

const guessInput = document.getElementById("guess");

const attemptsDisplay = document.getElementById("attempts");
const hintsDisplay = document.getElementById("hints");
const possibleDisplay = document.getElementById("possible");
const wordDisplay = document.getElementById("word");
const message = document.getElementById("message");

const guessButton = document.getElementById("guessButton");
const hintButton = document.getElementById("hintButton");
const restartButton = document.getElementById("restartButton");


// LOAD WORDS FROM TEXT FILE

async function loadWords() {
    try {
        const response = await fetch("words.txt");

        if (!response.ok) {
            throw new Error("Could not load words.txt");
        }

        const text = await response.text();

        words = [...new Set(
            text.split(/\r?\n/)
                .map(word => word.trim().toLowerCase())
                .filter(word => /^[a-z]+$/.test(word))
        )];

        if (words.length === 0) {
            throw new Error("No valid words found!");
        }

        startGame();

    } catch (error) {
        message.textContent =
            "Could not load words.txt. Open using Live Server!";
        console.error(error);
    }
}

loadWords();

// START A NEW GAME

function startGame() {

    if (words.length === 0) {
        message.textContent = "Please select words.txt first!";
        return;
    }

    secretWord = words[Math.floor(Math.random() * words.length)];

    guessedLetters = [];
    gameOver = false;

    if (secretWord.length <= 5) {
        attempts = 7;
        hints = 1;
    }
    else if (secretWord.length <= 8) {
        attempts = 10;
        hints = 2;
    }
    else {
        attempts = 12;
        hints = 3;
    }

    guessInput.disabled = false;
    guessButton.disabled = false;
    hintButton.disabled = false;
    restartButton.disabled = false;

    message.textContent = "Enter a letter to begin!";

    updateGame();
}


// UPDATE THE GAME DISPLAY

function updateGame() {

    let display = "";

    for (let letter of secretWord) {

        if (guessedLetters.includes(letter)) {
            display += letter + " ";
        } else {
            display += "_ ";
        }
    }

    wordDisplay.textContent = display.trim();

    attemptsDisplay.textContent = attempts;
    hintsDisplay.textContent = hints;

    // Find words matching the currently revealed pattern

    let possibleWords = words.filter(word => {

        if (word.length !== secretWord.length) {
            return false;
        }

        for (let i = 0; i < secretWord.length; i++) {

            if (guessedLetters.includes(secretWord[i])) {

                if (word[i] !== secretWord[i]) {
                    return false;
                }

            } else {

                if (guessedLetters.includes(word[i])) {
                    return false;
                }

            }
        }

        return true;
    });

    possibleDisplay.textContent = possibleWords.length;
}


// CHECK A GUESS

function checkGuess() {

    if (gameOver) return;

    let guess = guessInput.value.toLowerCase().trim();

    guessInput.value = "";

    if (!guess) {
        message.textContent = "Please enter something!";
        return;
    }

    if (!/^[a-z]+$/.test(guess)) {
        message.textContent = "Enter letters only!";
        return;
    }

    // SINGLE LETTER GUESS

    if (guess.length === 1) {

        if (guessedLetters.includes(guess)) {
            message.textContent = "You already guessed that letter!";
            return;
        }

        guessedLetters.push(guess);

        if (secretWord.includes(guess)) {
            message.textContent = "Correct guess!";
        } else {
            attempts--;
            message.textContent = "Wrong guess!";
        }

    }

    // WHOLE WORD GUESS

    // WHOLE WORD GUESS

else {

    let possibleWords = words.filter(word => {

        if (word.length !== secretWord.length) {
            return false;
        }

        for (let i = 0; i < secretWord.length; i++) {

            if (guessedLetters.includes(secretWord[i])) {

                if (word[i] !== secretWord[i]) {
                    return false;
                }

            } else {

                if (guessedLetters.includes(word[i])) {
                    return false;
                }

            }
        }

        return true;
    });

    if (possibleWords.includes(guess)) {

        secretWord = guess;
        guessedLetters = [...new Set(secretWord)];

        updateGame();
        endGame(true);
        return;

    } else {

        attempts--;
        message.textContent = "Wrong word!";

    }
}

    updateGame();

    checkGameStatus();
}


// CHECK WIN OR LOSS

function checkGameStatus() {

    const won = [...secretWord].every(letter =>
        guessedLetters.includes(letter)
    );

    if (won) {
        endGame(true);
    }
    else if (attempts <= 0) {
        endGame(false);
    }
}


// USE A HINT

function useHint() {

    if (gameOver) return;

    if (hints <= 0) {
        message.textContent = "No hints remaining!";
        return;
    }

    let hiddenLetters = [...new Set(secretWord)].filter(letter =>
        !guessedLetters.includes(letter)
    );

    if (hiddenLetters.length === 0) return;

    let letter = hiddenLetters[
        Math.floor(Math.random() * hiddenLetters.length)
    ];

    guessedLetters.push(letter);
    hints--;

    message.textContent = "Hint revealed: " + letter.toUpperCase();

    updateGame();

    checkGameStatus();
}


// END THE GAME

function endGame(won) {

    gameOver = true;

    if (won) {

        message.textContent =
            "🎉 You won! The word was " + secretWord.toUpperCase();

    } else {

        message.textContent =
            "Game over! The word was " + secretWord.toUpperCase();

    }

    guessInput.disabled = true;
    guessButton.disabled = true;
    hintButton.disabled = true;
}


// BUTTON EVENTS

guessButton.addEventListener("click", checkGuess);

hintButton.addEventListener("click", useHint);

restartButton.addEventListener("click", startGame);


// ENTER KEY

guessInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        checkGuess();
    }

});


// INITIAL MESSAGE

message.textContent = "loading words.txt... Please wait!";
