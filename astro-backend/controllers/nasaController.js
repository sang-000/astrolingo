require("dotenv").config(); // ensures env variables are loaded
const axios = require("axios");

const NASA_API_KEY = process.env.NASA_API_KEY;
console.log("🔑 NASA_API_KEY (from nasaController.js):", NASA_API_KEY);

const getApod = async (req, res) => {
  try {
    if (!NASA_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "NASA API key is missing in backend",
      });
    }

    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
    );

    res.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("❌ Error fetching APOD:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch APOD",
    });
  }
};

module.exports = { getApod };
