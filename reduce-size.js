const fs = require("fs");
const path = require("path");

const inputFilePath = path.join(__dirname, "data", "postcode-lat-long.json");
const outputFilePath = path.join(
  __dirname,
  "data",
  "postcode-lat-long-min.json"
);

fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  try {
    const jsonData = JSON.parse(data);
    const minifiedData = JSON.stringify(jsonData);

    fs.writeFile(outputFilePath, minifiedData, "utf8", (err) => {
      if (err) {
        console.error("Error writing the minified file:", err);
        return;
      }
      console.log(`Minified JSON file created at: ${outputFilePath}`);
    });
  } catch (parseErr) {
    console.error("Error parsing the JSON file:", parseErr);
  }
});
