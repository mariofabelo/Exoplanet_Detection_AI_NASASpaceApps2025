"use client";

import { useState } from "react";
import { runModelOnDataset, ModelResults, PredictionResult } from "@/lib/runModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ModelResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'metrics' | 'predictions'>('metrics');
  const [isDragOver, setIsDragOver] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  const handleRunModel = async () => {
    if (!file) return alert("Please upload a CSV file first.");
    setLoading(true);
    try {
      const data = await runModelOnDataset(file);
      setResults(data);
    } catch (err) {
      console.error(err);
      alert("Error running model.");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (droppedFile.type === 'text/csv' || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Please upload a CSV file.');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Prepare chart data for metrics
  const metricsChartData = results
    ? Object.entries(results.test_set).map(([key, value]) => ({ 
        metric: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()), 
        value: value as number 
      }))
    : [];

  // Prepare data for prediction accuracy pie chart
  const predictionAccuracy = results ? (() => {
    const correct = results.predictions.filter(p => p.prediction === p.actual).length;
    const total = results.predictions.length;
    return [
      { name: 'Correct', value: correct, color: '#10B981' },
      { name: 'Incorrect', value: total - correct, color: '#EF4444' }
    ];
  })() : [];

  // Filter predictions based on classification filter
  const filteredPredictions = results ? (() => {
    switch (classificationFilter) {
      case 'correct':
        return results.predictions.filter(p => p.prediction === p.actual);
      case 'incorrect':
        return results.predictions.filter(p => p.prediction !== p.actual);
      default:
        return results.predictions;
    }
  })() : [];

  return (
    <div className="min-h-screen bg-gradient-research">
      <div className="flex flex-col items-center justify-center p-6 space-y-8 min-h-screen max-w-7xl mx-auto">
        {/* Scientific Header */}
        <div className="text-center space-y-3 animate-fade-in">
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-metric">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">ML Research Platform</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-bold scientific-header text-gray-900">
              Exoplanet Classification Model
            </h1>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span>RandomForest Algorithm</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span>Kepler Dataset Analysis</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                <span>Performance Metrics</span>
              </span>
            </div>
          </div>
          
          <p className="text-lg text-gray-700 max-w-4xl leading-relaxed">
            Analyse exoplanet candidate data using our trained machine learning models.
          </p>
        </div>

        {/* Data Input Section */}
        <Card className="w-full max-w-4xl research-card shadow-research animate-slide-up">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl scientific-header text-gray-900">
              Dataset Input
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload CSV files containing exoplanet candidate data for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <label 
                  htmlFor="csv-upload"
                  className="block cursor-pointer"
                >
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 bg-gray-50 hover:bg-gray-100 group ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className={`mx-auto w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                        isDragOver 
                          ? 'bg-blue-100' 
                          : 'bg-gray-200 group-hover:bg-gray-300'
                      }`}>
                        <svg className={`w-6 h-6 transition-colors duration-200 ${
                          isDragOver 
                            ? 'text-blue-600' 
                            : 'text-gray-600 group-hover:text-gray-700'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className={`font-medium transition-colors duration-200 ${
                          isDragOver 
                            ? 'text-blue-600' 
                            : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {isDragOver 
                            ? 'Drop CSV file here' 
                            : file 
                              ? file.name 
                              : 'Select or drag CSV file'
                          }
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Required format: CSV with stellar and orbital parameters
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
            
            <Button 
              onClick={handleRunModel} 
              disabled={!file || loading}
              className="w-full h-12 text-base font-medium"
              variant={file ? "default" : "secondary"}
            >
              {loading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span>Processing Dataset...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Execute Model Analysis</span>
                </div>
              )}
            </Button>
            
            {file && (
              <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-green-800 font-medium text-sm">
                    Dataset loaded: {file.name}
                  </p>
                  <p className="text-green-600 text-xs">
                    Ready for machine learning analysis
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {results && (
          <Card className="w-full max-w-7xl research-card shadow-data animate-slide-up">
            <CardContent className="p-8">
              <div className="flex justify-center mb-8">
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                  <button
                    onClick={() => setSelectedTab('metrics')}
                    className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                      selectedTab === 'metrics'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span>Model Performance</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setSelectedTab('predictions')}
                    className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                      selectedTab === 'predictions'
                        ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Classification Results ({results.predictions.length})</span>
                    </div>
                  </button>
                </div>
              </div>

              {selectedTab === 'metrics' && (
                <div className="space-y-8">
                  <div className="text-center space-y-3 border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold scientific-header text-gray-900">
                      Model Performance Analysis
                    </h2>
                    <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="data-metric">Execution Time: {results.runtime_seconds}s</span>
                      </div>
                      <div className="w-px h-4 bg-gray-300"></div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="data-metric">Samples: {results.predictions.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Performance Metrics */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold scientific-header text-gray-900 mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span>Classification Metrics</span>
                      </h3>
                      {Object.entries(results.test_set).map(([key, value], index) => (
                        <div key={key} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <div className="flex items-center space-x-3">
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-metric rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${((value as number) * 100).toFixed(1)}%` }}
                                ></div>
                              </div>
                              <span className="text-lg font-bold data-metric text-gray-900 min-w-[3.5rem] text-right">
                                {((value as number) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Data Visualizations */}
                    <div className="space-y-6">
                      {/* Performance Chart */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-metric">
                        <h3 className="text-lg font-semibold scientific-header text-gray-900 mb-4 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <span>Performance Metrics</span>
                        </h3>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={metricsChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                              <XAxis 
                                dataKey="metric" 
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                angle={-45}
                                textAnchor="end"
                                height={80}
                              />
                              <YAxis 
                                domain={[0, 1]} 
                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                              />
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  color: '#374151',
                                  fontSize: '12px'
                                }}
                                formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Score']}
                                labelFormatter={(label) => `${label}`}
                              />
                              <Bar 
                                dataKey="value" 
                                fill="url(#scientificBar)"
                                radius={[4, 4, 0, 0]}
                              />
                              <defs>
                                <linearGradient id="scientificBar" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" />
                                  <stop offset="100%" stopColor="#1d4ed8" />
                                </linearGradient>
                              </defs>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Classification Accuracy Chart */}
                      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-metric">
                        <h3 className="text-lg font-semibold scientific-header text-gray-900 mb-4 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Classification Accuracy</span>
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={predictionAccuracy}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                                labelLine={false}
                              >
                                {predictionAccuracy.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip 
                                contentStyle={{
                                  backgroundColor: 'white',
                                  border: '1px solid #e5e7eb',
                                  borderRadius: '8px',
                                  color: '#374151',
                                  fontSize: '12px'
                                }}
                                formatter={(value) => [value, 'Samples']} 
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'predictions' && (
                <div className="space-y-6">
                  <div className="text-center space-y-4 border-b border-gray-200 pb-6">
                    <h2 className="text-2xl font-bold scientific-header text-gray-900">
                      Classification Results
                    </h2>
                    <p className="text-gray-600">
                      Showing {filteredPredictions.length} of {results.predictions.length} total classifications
                    </p>
                    
                    {/* Filter Controls */}
                    <div className="flex justify-center">
                      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                          onClick={() => setClassificationFilter('all')}
                          className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                            classificationFilter === 'all'
                              ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          All ({results.predictions.length})
                        </button>
                        <button
                          onClick={() => setClassificationFilter('correct')}
                          className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                            classificationFilter === 'correct'
                              ? 'bg-white text-green-600 shadow-sm border border-gray-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Correct ({results.predictions.filter(p => p.prediction === p.actual).length})</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setClassificationFilter('incorrect')}
                          className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                            classificationFilter === 'incorrect'
                              ? 'bg-white text-red-600 shadow-sm border border-gray-200'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Incorrect ({results.predictions.filter(p => p.prediction !== p.actual).length})</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 shadow-metric overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepler Object</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Class</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">True Class</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPredictions.map((pred, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-sm data-metric text-gray-900">
                                  {pred.kepoi_name}
                                </code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.prediction === 1 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {pred.prediction === 1 ? 'CANDIDATE' : 'CONFIRMED'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.actual === 1 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {pred.actual === 1 ? 'CANDIDATE' : 'CONFIRMED'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.prediction === pred.actual
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {pred.prediction === pred.actual ? (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      Correct
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      Incorrect
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {filteredPredictions.length === 0 && (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex flex-col items-center space-y-3">
                        <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.709M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-gray-600 text-sm">
                          No {classificationFilter === 'all' ? '' : classificationFilter} predictions found.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Attribution Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="text-center space-y-4">
            <p className="font-sf-pro text-lg text-gray-900 font-medium">
              Made by Erasmo Marcozzi, Ethan Nolan Ravanona, Mario Fabelo Ozcáriz, Matus Starcok
            </p>
            <div className="flex justify-center">
              <img 
                src="/nasa-logo.png" 
                alt="NASA Space Apps Dublin Logo" 
                className="h-36 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg"
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
