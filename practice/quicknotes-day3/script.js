//1. Variables
const appName = "QuickNotes";
let noteCount = 2;

console.log(appName);
console.log(noteCount);

// let can be changed
noteCount = 3;
console.log(noteCount);


// 2. Strings
const firstNote = "Revise HTML forms";

console.log(firstNote);
console.log(firstNote.length);
console.log(firstNote.toUpperCase());
console.log(firstNote.toLowerCase());


// Template literals
console.log(`${appName} currently has ${noteCount} notes.`);


// 3. Numbers and arithmetic
const completed = 2;

console.log(noteCount + completed);
console.log(noteCount - completed);
console.log(noteCount * completed);
console.log(noteCount / completed);
console.log(noteCount % completed);


// 4. Booleans
const hasNotes = true;
const isEmpty = false;

console.log(hasNotes);
console.log(isEmpty);


// 5. Comparisons
console.log(noteCount > 0);
console.log(noteCount === 3);
console.log(noteCount === 5);
console.log(noteCount !== 5);


// 6. if / else
if (noteCount > 0) {
    console.log("You have notes.");
} else {
    console.log("You have no notes yet.");
}


// 7. if / else if / else
if (noteCount === 0) {
    console.log("You have no notes yet.");
} else if (noteCount === 1) {
    console.log("You have 1 note.");
} else {
    console.log(`You have ${noteCount} notes.`);
}


// 8. Arrays
const simpleNotes = [
    "Revise HTML forms",
    "Practise Flexbox",
    "Push code to GitHub"
];

console.log(simpleNotes);
console.log(simpleNotes[0]);
console.log(simpleNotes[1]);
console.log(simpleNotes[2]);
console.log(simpleNotes.length);


// Add an item
simpleNotes.push("Learn JavaScript");

console.log(simpleNotes);


// Remove the last item
simpleNotes.pop();

console.log(simpleNotes);


// Check whether an item exists
console.log(simpleNotes.includes("Practise Flexbox"));
console.log(simpleNotes.includes("Learn Python"));


// 9. Objects
const note = {
    id: 1,
    text: "Revise HTML forms",
    done: false
};

console.log(note);
console.log(note.id);
console.log(note.text);
console.log(note.done);


// Changing an object property
note.done = true;

console.log(note.done);


// 10. Array of objects
const notes = [
    {
        id: 1,
        text: "Revise HTML forms",
        done: false
    },
    {
        id: 2,
        text: "Practise Flexbox",
        done: true
    },
    {
        id: 3,
        text: "Push code to GitHub",
        done: false
    }
];

console.log(notes);


// Accessing properties inside array objects
console.log(notes[0].text);
console.log(notes[1].text);
console.log(notes[2].done);


// 11. for loop
for (let i = 0; i < notes.length; i++) {
    console.log(notes[i].text);
}


// 12. for...of loop
for (const note of notes) {
    console.log(note.text);
}


// 13. forEach()
notes.forEach((note) => {
    console.log(`${note.text} — completed: ${note.done}`);
});


// 14. filter()
const incompleteNotes = notes.filter((note) => {
    return note.done === false;
});

console.log(incompleteNotes);


// 15. find()
const foundNote = notes.find((note) => {
    return note.id === 2;
});

console.log(foundNote);

// 16. Functions    
function showMessage() {
    console.log("Welcome to QuickNotes!");
}

showMessage();


// 17. Function parameters
function showNote(text) {
    console.log(`Note: ${text}`);
}

showNote("Revise HTML forms");
showNote("Push code to GitHub");


// 18. return
function add(a, b) {
    return a + b;
}

const result = add(5, 3);

console.log(result);


console.log("Day 3 practice complete!");