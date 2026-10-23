
'use client';

import { useEffect, useMemo, useState } from 'react';

type SearchableCandidate = {
  id?: string;
  full_name?: string;
  usn?: string;
  name?: string;
  [key: string]: unknown;
};

type CandidateSearchProps = {
  candidates: SearchableCandidate[];
  onFilteredResults: (results: SearchableCandidate[]) => void;
};

export default function CandidateSearch({
  candidates,
  onFilteredResults,
}: CandidateSearchProps) {
  const [query, setQuery] = useState('');

  const filteredCandidates = useMemo(() => {
    const search = query.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const name =
        typeof candidate.full_name === 'string'
          ? candidate.full_name
          : typeof candidate.name === 'string'
            ? candidate.name
            : '';

      const usn =
        typeof candidate.usn === 'string' ? candidate.usn : '';

      return (
        name.toLowerCase().includes(search) ||
        usn.toLowerCase().includes(search)
      );
    });
  }, [candidates, query]);

  useEffect(() => {
    onFilteredResults(filteredCandidates);
  }, [filteredCandidates, onFilteredResults]);

  return (
    <div className="w-full space-y-2">
      <label
        htmlFor="candidate-search"
        className="block text-sm font-medium text-slate-700 dark:text-slate-300"
      >
        Search candidates
      </label>

      <div className="flex gap-2">
        <input
          id="candidate-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Enter student name or USN..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing {filteredCandidates.length} of {candidates.length} candidates
      </p>
    </div>
  );
}
