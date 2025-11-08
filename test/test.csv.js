const { expect } = require('chai');
// const sinon = require('sinon'); // Not strictly needed for this functional logic
const { parseCsv,
    csvToJson,
    jsonToCsv } = require("../index.js")
// --- Test Suite using Mocha and Chai ---

describe('CSV Parser and Converter', () => {

    // --- Tests for parseCsv (The robust parser) ---
    describe('parseCsv', () => {
        it('should handle basic comma separation and trim whitespace', () => {
            const csv = '  Header1,Header2 \n value1, value2  ';
            const expected = [
                ['Header1', 'Header2'],
                ['value1', 'value2']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
        });

        it('should handle quoted fields with embedded commas', () => {
            const csv = 'Name,"Address, City",Email\n"John Doe","123 Main St, Anytown",john@example.com';
            const expected = [
                ['Name', 'Address, City', 'Email'],
                ['John Doe', '123 Main St, Anytown', 'john@example.com']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
        });

        it('should handle quoted fields with embedded newlines (multiline data)', () => {
            const csv = 'ID,Description\n101,"This is a long description\nthat spans multiple lines."\n102,Simple';
            const expected = [
                ['ID', 'Description'],
                ['101', 'This is a long description\nthat spans multiple lines.'],
                ['102', 'Simple']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
        });

        it('should handle escaped double quotes ("" -> ") inside a quoted field', () => {
            const csv = 'Key,Value\n"Title","Item ""A"" with quotes"\n"Note","This is not a ""quoted"" word"';
            const expected = [
                ['Key', 'Value'],
                ['Title', 'Item "A" with quotes'],
                ['Note', 'This is not a "quoted" word']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
        });

        it('should handle empty fields and empty input', () => {
            const csv = 'A,B,C\n1,,3\n4,5,';
            const expected = [
                ['A', 'B', 'C'],
                ['1', '', '3'],
                ['4', '5', '']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
            expect(parseCsv('')).to.deep.equal([]);
        });

        it('should handle Windows (CRLF) and Unix (LF) line endings', () => {
            const csv = 'R1F1,R1F2\r\nR2F1,R2F2\nR3F1,R3F2';
            const expected = [
                ['R1F1', 'R1F2'],
                ['R2F1', 'R2F2'],
                ['R3F1', 'R3F2']
            ];
            expect(parseCsv(csv)).to.deep.equal(expected);
        });
    });

    // --- Tests for csvToJson (The final converter) ---
    describe('csvToJson', () => {
        const complexCsv = 'Name,"Value, Metric",Status\nAlice,"1,000","Active"\nBob,"500",Inactive';

        it('should convert CSV with headers correctly', () => {
            const expected = [
                { Name: 'Alice', 'Value, Metric': '1,000', Status: 'Active' },
                { Name: 'Bob', 'Value, Metric': '500', Status: 'Inactive' }
            ];
            expect(csvToJson(complexCsv, true)).to.deep.equal(expected);
        });

        it('should convert CSV without headers using generic column names', () => {
            const csv = '1,2,3\nA,B,C';
            const expected = [
                { col1: '1', col2: '2', col3: '3' },
                { col1: 'A', col2: 'B', col3: 'C' }
            ];
            expect(csvToJson(csv, false)).to.deep.equal(expected);
        });

        it('should handle rows that are shorter than the headers by using null', () => {
            const csv = 'ColA,ColB,ColC\nData1,Data2\nData3';
            const expected = [
                { ColA: 'Data1', ColB: 'Data2', ColC: null },
                { ColA: 'Data3', ColB: null, ColC: null }
            ];
            expect(csvToJson(csv, true)).to.deep.equal(expected);
        });

        it('should return an empty array for empty input', () => {
            expect(csvToJson('', true)).to.deep.equal([]);
            expect(csvToJson(' \n ', false)).to.deep.equal([]);
        });
    });

    // --- Tests for jsonToCsv (The reverse converter) ---
    describe('jsonToCsv', () => {
        const jsonInput = [
            { Name: 'Alice', Age: 30, Description: "New York, a city that never sleeps.\nIt's great!" },
            { Name: 'Bob', Age: 25, Description: 'San Francisco, CA. The weather is cool.' },
            { Name: 'Charlie "The King"', Age: 40, Description: 'A note with a comma, and a "quoted" word' }
        ];

        it('should correctly escape internal quotes (" becomes "") and quote fields containing them', () => {
            const expectedCsv = 'Name,Age,Description\n' +
                'Alice,30,"New York, a city that never sleeps.\nIt\'s great!"\n' +
                'Bob,25,"San Francisco, CA. The weather is cool."\n' +
                '"Charlie ""The King""",40,"A note with a comma, and a ""quoted"" word"';

            expect(jsonToCsv(jsonInput)).to.equal(expectedCsv);
        });

        it('should correctly handle null/undefined values as empty strings', () => {
            const sparseJson = [
                { A: 1, B: 'Value', C: null },
                { A: 2, B: undefined, C: 3 }
            ];
            const expectedCsv = 'A,B,C\n1,Value,\n2,,3';
            expect(jsonToCsv(sparseJson)).to.equal(expectedCsv);
        });

        it('should respect custom headers and order, filling missing data with empty strings', () => {
            const json = [
                { id: 1, name: 'A' },
                { id: 2, name: 'B', extra: 'X' },
            ];
            const headers = ['id', 'extra', 'name', 'missing'];
            const expectedCsv = 'id,extra,name,missing\n' +
                '1,,A,\n' +
                '2,X,B,';
            expect(jsonToCsv(json, headers)).to.equal(expectedCsv);
        });

        it('should return an empty string for empty input array', () => {
            expect(jsonToCsv([])).to.equal('');
            expect(jsonToCsv(null)).to.equal('');
        });
    });
    // --- Fixed Roundtrip Test ---
    // --- Fixed Roundtrip Test ---
    describe('Roundtrip Test: CSV -> JSON -> CSV', () => {
        it('should produce the same CSV string after a roundtrip', () => {
            const originalCsv = 'ID,"Details, with comma","Note with\nnewline and ""quotes"""\n1,Data1,"Test ""one"""\n2,"Data 2, more detail","Another note"';
            
            // 1. CSV to JSON
            const json = csvToJson(originalCsv);
            
            // 2. JSON back to CSV
            const finalCsv = jsonToCsv(json);

            // FIX: The original test expectation incorrectly included quotes around "Another note"
            // which jsonToCsv correctly omits because the field has no special characters.
            const expectedNormalizedCsv = 'ID,"Details, with comma","Note with\nnewline and ""quotes"""\n' +
                                          '1,Data1,"Test ""one"""\n' +
                                          // Corrected last field: "Another note" -> Another note
                                          '2,"Data 2, more detail",Another note';

            expect(finalCsv).to.equal(expectedNormalizedCsv);
        });
    });
});