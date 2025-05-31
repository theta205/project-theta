const AWS = require('aws-sdk');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });

// Initialize DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Get table name from environment variable with fallback
const TABLE_NAME = process.env.AWS_DYNAMODB_TABLE_USER || 'UserProfiles';

// Get the user ID from command line arguments or use the last test user
const userId = process.argv[2] || 'user_e1904a58cdfa4778836b69df9e69cfd5';

async function checkUser() {
    console.log(`Checking for user with ID: ${userId}`);
    
    const params = {
        TableName: TABLE_NAME,
        Key: {
            'user_id': userId
        }
    };

    try {
        const result = await docClient.get(params).promise();
        
        if (!result.Item) {
            console.log('User not found in the database');
            return;
        }
        
        console.log('User found in database:');
        console.log(JSON.stringify(result.Item, null, 2));
    } catch (error) {
        console.error('Error checking user:', error);
    }
}

// List all users in the table
async function listAllUsers() {
    console.log('Listing all users in the table...');
    
    const params = {
        TableName: TABLE_NAME
    };

    try {
        const result = await docClient.scan(params).promise();
        
        if (!result.Items || result.Items.length === 0) {
            console.log('No users found in the database');
            return;
        }
        
        console.log(`Found ${result.Items.length} users:`);
        result.Items.forEach((item, index) => {
            console.log(`\nUser ${index + 1}:`);
            console.log(JSON.stringify(item, null, 2));
        });
    } catch (error) {
        console.error('Error listing users:', error);
    }
}

// Run the check
async function main() {
    await checkUser();
    console.log('\n---\n');
    await listAllUsers();
}

main().catch(console.error);
