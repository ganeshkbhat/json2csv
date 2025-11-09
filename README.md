# json2csv
package from json to csv and csv to json


```
const { parseCsv,
    csvToJson,
    jsonToCsv } = require("../index.js")

const simpleJson = [
    { id: 1, first: 'John', last: 'Doe' },
    { id: 2, first: 'Jane', last: 'Smith' },
];
const csvResult3 = jsonToCsv(simpleJson, specificHeaders, ';');
console.log(csvResult3);

```

```
// --- Example Usage 1: Pipe-separated Data to JSON Conversion ---
const pipeSeparatedData = `
"Name"|"Value"|"Note"
Alice|100|"Item A, for sales"
Bob|200|"Item B| for testing"
"Charlie ""The King"""|300|A simple note
`;

console.log("--- Example 1: Pipe-separated CSV to JSON Conversion ---");
const jsonResult1 = csvToJson(pipeSeparatedData, true, '|');
console.log(JSON.stringify(jsonResult1, null, 2));


// --- Example Usage 2: JSON to Pipe-separated CSV Conversion ---
console.log("\n--- Example 2: JSON back to Pipe-separated CSV Conversion ---");
const csvResult2 = jsonToCsv(jsonResult1, null, '|');
console.log(csvResult2);

```

### parseCsv

*** converts csv to json object

usage for parseCsv: `parseCsv(csv, separator = ',')`
csv is csv read text that can be parsed. seperator can be anything that seperates values like csv


### csvToJson

*** converts csv to json

usage for csvToJson: `csvToJson(csv, hasHeaders = true, separator = ',')`


### jsonToCsv

*** converts json to csv

usage for jsonToCsv:  `jsonToCsv(data, headers, separator = ',')`


### csvToXml

*** converts csv to cml

usage for csvToXml: `csvToXml(csv, separator = ',', rootName = 'root', rowName = 'row')`


### jsonToXml

usage for jsonToXml: `jsonToXml(data, rootName = 'root', rowName = 'row')`

