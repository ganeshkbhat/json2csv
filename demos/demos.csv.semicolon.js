const { parseCsv,
    csvToJson,
    jsonToCsv } = require("../index.js")
    
// --- Example Usage 3: JSON to Semicolon-separated CSV with Explicit Headers ---
const simpleJson = [
    { id: 1, first: 'John', last: 'Doe' },
    { id: 2, first: 'Jane', last: 'Smith' },
];

console.log("\n--- Example 3: JSON to Semicolon-separated CSV with Specific Header Order ---");
const specificHeaders = ['id', 'last', 'first', 'extra_col'];
// Note the use of the ';' separator here
const csvResult3 = jsonToCsv(simpleJson, specificHeaders, ';');
console.log(csvResult3);
