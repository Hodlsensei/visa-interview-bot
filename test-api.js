const GEMINI_API_KEY = 'AIzaSyBg0JwLr8KhLJLymdCSaa66PRbz0w36GAc'; // Use same key from server.js

async function testGemini() {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            role: 'user',
            parts: [{ text: 'Say hello' }]
          }]
        })
      }
    );

    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testGemini();