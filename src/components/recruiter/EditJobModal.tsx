import { useState } from "react";
import { X } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Props {
  job: any;
  onClose: () => void;
  onUpdated: () => void;
}

export default function EditJobModal({ job, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(job.title);
  const [description, setDescription] = useState(job.description);
  const [requirements, setRequirements] = useState(job.requirements);
  const [location, setLocation] = useState(job.location);
  const [salaryRange, setSalaryRange] = useState(job.salary_range || "");
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    await supabase
      .from("jobs")
      .update({
        title,
        description,
        requirements,
        location,
        salary_range: salaryRange || null,
      })
      .eq("id", job.id);

    setLoading(false);
    onUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400"
        >
          <X />
        </button>

        <h2 className="text-2xl font-bold mb-4">Edit Job</h2>

        <div className="space-y-3">
          <input
            className="w-full border px-3 py-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="w-full border px-3 py-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <textarea
            className="w-full border px-3 py-2 rounded"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <input
            className="w-full border px-3 py-2 rounded"
            value={salaryRange}
            onChange={(e) => setSalaryRange(e.target.value)}
          />

          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
