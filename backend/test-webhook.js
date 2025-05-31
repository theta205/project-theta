const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Your webhook secret from Clerk Dashboard -> Webhooks -> [Your Webhook] -> Secret
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set in environment variables');
    process.exit(1);
}

// Test webhook payload (example user.created event)
const testPayload = {
    type: 'user.created',
    data: {
        id: 'user_123456789',
        first_name: 'John',
        last_name: 'Doe',
        email_addresses: [
            {
                email_address: 'john.doe@example.com',
                id: 'email_123456789',
                linked_to: [],
                object: 'email_address',
                verification: {
                    status: 'verified',
                    strategy: 'from_oauth_github'
                }
            }
        ],
        primary_email_address_id: 'email_123456789',
        object: 'user',
        created_at: Date.now() / 1000,
        updated_at: Date.now() / 1000,
        username: 'johndoe',
        profile_image_url: 'https://example.com/avatar.jpg'
    },
    object: 'event',
    id: 'evt_123456789',
    api_version: 'v1'
};

// Function to create Svix signature
function createSignature(secret, msgId, timestamp, payload) {
    const toSign = `${msgId}.${timestamp}.${payload}`;
    const signature = crypto
        .createHmac('sha256', secret)
        .update(toSign)
        .digest('hex');
    return signature;
}

// Test the webhook endpoint
async function testWebhook() {
    try {
        const payload = JSON.stringify(testPayload);
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const msgId = 'msg_123456789';
        
        // Create the signature
        const signature = createSignature(WEBHOOK_SECRET, msgId, timestamp, payload);
        
        const webhookUrl = 'http://localhost:5001/webhooks/clerk';
        console.log(`Sending webhook to local server: ${webhookUrl}`);
        console.log('Payload:', payload);
        
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'Content-Type': 'application/json',
                'svix-id': msgId,
                'svix-timestamp': timestamp,
                'svix-signature': `v1,${signature}`
            }
        });
        
        console.log('Webhook test successful!');
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
    } catch (error) {
        console.error('Webhook test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Run the test
testWebhook();
