const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/", (req, res) => {
  const { location, budget, bedrooms } = req.body;

  const basics = JSON.parse(fs.readFileSync(path.join(__dirname, "../data_structure/property_basics.json")));
  const characteristics = JSON.parse(fs.readFileSync(path.join(__dirname, "../data_structure/property_characteristics.json")));
  const images = JSON.parse(fs.readFileSync(path.join(__dirname, "../data_structure/property_images.json")));

  const merged = basics.map((basic) => {
    const char = characteristics.find(c => c.id === basic.id) || {};
    const image = images.find(i => i.id === basic.id) || {};
    return { ...basic, ...char, ...image };
  });

  const filtered = merged.filter(p =>
    (!location || p.location.toLowerCase().includes(location.toLowerCase())) &&
    (!budget || parseInt(p.price) <= parseInt(budget)) &&
    (!bedrooms || parseInt(p.bedrooms) === parseInt(bedrooms))
  );

  res.json(filtered);
});

module.exports = router;
