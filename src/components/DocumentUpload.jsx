import React, { useState } from 'react';

export default function DocumentUpload({ onComplete, isAdditionalUpload = false }) {
  const [documents, setDocuments] = useState({
    passport: null,
    photo: null,
    financialProof: null,
    supportingDocs: null,
  });
  const [uploading, setUploading] = useState(false);
  const [userName, setUserName] = useState('');

  const handleFileChange = (docType, file) => {
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [docType]: {
          name: file.name,
          size: file.size,
          type: file.type,
          file: file
        }
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isAdditionalUpload) {
      // For additional uploads during interview
      const uploadedDocs = {};
      Object.keys(documents).forEach(key => {
        if (documents[key]) {
          uploadedDocs[key] = documents[key];
        }
      });
      onComplete(uploadedDocs);
    } else {
      // Initial upload - require at least passport
      if (!documents.passport) {
        alert('Please upload at least your passport document to continue.');
        return;
      }
      
      setUploading(true);
      
      // Simulate upload delay
      setTimeout(() => {
        const uploadedDocs = {
          userName: userName || 'Applicant',
          ...documents
        };
        onComplete(uploadedDocs);
        setUploading(false);
      }, 1000);
    }
  };

  const removeDocument = (docType) => {
    setDocuments(prev => ({
      ...prev,
      [docType]: null
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            {isAdditionalUpload ? 'Upload Additional Documents' : 'Visa Interview Preparation'}
          </h1>
          <p className="text-slate-300">
            {isAdditionalUpload 
              ? 'Please upload the requested documents' 
              : 'Please upload your documents to begin the mock interview'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isAdditionalUpload && (
            <div>
              <label className="block text-sm font-semibold mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div className="space-y-4">
            {/* Passport */}
            <DocumentUploadField
              label="Passport"
              required={!isAdditionalUpload}
              document={documents.passport}
              onFileChange={(file) => handleFileChange('passport', file)}
              onRemove={() => removeDocument('passport')}
              formatFileSize={formatFileSize}
            />

            {/* Photo */}
            <DocumentUploadField
              label="Passport Photo"
              document={documents.photo}
              onFileChange={(file) => handleFileChange('photo', file)}
              onRemove={() => removeDocument('photo')}
              formatFileSize={formatFileSize}
            />

            {/* Financial Proof */}
            <DocumentUploadField
              label="Financial Proof (Bank Statement, etc.)"
              document={documents.financialProof}
              onFileChange={(file) => handleFileChange('financialProof', file)}
              onRemove={() => removeDocument('financialProof')}
              formatFileSize={formatFileSize}
            />

            {/* Supporting Documents */}
            <DocumentUploadField
              label="Supporting Documents (Employment Letter, etc.)"
              document={documents.supportingDocs}
              onFileChange={(file) => handleFileChange('supportingDocs', file)}
              onRemove={() => removeDocument('supportingDocs')}
              formatFileSize={formatFileSize}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={uploading || (!isAdditionalUpload && !documents.passport)}
              className="flex-1 px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                isAdditionalUpload ? 'Submit Documents' : 'Start Interview'
              )}
            </button>
          </div>

          {!isAdditionalUpload && (
            <p className="text-center text-sm text-slate-400 mt-4">
              * Passport is required. Other documents are optional but recommended.
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

// Reusable Document Upload Field Component
function DocumentUploadField({ label, required, document, onFileChange, onRemove, formatFileSize }) {
  const inputId = `file-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="bg-slate-900/30 rounded-xl p-4 border border-slate-700">
      <label className="block text-sm font-semibold mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {!document ? (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-slate-800/30"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mb-2 text-sm text-slate-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PDF, JPG, PNG (MAX. 10MB)</p>
          </div>
          <input
            id={inputId}
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => onFileChange(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-600">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{document.name}</p>
              <p className="text-xs text-slate-400">{formatFileSize(document.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex-shrink-0 ml-4 text-red-400 hover:text-red-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}