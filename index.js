const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

app.use(morgan("common")); // Only for logging
app.use(helmet());
app.use(cors());

app.get("/", async (req, res) => {
  try {
    const url = "https://www.wildberries.ru/catalog/146972802/detail.aspx";

    const response = await axios.get(url);
    const htmlContent = response.data;

    // Load the HTML content into Cheerio
    const $ = cheerio.load(htmlContent);

    // Get all the stapled cards in the slider
    const stapledCards = $(".swiper-wrapper .swiper-slide");

    // Array to store the results
    const results = [];

    // Loop through each stapled card and extract data
    stapledCards.each((index, element) => {
      const cardUrl = $(element).find(".j-card-item").attr("href");
      const cardRemnantsText = $(element).find(".card-sale").text().trim();

      // Extract remnants value from text (e.g., "Остаток: 5 шт.")
      const remnantsMatch = cardRemnantsText.match(/Остаток: (\d+) шт\./);
      let remnantsCount;
      if (remnantsMatch && remnantsMatch[1]) {
        remnantsCount = parseInt(remnantsMatch[1]);
      }

      results.push({
        url: cardUrl,
        remnants: remnantsCount,
      });
    });

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
