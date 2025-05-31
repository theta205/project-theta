const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
} else {
    console.error('Error: .env file not found at', envPath);
    process.exit(1);
}

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
// Use ngrok URL directly from environment variable
const WEBHOOK_URL = 'https://76ef-132-145-153-145.ngrok-free.app/webhooks/clerk';

if (!WEBHOOK_SECRET) {
    console.error('Error: CLERK_WEBHOOK_SECRET is not set in environment variables');
    console.log('Current .env file:', envPath);
    console.log('Available environment variables:', Object.keys(process.env).join(', '));
    process.exit(1);
}

// Simple HMAC signature function
function signWebhook(payload, secret, timestamp) {
    const toSign = `${payload.id}.${timestamp}.${JSON.stringify(payload)}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(toSign)
        .digest('hex');
    return `v1,${timestamp},${signature}`;
}

// Helper to generate test webhook events
function generateTestEvent(type, data = {}) {
    const userId = `user_${uuidv4().replace(/-/g, '')}`;
    const email = `test_${Date.now()}@example.com`;
    const username = `user_${Date.now()}`;
    const firstName = `Test${Math.floor(Math.random() * 1000)}`;
    const lastName = `User${Math.floor(Math.random() * 1000)}`;
    
    const baseData = {
        id: userId,
        first_name: firstName,
        last_name: lastName,
        username: username,
        profile_image_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
        email_addresses: [
            {
                id: `email_${uuidv4().replace(/-/g, '')}`,
                email_address: email,
                verification: {
                    status: 'verified',
                    strategy: 'from_oauth_github'
                },
                linked_to: []
            }
        ],
        primary_email_address_id: null,
        object: 'user',
        ...data
    };
    
    baseData.primary_email_address_id = baseData.email_addresses[0].id;
    
    return {
        type: `user.${type}`,
        data: baseData,
        object: 'event',
        id: `evt_${uuidv4().replace(/-/g, '')}`,
        api_version: 'v1',
        created_at: Math.floor(Date.now() / 1000),
    };
}

// Sign and send webhook
async function sendWebhook(event) {
    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        
        console.log('Generating signature...');
        const signature = signWebhook(event, WEBHOOK_SECRET, timestamp);
        
        console.log('Generated signature:', signature);
        
        // Generate headers
        const headers = {
            'svix-id': event.id,
            'svix-timestamp': timestamp,
            'svix-signature': signature,
            'Content-Type': 'application/json',
            'webhook-id': event.id,
            'webhook-timestamp': timestamp,
            'webhook-signature': `v1,${signature.split(',')[1]}`,
            'user-agent': 'Clerk Webhook Test'
        };
        
        console.log('Sending webhook with headers:', JSON.stringify(headers, null, 2));
        console.log('Payload:', JSON.stringify(event, null, 2));
        
        console.log(`Sending ${event.type} webhook for user ${event.data.id}`);
        console.log(`Making request to: ${WEBHOOK_URL}`);
        
        // Make sure we're sending the raw JSON string
        const payload = JSON.stringify(event);
        
        // Use axios to make the request with the raw body
        const response = await axios({
            method: 'post',
            url: WEBHOOK_URL,
            data: payload,
            headers: {
                ...headers,
                'Content-Length': Buffer.byteLength(payload, 'utf8')
            },
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            responseType: 'json',
            validateStatus: () => true // Don't throw on HTTP error status
        });
        
        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
        
        if (response.status >= 400) {
            console.error('Error response body:', response.data);
            throw new Error(`Webhook request failed with status ${response.status}`);
        }
        
        return response.data;
    } catch (error) {
        console.error('Error sending webhook:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
        throw error;
    }
}

// Test user creation
async function testUserCreation() {
    console.log('\n=== Testing User Creation ===');
    const event = generateTestEvent('created');
    return sendWebhook(event);
}

// Test user update
async function testUserUpdate(userId) {
    console.log('\n=== Testing User Update ===');
    const event = generateTestEvent('updated', { 
        id: userId,
        first_name: `Updated${Math.floor(Math.random() * 1000)}`,
        last_name: `User${Math.floor(Math.random() * 1000)}`
    });
    return sendWebhook(event);
}

// Test user deletion
async function testUserDeletion(userId) {
    console.log('\n=== Testing User Deletion ===');
    const event = generateTestEvent('deleted', { id: userId });
    return sendWebhook(event);
}

// Run all tests
async function runTests() {
    try {
        // Test user creation
        const createResult = await testUserCreation();
        const userId = createResult?.data?.id;
        
        if (userId) {
            // Test user update
            await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
            await testUserUpdate(userId);
            
            // Test user deletion
            await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
            await testUserDeletion(userId);
        }
        
        console.log('\n=== All tests completed ===');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// Run the tests if this file is executed directly
if (require.main === module) {
    runTests();
}

module.exports = {
    generateTestEvent,
    sendWebhook,
    testUserCreation,
    testUserUpdate,
    testUserDeletion
};
