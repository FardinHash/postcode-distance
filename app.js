const express = require("express");
const xlsx = require("xlsx");
const path = require("path");

const app = express();

const filePath = path.join(__dirname, "data", "postcode-lat-long.xlsx");
const workbook = xlsx.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

data.forEach((row) => {
  row.lat = parseFloat(row.lat);
  row.long = parseFloat(row.long);
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function postcodesWithinRadius(postcode, radius) {
  const start = data.find((row) => row.pcd === postcode);
  if (!start) {
    return { error: `Postcode ${postcode} not found in the dataset.` };
  }

  const { lat: lat1, long: lon1 } = start;
  const results = data
    .map((row) => ({
      postcode: row.pcd,
      distance: calculateDistance(lat1, lon1, row.lat, row.long),
    }))
    .filter((row) => row.distance <= radius);

  return results;
}

app.get("/find-postcodes", (req, res) => {
  const { postcode, radius } = req.query;

  if (!postcode || !radius) {
    return res
      .status(400)
      .json({ error: "Please provide 'postcode' and 'radius' parameters." });
  }

  const numericRadius = parseFloat(radius);
  if (isNaN(numericRadius)) {
    return res.status(400).json({ error: "'radius' must be a numeric value." });
  }

  const result = postcodesWithinRadius(postcode, numericRadius);
  res.json(result);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
