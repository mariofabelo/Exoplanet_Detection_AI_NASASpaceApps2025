"use client";

import { useState } from "react";
import { runModelOnDataset, ModelResults, PredictionResult, downloadPredictionsCSV } from "@/lib/runModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<ModelResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'predictions'>('predictions');
  const [isDragOver, setIsDragOver] = useState(false);
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'candidate' | 'confirmed'>('all');
  const [confidenceSort, setConfidenceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [showColumnInfo, setShowColumnInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [idColumnName, setIdColumnName] = useState<string>('');
  const [hoveredColumn, setHoveredColumn] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Required CSV columns for the model
  const requiredColumns = [
    'Period', 'Period_err1', 'Period_err2', 'Duration', 'Duration_err1',
    'Duration_err2', 'Rho', 'Rho_err1', 'Rho_err2', 'Rp', 'Rp_err1',
    'Rp_err2', 'Insolation', 'Insolation_err1', 'Insolation_err2', 'SNR',
    'Ts', 'Ts_err1', 'Ts_err2', 'log(g)', 'log(g)_err1', 'log(g)_err2',
    'Rs', 'Rs_err1', 'Rs_err2'
  ];

  // Column descriptions for tooltips
  const columnDescriptions: Record<string, string> = {
    'Period': 'Orbital period of the planet. [days]',
    'Period_err1': 'Upper uncertainty for the orbital period of the planet.',
    'Period_err2': 'Lower uncertainty for the orbital period of the planet.',
    'Duration': 'Transit duration. [hrs]',
    'Duration_err1': 'Upper uncertainty for the transit duration',
    'Duration_err2': 'Lower uncertainty for the transit duration',
    'Rho': 'Fitted stellar density [g/cm^3]',
    'Rho_err1': 'Upper uncertainty for the fitted stellar density',
    'Rho_err2': 'Lower uncertainty for the fitted stellar density',
    'Rp': 'Radius of the planet [Earth radii]',
    'Rp_err1': 'Upper uncertainty for the radius of the planet',
    'Rp_err2': 'Lower uncertainty for the radius of the planet',
    'Insolation': 'Flux at the surface of the planet received from the star. [earth fluxes]',
    'Insolation_err1': 'Upper uncertainty for the insolation',
    'Insolation_err2': 'Lower uncertainty for the insolation',
    'SNR': 'Signal to noise ratio.',
    'Ts': 'Effective temperature of the star [K]',
    'Ts_err1': 'Upper uncertainty for the effective temperature of the star',
    'Ts_err2': 'Lower uncertainty for the effective temperature of the star',
    'log(g)': 'Star surface gravity [log_10(cm/s^2)]',
    'log(g)_err1': 'Upper uncertainty for the star surface gravity',
    'log(g)_err2': 'Lower uncertainty for the star surface gravity',
    'Rs': 'Radius of the star [solar radii]',
    'Rs_err1': 'Upper uncertainty for the radius of the star',
    'Rs_err2': 'Lower uncertainty for the radius of the star'
  };

  // Format columns as Python list string
  const columnsAsPythonList = `['${requiredColumns.join("', '")}']`;

  const handleCopyColumns = async () => {
    try {
      await navigator.clipboard.writeText(columnsAsPythonList);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = columnsAsPythonList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleRunModel = async () => {
    if (!file) return alert("Please upload a CSV file first.");
    setLoading(true);
    try {
      const data = await runModelOnDataset(file, idColumnName);
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

  const handleColumnMouseEnter = (column: string, e: React.MouseEvent) => {
    setHoveredColumn(column);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({ 
      x: rect.left + rect.width / 2, 
      y: rect.top 
    });
  };

  const handleColumnMouseLeave = () => {
    setHoveredColumn(null);
  };

  // Prepare data for prediction distribution pie chart
  const predictionDistribution = results ? [
    { name: 'CANDIDATE', value: results.candidate_count, color: '#3B82F6' },
    { name: 'CONFIRMED', value: results.confirmed_count, color: '#10B981' }
  ] : [];

  // Filter and sort predictions based on classification filter and confidence sort
  const filteredPredictions = results ? (() => {
    let filtered = results.predictions;
    
    // Apply classification filter
    switch (classificationFilter) {
      case 'candidate':
        filtered = results.predictions.filter(p => p.prediction === 1);
        break;
      case 'confirmed':
        filtered = results.predictions.filter(p => p.prediction === 0);
        break;
      default:
        filtered = results.predictions;
    }
    
    // Apply confidence sorting
    if (confidenceSort !== 'none') {
      filtered = [...filtered].sort((a, b) => {
        if (confidenceSort === 'asc') {
          return a.confidence - b.confidence;
        } else {
          return b.confidence - a.confidence;
        }
      });
    }
    
    return filtered;
  })() : [];

  return (
    <div className="min-h-screen bg-gradient-research">
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-6 sm:space-y-8 min-h-screen max-w-7xl mx-auto">
        {/* Scientific Header */}
        <div className="text-center space-y-2 sm:space-y-3 animate-fade-in">
          <div className="inline-flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-metric">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">ML Research Platform</span>
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-bold scientific-header text-gray-900">
              Exoplanet Classification Model
            </h1>
            <div className="flex items-center justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-600">
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
          
          <p className="text-base sm:text-lg text-gray-700 max-w-3xl leading-relaxed px-4">
            Upload your exoplanet candidate data to get predictions from our trained machine learning model. 
            The model will classify each object as either a CANDIDATE or CONFIRMED exoplanet.
          </p>
        </div>

        {/* Data Input Section */}
        <Card className="w-full max-w-4xl mx-4 sm:mx-0 research-card shadow-research animate-slide-up">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="text-xl scientific-header text-gray-900">
              Dataset Input
            </CardTitle>
            <CardDescription className="text-gray-600">
              Upload CSV files containing exoplanet candidate data for analysis
            </CardDescription>
            
            {/* CSV Format Info - Non-invasive help section */}
            <div className="mt-3">
              <button
                onClick={() => setShowColumnInfo(!showColumnInfo)}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Required CSV format</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showColumnInfo ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showColumnInfo && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-blue-900">Required CSV Columns ({requiredColumns.length} total):</h4>
                    <button
                      onClick={handleCopyColumns}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                        copySuccess 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200'
                      }`}
                    >
                      {copySuccess ? (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy as list</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                    {requiredColumns.map((column, index) => (
                      <div 
                        key={index} 
                        className="bg-white px-2 py-1 rounded border border-blue-100 text-blue-800 font-mono cursor-help relative"
                        onMouseEnter={(e) => handleColumnMouseEnter(column, e)}
                        onMouseLeave={handleColumnMouseLeave}
                      >
                        {column}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    Your CSV file must contain all these columns with the exact names shown above.
                  </p>
                </div>
              )}
            </div>
          </CardHeader>
          
          {/* Tooltip for column descriptions */}
          {hoveredColumn && (
            <div 
              className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none max-w-xs"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 5}px`,
                transform: 'translateX(-50%) translateY(-100%)'
              }}
            >
              <div className="font-semibold text-blue-300 mb-1">{hoveredColumn}</div>
              <div className="text-gray-200">{columnDescriptions[hoveredColumn]}</div>
              <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 transform -translate-x-1/2"></div>
            </div>
          )}
          <CardContent className="p-4 sm:p-5 space-y-4 sm:space-y-5">
            <div className="space-y-3">
              {/* ID Column Input */}
              <div className="space-y-2">
                <label htmlFor="id-column" className="block text-sm font-medium text-gray-700">
                  ID Column Name
                </label>
                <input
                  id="id-column"
                  type="text"
                  value={idColumnName}
                  onChange={(e) => setIdColumnName(e.target.value)}
                  placeholder="Enter the name of your ID column (e.g., kepoi_name, pl_name, id)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <p className="text-xs text-gray-500">
                  This column will be used to identify each row in the results. Leave empty to use row numbers.
                </p>
              </div>
              
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
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 bg-gray-50 hover:bg-gray-100 group ${
                      isDragOver 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-3">
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
              className="w-full h-11 text-base font-medium"
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
          <Card className="w-full max-w-7xl mx-4 sm:mx-0 research-card shadow-data animate-slide-up">
            <CardContent className="p-4 sm:p-6">
                <div className="space-y-5">
                  <div className="text-center space-y-3 border-b border-gray-200 pb-4">
                    <h2 className="text-2xl font-bold scientific-header text-gray-900">
                      Exoplanet Classification Results
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
                        <span className="data-metric">Total Samples: {results.total_samples}</span>
                      </div>
                    </div>
                    <p className="text-gray-600">
                      Showing {filteredPredictions.length} of {results.predictions.length} total classifications
                    </p>
                    
                    {/* Download and Filter Controls */}
                    <div className="flex flex-col lg:flex-row justify-center items-center space-y-4 lg:space-y-0 lg:space-x-4">
                      {/* Download Button */}
                      <Button
                        onClick={() => downloadPredictionsCSV(results.predictions)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors duration-200"
                        size="sm"
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Download CSV of Predictions</span>
                        </div>
                      </Button>
                      
                      {/* Filter and Sort Controls */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Classification Filter Controls */}
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
                            onClick={() => setClassificationFilter('candidate')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                              classificationFilter === 'candidate'
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <span>CANDIDATE ({results.candidate_count})</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setClassificationFilter('confirmed')}
                            className={`px-4 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                              classificationFilter === 'confirmed'
                                ? 'bg-white text-green-600 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>CONFIRMED ({results.confirmed_count})</span>
                            </div>
                          </button>
                        </div>
                        
                        {/* Confidence Sort Controls */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200">
                          <button
                            onClick={() => setConfidenceSort('none')}
                            className={`px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                              confidenceSort === 'none'
                                ? 'bg-white text-gray-600 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                              </svg>
                              <span>No Sort</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setConfidenceSort('asc')}
                            className={`px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                              confidenceSort === 'asc'
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                              </svg>
                              <span>Confidence ↑</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setConfidenceSort('desc')}
                            className={`px-3 py-2 rounded-md transition-all duration-200 font-medium text-sm ${
                              confidenceSort === 'desc'
                                ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                              </svg>
                              <span>Confidence ↓</span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Prediction Distribution Chart */}
                  <div className="bg-white rounded-lg p-5 border border-gray-200 shadow-metric">
                    <h3 className="text-lg font-semibold scientific-header text-gray-900 mb-3 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                      </svg>
                      <span>Prediction Distribution</span>
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={predictionDistribution}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                            labelLine={false}
                          >
                            {predictionDistribution.map((entry, index) => (
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

                  <div className="bg-white rounded-lg border border-gray-200 shadow-metric overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr className="border-b border-gray-200">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identifier</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Predicted Class</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Model Prediction</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredPredictions.map((pred, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <code className="text-sm data-metric text-gray-900">
                                  {pred.user_id || pred.kepoi_name || pred.pl_name || `Row ${pred.row_index || 0}`}
                                </code>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.prediction === 1 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {pred.prediction_label}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex flex-col items-center space-y-1">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    pred.confidence >= 0.8 
                                      ? 'bg-green-100 text-green-800' 
                                      : pred.confidence >= 0.6 
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}>
                                    {(pred.confidence * 100).toFixed(1)}%
                                  </span>
                                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        pred.confidence >= 0.8 
                                          ? 'bg-green-500' 
                                          : pred.confidence >= 0.6 
                                            ? 'bg-yellow-500'
                                            : 'bg-red-500'
                                      }`}
                                      style={{ width: `${(pred.confidence * 100).toFixed(1)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  pred.confidence >= 0.8 
                                    ? 'bg-green-100 text-green-800'
                                    : pred.confidence >= 0.6 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                }`}>
                                  {pred.confidence >= 0.8 ? (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      High Confidence
                                    </>
                                  ) : pred.confidence >= 0.6 ? (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Medium Confidence
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                      Low Confidence
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
            </CardContent>
          </Card>
        )}
        
        {/* Attribution Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200">
          <div className="text-center space-y-3">
            <p className="font-sf-pro text-lg text-gray-900 font-medium">
              Made by Erasmo Marcozzi, Ethan Nolan Ravanona, Mario Fabelo Ozcáriz, Matus Starcok
            </p>
            <div className="flex justify-center">
              <img 
                src="/nasa-logo.png" 
                alt="NASA Space Apps Dublin Logo" 
                className="h-28 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200 rounded-full shadow-lg"
              />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
