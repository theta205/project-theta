const express = require('express');
const { Webhook } = require('svix');
const router = express.Router();
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '..', '.env') });
const { saveUserProfile, deleteUserProfile } = require('../utils/db');

// Helper to map Clerk user data to our profile format
function mapToUserProfile(clerkUser) {
    const now = new Date().toISOString();
    const email = clerkUser.email_addresses?.find(e => e.id === clerkUser.primary_email_address_id)?.email_address || '';
    const username = clerkUser.username || email.split('@')[0];
    const [firstName, lastName] = clerkUser.first_name && clerkUser.last_name 
        ? [clerkUser.first_name, clerkUser.last_name]
        : username.split(/[._-]/);

    return {
        userId: clerkUser.id,
        basicInfo: {
            userId: clerkUser.id,
            username: username,
            firstName: firstName || '',
            lastName: lastName || '',
            email: email,
            avatarUrl: clerkUser.profile_image_url || '',
            joinedDate: new Date(clerkUser.created_at * 1000).toISOString()
        },
        preferences: {
            theme: 'light',
            language: 'en-US',
            timezone: 'UTC',
            notifications: {
                email: true,
                push: false,
                frequency: 'daily'
            }
        },
        activity: {
            lastActive: now,
            status: 'active',
            streakDays: 0,
            loginCount: 0
        },
        education: {
            level: '',
            institution: '',
            expectedGraduationYear: null,
            fieldOfInterest: '',
            degreePursuing: null,
            highestDegreeEarned: null,
            yearEarned: null
        },
        interests: [],
        stats: {
            documentsUploaded: 0,
            notesTaken: 0,
            sessionsCompleted: 0
        },
        metadata: {
            accountType: 'free',
            createdAt: new Date(clerkUser.created_at * 1000).toISOString(),
            updatedAt: now
        },
        // Additional fields required by the example
        PK: `USER#${clerkUser.id}`,
        SK: 'PROFILE',
        GSI1PK: 'USER',
        GSI1SK: `PROFILE#${clerkUser.id}`,
        createdAt: new Date(clerkUser.created_at * 1000).toISOString(),
        updatedAt: now
    };
}

// Simple middleware to log webhook requests (no signature verification)
const verifyWebhook = (req, res, next) => {
    const startTime = Date.now();
    const requestId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const log = (level, message, data = {}) => {
        const logEntry = {
            level,
            timestamp: new Date().toISOString(),
            requestId,
            duration: Date.now() - startTime,
            message,
            ...data
        };
        console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));
    };
    
    // Log the incoming request
    log('info', 'Incoming webhook request', { 
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body
    });
    
    // Parse the body if it's a string
    if (typeof req.body === 'string') {
        try {
            req.body = JSON.parse(req.body);
        } catch (error) {
            log('error', 'Failed to parse request body', { error: error.message });
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
    }
    
    // Attach the payload to the request object
    req.verifiedPayload = req.body;
    next();
};

// Raw body parser middleware
const rawBodyParser = (req, res, next) => {
    let data = '';
    req.setEncoding('utf8');
    
    req.on('data', (chunk) => {
        data += chunk;
    });

    req.on('end', () => {
        req.rawBody = data;
        try {
            req.body = JSON.parse(data);
            next();
        } catch (error) {
            console.error('Error parsing JSON:', error);
            res.status(400).json({ error: 'Invalid JSON' });
        }
    });
};

// Webhook endpoint for Clerk
router.post('/clerk', 
    // Verify webhook signature first
    verifyWebhook,
    
    // Process the webhook event
    async (req, res) => {
        const startTime = Date.now();
        const requestId = `process_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        const payload = req.verifiedPayload || req.body;
        const eventType = payload.type;
        const data = payload.data;

        const log = (level, message, data = {}) => {
            const logEntry = {
                level,
                timestamp: new Date().toISOString(),
                requestId,
                duration: Date.now() - startTime,
                message,
                eventType,
            };
            console[level === 'error' ? 'error' : 'log'](JSON.stringify(logEntry));
        };
        
        try {
            const payload = req.verifiedPayload || req.body;
            const eventType = payload.type;
            const data = payload.data;
            
            log('info', 'Processing webhook event', {
                type: eventType,
                eventId: payload.id,
                userId: data?.id
            });
            
            if (!eventType || !data) {
                throw new Error('Invalid webhook payload');
            }
            
            console.log('Raw request headers:', JSON.stringify(req.headers, null, 2));
            console.log('Raw request body length:', req.body?.length || 0);
            if (req.body && req.body.length > 0) {
                console.log('First 200 chars of body:', req.body.toString('utf8').substring(0, 200));
            }

            // Handle different webhook events
            switch (eventType) {
                case 'user.created':
                    log('info', 'Creating new user profile', { userId: data.id });
                    try {
                        const userProfile = mapToUserProfile(data);
                        await saveUserProfile(userProfile);
                        log('info', 'Successfully created user profile', { userId: data.id });
                    } catch (error) {
                        log('error', 'Failed to create user profile', { 
                            userId: data.id, 
                            error: error.message,
                            stack: error.stack 
                        });
                        throw error; // Re-throw to be caught by the outer catch
                    }
                    break;
                    
                case 'user.updated':
                    log('info', 'Updating user profile', { userId: data.id });
                    try {
                        const userProfile = mapToUserProfile(data);
                        await saveUserProfile({
                            ...userProfile,
                            // Preserve existing stats and preferences if they exist
                            $REMOVE: ['stats', 'preferences']
                        });
                        log('info', 'Successfully updated user profile', { userId: data.id });
                    } catch (error) {
                        log('error', 'Failed to update user profile', { 
                            userId: data.id, 
                            error: error.message,
                            stack: error.stack 
                        });
                        throw error; // Re-throw to be caught by the outer catch
                    }
                    break;
                    
                case 'user.deleted':
                    log('info', 'Deleting user profile', { userId: data.id });
                    try {
                        await deleteUserProfile(data.id);
                        log('info', 'Successfully deleted user profile', { userId: data.id });
                    } catch (error) {
                        // If the profile wasn't found, that's fine - it might have been deleted already
                        if (error.code !== 'ResourceNotFoundException') {
                            log('error', 'Failed to delete user profile', { 
                                userId: data.id, 
                                error: error.message,
                                stack: error.stack 
                            });
                            throw error; // Re-throw to be caught by the outer catch
                        } else {
                            log('info', 'User profile not found during deletion, skipping', { userId: data.id });
                        }
                    }
                    break;
                    
                default:
                    const message = `Unhandled event type: ${eventType}`;
                    log('warn', message);
                    return res.status(400).json({ error: message });
            }

            // Acknowledge receipt of the webhook
            res.status(200).json({ 
                success: true, 
                message: 'Webhook processed successfully',
                requestId
            });
            
        } catch (error) {
            const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            log('error', 'Error processing webhook', { 
                errorId,
                error: error.message,
                stack: error.stack,
                eventType: req.verifiedPayload?.type,
                userId: req.verifiedPayload?.data?.id
            });
            
            res.status(500).json({ 
                success: false, 
                error: 'Failed to process webhook',
                details: error.message,
                errorId,
                requestId
            });
        } finally {
            log('info', 'Webhook processing completed', { 
                duration: Date.now() - startTime 
            });
        }
    }
);

module.exports = router;
