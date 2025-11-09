const { parseCsv,
    csvToJson,
    jsonToCsv } = require("../index.js")
// --- Example Usage 1: Pipe-separated Data to JSON Conversion ---
const pipeSeparatedData = `
"Name"|"Value"|"Note"
Alice|100|"Item A, for sales"
Bob|200|"Item B| for testing"
"Charlie ""The King"""|300|A simple note
`;

console.log("--- Example 1: Pipe-separated CSV to JSON Conversion ---");
// Note the use of the '|' separator here
const jsonResult1 = csvToJson(pipeSeparatedData, true, '|');
console.log(JSON.stringify(jsonResult1, null, 2));


// --- Example Usage 2: JSON to Pipe-separated CSV Conversion ---
console.log("\n--- Example 2: JSON back to Pipe-separated CSV Conversion ---");
// Note the use of the '|' separator here
const csvResult2 = jsonToCsv(jsonResult1, null, '|');
console.log(csvResult2);

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
