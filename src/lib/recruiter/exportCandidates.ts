
export type ExportCandidate = {
  name: string;
  usn: string;
  department: string;
  cgpa: number | string;
  activeBacklogs: number | string;
  matchScore: number | string;
  eligible: boolean;
  shortlisted: boolean;
};

function escapeCsv(value: unknown): string {
  let text = String(value ?? '');

  // Prevent spreadsheet formula injection.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function exportCandidatesToCsv(
  candidates: ExportCandidate[],
  filename = 'recruiter-candidates.csv',
): void {
  const headers = [
    'Name',
    'USN',
    'Department',
    'CGPA',
    'Active Backlogs',
    'Match Score',
    'Eligible',
    'Shortlisted',
  ];

  const rows = candidates.map((candidate) => [
    candidate.name,
    candidate.usn,
    candidate.department,
    candidate.cgpa,
    candidate.activeBacklogs,
    candidate.matchScore,
    candidate.eligible ? 'Yes' : 'No',
    candidate.shortlisted ? 'Yes' : 'No',
  ]);

  const csv = [
    headers.map(escapeCsv).join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF', csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}
