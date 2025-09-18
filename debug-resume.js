// Simple Node.js script to test the admin contractor API endpoint
const https = require('https');
const http = require('http');

// Configuration
const API_BASE_URL = 'http://localhost:54193/api';
const CONTRACTOR_ID = '1'; // Change this to a real contractor ID
const TOKEN = 'your-jwt-token-here'; // You would need to get a real token

function makeRequest(url, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestModule = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };

    const req = requestModule.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function debugContractorAPI() {
  try {
    console.log('Testing contractor API endpoints...');
    
    // Test the main contractor endpoint
    const contractorUrl = `${API_BASE_URL}/user/admin/contractors/${CONTRACTOR_ID}`;
    console.log(`\nTesting: ${contractorUrl}`);
    
    const contractorData = await makeRequest(contractorUrl, TOKEN);
    console.log('Contractor Data:');
    console.log(JSON.stringify(contractorData, null, 2));
    
    if (contractorData && typeof contractorData === 'object') {
      console.log('\nAvailable fields:', Object.keys(contractorData));
      
      // Check for resume fields
      const resumeFields = ['resumeUpload', 'resume', 'resumeUrl', 'resumeFile', 'ResumeFile', 'cv', 'CV', 'document'];
      console.log('\nResume field values:');
      resumeFields.forEach(field => {
        if (contractorData.hasOwnProperty(field)) {
          console.log(`- ${field}: ${contractorData[field]}`);
        }
      });
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
    console.log('\nThis script requires a valid API server and authentication token.');
    console.log('To use this script:');
    console.log('1. Make sure your backend API is running');
    console.log('2. Get a valid JWT token from login');
    console.log('3. Update the TOKEN variable in this script');
    console.log('4. Update the CONTRACTOR_ID to a real contractor ID');
  }
}

debugContractorAPI();