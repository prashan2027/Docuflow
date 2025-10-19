import { useEffect, useState } from "react";
import { Upload, FileText, Clock, MessageSquare, TrendingUp, Search, Filter, RefreshCw } from "lucide-react";

// Professional Document Card Component
function DocumentCard({ doc }) {
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      approved: "bg-green-500/10 text-green-500 border-green-500/20",
      rejected: "bg-red-500/10 text-red-500 border-red-500/20",
      review: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  const getWorkflowColor = (state) => {
    const colors = {
      submitted: "bg-blue-400",
      "in-review": "bg-purple-400",
      approved: "bg-green-400",
      rejected: "bg-red-400"
    };
    return colors[state?.toLowerCase()] || "bg-gray-400";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 overflow-hidden group">
      {/* Header with Status Badge */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                {doc.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                  {doc.status}
                </span>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <div className={`w-2 h-2 rounded-full ${getWorkflowColor(doc.workflowState)} animate-pulse`}></div>
                  <span className="text-xs font-medium">{doc.workflowState}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Comments Section */}
        {doc.remarks && (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/30">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400 mb-1">Comments</p>
                <p className="text-sm text-gray-300 leading-relaxed">{doc.remarks}</p>
              </div>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <p className="text-xs font-medium text-gray-400">Created</p>
            </div>
            <p className="text-sm text-gray-200 font-medium">{formatDate(doc.createdAt)}</p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <p className="text-xs font-medium text-gray-400">Updated</p>
            </div>
            <p className="text-sm text-gray-200 font-medium">{formatDate(doc.updatedAt)}</p>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-700/30">
        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center gap-2">
          View Details
          <span className="text-xs">→</span>
        </button>
      </div>
    </div>
  );
}