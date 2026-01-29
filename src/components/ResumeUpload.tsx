import { useState, useCallback } from "react";
import { X, Upload, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface ResumeUploadProps {
  onClose: () => void;
  onUploaded?: () => void; // ✅ IMPORTANT
}

export default function ResumeUpload({ onClose, onUploaded }: ResumeUploadProps) {
  const { user } = useAuth();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (
      droppedFile &&
      (droppedFile.type === "application/pdf" ||
        droppedFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    ) {
      setFile(droppedFile);
      setError("");
    } else {
      setError("Please upload a PDF or DOCX file");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setError("");

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("resumes")
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from("resumes").insert({
        candidate_id: user.id,
        file_name: file.name,
        file_url: data.publicUrl,
        parsed_data: {},
      });

      if (dbError) throw dbError;

      setUploaded(true);

      // ✅ Notify parent (JobProfile)
      if (onUploaded) {
        onUploaded();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-bold mb-6">Upload Your Resume</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        {uploaded ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600">Resume uploaded successfully</p>
          </div>
        ) : (
          <>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300"
              }`}
            >
              {file ? (
                <p className="font-semibold">{file.name}</p>
              ) : (
                <p>Drag & drop or browse resume (PDF/DOCX)</p>
              )}
            </div>

            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full mt-6 py-3 bg-blue-600 text-white rounded-lg"
              >
                {uploading ? "Uploading..." : "Upload Resume"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
