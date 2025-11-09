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

