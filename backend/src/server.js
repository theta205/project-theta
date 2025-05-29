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

// List all ChromaDB collections
app.get('/api/collections', async (req, res) => {
    const pythonScript = path.resolve(__dirname, '../../src/parsers/list_collections.py');
    const python = spawn('python3', [pythonScript]);
    let data = '';
    let errData = '';
    python.stdout.on('data', chunk => data += chunk);
    python.stderr.on('data', err => errData += err.toString());
    python.on('close', code => {
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                res.status(500).json(parsed);
            } else {
                res.json(parsed);
            }
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse Python output', details: data, stderr: errData });
        }
    });
});

// ChromaDB collection dump endpoint for debugging
app.get('/api/collection/:collectionName', async (req, res) => {
    const { collectionName } = req.params;
    const pythonScript = path.resolve(__dirname, '../../src/parsers/dump_collection.py');
    const command = `python3 ${pythonScript} ${collectionName}`;
    console.log(`[COLLECTION DEBUG] Requested collection: ${collectionName}`);
    console.log(`[COLLECTION DEBUG] Python script path: ${pythonScript}`);
    console.log(`[COLLECTION DEBUG] Running command: ${command}`);
    const python = spawn('python3', [pythonScript, collectionName]);
    let data = '';
    let errData = '';
    python.stdout.on('data', chunk => {
        data += chunk;
        console.log(`[COLLECTION DEBUG] stdout: ${chunk}`);
    });
    python.stderr.on('data', err => {
        errData += err.toString();
        console.error(`[COLLECTION DEBUG] stderr: ${err}`);
    });
    python.on('close', code => {
        console.log(`[COLLECTION DEBUG] Python process exited with code: ${code}`);
        try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
                console.warn(`[COLLECTION DEBUG] Collection error: ${parsed.error}`);
                res.status(404).json(parsed);
            } else {
                res.json(parsed);
            }
        } catch (e) {
            console.error('[COLLECTION DEBUG] Failed to parse Python output:', e);
            res.status(500).json({ error: 'Failed to parse Python output', details: data, stderr: errData });
        }
    });
    python.on('error', err => {
        console.error('[COLLECTION DEBUG] Failed to start Python process:', err);
        res.status(500).json({ error: 'Failed to start Python process', details: err.message });
    });
});

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
        // Use file_id as the S3 key for consistency across endpoints
        const s3Key = `uploads/${fileId}`;
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

        // Check again for existing record just before insert to prevent race conditions
        const normalizedUserId = userId.startsWith('user_') ? userId.slice(5) : userId;
        const existingUpload = await dynamodb.get({
            TableName: process.env.AWS_DYNAMODB_TABLE,
            Key: {
                user_id: normalizedUserId,
                file_id: fileId
            }
        }).promise();
        if (!existingUpload.Item) {
            try {
                // Only store allowed metadata fields, never the file's text/content
                await dynamodb.put({
                    TableName: process.env.AWS_DYNAMODB_TABLE,
                    Item: {
                        user_id: normalizedUserId,
                        file_id: fileId,
                        // Strip user_id prefix if present (e.g., user_<id>_filename.pdf)
                        filename: (() => {
                            const match = fileId.match(/^user_[^_]+_(.+)$/);
                            return match ? match[1] : fileId;
                        })(),
                        s3_key: s3Key,
                        uploaded_at: new Date().toISOString(),
                        class: req.body.class || '',
                        topic: req.body.topic || '',
                        file_type: req.body.file_type || '',
                        num_pages: undefined
                        // Do NOT include 'text' or file contents here
                    }
                }).promise();
                console.log(`[UPLOAD DEBUG] File registered in DynamoDB: user_id=${normalizedUserId}, file_id=${fileId}`);
            } catch (ddbErr) {
                console.error('[UPLOAD ERROR] Failed to register file in DynamoDB:', ddbErr);
                return res.status(500).json({ error: 'Failed to register file in DynamoDB', details: ddbErr.message });
            }
        } else {
            console.log(`[UPLOAD DEBUG] File already registered in DynamoDB: user_id=${normalizedUserId}, file_id=${fileId}`);
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

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            // Accept file_id from frontend (array or single value)
            let fileId = req.body.file_id;
            if (Array.isArray(fileId)) {
                fileId = fileId[i];
            }
            if (!fileId) {
                // fallback for legacy clients
                fileId = `${req.body.user_id || 'unknown'}_${file.originalname}`;
                console.warn(`[PROCESS WARNING] No file_id provided by frontend, using fallback: ${fileId}`);
            }
            const s3Key = `uploads/${fileId}`;

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
            const supportedFiletypes = require('./supported_filetypes');

            // Generate a secure temp file path
            const tmpDir = os.tmpdir();
            const tmpFilePath = pathTmp.join(tmpDir, `${fileId}${fileExt}`);
            fs.writeFileSync(tmpFilePath, file.buffer);
            console.log(`[PROCESS DEBUG] Saved temp file for parsing: ${tmpFilePath}`);

            let pdfPath = tmpFilePath;
            let tempPdfToDelete = null;
            if (!isAudio && fileExt !== '.pdf' && supportedFiletypes.includes(fileExt)) {
                // Convert to PDF using toPdf.py
                const { spawnSync } = require('child_process');
                const pdfOutputPath = pathTmp.join(tmpDir, `${fileId}.pdf`);
                console.log(`[PROCESS DEBUG] Converting ${tmpFilePath} to PDF at ${pdfOutputPath}`);
                const convertResult = spawnSync('python3', [
                    path.join(__dirname, '..', '..', 'src', 'parsers', 'toPdf.py'),
                    tmpFilePath,
                    tmpDir
                ], { encoding: 'utf-8' });
                if (convertResult.status === 0 && fs.existsSync(pdfOutputPath)) {
                    pdfPath = pdfOutputPath;
                    tempPdfToDelete = pdfOutputPath;
                    console.log(`[PROCESS DEBUG] File converted to PDF: ${pdfOutputPath}`);
                } else {
                    const errMsg = convertResult.stderr || (convertResult.stdout ? convertResult.stdout : 'Unknown error during PDF conversion');
                    throw new Error(`[PROCESS ERROR] PDF conversion failed for ${tmpFilePath}: ${errMsg}`);
                }
            }

            let outputData = '';
            let errorData = '';
            let pythonProcess;
            // NOTE: No processed results are written to disk. All persistent storage is handled by ChromaDB and DynamoDB/S3.
            try {
                // Run parser, passing the PDF temp file path (converted or original)
                pythonProcess = spawn('python3', [
                    path.join(__dirname, '..', '..', 'src', 'parsers', parserScript),
                    pdfPath
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
                        // Clean up PDF conversion temp file if needed
                        if (tempPdfToDelete) {
                            fs.unlink(tempPdfToDelete, (err) => {
                                if (err) {
                                    console.error('Failed to delete temp PDF:', tempPdfToDelete, err);
                                }
                            });
                        }
                        if (code === 0) {
                            try {
                                const result = JSON.parse(outputData);
                                // Ensure all required fields are present for frontend display
                                result.filename = result.filename || file.originalname;
                                result.class = typeof result.class !== 'undefined' ? result.class : (className || '');
                                result.topic = typeof result.topic !== 'undefined' ? result.topic : (note || '');
                                result.text = typeof result.text !== 'undefined' ? result.text : '';
                                result.s3_key = s3Key;
                                result.file_id = fileId; // Ensure file_id is always present
                                let userId = req.body.user_id || 'default_user';
                                result.user_id = userId; 
                                console.log(`[PROCESS DEBUG] Used user_id for file ${result.filename}:`, userId);
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


            // Save result to DynamoDB (never store 'text' content)
            let parserResult = results[results.length - 1];
            // Check if file is already registered in DynamoDB before inserting
            const existing = await dynamodb.get({
                TableName: process.env.AWS_DYNAMODB_TABLE,
                Key: {
                    user_id: parserResult.user_id,
                    file_id: parserResult.file_id
                }
            }).promise();
            if (!existing.Item) {
                // Only store allowed metadata fields, never 'text' or 'result'
                await dynamodb.put({
                    TableName: process.env.AWS_DYNAMODB_TABLE,
                    Item: {
                        user_id: parserResult.user_id,
                        file_id: parserResult.file_id,
                        // Always store just the original filename (no user_id prefix)
                        filename: file.originalname,
                        s3_key: parserResult.s3_key,
                        uploaded_at: new Date().toISOString(),
                        class: (typeof parserResult.class !== 'undefined' && parserResult.class !== null && parserResult.class !== '') ? parserResult.class : (className || ''),
                        topic: (typeof parserResult.topic !== 'undefined' && parserResult.topic !== null && parserResult.topic !== '') ? parserResult.topic : (note || ''),
                        file_type: parserResult.file_type || '',
                        num_pages: parserResult.num_pages || undefined
                        // Do NOT include 'text' or 'result' fields here
                    }
                }).promise();
            } else {
                console.log(`[PROCESS DEBUG] File already registered in DynamoDB: user_id=${parserResult.user_id}, file_id=${parserResult.file_id}`);
            }
        }

        // Run embedding process and send parsed results as JSON via stdin
        console.log('[DEBUG] Starting embedding for all parsed files (passing results as stdin)...');
        const embedProcess = spawn('python3', [
            path.join(__dirname, '..', '..', 'src', 'parsers', 'embed_parser.py')
        ], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let embedError = '';
        let embedOutput = '';
        embedProcess.stderr.on('data', (data) => {
            embedError += data.toString();
            console.error('[EMBED STDERR]', data.toString());
        });
        embedProcess.stdout.on('data', (data) => {
            embedOutput += data.toString();
            console.log('[EMBED STDOUT]', data.toString());
        });

        // Write the results array as JSON to stdin of embed_parser
        embedProcess.stdin.write(JSON.stringify(results));
        embedProcess.stdin.end();

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
        let collection = user_id;
        if (!collection.startsWith('user_')) {
            collection = `user_${collection}`;
        }
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