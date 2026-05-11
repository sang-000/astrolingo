const axios = require('axios');

async function testFetch() {
  try {
    // Test the fetch endpoint
    console.log('Testing /api/news/fetch...');
    const fetchResponse = await axios.get('http://localhost:5000/api/news/fetch');
    console.log('Fetch Response:', JSON.stringify(fetchResponse.data, null, 2));

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test the latest articles endpoint
    console.log('\nTesting /api/news/latest...');
    const latestResponse = await axios.get('http://localhost:5000/api/news/latest');
    console.log('Latest Articles Response:', JSON.stringify(latestResponse.data, null, 2));

  } catch (error) {
    console.error('Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status code:', error.response.status);
    }
  }
}

testFetch();
