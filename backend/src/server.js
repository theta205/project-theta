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
        cb(null, path.join(__dirname, '../../data/raw/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
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
app.post('/api/process', async (req, res) => {
    console.log('Process endpoint hit');
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'No filename provided' });
        }

        // Determine file type and run appropriate parser
        const fileExtension = path.extname(filename).toLowerCase();
        let pythonScript;
        
        if (fileExtension === '.pdf') {
            pythonScript = path.join(__dirname, '../../src/parsers/pdf_parser.py');
        } else if (fileExtension === '.mp3') {
            pythonScript = path.join(__dirname, '../../src/parsers/audio_parser.py');
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        const filePath = path.join(__dirname, '../../data/raw', filename);
        
        // Debug logging
        console.log('Current directory:', __dirname);
        console.log('Python script path:', pythonScript);
        console.log('File path:', filePath);

        // Use the virtual environment's Python
        const pythonPath = path.join(__dirname, '../../.venv/bin/python3');

        // Run the appropriate Python script with the virtual environment's Python
        const pythonProcess = spawn(pythonPath, [pythonScript, filePath]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            outputData += output;
            console.log('Python output:', output);
        });

        pythonProcess.stderr.on('data', (data) => {
            const error = data.toString();
            errorData += error;
            console.error('Python error:', error);
        });

        pythonProcess.on('close', (code) => {
            console.log('Python process exited with code:', code);
            if (code !== 0) {
                return res.status(500).json({ 
                    error: 'Python script failed',
                    details: errorData
                });
            }

            try {
                // Try to parse the output as JSON
                const result = JSON.parse(outputData);
                res.json(result);
            } catch (e) {
                // If parsing fails, send the raw output
                res.json({
                    message: 'File processed successfully',
                    output: outputData
                });
            }
        });
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