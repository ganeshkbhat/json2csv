// --- Functions under Test (Copied from csv_converter.js for self-containment) ---
/**
 * @fileoverview Node.js script to convert a CSV-like string (with any separator)
 * into a JSON array of objects and vice-versa, with robust handling for 
 * quoted fields and custom delimiters.
 */

/**
 * Helper function to robustly parse a delimited string into a 2D array of strings,
 * respecting double quotes for fields containing the separator, newlines, or quotes.
 * @param {string} csv The delimited string content.
 * @param {string} separator The field delimiter (e.g., ',', '|', ';'). Defaults to ','.
 * @returns {Array<Array<string>>} A 2D array of parsed field values.
 */
function parseCsv(csv, separator = ',') {
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
                // Inside quotes, append any character (including the separator or newlines)
                currentField += char;
            }
        } else {
            // Logic when not inside a quoted field
            if (char === '"') {
                // Starting double quote. Clear leading whitespace if present.
                currentField = '';
                inQuotes = true;
            } else if (char === separator) {
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

/**
 * Converts a delimited string into a JSON array of objects.
 * @param {string} csv The delimited string content.
 * @param {boolean} hasHeaders If true, the first row is used as headers. Defaults to true.
 * @param {string} separator The field delimiter (e.g., ',', '|', ';'). Defaults to ','.
 * @returns {Array<Object>} The resulting JSON array.
 */
function csvToJson(csv, hasHeaders = true, separator = ',') {
    if (!csv) {
        return [];
    }

    // Use the robust parser with the specified separator
    const values = parseCsv(csv, separator);

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

/**
 * Converts a JSON array of objects back into a delimited string.
 * @param {Array<Object>} data The JSON array of objects.
 * @param {Array<string>} [headers] Optional array of headers to define column order.
 * @param {string} separator The field delimiter (e.g., ',', '|', ';'). Defaults to ','.
 * @returns {string} The resulting delimited string content.
 */
function jsonToCsv(data, headers, separator = ',') {
    if (!data || data.length === 0) {
        return '';
    }

    // 1. Determine Headers: Use provided headers or extract them from the first object
    const finalHeaders = headers || Object.keys(data[0]);

    // Helper function to format a single cell value for CSV (quoting and escaping)
    const formatCell = (value) => {
        // Coerce value to string, using empty string for null/undefined
        let str = (value === null || value === undefined) ? '' : String(value);

        // Check if quoting is required: contains the separator, double quote, or newline
        const needsQuotes = str.includes(separator) || str.includes('"') || str.includes('\n') || str.includes('\r');

        if (needsQuotes) {
            // Escape double quotes by doubling them up (" -> "")
            str = str.replace(/"/g, '""');
            // Enclose the entire field in double quotes
            return `"${str}"`;
        }

        return str;
    };

    // 2. Generate Header Row
    const headerRow = finalHeaders.map(h => formatCell(h)).join(separator);

    // 3. Generate Data Rows
    const dataRows = data.map(obj => {
        return finalHeaders.map(header => {
            // Use property value or empty string if property is missing
            const value = obj[header];
            return formatCell(value);
        }).join(separator);
    });

    // 4. Combine all parts with newline separators
    return [headerRow, ...dataRows].join('\n');
}

/**
 * Helper function to escape special XML characters.
 * @param {string} str The string to escape.
 * @returns {string} The escaped string.
 */
function xmlEscape(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, function (match) {
        switch (match) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case "'":
                return '&apos;';
            default:
                return match;
        }
    });
}

/**
 * Converts a JSON array of objects into an XML string.
 * @param {Array<Object>} data The JSON array of objects.
 * @param {string} rootName The name of the root XML element. Defaults to 'root'.
 * @param {string} rowName The name of the element for each object/row. Defaults to 'row'.
 * @returns {string} The resulting XML string.
 */
function jsonToXml(data, rootName = 'root', rowName = 'row') {
    if (!data || data.length === 0) {
        return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}/>`;
    }

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}>\n`;

    data.forEach(item => {
        xml += `  <${rowName}>\n`;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                // Use the key as the element name
                const escapedKey = key.replace(/[^a-zA-Z0-9_]/g, ''); // Simple sanitization
                const escapedValue = xmlEscape(String(item[key] === null ? '' : item[key]));

                // Indent content for readability
                xml += `    <${escapedKey}>${escapedValue}</${escapedKey}>\n`;
            }
        }
        xml += `  </${rowName}>\n`;
    });

    xml += `</${rootName}>`;
    return xml;
}

/**
 * Converts a delimited string (CSV) into an XML string.
 * @param {string} csv The delimited string content.
 * @param {string} separator The field delimiter (e.g., ',', '|', ';'). Defaults to ','.
 * @param {string} rootName The name of the root XML element. Defaults to 'root'.
 * @param {string} rowName The name of the element for each object/row. Defaults to 'row'.
 * @returns {string} The resulting XML string.
 */
function csvToXml(csv, separator = ',', rootName = 'root', rowName = 'row') {
    const jsonData = csvToJson(csv, true, separator);
    return jsonToXml(jsonData, rootName, rowName);
}


module.exports = {
    parseCsv,
    csvToJson,
    jsonToCsv,
    csvToXml,
    jsonToXml,
    xmlEscape
}
