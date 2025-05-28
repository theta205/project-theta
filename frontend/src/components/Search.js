import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import './Search.css';

const Search = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { user } = useUser();

    const handleSearch = async () => {
        if (!query.trim()) {
            alert('Please enter a search query');
            return;
        }

        console.log('[VectorDB Search] Query:', query);
        setLoading(true);
        setError(null);
        setResults([]);

        try {
            if (!user?.id) {
                alert("You must be signed in to search.");
                return;
            }
            console.log('[VectorDB Search] Sending POST /api/search ...');
            const response = await axios.post('/api/search', {
                query: query,
                user_id: user.id,
            });
            console.log('[VectorDB Search] Response:', response.data);
            setResults(Array.isArray(response.data.results) ? response.data.results : []);
        } catch (err) {
            console.error('[VectorDB Search] Error:', err);
            setError(err.response?.data?.error || 'Search failed');
        } finally {
            setLoading(false);
            console.log('[VectorDB Search] Done');
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

            {Array.isArray(results) && results.length > 0 && (
                <div className="results-section">
                    <h3>Search Results:</h3>
                    {(results || []).map((result, index) => (
                        <div key={index} className="result-item">
                            <h4>File: {result.filename}</h4>
                            <p>Class: {result.class}</p>
                            <p>Topic: {result.topic}</p>
                            <p>Similarity Score: {result.similarity_score?.toFixed ? result.similarity_score.toFixed(4) : result.similarity_score}</p>
                            <p>Text: {result.text}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Search; 