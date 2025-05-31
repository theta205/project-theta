const AWS = require('aws-sdk');
const axios = require('axios');
const crypto = require('crypto');
const { Webhook } = require('svix');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
    connectTimeout: 5000
  }
});

const dynamoDB = new AWS.DynamoDB.DocumentClient();
const dynamoDbService = new AWS.DynamoDB();
const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_USER || 'UserProfiles';

// Test user data
const testUser = {
  id: 'test_user_123',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  email_addresses: [
    {
      id: 'email_123',
      email_address: 'test.user@example.com',
      verification: { status: 'verified' }
    }
  ],
  primary_email_address_id: 'email_123',
  profile_image_url: 'https://example.com/avatar.jpg',
  created_at: Math.floor(Date.now() / 1000),
  updated_at: Math.floor(Date.now() / 1000)
};

describe('Webhook Integration Test', () => {
  let webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  let webhookUrl = 'http://localhost:5001/webhooks/clerk';

  // Clean up after tests
  afterAll(async () => {
    try {
      // Only try to delete the test item, not the table
      try {
        await dynamoDB.delete({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${testUser.id}`,
            SK: 'PROFILE'
          },
          ReturnValues: 'NONE'
        }).promise();
      } catch (error) {
        // Ignore if item doesn't exist
        if (error.code !== 'ResourceNotFoundException') {
          console.warn('Cleanup warning:', error.message);
        }
      }
    } catch (error) {
      console.warn('Unexpected error during cleanup:', error.message);
    }
  }, 10000); // 10s timeout for cleanup

  test('should process user.created webhook and save to DynamoDB', async () => {
    // Increase test timeout to 20 seconds
    jest.setTimeout(20000);
    // 1. Prepare test event
    const event = {
      type: 'user.created',
      data: testUser,
      object: 'event',
      id: 'evt_test_123',
      api_version: 'v1'
    };

    // 2. Create webhook signature
    const wh = new Webhook(webhookSecret);
    const payload = JSON.stringify(event);
    const msgId = 'msg_test_123';
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 3. Sign the payload
    const toSign = `${msgId}.${timestamp}.${payload}`;
    const signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(toSign)
      .digest('hex');

    // 4. Send the webhook
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'svix-id': msgId,
        'svix-timestamp': timestamp,
        'svix-signature': signature
      }
    });

    // 5. Verify response
    expect(response.status).toBe(200);
    
    // 6. Wait a bit for DynamoDB to be consistent
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 7. Check if user exists in DynamoDB
    let user;
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const result = await dynamoDB.get({
          TableName: TABLE_NAME,
          Key: {
            PK: `USER#${testUser.id}`,
            SK: 'PROFILE'
          },
          ConsistentRead: true
        }).promise();
        
        if (result.Item) {
          user = result.Item;
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
    }
    
    if (!user && lastError) {
      console.error('Error fetching user from DynamoDB:', lastError);
    }
    
    // 8. Verify user data
    expect(user).toBeDefined();
    if (user) {
      expect(user.userId).toBe(testUser.id);
      expect(user.basicInfo.username).toBe(testUser.username);
      expect(user.basicInfo.email).toBe(testUser.email_addresses[0].email_address);
      expect(user.metadata.accountType).toBe('free');
    }
  });
});
