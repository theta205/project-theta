const express = require('express');
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
const cors = require('cors');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5001;

// Create necessary directories if they don't exist
const dirs = ['data/raw', 'data/processed/test_class'];
dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Enable CORS with specific options
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from React app
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);  // Use the absolute path
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', port: port });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
    console.log('Upload endpoint hit'); // Debug log
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    if (!req.file) {
        console.log('No file in request'); // Debug log
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
        message: 'File uploaded successfully',
        filename: req.file.originalname
    });
});

// File processing endpoint
app.post('/api/process', upload.array('files'), async (req, res) => {
    console.log('Process endpoint hit');
    try {
        const files = req.files;
        const { className, note } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files provided' });
        }

        const results = [];

        for (const file of files) {
            // Use let instead of const for filePath since it needs to be updated
            let filePath = path.join(__dirname, '..', '..', 'uploads', file.filename);
            console.log('Processing file at path:', filePath);
            
            const fileExt = path.extname(file.originalname).toLowerCase();
            
            // Check if file needs conversion
            const needsConversion = !['.pdf', '.mp3', '.wav', '.m4a'].includes(fileExt);
            
            if (needsConversion) {
                console.log('Converting file:', filePath);
                // Convert file to PDF using venv Python
                const convertProcess = spawn(path.join(__dirname, '..', '..', '.venv', 'bin', 'python3'), [
                    path.join(__dirname, 'convert_to_pdf.py'),
                    filePath
                ]);

                await new Promise((resolve, reject) => {
                    convertProcess.on('close', (code) => {
                        if (code === 0) {
                            resolve();
                        } else {
                            reject(new Error('Conversion failed'));
                        }
                    });
                });

                // Update file path to the converted PDF
                filePath = filePath.replace(fileExt, '.pdf');
                console.log('Converted file path:', filePath);
            }

            // Determine which parser to use
            const isAudio = ['.mp3', '.wav', '.m4a'].includes(fileExt);
            const parserScript = isAudio ? 'audio_parser.py' : 'pdf_parser.py';

            console.log('Running parser:', parserScript, 'for file:', filePath);

            // Run the appropriate parser using venv Python
            const pythonProcess = spawn(path.join(__dirname, '..', '..', '.venv', 'bin', 'python3'), [
                path.join(__dirname, '..', '..', 'src', 'parsers', parserScript),
                filePath
            ]);

            let outputData = '';
            let errorData = '';

            pythonProcess.stdout.on('data', (data) => {
                console.log('Python stdout:', data.toString());
                outputData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                console.error('Python stderr:', data.toString());
                errorData += data.toString();
            });

            await new Promise((resolve, reject) => {
                pythonProcess.on('close', (code) => {
                    console.log('Python process exited with code:', code);
                    if (code === 0) {
                        try {
                            const result = JSON.parse(outputData);
                            result.class = className || '';
                            result.topic = note || '';
                            results.push(result);
                            resolve();
                        } catch (e) {
                            console.error('Failed to parse Python output:', e);
                            console.error('Raw output:', outputData);
                            reject(new Error('Failed to parse Python script output'));
                        }
                    } else {
                        console.error('Python script failed with error:', errorData);
                        reject(new Error(`Python script failed: ${errorData}`));
                    }
                });
            });

            // Clean up converted files
            if (needsConversion) {
                try {
                    fs.unlinkSync(filePath);
                } catch (err) {
                    console.error('Error cleaning up converted file:', err);
                }
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Process error:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err); // Debug log
    res.status(500).json({ error: 'Something broke!' });
});

// Start server with error handling
const server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Upload endpoint available at: http://localhost:${port}/api/upload`);
    console.log(`Process endpoint available at: http://localhost:${port}/api/process`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Trying port ${parseInt(port) + 1}`);
        server.close();
        app.listen(parseInt(port) + 1);
    } else {
        console.error('Server error:', err);
    }
}); 