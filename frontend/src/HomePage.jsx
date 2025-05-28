import React, { useState } from "react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import FileUpload from "./components/FileUpload";
import ResultsSection from "./components/ResultsSection";
import SearchSection from "./components/SearchSection";

export default function HomePage() {
  // Print the Clerk user object to console on render
  React.useEffect(() => {
    if (window.Clerk && window.Clerk.user) {
      const user = window.Clerk.user;
      // Try common Clerk username fields
      const username = user.username || (user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : null) || user.id || null;
      if (username) {
        console.log('[HomePage] Username:', username);
      } else {
        console.log('[HomePage] No username found in Clerk user object:', user);
      }
    } else {
      console.log('[HomePage] No Clerk user found.');
    }
  }, []);
  // State to pass results between FileUpload and ResultsSection
  const [results, setResults] = useState([]);
  // State for search
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Handler to receive results from FileUpload
  const handleResults = (res) => setResults(res);

  // Handler for search
  const handleSearch = async (query) => {
    setIsSearching(true);
    setSearchResults([]);
    try {
      if (!query.trim()) {
        console.warn('[SearchSection] Empty query');
        setIsSearching(false);
        return;
      }
      if (!window.Clerk?.user?.id) {
        console.warn('[SearchSection] No user id');
        setIsSearching(false);
        return;
      }
      console.log('[SearchSection] Query:', query);
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user_id: window.Clerk.user.id }),
      });
      const data = await response.json();
      console.log('[SearchSection] Response:', data);
      setSearchResults(Array.isArray(data.results) ? data.results : []);
    } catch (err) {
      console.error('[SearchSection] Error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 py-8 px-2">
      <SignedOut>
        <h1 className="text-3xl font-bold mb-2">Welcome to Project Theta</h1>
        <p className="mb-4">Please sign in to continue.</p>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <div className="w-full max-w-2xl space-y-8">
          <h1 className="text-3xl font-bold text-center mb-2">Project Theta</h1>
          <FileUpload onResults={handleResults} />
          <ResultsSection results={results} />
          <SearchSection onSearch={handleSearch} searchResults={searchResults} isSearching={isSearching} />
        </div>
      </SignedIn>
    </div>
  );
}
