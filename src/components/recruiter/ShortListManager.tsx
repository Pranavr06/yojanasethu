
'use client';

import { useEffect, useState } from 'react';

type ShortlistManagerProps = {
  driveId: string;
  candidateId: string;
  candidateName: string;
};

export default function ShortlistManager({
  driveId,
  candidateId,
  candidateName,
}: ShortlistManagerProps) {
  const [shortlisted, setShortlisted] = useState(false);

  const storageKey = `recruiter-shortlist-${driveId}`;

  useEffect(() => {
    if (!driveId || !candidateId) return;

    try {
      const saved = localStorage.getItem(storageKey);
      const ids: string[] = saved ? JSON.parse(saved) : [];
      setShortlisted(ids.includes(candidateId));
    } catch (error) {
      console.error('Unable to load shortlist:', error);
    }
  }, [storageKey, driveId, candidateId]);

  function toggleShortlist() {
    try {
      const saved = localStorage.getItem(storageKey);
      const ids: string[] = saved ? JSON.parse(saved) : [];

      const updated = ids.includes(candidateId)
        ? ids.filter((id) => id !== candidateId)
        : [...ids, candidateId];

      localStorage.setItem(storageKey, JSON.stringify(updated));
      setShortlisted(updated.includes(candidateId));
    } catch (error) {
      console.error('Unable to update shortlist:', error);
    }
  }

  return (
    <button
      type="button"
      onClick={toggleShortlist}
      disabled={!driveId || !candidateId}
      aria-pressed={shortlisted}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        shortlisted
          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
          : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {shortlisted ? '✓ Shortlisted' : '+ Shortlist'}
      <span className="sr-only"> {candidateName}</span>
    </button>
  );
}
