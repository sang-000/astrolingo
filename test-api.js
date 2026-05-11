// Simple script to test the API endpoints  
const axios = require('./astro-backend/node_modules/axios');

const BASE_URL = 'http://localhost:5000';

async function testAPI() {
    console.log('🧪 Testing AstroLingo API Endpoints...\n');

    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server status...');
        const serverResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Server is running:', serverResponse.data);

        // Test 2: Test RSS feed parsing
        console.log('\n2️⃣ Testing RSS feed parsing...');
        const feedResponse = await axios.get(`${BASE_URL}/test-feed`);
        console.log('✅ RSS feed test:', {
            success: feedResponse.data.success,
            count: feedResponse.data.count,
            sampleTitle: feedResponse.data.sample?.title || 'No sample available'
        });

        // Test 3: Fetch fresh news
        console.log('\n3️⃣ Fetching fresh news from NASA...');
        const fetchResponse = await axios.get(`${BASE_URL}/api/news/fetch`);
        console.log('✅ Fresh news fetch:', {
            success: fetchResponse.data.success,
            savedCount: fetchResponse.data.savedCount
        });

        // Test 4: Get latest news
        console.log('\n4️⃣ Getting latest saved news...');
        const latestResponse = await axios.get(`${BASE_URL}/api/news/latest?limit=3`);
        console.log('✅ Latest news:', {
            success: latestResponse.data.success,
            articlesCount: latestResponse.data.articles?.length || 0,
            firstArticleTitle: latestResponse.data.articles?.[0]?.title || 'No articles'
        });

        // Test 5: Test simplification (if articles exist)
        if (latestResponse.data.articles && latestResponse.data.articles.length > 0) {
            console.log('\n5️⃣ Testing AI simplification...');
            const articleId = latestResponse.data.articles[0]._id;
            const simplifyResponse = await axios.post(`${BASE_URL}/api/articles/${articleId}/simplify`, {
                mode: 'student'
            });
            console.log('✅ Simplification test:', {
                success: simplifyResponse.data.success,
                mode: simplifyResponse.data.mode,
                hasSimplifiedContent: !!simplifyResponse.data.simplifiedContent
            });
        }

        console.log('\n🎉 All API tests completed successfully!');

    } catch (error) {
        console.error('❌ API Test Error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
    }
}

// Run the tests
testAPI();
