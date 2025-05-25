import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [serverPort, setServerPort] = useState(5001);
    const [parsingStatus, setParsingStatus] = useState({});

    useEffect(() => {
        // Check server health and get port
        const checkServer = async () => {
            try {
                const response = await axios.get('http://localhost:5001/api/health');
                setServerPort(response.data.port);
            } catch (err) {
                try {
                    const response = await axios.get('http://localhost:5002/api/health');
                    setServerPort(response.data.port);
                } catch (err) {
                    setError('Server is not available');
                }
            }
        };
        checkServer();
    }, []);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const validFiles = selectedFiles.filter(file => {
            const fileType = file.type;
            return fileType === 'application/pdf' || fileType === 'audio/mp3' || fileType === 'audio/mpeg';
        });

        if (validFiles.length !== selectedFiles.length) {
            setError('Only PDF and MP3 files are allowed');
        } else {
            setError(null);
            setFiles(validFiles);
        }
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const uploadPromises = files.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                console.log('Uploading file:', file.name); // Debug log
                const response = await axios.post(
                    `http://localhost:${serverPort}/api/upload`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
                console.log('Upload response:', response.data); // Debug log

                return {
                    file,
                    status: 'uploaded',
                    response: response.data
                };
            });

            const results = await Promise.all(uploadPromises);
            setUploadedFiles(results);
            setFiles([]);
        } catch (err) {
            console.error('Upload error:', err); // Debug log
            setError(err.response?.data?.error || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleParse = async () => {
        if (uploadedFiles.length === 0) return;

        setLoading(true);
        setError(null);

        try {
            const parsePromises = uploadedFiles.map(async (fileData) => {
                setParsingStatus(prev => ({
                    ...prev,
                    [fileData.file.name]: 'parsing'
                }));

                const response = await axios.post(
                    `http://localhost:${serverPort}/api/process`,
                    { filename: fileData.file.name },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                setParsingStatus(prev => ({
                    ...prev,
                    [fileData.file.name]: 'completed'
                }));

                return {
                    ...fileData,
                    parseResult: response.data
                };
            });

            const results = await Promise.all(parsePromises);
            setUploadedFiles(results);
        } catch (err) {
            setError(err.response?.data?.error || 'Parsing failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="file-upload">
            <h2>Upload Files</h2>
            <div className="upload-section">
                <input
                    type="file"
                    accept=".pdf,.mp3"
                    multiple
                    onChange={handleFileChange}
                    disabled={loading}
                />
                <button 
                    onClick={handleUpload} 
                    disabled={files.length === 0 || loading}
                >
                    {loading ? 'Uploading...' : 'Upload Files'}
                </button>
            </div>

            {error && <div className="error">{error}</div>}
            
            {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                    <h3>Uploaded Files:</h3>
                    <ul>
                        {uploadedFiles.map((fileData, index) => (
                            <li key={index}>
                                {fileData.file.name}
                                <span className={`status ${parsingStatus[fileData.file.name] || 'pending'}`}>
                                    {parsingStatus[fileData.file.name] || 'Pending'}
                                </span>
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={handleParse}
                        disabled={loading || Object.values(parsingStatus).some(status => status === 'parsing')}
                    >
                        {loading ? 'Parsing...' : 'Parse Files'}
                    </button>
                </div>
            )}

            {uploadedFiles.some(file => file.parseResult) && (
                <div className="results">
                    <h3>Results:</h3>
                    {uploadedFiles.map((fileData, index) => (
                        fileData.parseResult && (
                            <div key={index} className="result-item">
                                <h4>{fileData.file.name}</h4>
                                <pre>{JSON.stringify(fileData.parseResult, null, 2)}</pre>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload; 