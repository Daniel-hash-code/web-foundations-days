const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const themeToggle = document.querySelector("#theme-toggle");
const clearBtn = document.querySelector("#clear-btn");

const DRAFT_KEY = "quicknotes-draft";
const THEME_KEY = "quicknotes-theme";

function updateCounts() {
    const text = noteText.value;
    const characters = text.length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

    charCount.textContent = `${characters} / 200 characters`;
    wordCount.textContent = `${words} words`;

    charCount.classList.remove("warning", "over");

    if (characters > 200) {
        charCount.classList.add("over");
    }else if (characters > 180) {
        charCount.classList.add("warning");
    }
}

noteText.addEventListener("input", () => {
    updateCounts();
    localStorage.setItem(DRAFT_KEY, noteText.value);
});

const savedDraft = localStorage.getItem(DRAFT_KEY);

if (savedDraft !== null) {
    noteText.value = savedDraft;
}

updateCounts();