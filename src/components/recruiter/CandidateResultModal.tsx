import ResultsDashboard from "../ResultsDashboard";

interface Props {
  interviewId: string;
  onClose: () => void;
}

export default function CandidateResultModal({ interviewId, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50">
      <div className="absolute inset-4 bg-white rounded-xl overflow-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 px-3 py-1 bg-slate-200 rounded"
        >
          Close
        </button>
        <ResultsDashboard interviewId={interviewId} onBack={onClose} />
      </div>
    </div>
  );
}
