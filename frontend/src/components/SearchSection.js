import React, { useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

export default function SearchSection({ onSearch, searchResults = [], isSearching = false }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (onSearch) onSearch(searchQuery);
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search Documents
        </CardTitle>
        <CardDescription>Search through your parsed documents to find relevant information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex gap-2">
            <Input
              placeholder="Enter search query..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-4 mt-6">
              <div className="text-sm font-medium">Search Results ({searchResults.length})</div>

              <div className="space-y-4">
                {searchResults.map((result) => (
                  <div key={result.id || result.filename} className="rounded-lg border bg-white p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-medium">{result.filename}</div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Score: {result.similarity_score ? result.similarity_score.toFixed(2) : result.score?.toFixed(2)}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {result.className || result.class}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {result.topic}
                      </Badge>
                    </div>

                    <div className="text-sm bg-slate-50 p-3 rounded-md">
                      <div className="font-medium text-slate-700 mb-1">Matched Text:</div>
                      <div className="text-slate-600" dangerouslySetInnerHTML={{ __html: result.matchedText || result.text }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
