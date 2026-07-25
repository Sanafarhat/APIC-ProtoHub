require('dotenv').config();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testKey() {
  try {
    console.log('Testing Groq API Key...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: 'Reply exactly with "Working"',
        },
      ],
      model: 'llama-3.1-8b-instant',
    });
    console.log('Response:', chatCompletion.choices[0]?.message?.content || '');
    console.log('API Key is valid and working!');
  } catch (err) {
    console.error('Error testing API key:', err.message);
  }
}

testKey();
