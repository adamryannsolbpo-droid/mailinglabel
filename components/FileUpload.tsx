import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  isProcessing: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ files, setFiles, isProcessing }) => {
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(
      file => file.name.endsWith('.csv') || file.name.match(/\.xlsx?$/)
    );
    setFiles([...files, ...droppedFiles]);
  }, [files, isProcessing, setFiles]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && !isProcessing) {
      const selectedFiles = Array.from(e.target.files);
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    if (isProcessing) return;
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <div className="w-full space-y-4">
      <div 
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
          ${isProcessing ? 'bg-gray-50 border-gray-200 cursor-not-allowed' : 'border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 bg-white'}
        `}
      >
        <input 
          type="file" 
          multiple 
          accept=".csv,.xls,.xlsx" 
          onChange={onFileSelect} 
          className="hidden" 
          id="fileInput" 
          disabled={isProcessing}
        />
        <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
          <Upload className={`w-12 h-12 mb-4 ${isProcessing ? 'text-gray-300' : 'text-indigo-500'}`} />
          <h3 className="text-lg font-semibold text-gray-700">
            {isProcessing ? 'Processing...' : 'Click or Drag files here'}
          </h3>
          <p className="text-sm text-gray-500 mt-2">Supports .CSV, .XLS, .XLSX</p>
        </label>
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 divide-y">
          {files.map((file, idx) => (
            <div key={idx} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button 
                onClick={() => removeFile(idx)}
                disabled={isProcessing}
                className="text-gray-400 hover:text-red-500 disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};