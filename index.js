// --- Functions under Test (Copied from csv_converter.js for self-containment) ---

// Helper function to robustly parse CSV into a 2D array of strings.
function parseCsv(csv) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    
    // Append a newline to ensure the final field and row are processed by the loop
    const data = csv.trim() + '\n';

    for (let i = 0; i < data.length; i++) {
        const char = data[i];

        if (inQuotes) {
            // Logic when inside a quoted field
            if (char === '"') {
                // Check for escaped quote: "" -> "
                if (data[i + 1] === '"') {
                    currentField += '"';
                    i++; // Consume the second quote
                } else {
                    // Closing double quote found
                    inQuotes = false;
                }
            } else {
                // Inside quotes, append any character (including delimiters or newlines)
                currentField += char;
            }
        } else {
            // Logic when not inside a quoted field
            if (char === '"') {
                // Starting double quote. Clear leading whitespace if present.
                currentField = ''; 
                inQuotes = true;
            } else if (char === ',') {
                // Delimiter found: end of field
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (char === '\n' || char === '\r') {
                // Line break found: end of row
                if (char === '\r' && data[i + 1] === '\n') {
                    i++; // Consume CRLF if Windows format
                }

                // Push the last field of the row
                currentRow.push(currentField.trim());
                
                // Only push the row if it contains data
                if (currentRow.some(cell => cell.length > 0)) {
                    rows.push(currentRow);
                }
                
                currentRow = [];
                currentField = '';
            } else {
                // Regular character
                currentField += char;
            }
        }
    }

    return rows;
}

// Function to convert a 2D array (from parseCsv) into a JSON array of objects
function csvToJson(csv, hasHeaders = true) {
    if (!csv) {
        return [];
    }
    
    // Use the robust parser
    const values = parseCsv(csv);

    if (values.length === 0) {
        return [];
    }

    let headers;
    let dataRows;

    // 1. Determine headers and data rows based on the 'hasHeaders' flag.
    if (hasHeaders) {
        // The first row is the header row.
        headers = values[0];
        dataRows = values.slice(1);
    } else {
        // No headers provided. Generate generic column names (col1, col2, etc.).
        const columnCount = values[0].length;
        headers = Array.from({ length: columnCount }, (_, i) => `col${i + 1}`);
        dataRows = values;
    }

    // 2. Convert each data row into an object.
    const result = [];
    for (const row of dataRows) {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
            // Assign the value to the corresponding header key.
            // Use null if the value is missing.
            obj[headers[i]] = row[i] !== undefined ? row[i] : null;
        }
        result.push(obj);
    }

    return result;
}

// Function to convert a JSON array of objects back into a CSV string
function jsonToCsv(data, headers) {
    if (!data || data.length === 0) {
        return '';
    }

    // 1. Determine Headers: Use provided headers or extract them from the first object
    const finalHeaders = headers || Object.keys(data[0]);

    // Helper function to format a single cell value for CSV (quoting and escaping)
    const formatCell = (value) => {
        // Coerce value to string, using empty string for null/undefined
        let str = (value === null || value === undefined) ? '' : String(value);

        // Check if quoting is required: contains comma, double quote, or newline
        const needsQuotes = str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r');

        if (needsQuotes) {
            // Escape double quotes by doubling them up (" -> "")
            str = str.replace(/"/g, '""');
            // Enclose the entire field in double quotes
            return `"${str}"`;
        }

        return str;
    };

    // 2. Generate Header Row
    const headerRow = finalHeaders.map(h => formatCell(h)).join(',');

    // 3. Generate Data Rows
    const dataRows = data.map(obj => {
        return finalHeaders.map(header => {
            // Use property value or empty string if property is missing
            const value = obj[header];
            return formatCell(value);
        }).join(',');
    });

    // 4. Combine all parts with newline separators
    return [headerRow, ...dataRows].join('\n');
}

module.exports = {
    parseCsv,
    csvToJson,
    jsonToCsv
}
