const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors(
  {
    origin: '*'
  }
));
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

// Define the API key
const apiKey = 'AIzaSyCg7hc8VUxE8s1F8CVLeU_2i_s2B4RM1cc';

// Initialize the GoogleGenerativeAI object with the API key
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


app.post("/moody", upload.single("image"), async (req, res) => {
  return res.json({ caption: "This is a moody image" });
})


app.post('/generate-caption', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    console.log(`File uploaded to: ${imagePath}`); // Log the file path

    const image = {
      inlineData: {
        data: fs.readFileSync(imagePath).toString('base64'),
        mimeType: req.file.mimetype,
      },
    };

    const result = await model.generateContent(['Describe this image:', image]);
    
    // Optionally, delete the uploaded file after processing
    fs.unlinkSync(imagePath);
    return res.json({ caption: result.response.text() });
  } catch (error) {
    console.error('Error generating caption:', error);
    return res.status(500).json({ error: error.message });
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

// Handle other routes or serve static files if needed
app.get('/', (req, res) => {
  res.send('Welcome to the Image Caption Generator API');
});

app.use((req, res) => {
  res.status(404).send('Route not found');
});
