import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const UserCollectionView = () => {
  const { collectionName } = useParams();
  const [chunks, setChunks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChunks = async () => {
      setLoading(true);
      setError(null);
      console.log('[UserCollectionView] Fetching collection:', collectionName);
      const url = `/api/collection/${collectionName}`;
      console.log('[UserCollectionView] Request URL:', url);
      try {
        const res = await axios.get(url);
        console.log('[UserCollectionView] Response data:', res.data);
        setChunks(res.data.chunks || []);
      } catch (err) {
        // Log the entire error object for debugging
        console.error('[UserCollectionView] Error fetching collection:', err);
        if (err.response) {
          console.error('[UserCollectionView] Error response data:', err.response.data);
        }
        setError(
          (err.response && err.response.data && err.response.data.error)
            ? `${err.response.data.error} (status ${err.response.status})`
            : err.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchChunks();
  }, [collectionName]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Collection: {collectionName}</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {chunks.length === 0 && !loading && !error && <p>No chunks found for this collection.</p>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {chunks.map((chunk, i) => (
          <div key={chunk.id || i} style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, width: 400, background: '#fafbfc' }}>
            <h4>Chunk #{i + 1} (ID: {chunk.id || 'N/A'})</h4>
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', background: '#f4f4f4', padding: 8 }}>{chunk.text?.slice(0, 500) || ''}{chunk.text?.length > 500 ? '...' : ''}</pre>
            <div style={{ fontSize: 12, color: '#555', marginTop: 8 }}>
              <strong>Metadata:</strong>
              <pre style={{ background: '#f9f9f9', padding: 4, borderRadius: 4 }}>{JSON.stringify(chunk.metadata || chunk, null, 2)}</pre>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserCollectionView;
