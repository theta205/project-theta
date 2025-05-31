const axios = require('axios');
const crypto = require('crypto');
const { Webhook } = require('svix');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Helper function to log messages with timestamps
function log(level, message, data = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, level, message, ...data };
    console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry, null, 2));
}

async function testWebhook() {
  const webhookUrl = process.env.CLERK_WEBHOOK_URL ? 
    `${process.env.CLERK_WEBHOOK_URL}/webhooks/clerk` : 
    'http://localhost:5001/webhooks/clerk';
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  
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

  // Prepare event
  const event = {
    type: 'user.created',
    data: testUser,
    object: 'event',
    id: 'evt_test_' + Math.random().toString(36).substring(2, 10),
    api_version: 'v1'
  };

  const payload = JSON.stringify(event);
  const msgId = 'msg_test_' + Math.random().toString(36).substring(2, 10);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  
  // Create signature using Svix Webhook class
  const wh = new Webhook(webhookSecret);
  const timestampDate = new Date(parseInt(timestamp) * 1000);
  const headers = {
      'svix-id': msgId,
      'svix-timestamp': timestamp,
      'svix-signature': wh.sign(msgId, timestampDate, payload)
  };

  log('debug', 'Sending webhook request', {
      url: webhookUrl,
      headers,
      payload: JSON.parse(payload)
  });

  console.log('Sending webhook to:', webhookUrl);
  console.log('Event ID:', event.id);
  console.log('Message ID:', msgId);
  console.log('Payload:', payload);

  try {
    // Send the webhook
    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 10000, // 10 second timeout
      validateStatus: () => true // Don't throw on HTTP error status codes
    });

    console.log('Webhook sent successfully!');
    console.log('Status:', response.status);
    console.log('Response:', response.data);
    
    // Check DynamoDB after a short delay
    console.log('\nChecking DynamoDB in 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await checkDynamoDB(testUser.id);
    
  } catch (error) {
    console.error('Error sending webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

async function checkDynamoDB(userId) {
  const AWS = require('aws-sdk');
  
  AWS.config.update({
    region: process.env.AWS_REGION || 'us-east-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  });
  
  const dynamoDB = new AWS.DynamoDB.DocumentClient();
  
  // Only check the UserProfiles table
  const tableNames = ['UserProfiles'];
  
  for (const tableName of tableNames) {
    try {
      console.log(`\nChecking table: ${tableName}`);
      
      // Try to get the item by user_id (which is the partition key in UserProfiles)
      const getParams = {
        TableName: tableName,
        Key: { user_id: userId },
        ConsistentRead: true
      };
      
      console.log(`Checking for user ${userId} in table ${tableName}...`);
      const result = await dynamoDB.get(getParams).promise();
      
      if (result.Item) {
        console.log('✅ User found in DynamoDB:', JSON.stringify(result.Item, null, 2));
        return;
      }
      
      // If not found, try with the GSI if it's the ThetaUserProfiles table
      if (tableName.includes('Theta')) {
        const queryParams = {
          TableName: tableName,
          IndexName: 'GSI1',
          KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :sk)',
          ExpressionAttributeValues: {
            ':pk': 'USER',
            ':sk': `PROFILE#${userId}`
          }
        };
        
        console.log(`Querying GSI for user ${userId}...`);
        const gsiResult = await dynamoDB.query(queryParams).promise();
        
        if (gsiResult.Items?.length > 0) {
          console.log('✅ User found via GSI:', JSON.stringify(gsiResult.Items[0], null, 2));
          return;
        }
      }
      
      // If we get here, the user wasn't found in this table
      console.log(`❌ User not found in table ${tableName}`);
      
      // List all items in the table for debugging (limit to 10 items)
      console.log(`\nScanning table ${tableName}...`);
      const scanParams = { 
        TableName: tableName,
        Limit: 10
      };
      
      const scanResult = await dynamoDB.scan(scanParams).promise();
      console.log(`Found ${scanResult.Items?.length || 0} items in ${tableName}:`);
      
      if (scanResult.Items?.length > 0) {
        console.log('First 10 items:', JSON.stringify(scanResult.Items, null, 2));
      }
      
      // Show table description
      console.log('\nTable description:');
      try {
        const describeParams = { TableName: tableName };
        const description = await new AWS.DynamoDB().describeTable(describeParams).promise();
        console.log(JSON.stringify(description.Table, null, 2));
      } catch (err) {
        console.error('Error describing table:', err);
      }
      
    } catch (error) {
      console.error(`❌ Error checking table ${tableName}:`, error.message);
      if (error.code === 'ResourceNotFoundException') {
        console.log(`Table ${tableName} does not exist`);
      }
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  console.log('✅ Finished checking all tables');  
}

// Run the test
testWebhook().catch(console.error);
