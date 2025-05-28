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
        const userId = req.body.user_id;
        const fileId = req.body.file_id;
        const s3Key = `uploads/${userId}_${file.originalname}`;
        console.log(`[UPLOAD DEBUG] Incoming upload: user_id=${userId}, file_id=${fileId}, filename=${file.originalname}`);
        if (!userId) {
            console.error('[UPLOAD ERROR] No user_id provided');
            return res.status(400).json({ error: 'No user_id provided' });
        }
        if (!fileId) {
            console.error('[UPLOAD ERROR] No file_id provided');
            return res.status(400).json({ error: 'No file_id provided' });
        }

        // Check if file is already registered in DynamoDB
        let fileRecord;
        try {
            console.log(`[UPLOAD DEBUG] Checking DynamoDB for user_id=${userId}, file_id=${fileId}`);
            const dbResp = await dynamodb.get({
                TableName: process.env.AWS_DYNAMODB_TABLE,
                Key: {
                    user_id: userId,
                    file_id: fileId
                }
            }).promise();
            fileRecord = dbResp.Item;
            console.log(`[UPLOAD DEBUG] DynamoDB registration lookup result:`, fileRecord);
        } catch (dbErr) {
            console.error('[UPLOAD ERROR] DynamoDB error during registration check:', dbErr);
            return res.status(500).json({ error: 'Database error', details: dbErr.message });
        }

        if (fileRecord) {
            // File already registered, check if it's in S3
            try {
                await s3.headObject({
                    Bucket: process.env.AWS_S3_BUCKET,
                    Key: s3Key
                }).promise();
                // File exists in S3
                console.warn(`[UPLOAD WARNING] File already uploaded: user_id=${userId}, file_id=${fileId}`);
                return res.status(200).json({
                    warning: 'File already uploaded.',
                    user_id: userId,
                    file_id: fileId,
                    filename: file.originalname
                });
            } catch (err) {
                if (err.code !== 'NotFound') {
                    // S3 error
                    console.error('[UPLOAD ERROR] S3 error:', err);
                    return res.status(500).json({ error: 'S3 error', details: err.message });
                }
                // File not in S3, proceed to upload
                console.log(`[UPLOAD DEBUG] File registered but not yet uploaded to S3. Proceeding to upload.`);
            }
        } else {
            // Not registered, so register in DynamoDB after upload
            console.log(`[UPLOAD DEBUG] File not registered. Will register after upload.`);
        }

        // Upload to S3
        try {
            await s3.upload({
                Bucket: process.env.AWS_S3_BUCKET,
                Key: s3Key,
                Body: file.buffer,
                ContentType: file.mimetype
            }).promise();
            console.log(`[UPLOAD DEBUG] File uploaded to S3: ${s3Key}`);
        } catch (s3Err) {
            console.error('[UPLOAD ERROR] Failed to upload to S3:', s3Err);
            return res.status(500).json({ error: 'Failed to upload to S3', details: s3Err.message });
        }

        // Register file in DynamoDB if not already present
        if (!fileRecord) {
            try {
                await dynamodb.put({
                    TableName: process.env.AWS_DYNAMODB_TABLE,
                    Item: {
                        user_id: userId,
                        file_id: fileId,
                        filename: file.originalname,
                        s3_key: s3Key,
                        uploaded_at: new Date().toISOString()
                    }
                }).promise();
                console.log(`[UPLOAD DEBUG] File registered in DynamoDB: user_id=${userId}, file_id=${fileId}`);
            } catch (ddbErr) {
                console.error('[UPLOAD ERROR] Failed to register file in DynamoDB:', ddbErr);
                return res.status(500).json({ error: 'Failed to register file in DynamoDB', details: ddbErr.message });
            }
        }

        // Respond with success
        return res.status(200).json({
            message: 'File uploaded and registered successfully.',
            user_id: userId,
            file_id: fileId,
            filename: file.originalname,
            s3_key: s3Key
        });
    } catch (error) {
        console.error('[UPLOAD ERROR] Unexpected error:', error);
        res.status(500).json({ error: 'Upload failed', details: error.message });
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
            console.log(`[PROCESS DEBUG] Uploaded file to S3: ${s3Key}`);

            // Process file
            const fileExt = path.extname(file.originalname).toLowerCase();
            const isAudio = ['.mp3', '.wav', '.m4a'].includes(fileExt);
            const parserScript = isAudio ? 'audio_parser.py' : 'pdf_parser.py';
            console.log(`[DEBUG] Starting parsing for file: ${file.originalname} (${fileId}) using script: ${parserScript}`);

            // Save buffer to a temporary file
            const fs = require('fs');
            const os = require('os');
            const pathTmp = require('path');

            // Generate a secure temp file path
            const tmpDir = os.tmpdir();
            const tmpFilePath = pathTmp.join(tmpDir, `${fileId}${fileExt}`);
            fs.writeFileSync(tmpFilePath, file.buffer);
            console.log(`[PROCESS DEBUG] Saved temp file for parsing: ${tmpFilePath}`);

            let outputData = '';
            let errorData = '';
            let pythonProcess;
            // NOTE: No processed results are written to disk. All persistent storage is handled by ChromaDB and DynamoDB/S3.
            try {
                // Run parser, passing the temp file path
                pythonProcess = spawn('python3', [
                    path.join(__dirname, '..', '..', 'src', 'parsers', parserScript),
                    tmpFilePath
                ]);

                pythonProcess.stdout.on('data', (data) => {
                    outputData += data.toString();
                });

                pythonProcess.stderr.on('data', (data) => {
                    errorData += data.toString();
                });

                await new Promise((resolve, reject) => {
                    pythonProcess.on('close', (code) => {
                        // Clean up temp file after process ends
                        fs.unlink(tmpFilePath, (err) => {
                            if (err) {
                                console.error('Failed to delete temp file:', tmpFilePath, err);
                            }
                        });
                        if (code === 0) {
                            try {
                                const result = JSON.parse(outputData);
                                // Ensure all required fields are present for frontend display
                                result.filename = result.filename || file.originalname;
                                result.class = typeof result.class !== 'undefined' ? result.class : (className || '');
                                result.topic = typeof result.topic !== 'undefined' ? result.topic : (note || '');
                                result.text = typeof result.text !== 'undefined' ? result.text : '';
                                result.s3_key = s3Key;
                                results.push(result);
                                console.log(`[PROCESS DEBUG] Parsed file: ${result.filename}`);
                                resolve();
                            } catch (e) {
                                reject(new Error('Failed to parse Python script output'));
                            }
                        } else {
                            reject(new Error(`Python script failed: ${errorData}`));
                        }
                    });
                });
            } catch (err) {
                // Ensure temp file is cleaned up on error
                try { fs.unlinkSync(tmpFilePath); } catch (e) {}
                throw err;
            }


            // Save result to DynamoDB
            // Extract 'text' from the parser result (if present)
            let parserResult = results[results.length - 1];
            let text = '';
            if (parserResult) {
                if (typeof parserResult === 'object' && parserResult.text) {
                    text = parserResult.text;
                } else if (parserResult.result && parserResult.result.text) {
                    text = parserResult.result.text;
                }
            }
            await dynamodb.put({
                TableName: process.env.AWS_DYNAMODB_TABLE,
                Item: {
                    file_id: fileId,
                    filename: file.originalname,
                    s3_key: s3Key,
                    class: className || '',
                    topic: note || '',
                    processed_date: new Date().toISOString(),
                    result: parserResult,
                    user_id: req.body.user_id || 'default_user',
                    text: text // <-- Store text at top level for embedding
                }
            }).promise();
        }

        // Run embedding process
        console.log('[DEBUG] Starting embedding for all parsed files...');
        const embedProcess = spawn('python3', [
            path.join(__dirname, '..', '..', 'src', 'parsers', 'embed_parser.py')
        ]);

        let embedError = '';
        embedProcess.stderr.on('data', (data) => {
            embedError += data.toString();
        });

        await new Promise((resolve, reject) => {
            embedProcess.on('close', (code) => {
                if (code === 0) {
                    console.log('[DEBUG] Embedding completed successfully.');
                    resolve();
                } else {
                    console.error('[DEBUG] Embed script error output:', embedError);
                    reject(new Error(`Embedding process failed: ${embedError}`));
                }
            });
        });

        console.log('[DEBUG] Final results being sent to frontend:', JSON.stringify(results, null, 2));
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
  console.log('[API/Search] Received search request:', req.body);

    try {
        const { query, user_id } = req.body;
        if (!query) {
            console.warn('[API/Search] Missing search query');
            return res.status(400).json({ error: 'Missing search query' });
        }

        console.log(`[API/Search] Starting vector DB search for query:`, query, 'user_id:', user_id);
        // Build collection name for user-specific search
        const collection = `user_${user_id}`;
        const args = [
            path.join(__dirname, '..', '..', 'src', 'parsers', 'test_embeddings.py'),
            '--query', query,
            '--collection', collection,
            '--n-results', '5'
        ];
        if (req.body.topic) {
            console.log('[API/Search] Passing topic as metadata filter:', req.body.topic);
            args.push('--topic', req.body.topic);
        }
        console.log('[API/Search] Spawning Python search process with args:', args);
        const searchProcess = spawn('python3', args);

        let searchOutput = '';
        let searchError = '';

        searchProcess.stdout.on('data', (data) => {
            console.log('[API/Search] Python stdout:', data.toString());
            searchOutput += data.toString();
        });

        searchProcess.stderr.on('data', (data) => {
            console.error('[API/Search] Python stderr:', data.toString());
            searchError += data.toString();
        });

        await new Promise((resolve, reject) => {
            searchProcess.on('close', (code) => {
                console.log(`[API/Search] Python process exited with code ${code}`);
                if (code === 0) {
                    resolve();
                } else {
                    // Log the full Python error output for debugging
                    console.error('Search script error output:', searchError);
                    reject(new Error(`Search failed: ${searchError}`));
                }
            });
        });

        try {
            console.log('[API/Search] Parsing Python output...');
            // Split output into lines and find the first non-empty one
            const lines = searchOutput.split('\n').map(line => line.trim()).filter(line => line);
            if (lines.length === 0) {
                console.warn('[API/Search] No output from Python search script.');
                return res.status(200).json([]);
            }
            const results = JSON.parse(lines[0]);
            console.log('[API/Search] Final results sent to client:', results);
            res.json(results);
        } catch (parseError) {
            console.error('Failed to parse search results:', searchOutput);
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