const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save files with a timestamp
  },
});
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI("AIzaSyCg7hc8VUxE8s1F8CVLeU_2i_s2B4RM1cc");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/generate-caption", upload.single("image"), async (req, res) => {
  try {
    const prompt = "Describe this image:";
    const imagePath = req.file.path;

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "File not found: " + imagePath });
    }

    const image = {
      inlineData: {
        data: fs.readFileSync(imagePath).toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    console.log("File uploaded:", imagePath);
    console.log("MIME Type:", image.inlineData.mimeType);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }, image] }],
    });

    if (!result || !result.response) {
      throw new Error("Invalid API response");
    }

    res.json({ caption: result.response.candidates[0].content.parts[0].text });

    fs.unlinkSync(imagePath); // Optionally delete after processing
  } catch (error) {
    console.error("Error generating caption:", error);
    res.status(500).json({ error: "Failed to generate caption" });
  }
});

// Create the uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
