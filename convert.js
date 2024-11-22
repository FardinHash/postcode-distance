const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const inputFilePath = path.join(__dirname, "data", "postcode-lat-long.xlsx");
const outputFilePath = path.join(__dirname, "data", "postcode-lat-long.json");

const workbook = xlsx.readFile(inputFilePath);

const sheetName = workbook.SheetNames[0];
const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

fs.writeFileSync(outputFilePath, JSON.stringify(sheetData, null, 2), "utf-8");

console.log(`Converted Excel file to JSON: ${outputFilePath}`);
