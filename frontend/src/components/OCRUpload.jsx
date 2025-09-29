import { useState, useRef } from "react";
import { ocrAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const OCRUpload = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  if (user?.user_type !== "patient") return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      const response = await ocrAPI.uploadPrescription(formData);
      toast.success("Prescription uploaded! Processing with AI...");
      setSelectedFile(null);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploadSuccess?.(response.data);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error.response?.data?.error || "Failed to upload prescription"
      );
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100 p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold text-blue-900 mb-2">
        Upload Prescription
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Our AI will automatically extract medicine details from your
        prescription.
      </p>

      <div className="space-y-5">
        {/* Drag & Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition 
            ${
              dragActive
                ? "border-blue-400 bg-blue-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <svg
            className="mx-auto h-12 w-12 text-blue-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <p className="mt-3 text-base text-gray-700">
            <span className="font-medium text-blue-600 hover:text-blue-700">
              Click to upload
            </span>{" "}
            or drag & drop
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, JPEG up to 10 MB
          </p>
        </div>

        {/* Preview Section */}
        {preview && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-800">Preview</h4>
              <button
                onClick={clearFile}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </div>

            <div className="border rounded-lg p-2 bg-gray-50">
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto object-contain rounded-md"
              />
            </div>

            <p className="text-xs text-gray-600">
              {selectedFile?.name} (
              {(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition"
        >
          {uploading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing with AI...
            </>
          ) : (
            "Upload & Extract Data"
          )}
        </button>
      </div>
    </div>
  );
};

export default OCRUpload;
