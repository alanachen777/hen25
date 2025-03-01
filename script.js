const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function generateCaption() {
  const prompt = "Describe this image:";
  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync("path/to/your/image.png")).toString("base64"),
      mimeType: "image/png",
    },
  };
  const result = await model.generateContent([prompt, image]);
  console.log(result.response.text());
}

generateCaption();