interface Props {
  jobs: any[];
  onSelect: (job: any) => void;
  onEdit: (job: any) => void;
  currentUserId: string;
}

export default function JobList({
  jobs,
  onSelect,
  onEdit,
  currentUserId,
}: Props) {
  if (!jobs || jobs.length === 0) {
    return <p>No jobs available.</p>;
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white p-6 rounded-xl shadow"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{job.title}</h3>
              <p className="text-slate-600">{job.company}</p>

              <p className="text-sm mt-1">
                Applicants:{" "}
                <span className="font-semibold">
                  {job.interviews?.[0]?.count ?? 0}
                </span>
              </p>

              {job.recruiter_id === currentUserId && (
                <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                  Your job
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSelect(job)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                View Applicants
              </button>

              {job.recruiter_id === currentUserId && (
                <button
                  onClick={() => onEdit(job)}
                  className="px-4 py-2 bg-slate-200 rounded-lg"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
