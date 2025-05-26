import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileUpload.css';

const FileUpload = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [className, setClassName] = useState('');
    const [fileTopics, setFileTopics] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [results, setResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (newFiles.length > 0) {
            // Filter out duplicates by checking if the file name already exists
            const uniqueNewFiles = newFiles.filter(newFile => 
                !selectedFiles.some(existingFile => existingFile.name === newFile.name)
            );

            // Add only unique files to the list, up to 10 total
            const updatedFiles = [...selectedFiles, ...uniqueNewFiles].slice(0, 10);
            setSelectedFiles(updatedFiles);
            e.target.value = '';

            // Show alert if any duplicates were found
            if (uniqueNewFiles.length < newFiles.length) {
                alert('Some files were skipped because they were already selected.');
            }
        }
    };

    const handleTopicChange = (fileName, topic) => {
        setFileTopics(prev => ({
            ...prev,
            [fileName]: topic
        }));
    };

    const handleParse = async () => {
        if (!selectedFiles.length) {
            alert('Please select at least one file');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });
            formData.append('className', className);
            selectedFiles.forEach(file => {
                formData.append(`topic_${file.name}`, fileTopics[file.name] || '');
            });

            const response = await axios.post('http://localhost:5001/api/process', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const processedResults = Array.isArray(response.data) ? response.data : [response.data];
            setResults(processedResults);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process files');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            alert('Please enter a search query');
            return;
        }

        setSearchLoading(true);
        setSearchError(null);
        setSearchResults([]);

        try {
            const response = await axios.post('http://localhost:5001/api/search', {
                query: searchQuery
            });

            console.log('Search response:', response.data);

            if (response.data.error) {
                setSearchError(response.data.error);
                return;
            }

            const results = response.data.results || response.data;
            console.log('Processed results:', results);

            if (typeof results === 'string') {
                try {
                    const parsedResults = JSON.parse(results);
                    setSearchResults(Array.isArray(parsedResults) ? parsedResults : [parsedResults]);
                } catch (e) {
                    console.error('Failed to parse results:', e);
                    setSearchError('Invalid response format');
                }
            } else {
                setSearchResults(Array.isArray(results) ? results : [results]);
            }
        } catch (err) {
            console.error('Search error:', err);
            setSearchError(err.response?.data?.error || 'Search failed');
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    return (
        <div className="file-upload-container">
            <div className="upload-section">
                <input
                    type="text"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    placeholder="Enter class name"
                    className="class-input"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    multiple
                    accept=".pdf,.mp3,.wav,.m4a,.docx,.doc,.md,.txt,.html,.odt,.pptx,.ppt,.xls,.xlsx"
                />
            </div>

            {selectedFiles.length > 0 && (
                <div className="selected-files">
                    <h3>Selected Files ({selectedFiles.length}/10):</h3>
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>
                                <div className="file-item">
                                    <span className="file-name">{file.name}</span>
                                    <input
                                        type="text"
                                        value={fileTopics[file.name] || ''}
                                        onChange={(e) => handleTopicChange(file.name, e.target.value)}
                                        placeholder="Enter topic (optional)"
                                        className="topic-input"
                                    />
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button 
                        onClick={handleParse}
                        disabled={loading || !selectedFiles.length}
                        className="parse-button"
                    >
                        {loading ? 'Processing...' : 'Ready to Parse'}
                    </button>
                </div>
            )}

            <div className="search-section">
                <h3>Search Uploaded Content</h3>
                <div className="search-input-group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter your search query"
                        className="search-input"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={searchLoading}
                        className="search-button"
                    >
                        {searchLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {searchError && (
                    <div className="error-message">
                        {searchError}
                    </div>
                )}

                {Array.isArray(searchResults) && searchResults.length > 0 && (
                    <div className="search-results">
                        <h4>Search Results:</h4>
                        {searchResults.map((result, index) => (
                            <div key={index} className="search-result-item">
                                <div className="result-header">
                                    <span className="result-filename">{result?.filename || 'Unknown'}</span>
                                    <span className="result-score">
                                        Score: {(result?.similarity_score || 0).toFixed(4)}
                                    </span>
                                </div>
                                <div className="result-metadata">
                                    <span className="result-class">Class: {result?.class || 'Not specified'}</span>
                                    <span className="result-topic">Topic: {result?.topic || 'Not specified'}</span>
                                </div>
                                <p className="result-text">{result?.text || 'No text content'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="results-section">
                    <h3>Parsing Results:</h3>
                    {results.map((result, index) => (
                        <div key={index} className="result-item">
                            <h4>File: {result?.filename || 'Unknown'}</h4>
                            <p>Class: {result?.class || 'Not specified'}</p>
                            {result?.topic && <p>Topic: {result.topic}</p>}
                            <p>Text: {result?.text || 'No text content'}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUpload; 
