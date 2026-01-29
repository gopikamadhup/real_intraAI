import { useState } from "react";
import ResumeUpload from "./ResumeUpload";
import InterviewInterface from "./InterviewInterface";

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
}

interface Props {
  job: Job;
  onBack: () => void;
}

export default function JobProfile({ job, onBack }: Props) {
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [showInterview, setShowInterview] = useState(false);

  if (showInterview) {
    return (
      <InterviewInterface
        job={job}
        onBack={() => setShowInterview(false)}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button onClick={onBack} className="text-blue-600 mb-6">
        ← Back to Jobs
      </button>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
        <p className="text-blue-600 font-semibold mb-4">
          {job.company}
        </p>

        <h3 className="text-lg font-semibold mb-2">Job Description</h3>
        <p className="text-slate-600 mb-4">{job.description}</p>

        <h3 className="text-lg font-semibold mb-2">Requirements</h3>
        <p className="text-slate-600">{job.requirements}</p>
      </div>

      {!resumeUploaded ? (
        <ResumeUpload
          onClose={() => setResumeUploaded(true)}
        />
      ) : (
        <button
          onClick={() => setShowInterview(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Start Interview
        </button>
      )}
    </div>
  );
}
