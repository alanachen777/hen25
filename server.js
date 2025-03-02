const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the "uploads" directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save files with a timestamp
  },
});
const upload = multer({ storage: storage });

const genAI = new GoogleGenerativeAI('YAIzaSyAE4ysuEWYcgXtoWhJEqsPCJDy_93ua9Vg');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

app.post('/generate-caption', upload.single('image'), async (req, res) => {
  try {
    const prompt = 'Describe this image:';
    const imagePath = req.file.path; // Get the path of the uploaded file

    // Check if the file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'File not found: ' + imagePath });
    }

    const image = {
      inlineData: {
        data: fs.readFileSync(imagePath).toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent([prompt, image]);
    res.json({ caption: result.response.text() });

    // Optionally, delete the uploaded file after processing
    fs.unlinkSync(imagePath);
  } catch (error) {
    console.error('Error generating caption:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create the uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// This code sets up an Express server with endpoints for uploading images and generating captions using Google Generative AI.
// It includes the caption generation functionality in the `/generate-caption` endpoint.
