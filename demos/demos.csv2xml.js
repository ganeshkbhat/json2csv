const { parseCsv,
    csvToJson,
    jsonToCsv, csvToXml } = require("../index.js")


// --- Example Usage 1: Pipe-separated Data to JSON Conversion ---
const pipeSeparatedData = `
"Name"|"Value"|"Note"
Alice|100|"Item A, for sales"
Bob|200|"Item B| for testing"
"Charlie ""The King"""|300|A simple note
`;

console.log("--- Example 1: Pipe-separated CSV to XML Conversion ---");
// Note the use of the '|' separator here
const xmlResult1 = csvToXml(pipeSeparatedData, '|', 'Inventory', 'Item');
console.log(xmlResult1);
