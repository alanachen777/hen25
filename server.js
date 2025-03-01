const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/generate-caption", async (req, res) => {
  try {
    const prompt = "Describe this image:";
    const image = {
      inlineData: {
        data: fs.readFileSync("path/to/your/image.png").toString("base64"),
        mimeType: "image/png",
      },
    };

    const result = await model.generateContent([prompt, image]);
    res.json({ caption: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
