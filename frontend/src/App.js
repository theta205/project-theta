import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Theta</h1>
        <p>Upload your lecture materials for processing</p>
      </header>
      <main>
        <FileUpload />
      </main>
    </div>
  );
}

export default App; 