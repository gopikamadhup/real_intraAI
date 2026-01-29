import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import JobList from "./JobList";
import JobApplicants from "./JobApplicants";
import JobForm from "./JobForm";
import EditJobModal from "./EditJobModal";

export default function RecruiterDashboard() {
  const { user, signOut } = useAuth();

  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
  const { data, error } = await supabase
    .from("jobs")
    .select(`
      *,
      interviews:interviews(count)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (!error) setJobs(data || []);
  setLoading(false);
  };


  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Recruiter Dashboard</h1>
        <div className="space-x-3">
          <button
            onClick={() => setShowJobForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            + Post Job
          </button>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-slate-200 rounded-lg"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-8">
        {loading ? (
          <p>Loading jobs...</p>
        ) : selectedJob ? (
          <JobApplicants
            job={selectedJob}
            onBack={() => setSelectedJob(null)}
          />
        ) : (
          <JobList
            jobs={jobs}
            onSelect={setSelectedJob}
            onEdit={setEditingJob}
            currentUserId={user!.id}
          />

        )}
      </main>

      {showJobForm && (
        <JobForm
          onClose={() => setShowJobForm(false)}
          onCreated={loadJobs}
        />
      )}

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onUpdated={loadJobs}
        />
      )}
    </div>
  );
}
