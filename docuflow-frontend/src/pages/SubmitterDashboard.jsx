import { useEffect, useState } from "react";
import { Upload, FileText, Calendar, Eye, Edit2, Search, ChevronDown, X, Download } from "lucide-react";

const getStatusColor = (status) => {
  const colors = {
    draft: "bg-yellow-100 text-yellow-700",
    pending: "bg-blue-100 text-blue-700",
    submitted: "bg-purple-100 text-purple-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700"
  };
  return colors[status?.toLowerCase()] || colors.draft;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

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
      // cleanup object URL when modal unmounts or document changes
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
      setFileType(null);
      setError(null);
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, document]);

  const loadDocument = async () => {
    if (!document?.id) return;
    setLoading(true);
    setError(null);

    // revoke previous URL if any
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }

    try {
      const response = await fetch(`/api/submitter/view/${document.id}`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to load document');

      // read content-type header first
      const contentType = response.headers.get('content-type') || document.fileType || '';
      setFileType(contentType);

      const blob = await response.blob();
      // create object URL for blob
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
    if (!document?.id) return;
    try {
      const response = await fetch(`/api/submitter/view/${document.id}`, {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {document?.title || 'Document Preview'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {fileType || document?.fileType || 'Unknown format'}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <button
              onClick={() => {
                // revoke current blob url and close
                if (fileUrl) {
                  URL.revokeObjectURL(fileUrl);
                }
                setFileUrl(null);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-gray-50 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading document...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <p className="text-red-600 text-lg mb-2">{error}</p>
                <button
                  onClick={loadDocument}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : isPdf && fileUrl ? (
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg border border-gray-300"
              title="Document Preview"
            />
          ) : isImage && fileUrl ? (
            <div className="flex items-center justify-center h-full">
              <img
                src={fileUrl}
                alt="Document preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            </div>
          ) : fileUrl ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center bg-white rounded-xl p-8 shadow-sm max-w-md">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">Preview not available</p>
                <p className="text-gray-500 text-sm mb-4">
                  {isWord ? "Word documents cannot be previewed directly in the browser" : "This file type cannot be previewed in the browser"}
                </p>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors mx-auto"
                >
                  <Download className="w-5 h-5" />
                  Download to View
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-2">No preview available</p>
                <p className="text-gray-500 text-sm">Try downloading the file.</p>
              </div>
            </div>
          )}
        </div>

        {document && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                  {document.status || 'Draft'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Created Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(document.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">File Type</p>
                <p className="text-sm font-medium text-gray-900">
                  {fileType || document.fileType || 'Unknown'}
                </p>
              </div>
            </div>
            {document.remarks && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm text-gray-700">{document.remarks}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentCard({ doc, onEdit, onView }) {
  const canEdit = () => {
    const status = doc.status?.toLowerCase();
    return status === 'draft' || status === 'rejected';
  };

  const getLockedMessage = () => {
    const status = doc.status?.toLowerCase();
    if (status === 'submitted') return 'Document is under review';
    if (status === 'approved') return 'Document is approved and locked';
    if (status === 'pending') return 'Document is pending review';
    return '';
  };

  const isEditable = canEdit();
  const lockedMessage = getLockedMessage();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-blue-50 rounded-lg flex-shrink-0">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {doc.title || "Untitled Document"}
              </h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                {doc.status || "Draft"}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onView(doc)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              {isEditable ? (
                <button 
                  onClick={() => onEdit(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
              ) : (
                <div className="relative group">
                  <button 
                    disabled
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-50 rounded-lg cursor-not-allowed"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  {lockedMessage && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {lockedMessage}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {doc.remarks || "No description available."}
          </p>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(doc.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>{doc.fileType || "DOCX"}</span>
            </div>
            {!isEditable && (
              <div className="flex items-center gap-1.5 text-orange-600">
                <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                <span className="font-medium">Locked</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentFormModal({ isOpen, onClose, onSubmit, editingDoc }) {
  const [formData, setFormData] = useState({
    title: '',
    file: null,
    remarks: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingDoc) {
      setFormData({
        title: editingDoc.title || '',
        file: null,
        remarks: editingDoc.remarks || ''
      });
    } else {
      setFormData({ title: '', file: null, remarks: '' });
    }
  }, [editingDoc, isOpen]);

  const handleSubmit = async (isDraft = false) => {
    if (!formData.title || (!formData.file && !editingDoc)) return;
    
    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      if (formData.file) formDataToSend.append('file', formData.file);
      if (formData.remarks) formDataToSend.append('remarks', formData.remarks);
      
      let url, method;
      
      if (editingDoc) {
        url = `/api/submitter/documents/${editingDoc.id}`;
        method = 'PUT';
        formDataToSend.append('status', isDraft ? 'draft' : 'submitted');
      } else {
        if (isDraft) {
          url = '/api/submitter/document';
          method = 'POST';
          formDataToSend.append('status', 'draft');
        } else {
          url = '/api/submitter/documents';
          method = 'POST';
          formDataToSend.append('status', 'submitted');
        }
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend,
        credentials: 'include'
      });

      if (response.ok) {
        onSubmit();
        onClose();
        setFormData({ title: '', file: null, remarks: '' });
      }
    } catch (err) {
      console.error('Failed to save document:', err);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingDoc ? 'Edit Document' : 'Upload New Document'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Q4 Financial Report 2024"
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload File {!editingDoc && '*'}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-all cursor-pointer bg-gray-50 relative">
              <input
                type="file"
                onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx"
              />
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                {formData.file ? formData.file.name : 'Drag and drop or click to upload'}
              </p>
              <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
              placeholder="Add any additional notes or comments..."
              rows={4}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={uploading || !formData.title || (!formData.file && !editingDoc)}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={uploading || !formData.title || (!formData.file && !editingDoc)}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Submitting...' : editingDoc ? 'Update & Submit' : 'Submit for Review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmitterDashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [viewingDoc, setViewingDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/submitter/documents", {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    total: documents.length,
    draft: documents.filter(d => d.status?.toLowerCase() === 'draft').length,
    submitted: documents.filter(d => d.status?.toLowerCase() === 'submitted').length,
    approved: documents.filter(d => d.status?.toLowerCase() === 'approved').length,
    rejected: documents.filter(d => d.status?.toLowerCase() === 'rejected').length
  };

  const handleEdit = (doc) => {
    setEditingDoc(doc);
    setIsFormOpen(true);
  };

  const handleView = (doc) => {
    setViewingDoc(doc);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 rounded-xl">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Document Management System</h1>
                <p className="text-sm text-gray-600">Submitter Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.total}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Draft</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.draft}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Submitted</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.submitted}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.approved}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-3xl font-bold text-gray-900">{statusCounts.rejected}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <FileText className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Title A-Z</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600 mt-4">Loading documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">No documents found</p>
            <p className="text-gray-500 text-sm mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Try adjusting your filters" 
                : "Upload your first document to get started"}
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Document
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard 
                key={doc.id} 
                doc={doc} 
                onEdit={handleEdit}
                onView={handleView}
              />
            ))}
          </div>
        )}
      </div>

      <DocumentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingDoc(null);
        }}
        onSubmit={fetchDocuments}
        editingDoc={editingDoc}
      />

      <DocumentViewerModal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </div>
  );
}
