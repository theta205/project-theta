import React, { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

// TODO: Replace with real results from props or context
const mockResults = [];

export default function ResultsSection({ results = mockResults }) {
  const [expandedResults, setExpandedResults] = useState([]);

  const toggleExpand = (id) => {
    setExpandedResults((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Parsing Results
        </CardTitle>
        <CardDescription>View the extracted information from your parsed documents</CardDescription>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id || result.filename} className="rounded-lg border bg-white overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium">{result.filename}</div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {result.className || result.class}
                      </Badge>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-100">
                        {result.topic}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="text-sm font-medium text-slate-700 mb-1">Extracted Text:</div>
                      <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">{result.text || result.extractedText}</div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between mt-2 text-slate-600"
                      onClick={() => toggleExpand(result.id || result.filename)}
                    >
                      <span>Raw JSON Data</span>
                      {expandedResults.includes(result.id || result.filename) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>

                    {expandedResults.includes(result.id || result.filename) && (
                      <div className="text-xs font-mono bg-slate-900 text-slate-100 p-3 rounded-md overflow-x-auto">
                        <pre>{JSON.stringify(result, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No parsing results yet. Upload and parse files to see results here.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
