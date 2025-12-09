import React, { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { LabelPreview } from './components/LabelPreview';
import { processFiles } from './services/dataProcessor';
import { generatePDF } from './services/pdfGenerator';
import { LabelData, TEMPLATES, LabelTemplate } from './types';
import { Printer, Download, Wand2, RefreshCw, AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [labels, setLabels] = useState<LabelData[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('30-up');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<{ processed: number } | null>(null);

  const selectedTemplate = TEMPLATES[selectedTemplateId];

  const handleProcess = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const cleanedData = await processFiles(files);
      setLabels(cleanedData);
      setStats({ processed: cleanedData.length });
    } catch (err: any) {
      console.error(err);
      setError("Failed to process files. Please ensure they are valid CSV or Excel files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    generatePDF(labels, selectedTemplate);
  };

  const reset = () => {
    setFiles([]);
    setLabels([]);
    setStats(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              AutoLabel Pro
            </h1>
          </div>
          {labels.length > 0 && (
             <button onClick={reset} className="text-sm font-medium text-gray-500 hover:text-indigo-600 flex items-center gap-1">
               <RefreshCw className="w-4 h-4" /> Start Over
             </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* Step 1: Upload */}
        {labels.length === 0 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900">Upload Your Data</h2>
              <p className="text-gray-500">
                Upload CSV or Excel files. We'll automatically merge, clean, and format them for printing.
              </p>
            </div>
            
            <FileUpload files={files} setFiles={setFiles} isProcessing={isProcessing} />
            
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={files.length === 0 || isProcessing}
              className={`w-full py-4 rounded-xl text-lg font-bold shadow-lg transition-all flex items-center justify-center gap-2
                ${files.length > 0 && !isProcessing 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <><Wand2 className="w-5 h-5" /> Clean & Generate Labels</>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Configuration & Preview */}
        {labels.length > 0 && (
          <div className="grid lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Left: Controls */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Stats Card */}
              <div className="bg-white p-6 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Dataset Stats</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-indigo-600">{stats?.processed}</span>
                  <span className="text-gray-600">Labels Ready</span>
                </div>
                <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  ✓ Duplicates removed
                </div>
                <div className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Addresses formatted
                </div>
              </div>

              {/* Template Selector */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Label Format</h3>
                <div className="space-y-3">
                  {Object.values(TEMPLATES).map(t => (
                    <label 
                      key={t.id} 
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${selectedTemplateId === t.id 
                          ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                          : 'border-gray-200 hover:border-indigo-300'}
                      `}
                    >
                      <input 
                        type="radio" 
                        name="template" 
                        value={t.id}
                        checked={selectedTemplateId === t.id}
                        onChange={(e) => setSelectedTemplateId(e.target.value)}
                        className="hidden" 
                      />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">{t.name}</span>
                        <span className="bg-white text-gray-600 text-xs px-2 py-1 rounded border border-gray-200">
                          {t.rows} x {t.cols}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Download Action */}
              <button
                onClick={handleDownload}
                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-bold shadow-lg shadow-green-200 transition-colors flex items-center justify-center gap-2 sticky bottom-4 lg:relative"
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
            </div>

            {/* Right: Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white p-4 rounded-t-xl border border-gray-200 border-b-0 flex justify-between items-center">
                 <h3 className="font-bold text-gray-700">Live Preview</h3>
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                   US Letter (8.5" x 11")
                 </span>
              </div>
              <LabelPreview labels={labels} template={selectedTemplate} />
            </div>

          </div>
        )}

      </main>
    </div>
  );
};

export default App;