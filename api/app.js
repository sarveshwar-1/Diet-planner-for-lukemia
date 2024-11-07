const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager } = require('@google/generative-ai/server'); 
const fs = require('fs');

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors()); // Enable CORS for all routes

app.use(express.json({ limit: '10mb' })); // Adjust this value as needed
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Adjust this value as needed

const { Neo4jConnection, create_user_taste_graph, get_user_taste_weights, update_taste_weight } = require('./neo4j_diet_plan');

// Use the provided Neo4j credentials
const uri = "bolt://localhost:7687";
const user = "lukemia";
const password = "12345678";

const neo4j = new Neo4jConnection(uri, user, password);

app.post('/upload-and-generate', async (req, res) => {
  const { image, apiKey, foodName, foodQuantity } = req.body;
  const mimeType = 'image/jpeg';

  if (!image || !apiKey || !foodName || !foodQuantity) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // Decode base64 image and save it locally
  const buffer = Buffer.from(image, 'base64');
  fs.mkdirSync('./uploads', { recursive: true });
  const filePath = './uploads/image.jpg';
  fs.writeFileSync(filePath, buffer);

  try {
    const fileManager = new GoogleAIFileManager(apiKey);

    // Upload the file to Google Gemini
    const uploadResult = await fileManager.uploadFile(filePath, {
      mimeType: mimeType,
      displayName: 'Uploaded Image',
    });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `"Using the food name: ${foodName} and portion size: ${foodQuantity}, analyze the image and provide a nutritional analysis and if you are calculatng calories and stuff make sure you ensure it is based on the food name and the quantity provided in the portion size. Do not add uncertainties or ask for more information in any format. If the image is not an edible food item, respond with 'Please upload the images of your food.'"`;

    // Generate content based on the uploaded image
    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: uploadResult.file.mimeType,
        },
      },
    ]);

    res.json({ aiResponse: result.response.text() });
  } catch (error) {
    console.error('Error in AI content generation:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/register', async (req, res) => {
  const { gmail } = req.body;
  try {
    await create_user_taste_graph(neo4j, gmail);
    res.json({ message: 'User registered and taste graph created successfully' });
  } catch (error) {
    console.error('Error creating taste graph:', error);
    res.status(500).json({ error: 'Failed to create taste graph', details: error.message });
  }
});

app.get('/get-taste-weights', async (req, res) => {
  const { gmail } = req.query;
  try {
    const weights = await get_user_taste_weights(neo4j, gmail);
    const weightObject = weights.reduce((acc, { taste, weight }) => {
      acc[taste] = parseFloat(weight);
      return acc;
    }, {});
    res.json(weightObject);
  } catch (error) {
    console.error('Error fetching taste weights:', error);
    res.status(500).json({ error: 'Failed to fetch taste weights' });
  }
});

app.post('/update-taste-weights', async (req, res) => {
  const { gmail, tasteWeights } = req.body;
  try {
    for (const [taste, weight] of Object.entries(tasteWeights)) {
      await update_taste_weight(neo4j, gmail, taste, weight);
    }
    res.json({ message: 'Weights updated successfully' });
  } catch (error) {
    console.error('Error updating taste weights:', error);
    res.status(500).json({ error: 'Failed to update taste weights' });
  }
});

const PORT =  3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
