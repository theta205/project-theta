import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import React, { useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/clerk-react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "../components/ui/button";
import "../index.css"
function isValidParsedResult(result) {
  return (
    result &&
    typeof result === "object" &&
    typeof result.text === "string" &&
    result.text.trim().length > 0
  );
}

const FileUpload = () => {
  // File upload and parse state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [className, setClassName] = useState('');
  const [fileTopics, setFileTopics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const { user } = useUser();

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length > 0 && user?.id) {
      const formattedNewFiles = newFiles.map(file => {
        const newFile = new File([file], `${user.id}_${file.name}`, { type: file.type });
        newFile.file_id = `${user.id}_${file.name}`;
        return newFile;
      });
      const uniqueNewFiles = formattedNewFiles.filter(newFile =>
        !selectedFiles.some(existingFile => existingFile.name === newFile.name)
      );
      const updatedFiles = [...selectedFiles, ...uniqueNewFiles].slice(0, 10);
      setSelectedFiles(updatedFiles);
      e.target.value = '';
      if (uniqueNewFiles.length < formattedNewFiles.length) {
        alert('Some files were skipped because they were already selected.');
      }
    } else if (!user?.id) {
      alert('You must be signed in to select files.');
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
      for (const file of selectedFiles) {
        if (!file.file_id) {
          setError('All files must be registered before upload. Please process/register your files first.');
          setLoading(false);
          return;
        }
        formData.append('file', file);
        formData.append('file_id', file.file_id);
      }
      if (user?.id) {
        formData.append('user_id', user.id);
      } else {
        alert("You must be signed in to upload files.");
        return;
      }
      formData.append('className', className);
      selectedFiles.forEach(file => {
        formData.append(`topic_${file.name}`, fileTopics[file.name] || '');
      });

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setResults([response.data]);
        // Automatically trigger parsing after upload
        try {
          const processFormData = new FormData();
          // Attach each file and its file_id
          selectedFiles.forEach(file => {
            processFormData.append('files', file);
            processFormData.append('file_id', file.file_id);
          });

          // Attach user_id from Clerk
          if (user?.id) {
            processFormData.append('user_id', user.id);
          } else {
            console.warn('[FileUpload] No user_id found, aborting parse.');
            setError('You must be signed in to parse files.');
            setLoading(false);
            return;
          }

          processFormData.append('className', className);
          selectedFiles.forEach(file => {
            processFormData.append(`topic_${file.name}`, fileTopics[file.name] || '');
          });

          // Debug: log formData contents
          console.log('[FileUpload] Submitting /api/process with user_id:', user.id);
          for (let pair of processFormData.entries()) {
            console.log(`[FileUpload] FormData: ${pair[0]} =`, pair[1]);
          }

          const processResponse = await axios.post('/api/process', processFormData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          let responseData = processResponse.data.results || processResponse.data;
          let resultsArray = Array.isArray(responseData) ? responseData : [responseData];
          const validResults = resultsArray.filter(isValidParsedResult);
          if (validResults.length > 0) {
            setResults(validResults);
            setError('');
          } else {
            setResults([]);
            let warningMsg = '';
            if (resultsArray.length > 0 && resultsArray[0] && typeof resultsArray[0].text === 'string') {
              warningMsg = resultsArray[0].text;
            } else if (typeof responseData === 'string') {
              warningMsg = responseData;
            } else {
              warningMsg = 'No valid parsed results received. Please check your file or try again.';
            }
            setError(warningMsg);
          }
        } catch (parseErr) {
          setError(parseErr.response?.data?.error || 'Parsing after upload failed');
        }
        setLoading(false);
        return;
      } catch (err) {
        if (err.response && err.response.status === 409) {
          setError('A file with this name already exists.');
        } else {
          setError(err.response?.data?.error || 'Upload failed');
        }
        setLoading(false);
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  // Search handler (fixed state usage)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setSearchLoading(true); // Renamed for clarity
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
      setSearchLoading(false); // Renamed for clarity
    }
  };

  return (
    <Card className="max-w-2xl mx-auto my-8 p-6">
      <CardHeader>
        <h2 className="text-2xl font-bold mb-2">File Upload</h2>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-6">
          <Input
            type="text"
            placeholder="Class Name (optional)"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <Label htmlFor="file-upload" className="font-semibold">Select Files</Label>
          <Input
            id="file-upload"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          {selectedFiles.length > 0 && (
            <div className="bg-muted p-4 rounded-lg mt-2">
              <ul className="flex flex-col gap-2">
                {selectedFiles.map((file, idx) => (
                  <li key={file.name} className="flex items-center gap-3">
                    <span className="truncate font-mono text-sm">{file.name.replace(/^.*?_/, '')}</span>
                    <Input
                      type="text"
                      placeholder="Topic (optional)"
                      value={fileTopics[file.name] || ''}
                      onChange={(e) => handleTopicChange(file.name, e.target.value)}
                      className="flex-1"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}


          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Parsing Results Section */}
        {results && Array.isArray(results) && results.filter(isValidParsedResult).length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Parsing Results</h3>
            <div className="flex flex-col gap-4">
              {results.filter(isValidParsedResult).map((result, index) => (
                <Card key={index} className="result-item">
                  <CardHeader>
                    <span className="font-mono text-sm text-muted-foreground">{result.filename || 'Unknown file'}</span>
                  </CardHeader>
                  <CardContent>
                    <ul className="mb-2">
                      {Object.entries(result).map(([key, value]) => (
                        <li key={key} className="text-sm"><strong>{key}:</strong> {typeof value === 'string' || typeof value === 'number'
                          ? value
                          : <pre className="inline bg-muted px-2 py-1 rounded">{JSON.stringify(value, null, 2)}</pre>
                        }
                        </li>
                      ))}
                    </ul>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs underline">Show Raw Result</summary>
                      <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mt-1">{JSON.stringify(result, null, 2)}</pre>
                    </details>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4 bg-slate-50 rounded-b-lg">
        <div className="text-sm text-slate-500">
          {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
        </div>
        <Button
          type="button"
          disabled={selectedFiles.length === 0 || loading}
          onClick={handleParse}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Parsing...
            </>
          ) : (
            "Parse Files"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUpload;
