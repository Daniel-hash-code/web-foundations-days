// 1. Select the elements we need
const form = document.querySelector("#note-form");
const noteInput = document.querySelector("#note-input");
const notesList = document.querySelector("#notes-list");
const noteCount = document.querySelector("#note-count");

const STORAGE_KEY = "quicknotes";

// 2. Load saved notes (or start empty)
let notes = loadNotes();

function loadNotes() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
}

function saveNotes() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// 3. Draw the notes on the page
function render() {
    notesList.innerHTML = "";
    
    notes.forEach((note) => {
        const li = document.createElement("li");
        li.classList.add("note");

        const text = document.createElement("span");
        text.textContent = note.text;

        const del = document.createElement("button");
        del.textContent = "Delete";
        del.classList.add("delete-btn");
        del.addEventListener("click", () => deleteNote(note.id));

        li.appendChild(text);
        li.appendChild(del);
        notesList.appendChild(li);
    });

    noteCount.textContent =
        notes.length === 1
            ? "You have 1 note."
            : `You have ${notes.length} notes.`;
}

// 4. Add and delete
function addNote(text) {
    notes.push({ id: Date.now(), text: text });
    saveNotes();
    render();
}

function deleteNote(id) {
    notes = notes.filter((note) => note.id !== id);
    saveNotes();
    render();
}

// 5. Listen for the form submit event
form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = noteInput.value.trim();
    if (text === "") return;
    addNote(text);
    noteInput.value = "";
    noteInput.focus();
});

// 6. Draw once when the page first loads
render();