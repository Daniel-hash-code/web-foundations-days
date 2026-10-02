let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study"},
    { id: 3, text: "Email the project report to Grace", category: "work"},
    { id: 4, text: "Revise Javascript arrays", category: "study"},
    { id: 5, text: "Call mum", category: "personal"}
];

function searchNotes(word) {
    return notes.filter((note) => {
        return note.text.toLowerCase().includes(word.toLowerCase());
    });
}

console.log(searchNotes("Javascript")); //Expected output: [{id:4, text: "Revise Javascript arrays", category: "study"}]
console.log(searchNotes("python")); //Expected output: []

function longestNote() {
    if (notes.length === 0) {
        return null;
    }

    let longest = notes[0];
    for (const note of notes) {
        if (note.text.length > longest.text.length) {
            longest = note;
        }
    }
    return longest;
}

console.log(longestNote()); //Expected output: {id: 3, text: "Email the project report to Grace", category: "work"}

const originalNotes = notes;
notes = [];
console.log(longestNote()); //Expected output: null
notes = originalNotes;


function countByCategory() {
    const counts = {};

    for (const note of notes) {
        const category = note.category;
        if (counts[category]) {
            counts[category]++;
        } else {
            counts[category] = 1;
        }
    }
    return counts;
}

console.log(countByCategory()); //Expected output: {personal: 2, work: 1, study: 2}

const savedNotes = notes;
notes = [];
console.log(countByCategory()); //Expected output: {}
notes = savedNotes;

function getSummary() {
    const counts = countByCategory();
    const word = notes.length === 1 ? "note" : "notes";
    
    return `${notes.length} ${word}: ${counts.personal || 0} personal, ${counts.work || 0} work, ${counts.study || 0} study.`;
}

console.log(getSummary()); //Expected output: 5 notes: 2 personal, 1 work, 2 study.

const summaryNotes = notes;
notes = [
    {id: 99, text: "Test note", category: "personal"}
];
console.log(getSummary()); //Expected output: 1 note: 1 personal, 0 work, 0 study.
notes = summaryNotes;

function isDuplicate(text) {
    const cleanedText = text.trim().toLowerCase();

    return notes.some((note) => {
        return note.text.trim().toLowerCase() === cleanedText;
    });
}

console.log(isDuplicate("Buy milk and bread")); //Expected output: true
console.log(isDuplicate("buy milk and bread")); //Expected output: true
console.log(isDuplicate("  Buy Milk and Bread  ")); //Expected output: true
console.log(isDuplicate("Walk the dog")); //Expected output: false

function addNote(text, category) {
    const cleanedText = text.trim();

    if (cleanedText.length < 1 || cleanedText.length > 200) {
        console.log("Note rejected because text must be between 1-200 characters.");
        return false;
    }

    if (isDuplicate(cleanedText)) {
        console.log("Note rejected because duplicate already exists.");
        return false;
    }

    const validCategories = ["personal", "work", "study"];
    if (!validCategories.includes(category)) {
        console.log(`Note rejected: "${category}" is not a valid category.`);
        return false;
    }

    const maxId = Math.max(...notes.map((note) => note.id),0);

    const newNote = { 
        id: maxId + 1,
        text: cleanedText,
        category: category
    };
    notes.push(newNote);
    
    console.log("Note added successfully!");
    return true;
}

console.log(addNote("Buy milk and bread", "personal")); //Note rejected because duplicate already exists.
                                                        // false
console.log(addNote("", "work")); //Note rejected because text must be between 1-200 characters.
                                  // false
console.log(addNote("  BUY MILK AND BREAD", "personal")); //Note rejected because duplicate already exists.
                                                        // false
console.log(addNote("Go for a walk", "other")); //Note rejected: "other" is not a valid category.
                                                  // false
console.log(addNote("Learn JavaScript functions", "study")); //Note added successfully!
                                                            // true

console.log("Day 3 practice complete!");