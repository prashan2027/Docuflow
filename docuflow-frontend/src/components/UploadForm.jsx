import { useState } from "react";
import api from "../api/axiosConfig";

export default function UploadForm({ onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file) {
      setMessage("Please select a file and title");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);

    try {
      setLoading(true);
      await api.post("/api/submitter/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("✅ Document uploaded successfully");
      setTitle("");
      setFile(null);
      onUploaded(); // refresh list
    } catch {
      setMessage("❌ Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 p-4 rounded-lg shadow-md mb-4 space-y-3"
    >
      <h2 className="text-xl font-semibold">Upload New Document</h2>
      {message && <p className="text-sm text-blue-400">{message}</p>}
      <input
        type="text"
        placeholder="Document Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="w-full bg-gray-700 p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 p-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
