const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    console.log("Testing Gemini connection...");
    console.log("Model:", process.env.GEMINI_MODEL);
    
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ FAIL: GEMINI_API_KEY is not defined in .env");
        process.exit(1);
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-2.5-flash" });
        
        console.log("Sending query: 'Say hello in one word'...");
        const result = await model.generateContent("Say hello in one word");
        const responseText = result.response.text().trim();
        
        console.log(`✅ PASS: Gemini response: "${responseText}"`);
    } catch (error) {
        console.error("❌ FAIL: Gemini API call failed with error:", error.message);
        process.exit(1);
    }
}

testGemini();
