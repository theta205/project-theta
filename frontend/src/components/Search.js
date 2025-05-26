import React, { useState } from 'react';
import axios from 'axios';
import './Search.css';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!query.trim()) {
            alert('Please enter a search query');
            return;
        }

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            const response = await axios.post('http://localhost:5001/api/search', {
                query: query
            });

            setResults(response.data.results);
        } catch (err) {
            setError(err.response?.data?.error || 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="search-container">
            <div className="search-section">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your search query"
                    className="search-input"
                />
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="search-button"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="results-section">
                    <h3>Search Results:</h3>
                    {results.map((result, index) => (
                        <div key={index} className="result-item">
                            <h4>File: {result.filename}</h4>
                            <p>Class: {result.class}</p>
                            <p>Topic: {result.topic}</p>
                            <p>Similarity Score: {result.similarity_score.toFixed(4)}</p>
                            <p>Text: {result.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search; 