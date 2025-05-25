const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../../data/raw/'));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ status: 'ok', port: process.env.PORT || 5001 });
});

// File processing endpoint
router.post('/process', async (req, res) => {
    try {
        const { filename } = req.body;
        if (!filename) {
            return res.status(400).json({ error: 'No filename provided' });
        }

        // Determine file type and run appropriate parser
        const fileExtension = path.extname(filename).toLowerCase();
        let pythonScript;
        
        if (fileExtension === '.pdf') {
            pythonScript = 'pdf_parser.py';
        } else if (fileExtension === '.mp3') {
            pythonScript = 'audio_parser.py';
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        // Run the appropriate Python script
        const pythonProcess = spawn('python3', [pythonScript, filename]);

        let outputData = '';
        let errorData = '';

        pythonProcess.stdout.on('data', (data) => {
            outputData += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return res.status(500).json({ error: errorData });
            }

            res.json({
                message: 'File processed successfully',
                output: outputData
            });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add this new route for file uploads
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        res.json({
            message: 'File uploaded successfully',
            filename: req.file.originalname
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 