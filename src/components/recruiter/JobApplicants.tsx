import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import CandidateResultModal from "./CandidateResultModal";

interface Props {
  job: any;
  onBack: () => void;
}

export default function JobApplicants({ job, onBack }: Props) {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null);

  useEffect(() => {
    loadApplicants();
  }, []);

  const loadApplicants = async () => {
    const { data } = await supabase
      .from("interviews")
      .select(`
        id,
        overall_score,
        candidate:profiles (
          id,
          full_name,
          email
        ),
        resume:resumes (
          file_url
        )
      `)
      .eq("job_id", job.id)
      .eq("status", "completed");

    setInterviews(data || []);
  };

  return (
    <>
      <button onClick={onBack} className="mb-4 text-blue-600">
        ← Back to Jobs
      </button>

      <h2 className="text-2xl font-bold mb-6">
        Applicants – {job.title}
      </h2>

      <div className="space-y-4">
        {interviews.map((i) => (
          <div
            key={i.id}
            className="bg-white p-5 rounded-xl shadow"
          >
            <p className="font-semibold">{i.candidate.full_name}</p>
            <p className="text-sm text-slate-600">{i.candidate.email}</p>
            <p className="text-sm mt-1">
              Score: {i.overall_score?.toFixed(1)}%
            </p>

            <div className="flex gap-4 mt-3">
              {i.resume?.file_url && (
                <a
                  href={i.resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Resume
                </a>
              )}

              <button
                onClick={() => setSelectedInterview(i)}
                className="text-blue-600 underline"
              >
                View Interview Results
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedInterview && (
        <CandidateResultModal
          interviewId={selectedInterview.id}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </>
  );
}
