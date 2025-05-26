const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

// Configure AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

// Log AWS configuration (without sensitive data)
console.log('AWS Configuration:');
console.log('Region:', process.env.AWS_REGION);
console.log('S3 Bucket:', process.env.AWS_S3_BUCKET);
console.log('DynamoDB Table:', process.env.AWS_DYNAMODB_TABLE);

const s3 = new AWS.S3();
const dynamodb = new AWS.DynamoDB.DocumentClient();

const app = express();
const port = 5001;

// Enable CORS
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: port });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file;
        const s3Key = `uploads/${uuidv4()}-${file.originalname}`;
        const fileId = uuidv4();

        // Upload to S3
        await s3.upload({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: s3Key,
            Body: file.buffer,
            ContentType: file.mimetype
        }).promise();

        // Save metadata to DynamoDB
        const metadata = {
            file_id: fileId,
            filename: file.originalname,
            s3_key: s3Key,
            upload_date: new Date().toISOString(),
            file_size: file.size,
            mime_type: file.mimetype,
            user_id: req.body.user_id || 'default_user'
        };

        await dynamodb.put({
            TableName: process.env.AWS_DYNAMODB_TABLE,
            Item: metadata
        }).promise();

        res.json({
            message: 'File uploaded successfully',
            filename: file.originalname,
            s3_key: s3Key,
            file_id: fileId
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
    }
});

// File processing endpoint
app.post('/api/process', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        const { className, note } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        const results = [];

        for (const file of files) {
            const s3Key = `uploads/${uuidv4()}-${file.originalname}`;
            const fileId = uuidv4();
            
            // Upload to S3
            await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype
            }).promise();

            // Process file
            const fileExt = path.extname(file.originalname).toLowerCase();
            const isAudio = ['.mp3', '.wav', '.m4a'].includes(fileExt);
            const parserScript = isAudio ? 'audio_parser.py' : 'pdf_parser.py';

            // Run parser
            const pythonProcess = spawn('python3', [
                path.join(__dirname, '..', '..', 'src', 'parsers', parserScript),
                file.buffer.toString('base64')  // Pass file content as base64
            ]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                errorData += data.toString();
            });

            await new Promise((resolve, reject) => {
                pythonProcess.on('close', (code) => {
                    if (code === 0) {
                        try {
                            const result = JSON.parse(outputData);
                            result.class = className || '';
                            result.topic = note || '';
                            result.s3_key = s3Key;
                            results.push(result);
                            resolve();
                        } catch (e) {
                            reject(new Error('Failed to parse Python script output'));
                        }
                    } else {
                        reject(new Error(`Python script failed: ${errorData}`));
                    }
                });
            });

            // Save result to DynamoDB
            await dynamodb.put({
                TableName: process.env.AWS_DYNAMODB_TABLE,
                Item: {
                    file_id: fileId,
                    filename: file.originalname,
                    s3_key: s3Key,
                    class: className || '',
                    topic: note || '',
                    processed_date: new Date().toISOString(),
                    result: results[results.length - 1],
                    user_id: req.body.user_id || 'default_user'
                }
            }).promise();
        }

        // Run embedding process
        const embedProcess = spawn('python3', [
            path.join(__dirname, '..', '..', 'src', 'parsers', 'embed_parser.py')
        ]);

        await new Promise((resolve, reject) => {
            embedProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error('Embedding process failed'));
                }
            });
        });

        res.json(results);
    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message
        });
    }
});

// Search endpoint
app.post('/api/search', async (req, res) => {
    try {
        const { query, user_id } = req.body;
        if (!query) {
            return res.status(400).json({ error: 'No search query provided' });
        }
        if (!user_id) {
            return res.status(400).json({ error: 'No user_id provided' });
        }

        const searchProcess = spawn('python3', [
            path.join(__dirname, '..', '..', 'src', 'parsers', 'test_embeddings.py'),
            '--query', query,
            '--user-id', user_id,
            '--n-results', '5'
        ]);

        let searchOutput = '';
        let searchError = '';

        searchProcess.stdout.on('data', (data) => {
            searchOutput += data.toString();
        });

        searchProcess.stderr.on('data', (data) => {
            searchError += data.toString();
        });

        await new Promise((resolve, reject) => {
            searchProcess.on('close', (code) => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Search failed: ${searchError}`));
                }
            });
        });

        try {
            const results = JSON.parse(searchOutput);
            res.json(results);
        } catch (parseError) {
            res.status(500).json({ 
                error: 'Failed to parse search results',
                details: searchOutput
            });
        }
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Something broke!' });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Upload endpoint available at: http://localhost:${port}/api/upload`);
    console.log(`Process endpoint available at: http://localhost:${port}/api/process`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Please free up the port and try again.`);
        process.exit(1);
    } else {
        console.error('Server error:', err);
    }
}); 