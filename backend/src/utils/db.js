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
console.log('Using DynamoDB table:', TABLE_NAME);

/**
 * Get a user profile by user ID
 * @param {string} userId - The ID of the user
 * @returns {Promise<Object|null>} The user profile or null if not found
 */
async function getUserProfile(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            user_id: userId
        }
    };

    try {
        const result = await docClient.get(params).promise();
        if (!result.Item) return null;
        
        // Return the nested userProfile object if it exists, otherwise return the entire item
        // for backward compatibility
        return result.Item.userProfile || result.Item;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

/**
 * Create or update a user profile
 * @param {Object} profile - The user profile data
 * @returns {Promise<Object>} The created/updated profile
 */
async function saveUserProfile(profile) {
    const timestamp = new Date().toISOString();
    
    // Format the user profile to match the expected structure
    const userProfile = {
        basicInfo: {
            userId: profile.userId,
            username: profile.basicInfo?.username || '',
            firstName: profile.basicInfo?.firstName || '',
            lastName: profile.basicInfo?.lastName || '',
            email: profile.basicInfo?.email || '',
            avatarUrl: profile.basicInfo?.avatarUrl || '',
            joinedDate: profile.basicInfo?.joinedDate || timestamp
        },
        preferences: profile.preferences || {
            theme: 'light',
            language: 'en-US',
            timezone: 'UTC',
            notifications: {
                email: true,
                push: false,
                frequency: 'daily'
            }
        },
        activity: profile.activity || {
            lastActive: timestamp,
            status: 'active',
            streakDays: 0,
            loginCount: 0
        },
        education: profile.education || {
            level: '',
            institution: '',
            expectedGraduationYear: null,
            fieldOfInterest: '',
            degreePursuing: null,
            highestDegreeEarned: null,
            yearEarned: null
        },
        interests: profile.interests || [],
        stats: profile.stats || {
            documentsUploaded: 0,
            notesTaken: 0,
            sessionsCompleted: 0
        }
    };

    // Create the item with user_id as the primary key
    const item = {
        user_id: profile.userId,
        userProfile: userProfile,
        created_at: timestamp,
        updated_at: timestamp
    };

    const params = {
        TableName: TABLE_NAME,
        Item: item,
        ReturnValues: 'ALL_OLD'
    };

    console.log('Saving user profile to DynamoDB:', JSON.stringify(params, null, 2));
    
    try {
        const result = await docClient.put(params).promise();
        console.log('Successfully saved user profile:', profile.userId);
        return item;
    } catch (error) {
        console.error('Error saving user profile:', error);
        throw error;
    }
}

/**
 * Delete a user profile
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} True if successful
 */
async function deleteUserProfile(userId) {
    const params = {
        TableName: TABLE_NAME,
        Key: {
            PK: `USER#${userId}`,
            SK: 'PROFILE',
        },
    };

    try {
        await docClient.delete(params).promise();
        console.log(`Profile deleted for user ${userId}`);
        return true;
    } catch (error) {
        console.error('Error deleting user profile:', error);
        throw error;
    }
}

module.exports = {
    getUserProfile,
    saveUserProfile,
    deleteUserProfile,
};
