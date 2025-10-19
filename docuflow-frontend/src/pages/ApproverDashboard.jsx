import { useEffect, useState } from "react";
import { FileText, Calendar, User, Search, ChevronDown, X, CheckCircle, Archive, Clock, Eye, MessageSquare, Shield, XCircle, Download } from "lucide-react";

function ApproverDocumentCard({ doc, onReview, onView }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-100 text-blue-700",
      approved: "bg-purple-100 text-purple-700",
      finalized: "bg-green-100 text-green-700",
      archived: "bg-gray-100 text-gray-700",
      rejected: "bg-red-100 text-red-700"
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const isFinalized = doc.status?.toLowerCase() === 'finalized';
  const isArchived = doc.status?.toLowerCase() === 'archived';
  const isRejected = doc.status?.toLowerCase() === 'rejected';
  const needsApproval = doc.status?.toLowerCase() === 'approved';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-50 rounded-lg flex-shrink-0">
          <FileText className="w-6 h-6 text-purple-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {doc.title || "Untitled Document"}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                  {doc.status || "Pending"}
                </span>
                {needsApproval && (
                  <span className="flex items-center gap-1 text-xs text-orange-600">
                    <Clock className="w-3 h-3" />
                    Awaiting Final Approval
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onView(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              {needsApproval && (
                <button 
                  onClick={() => onReview(doc)}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Review
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {doc.remarks || "No description available."}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>By: {doc.owner || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{doc.fileType || "DOCX"}</span>
            </div>
          </div>

          {doc.reviewerRemarks && (
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-600 mb-1">Reviewer Comments:</p>
                  <p className="text-sm text-gray-700">{doc.reviewerRemarks}</p>
                </div>
              </div>
            </div>
          )}

          {(isFinalized || isArchived || isRejected) && doc.approverRemarks && (
            <div className={`mt-3 p-3 rounded-lg border ${
              isRejected 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start gap-2">
                <Shield className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isRejected ? 'text-red-400' : 'text-green-400'
                }`} />
                <div>
                  <p className={`text-xs font-medium mb-1 ${
                    isRejected ? 'text-red-600' : 'text-green-600'
                  }`}>Approver Comments:</p>
                  <p className="text-sm text-gray-700">{doc.approverRemarks}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewModal({ isOpen, onClose, document, onSubmitAction }) {
  const [action, setAction] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAction(null);
      setRemarks('');
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!action) return;
    
    setSubmitting(true);
    try {
      await onSubmitAction(document.id, action, remarks);
      onClose();
    } catch (err) {
      console.error('Action submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !document) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Final Review</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{document.title}</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Submitted By</p>
              <p className="text-sm font-medium text-gray-900">{document.owner || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Submission Date</p>
              <p className="text-sm font-medium text-gray-900">
                {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">File Type</p>
              <p className="text-sm font-medium text-gray-900">{document.fileType || "DOCX"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Current Status</p>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                {document.status || "Approved"}
              </span>
            </div>
          </div>

          {document.remarks && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Document Description</p>
              <p className="text-sm text-gray-700">{document.remarks}</p>
            </div>
          )}

          {document.reviewerRemarks && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Reviewer Comments</p>
              <p className="text-sm text-gray-700">{document.reviewerRemarks}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Select Action *</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setAction('finalize')}
              className={`p-4 rounded-xl border-2 transition-all ${
                action === 'finalize' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${action === 'finalize' ? 'bg-green-500' : 'bg-gray-100'}`}>
                  <CheckCircle className={`w-6 h-6 ${action === 'finalize' ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${action === 'finalize' ? 'text-green-700' : 'text-gray-700'}`}>
                    Finalize
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Complete workflow</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAction('archive')}
              className={`p-4 rounded-xl border-2 transition-all ${
                action === 'archive' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${action === 'archive' ? 'bg-gray-500' : 'bg-gray-100'}`}>
                  <Archive className={`w-6 h-6 ${action === 'archive' ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${action === 'archive' ? 'text-gray-700' : 'text-gray-700'}`}>
                    Archive
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Store for reference</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setAction('reject')}
              className={`p-4 rounded-xl border-2 transition-all ${
                action === 'reject' ? 'border-red-500 bg-red-50' : 'border-gray-200 hover:border-red-300'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <div className={`p-2 rounded-lg ${action === 'reject' ? 'bg-red-500' : 'bg-gray-100'}`}>
                  <XCircle className={`w-6 h-6 ${action === 'reject' ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <div className="text-center">
                  <p className={`font-semibold text-sm ${action === 'reject' ? 'text-red-700' : 'text-gray-700'}`}>
                    Reject
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Send back</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comments {action === 'reject' && <span className="text-red-600">(Required for rejection)</span>}
          </label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder={
              action === 'reject' 
                ? "Please provide feedback on why this document is being rejected..." 
                : "Add any final comments or notes (optional)..."
            }
            rows={4}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!action || (action === 'reject' && !remarks.trim()) || submitting}
            className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              action === 'finalize' 
                ? 'bg-green-600 hover:bg-green-700' 
                : action === 'archive'
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? 'Processing...' : `Confirm ${
              action === 'finalize' ? 'Finalization' : 
              action === 'archive' ? 'Archive' : 
              'Rejection'
            }`}
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentViewerModal({ isOpen, onClose, document }) {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);

  useEffect(() => {
    if (isOpen && document) {
      loadDocument();
    }
    return () => {
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
      }
    };
  }, [isOpen, document]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/approver/view/${document.id}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load document');

      const contentType = response.headers.get('content-type');
      setFileType(contentType || document.fileType);

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
    } catch (err) {
      setError('Failed to load document preview');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/approver/view/${document.id}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to download document');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName || document.title || 'document';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (!isOpen) return null;

  const detectFileType = () => {
    const type = (fileType || document?.fileType || '').toLowerCase();
    return {
      isPdf: type.includes('pdf'),
      isImage: type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg'),
      isWord: type.includes('word') || type.includes('docx') || type.includes('doc')
    };
  };

  const { isPdf, isImage, isWord } = detectFileType();

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-100 text-blue-700",
      approved: "bg-purple-100 text-purple-700",
      finalized: "bg-green-100 text-green-700",
      archived: "bg-gray-100 text-gray-700",
      rejected: "bg-red-100 text-red-700"
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">{document?.title || 'Document Preview'}</h2>
            <p className="text-sm text-gray-500 mt-1">{fileType || document?.fileType || 'Unknown format'}</p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors">
              <Download className="w-4 h-4" />
              Download
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600 mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 text-lg mb-2">{error}</p>
                <button onClick={loadDocument} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                  Retry
                </button>
              </div>
            </div>
          ) : isPdf && fileUrl ? (
            <iframe src={fileUrl} className="w-full h-full rounded-lg border border-gray-300" title="Document Preview" />
          ) : isImage && fileUrl ? (
            <div className="flex items-center justify-center h-full">
              <img src={fileUrl} alt="Document preview" className="max-w-full max-h-full object-contain rounded-lg" />
            </div>
          ) : fileUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-xl p-8 shadow-sm max-w-md">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Preview not available</p>
                <p className="text-gray-500 text-sm mb-4">
                  {isWord ? "Word documents cannot be previewed directly in the browser" : "This file type cannot be previewed in the browser"}
                </p>
                <button onClick={handleDownload} className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors mx-auto">
                  <Download className="w-5 h-5" />
                  Download to View
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {document && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {document.status || 'Pending'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Submitted By</p>
                <p className="text-sm font-medium text-gray-900">{document.owner || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(document.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">File Type</p>
                <p className="text-sm font-medium text-gray-900">{fileType || document.fileType || 'Unknown'}</p>
              </div>
            </div>
            {document.remarks && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Document Description</p>
                <p className="text-sm text-gray-700">{document.remarks}</p>
              </div>
            )}
            {document.reviewerRemarks && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Reviewer Comments</p>
                <p className="text-sm text-gray-700">{document.reviewerRemarks}</p>
              </div>
            )}
            {document.approverRemarks && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Approver Comments</p>
                <p className="text-sm text-gray-700">{document.approverRemarks}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApproverDashboard() {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const allDocsPromises = [
        fetch('/api/approver/documents/pending', { credentials: "include" }),
        fetch('/api/approver/documents/finalized', { credentials: "include" })
      ];

      const [pendingRes, finalizedRes] = await Promise.all(allDocsPromises);
      
      let allDocs = [];
      if (pendingRes.ok) {
        const pending = await pendingRes.json();
        allDocs = [...allDocs, ...pending];
      }
      if (finalizedRes.ok) {
        const finalized = await finalizedRes.json();
        allDocs = [...allDocs, ...finalized];
      }
      
      setAllDocuments(allDocs);

      if (statusFilter === 'all') {
        const sorted = [...allDocs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setDocuments(sorted);
      } else if (statusFilter === 'pending') {
        const pendingDocs = allDocs.filter(d => d.status?.toLowerCase() === 'approved');
        const sorted = pendingDocs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setDocuments(sorted);
      } else if (statusFilter === 'finalized') {
        const finalizedDocs = allDocs.filter(d => d.status?.toLowerCase() === 'finalized');
        const sorted = finalizedDocs.sort((a, b) => new Date(b.finalizedAt || b.updatedAt) - new Date(a.finalizedAt || a.updatedAt));
        setDocuments(sorted);
      } else if (statusFilter === 'archived') {
        const archivedDocs = allDocs.filter(d => d.status?.toLowerCase() === 'archived');
        const sorted = archivedDocs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setDocuments(sorted);
      } else if (statusFilter === 'rejected') {
        const rejectedDocs = allDocs.filter(d => d.status?.toLowerCase() === 'rejected');
        const sorted = rejectedDocs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setDocuments(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [statusFilter]);

  const handleReview = (doc) => {
    setSelectedDoc(doc);
    setIsReviewModalOpen(true);
  };

  const handleView = (doc) => {
    setViewingDoc(doc);
  };

  const handleSubmitAction = async (docId, action, remarks) => {
    try {
      const endpoint = action === 'finalize' 
        ? `/api/approver/documents/${docId}/finalize`
        : action === 'archive'
        ? `/api/approver/documents/${docId}/archive`
        : `/api/approver/documents/${docId}/reject`;
      
      const url = new URL(endpoint, window.location.origin);
      if (remarks) {
        url.searchParams.append('remarks', remarks);
      }

      const response = await fetch(url.toString(), {
        method: 'PUT',
        credentials: 'include'
      });

      if (response.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to submit action:', err);
      throw err;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.owner?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const statusCounts = {
    all: allDocuments.length,
    pendingApproval: allDocuments.filter(d => d.status?.toLowerCase() === 'approved').length,
    finalized: allDocuments.filter(d => d.status?.toLowerCase() === 'finalized').length,
    archived: allDocuments.filter(d => d.status?.toLowerCase() === 'archived').length,
    rejected: allDocuments.filter(d => d.status?.toLowerCase() === 'rejected').length
  };
  
  statusCounts.totalProcessed = statusCounts.finalized + statusCounts.archived;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-600 rounded-xl">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Document Management System</h1>
                <p className="text-sm text-gray-600">Approver Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <Clock className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Final Approval Stage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-6 gap-4 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-5 border border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">All Documents</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.all}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.pendingApproval}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Finalized</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.finalized}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Archived</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.archived}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Archive className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.rejected}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 mb-1">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">{statusCounts.totalProcessed}</p>
              </div>
              <div className="p-2 bg-white rounded-lg">
                <Shield className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
            >
              <option value="all">All Documents</option>
              <option value="pending">Pending Approval</option>
              <option value="finalized">Finalized</option>
              <option value="archived">Archived</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-purple-600"></div>
            <p className="text-gray-600 mt-4">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No documents found</p>
            <p className="text-gray-500 text-sm">
              {statusFilter === 'all' 
                ? "No documents available in the system" 
                : statusFilter === 'pending'
                ? "No documents are waiting for final approval"
                : statusFilter === 'finalized'
                ? "No finalized documents yet"
                : statusFilter === 'archived'
                ? "No archived documents yet"
                : "No rejected documents"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <ApproverDocumentCard 
                key={doc.id} 
                doc={doc} 
                onReview={handleReview}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => {
          setIsReviewModalOpen(false);
          setSelectedDoc(null);
        }}
        document={selectedDoc}
        onSubmitAction={handleSubmitAction}
      />

      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </div>
  );
}