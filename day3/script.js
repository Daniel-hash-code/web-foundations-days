let notes = [
    { id: 1, text: "Buy milk and bread", category: "personal" },
    { id: 2, text: "Finish the Day 3 assignment", category: "study"},
    { id: 3, text: "Email the project report to Grace", category: "work"},
    { id: 4, text: "Revise Javascript arrays", category: "study"},
    { id: 5, text: "Call mum", category: "personal"}
];

function searchNotes(word) {
    return notes.filter((note) => {
        return note.text.toLowerCase().includes(word);
    });
}

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

console.log(searchNotes("javascript"));
console.log(searchNotes("python"));

console.log(longestNote());

const originalNotes = notes;
notes = [];
console.log(longestNote());
notes = originalNotes;

console.log(countByCategory());

const savedNotes = notes;
notes = [];
console.log(countByCategory());
notes = savedNotes;