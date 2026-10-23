'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import CandidateCard from '@/components/CandidateCard';
import CandidateComparisonModal from '@/components/recruiter/CandidateComparisonModal';
import StudentProfileModal from '@/components/recruiter/StudentProfileModal';

import { PlacementDrive, CandidateEvaluation, FullStudentProfile } from '@/types';
import {
  Briefcase,
  CheckCircle2,
  XCircle,
  Users,
  RefreshCw,
  AlertCircle,
  Scale,
  Download,
  Filter,
  ArrowUpDown,
  BookmarkCheck,
  Check,
  FileText,
  Clock,
  MessageSquare,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  Sparkles,
  Search,
  RotateCcw,
  Trophy,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';

export default function RecruiterPage() {
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<string>('');
  const [eligibleCandidates, setEligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [ineligibleCandidates, setIneligibleCandidates] = useState<CandidateEvaluation[]>([]);
  const [activeTab, setActiveTab] = useState<'eligible' | 'ineligible' | 'shortlist'>('eligible');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Discovery & Smart Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const POPULAR_SKILLS = [
    'Python',
    'AWS',
    'React',
    'Machine Learning',
    'Data Structures',
    'PostgreSQL',
    'Docker',
    'Java',
    'Next.js',
    'TypeScript',
    'Cloud Architecture',
    'DSA',
  ];

  const activeSearchTerms = useMemo(() => {
    const terms = searchQuery
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    return Array.from(new Set([...terms, ...selectedSkills]));
  }, [searchQuery, selectedSkills]);
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedMinCgpa, setSelectedMinCgpa] = useState<number>(0);
  const [sortBy, setSortBy] = useState<'score_desc' | 'cgpa_desc' | 'cgpa_asc' | 'name_asc'>('score_desc');

  // Pagination / Load More state
  const [pageSize, setPageSize] = useState<number>(15);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Candidate Selection & Comparison
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<Set<string>>(new Set());
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Shortlist Pipeline & Applications
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [pipelineFilter, setPipelineFilter] = useState<string>('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Modal for viewing student profile from shortlist or card
  const [profileModalStudent, setProfileModalStudent] = useState<FullStudentProfile | null>(null);

  // Modal/Drawer for editing recruiter note & interview feedback
  const [editingAppNote, setEditingAppNote] = useState<{
    id: string;
    studentName: string;
    stage: string;
    currentNote: string;
  } | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBranch, selectedSkill, selectedMinCgpa, sortBy, activeTab, selectedSkills, verifiedOnly]);

  // 1. Fetch Drives
  useEffect(() => {
    async function loadDrives() {
      try {
        const res = await fetch('/api/recruiter/jobs');
        const data = await res.json();
        if (data.drives && data.drives.length > 0) {
          setDrives(data.drives);
          setSelectedDriveId(data.drives[0].id);
        } else {
          setLoading(false);
        }
      } catch (e: any) {
        console.error('Failed to load drives:', e);
        setError('Failed to load recruitment drives from database.');
        setLoading(false);
      }
    }
    loadDrives();
  }, []);

  // 2. Fetch Candidates when drive changes
  const fetchCandidates = useCallback(async (driveId: string) => {
    if (!driveId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setSelectedCandidateIds(new Set()); // Reset selections on drive change
    setCurrentPage(1);
    try {
      const res = await fetch(`/api/recruiter/candidates?driveId=${driveId}`);
      const data = await res.json();
      if (res.ok && data.eligible_candidates) {
        setEligibleCandidates(data.eligible_candidates);
        setIneligibleCandidates(data.ineligible_candidates || []);
      } else {
        setError(data.error || 'Failed to load candidate evaluations from database.');
        setEligibleCandidates([]);
        setIneligibleCandidates([]);
      }
    } catch (e: any) {
      console.error('Candidate fetch error:', e);
      setError(e.message || 'Network error fetching candidates.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 3. Fetch Drive Applications (Shortlist pipeline)
  const fetchApplications = useCallback(async (driveId: string) => {
    if (!driveId) return;
    setLoadingApplications(true);
    try {
      const res = await fetch(`/api/recruiter/applications?driveId=${driveId}`);
      const data = await res.json();
      if (res.ok && data.applications) {
        setApplications(data.applications);
      } else {
        setApplications([]);
      }
    } catch (e: any) {
      console.error('Failed to load applications:', e);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDriveId) {
      fetchCandidates(selectedDriveId);
      fetchApplications(selectedDriveId);
    }
  }, [selectedDriveId, fetchCandidates, fetchApplications]);

  const currentDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  // Map of shortlisted student IDs for fast lookup
  const shortlistedStudentIds = useMemo(() => {
    return new Set(applications.map((app) => app.student_id));
  }, [applications]);

  // Combined candidates map to look up FullStudentProfile for modal
  const candidateStudentMap = useMemo(() => {
    const map = new Map<string, FullStudentProfile>();
    eligibleCandidates.forEach((c) => map.set(c.student.profile.id, c.student));
    ineligibleCandidates.forEach((c) => map.set(c.student.profile.id, c.student));
    return map;
  }, [eligibleCandidates, ineligibleCandidates]);

  // Summary Metrics for the currently selected placement drive
  const summaryMetrics = useMemo(() => {
    const totalCohort = eligibleCandidates.length + ineligibleCandidates.length;
    const eligibleCount = eligibleCandidates.length;
    const shortlistedCount = applications.filter(
      (a) => a.stage === 'shortlisted' || a.stage === 'interview_scheduled' || a.stage === 'interview_completed'
    ).length;
    const selectedCount = applications.filter(
      (a) => a.stage === 'selected' || a.stage === 'offered' || a.stage === 'placed'
    ).length;

    return {
      totalCohort,
      eligibleCount,
      shortlistedCount,
      selectedCount,
    };
  }, [eligibleCandidates, ineligibleCandidates, applications]);

  // Dynamic filter lists
  const availableBranches = useMemo(() => {
    const branches = new Set<string>();
    [...eligibleCandidates, ...ineligibleCandidates].forEach((c) => {
      if (c.student.profile.department_code) {
        branches.add(c.student.profile.department_code);
      }
    });
    return Array.from(branches).sort();
  }, [eligibleCandidates, ineligibleCandidates]);

  const availableSkills = useMemo(() => {
    const skills = new Set<string>();
    if (currentDrive?.required_skills) {
      currentDrive.required_skills.forEach((s: any) => {
        const skillName = typeof s === 'string' ? s : s?.name;
        if (skillName) skills.add(skillName);
      });
    }
    [...eligibleCandidates, ...ineligibleCandidates].forEach((c) => {
      c.student.skills?.forEach((s) => skills.add(s.skill_name));
    });
    return Array.from(skills).sort();
  }, [currentDrive, eligibleCandidates, ineligibleCandidates]);

  // Candidate filtering & sorting
  const processCandidateList = useCallback(
    (candidates: CandidateEvaluation[]) => {
      let filtered = [...candidates];

      // 1. Skill chips filter: Candidate must match all selected skill chips
      if (selectedSkills.length > 0) {
        filtered = filtered.filter((candidate) => {
          const studentSkills = (candidate.student.skills || []).map((s) => s.skill_name.toLowerCase());
          const breakdownSkills = (candidate.skill_breakdown || []).map((sb) => sb.skill_name.toLowerCase());
          const evidenceSkills = (candidate.student.evidence_submissions || []).flatMap((sub) => [
            ...(sub.associated_skills || []),
            ...(sub.technologies || []),
            sub.title || '',
          ]).map((s) => s.toLowerCase());

          const allSkills = [...studentSkills, ...breakdownSkills, ...evidenceSkills];

          return selectedSkills.every((sel) =>
            allSkills.some((s) => s.includes(sel.toLowerCase()))
          );
        });
      }

      // 2. Verified skills only filter
      if (verifiedOnly) {
        filtered = filtered.filter((candidate) => {
          const hasVerifiedPassportSkill = (candidate.student.skills || []).some(
            (s) => s.verification_badge || s.tier === 'faculty_verified' || s.tier === 'expert'
          );
          const hasVerifiedBreakdown = (candidate.skill_breakdown || []).some(
            (sb) => sb.status === 'verified'
          );
          return hasVerifiedPassportSkill || hasVerifiedBreakdown;
        });
      }

      // 3. Multi-keyword search across skills, name, USN, branch, target role, and project evidence
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const keywords = query
          .split(/[\s,]+/)
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        filtered = filtered.filter((candidate) => {
          const name = (candidate.student.profile?.full_name || '').toLowerCase();
          const usn = (candidate.student.profile?.usn || '').toLowerCase();
          const branch = (candidate.student.profile?.department_code || '').toLowerCase();
          const targetRole = (candidate.student.target_role || '').toLowerCase();

          const studentSkills = (candidate.student.skills || []).map((s) => ({
            name: s.skill_name.toLowerCase(),
            category: (s.category || '').toLowerCase(),
          }));

          const breakdownSkills = (candidate.skill_breakdown || []).map((sb) => sb.skill_name.toLowerCase());

          const evidenceTexts = (candidate.student.evidence_submissions || []).flatMap((sub) => [
            ...(sub.associated_skills || []),
            ...(sub.technologies || []),
            sub.title || '',
            sub.description || '',
          ]).map((t) => t.toLowerCase());

          return keywords.every((kw) => {
            return (
              name.includes(kw) ||
              usn.includes(kw) ||
              branch.includes(kw) ||
              targetRole.includes(kw) ||
              studentSkills.some((s) => s.name.includes(kw) || s.category.includes(kw)) ||
              breakdownSkills.some((bs) => bs.includes(kw)) ||
              evidenceTexts.some((et) => et.includes(kw))
            );
          });
        });
      }

      // 2. Branch Filter
      if (selectedBranch !== 'all') {
        filtered = filtered.filter(
          (c) => c.student.profile.department_code === selectedBranch
        );
      }

      // 3. Minimum CGPA Filter
      if (selectedMinCgpa > 0) {
        filtered = filtered.filter(
          (c) => (c.student.academic_record?.cgpa || 0) >= selectedMinCgpa
        );
      }

      // 4. Skill Filter
      if (selectedSkill !== 'all') {
        filtered = filtered.filter((c) => {
          const hasSkill = c.student.skills?.some(
            (s) => s.skill_name.toLowerCase() === selectedSkill.toLowerCase()
          );
          const hasInBreakdown = c.skill_breakdown?.some(
            (b) => b.skill_name.toLowerCase() === selectedSkill.toLowerCase() && b.status !== 'missing'
          );
          return hasSkill || hasInBreakdown;
        });
      }

      // 5. Sorting
      filtered.sort((a, b) => {
        if (sortBy === 'score_desc') {
          return b.match_score - a.match_score;
        }
        if (sortBy === 'cgpa_desc') {
          return (b.student.academic_record?.cgpa || 0) - (a.student.academic_record?.cgpa || 0);
        }
        if (sortBy === 'cgpa_asc') {
          return (a.student.academic_record?.cgpa || 0) - (b.student.academic_record?.cgpa || 0);
        }
        if (sortBy === 'name_asc') {
          return (a.student.profile.full_name || '').localeCompare(b.student.profile.full_name || '');
        }
        return 0;
      });

      return filtered;
    },
    [searchQuery, selectedBranch, selectedMinCgpa, selectedSkill, sortBy, selectedSkills, verifiedOnly]
  );

  const filteredEligibleCandidates = useMemo(
    () => processCandidateList(eligibleCandidates),
    [processCandidateList, eligibleCandidates]
  );

  const filteredIneligibleCandidates = useMemo(
    () => processCandidateList(ineligibleCandidates),
    [processCandidateList, ineligibleCandidates]
  );

  // Paginated Candidate Slices
  const totalFilteredCount = activeTab === 'eligible' ? filteredEligibleCandidates.length : filteredIneligibleCandidates.length;

  const displayedCandidates = useMemo(() => {
    const list = activeTab === 'eligible' ? filteredEligibleCandidates : filteredIneligibleCandidates;
    return list.slice(0, currentPage * pageSize);
  }, [activeTab, filteredEligibleCandidates, filteredIneligibleCandidates, currentPage, pageSize]);

  // Selection handlers
  const handleToggleSelectCandidate = (candidateId: string) => {
    setSelectedCandidateIds((prev) => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
      } else {
        next.add(candidateId);
      }
      return next;
    });
  };

  // Select All vs Deselect All Toggle for Filtered Candidates
  const allFilteredSelected = useMemo(() => {
    const currentList = activeTab === 'eligible' ? filteredEligibleCandidates : filteredIneligibleCandidates;
    if (currentList.length === 0) return false;
    return currentList.every((c) => selectedCandidateIds.has(c.student.profile.id));
  }, [activeTab, filteredEligibleCandidates, filteredIneligibleCandidates, selectedCandidateIds]);

  const handleToggleSelectAll = () => {
    const currentList = activeTab === 'eligible' ? filteredEligibleCandidates : filteredIneligibleCandidates;
    if (allFilteredSelected) {
      setSelectedCandidateIds((prev) => {
        const next = new Set(prev);
        currentList.forEach((c) => next.delete(c.student.profile.id));
        return next;
      });
    } else {
      setSelectedCandidateIds((prev) => {
        const next = new Set(prev);
        currentList.forEach((c) => next.add(c.student.profile.id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedCandidateIds(new Set());
  };

  // Clear All Filters
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedBranch('all');
    setSelectedSkill('all');
    setSelectedMinCgpa(0);
    setSortBy('score_desc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedBranch !== 'all' ||
    selectedSkill !== 'all' ||
    selectedMinCgpa > 0 ||
    sortBy !== 'score_desc';

  // Selected candidates for comparison modal
  const selectedCandidateObjects = useMemo(() => {
    const all = [...eligibleCandidates, ...ineligibleCandidates];
    return all.filter((c) => selectedCandidateIds.has(c.student.profile.id));
  }, [eligibleCandidates, ineligibleCandidates, selectedCandidateIds]);

  // Shortlisting actions
  const handleShortlistCandidate = async (studentId: string) => {
    if (!selectedDriveId) return;
    try {
      const res = await fetch('/api/recruiter/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveId: selectedDriveId,
          studentIds: [studentId],
          notes: 'Shortlisted by recruiter from Evidence-Ranked Talent Pipeline.',
        }),
      });

      if (res.ok) {
        showSuccessBanner('Candidate successfully added to Shortlist pipeline.');
        fetchApplications(selectedDriveId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to shortlist candidate.');
      }
    } catch (e: any) {
      console.error('Shortlist error:', e);
      setError(e.message || 'Error shortlisting candidate');
    }
  };

  const handleBatchShortlist = async () => {
    if (!selectedDriveId || selectedCandidateIds.size === 0) return;
    try {
      const studentIds = Array.from(selectedCandidateIds);
      const res = await fetch('/api/recruiter/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driveId: selectedDriveId,
          studentIds,
          notes: `Batch shortlisted (${studentIds.length} candidates) from Recruiter Intelligence Desk.`,
        }),
      });

      if (res.ok) {
        showSuccessBanner(`Successfully shortlisted ${studentIds.length} candidate(s)!`);
        handleClearSelection();
        fetchApplications(selectedDriveId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to batch shortlist candidates.');
      }
    } catch (e: any) {
      console.error('Batch shortlist error:', e);
      setError(e.message || 'Error in batch shortlisting');
    }
  };

  // Update application stage in pipeline
  const handleUpdateStage = async (applicationId: string, newStage: string) => {
    try {
      const res = await fetch('/api/recruiter/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          stage: newStage,
        }),
      });

      if (res.ok) {
        showSuccessBanner(`Application stage updated to ${newStage.replace(/_/g, ' ')}.`);
        fetchApplications(selectedDriveId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update application stage.');
      }
    } catch (e: any) {
      console.error('Update stage error:', e);
      setError(e.message || 'Error updating application stage');
    }
  };

  // Update application stage by student ID (for modal action)
  const handleUpdateStageByStudentId = async (studentId: string, newStage: string) => {
    const app = applications.find((a) => a.student_id === studentId);
    if (!app) {
      // If not yet in applications table, shortlist first
      await handleShortlistCandidate(studentId);
      return;
    }
    await handleUpdateStage(app.id, newStage);
  };

  // Open notes editor for a student
  const handleOpenNotesForStudent = (studentId: string, studentName: string) => {
    const app = applications.find((a) => a.student_id === studentId);
    if (app) {
      setEditingAppNote({
        id: app.id,
        studentName: app.student_name || studentName,
        stage: app.stage || 'shortlisted',
        currentNote: app.notes || '',
      });
      setNoteInput(app.notes || '');
      setFeedbackInput('');
    } else {
      // If not yet shortlisted, add to shortlist then open notes
      handleShortlistCandidate(studentId).then(() => {
        fetchApplications(selectedDriveId);
      });
    }
  };

  // Save recruiter note & feedback
  const handleSaveNoteAndFeedback = async () => {
    if (!editingAppNote) return;
    setIsSavingNote(true);
    try {
      const res = await fetch('/api/recruiter/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: editingAppNote.id,
          stage: editingAppNote.stage,
          notes: noteInput,
          feedback: feedbackInput,
        }),
      });

      if (res.ok) {
        showSuccessBanner('Recruiter feedback & notes saved successfully.');
        setEditingAppNote(null);
        setNoteInput('');
        setFeedbackInput('');
        fetchApplications(selectedDriveId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save notes.');
      }
    } catch (e: any) {
      console.error('Note save error:', e);
      setError(e.message || 'Error saving recruiter notes');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Remove from shortlist
  const handleRemoveApplication = async (applicationId: string) => {
    if (!confirm('Are you sure you want to remove this candidate from the shortlist?')) {
      return;
    }
    try {
      const res = await fetch(`/api/recruiter/applications?id=${applicationId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showSuccessBanner('Candidate removed from shortlist.');
        fetchApplications(selectedDriveId);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to remove candidate.');
      }
    } catch (e: any) {
      console.error('Remove application error:', e);
      setError(e.message || 'Error removing candidate');
    }
  };

  // Helper for success notification
  const showSuccessBanner = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => {
      setActionSuccessMsg(null);
    }, 4000);
  };

  // Export Shortlist to CSV
  const handleExportCsv = () => {
    if (applications.length === 0) {
      alert('No shortlisted candidates available to export.');
      return;
    }

    const headers = [
      'Candidate Name',
      'USN',
      'Email',
      'Department',
      'CGPA',
      'Active Backlogs',
      'Contineo Verified',
      'Placement Drive',
      'Role Title',
      'Package (LPA)',
      'Application Stage',
      'Mentor Verified Skills',
      'Total Skills',
      'Recruiter Notes',
      'Applied Date',
      'Last Updated',
    ];

    const rows = applications.map((app) => {
      const c = candidateStudentMap.get(app.student_id);
      return [
        app.student_name || c?.profile?.full_name || 'N/A',
        app.student_usn || c?.profile?.usn || 'N/A',
        app.student_email || c?.profile?.email || 'N/A',
        app.student_department || c?.profile?.department_code || 'N/A',
        app.cgpa !== undefined ? app.cgpa : (c?.academic_record?.cgpa || 0),
        app.active_backlogs !== undefined ? app.active_backlogs : (c?.academic_record?.active_backlogs || 0),
        app.is_contineo_verified ? 'Yes' : 'No',
        app.company_name || currentDrive?.company_name || 'N/A',
        app.role_title || currentDrive?.role_title || 'N/A',
        currentDrive?.ctc_lpa || 'N/A',
        app.stage || 'shortlisted',
        app.verified_skills_count || (c?.skills?.filter((s) => s.verification_badge).length || 0),
        app.total_skills_count || (c?.skills?.length || 0),
        app.notes || '',
        app.applied_at || '',
        app.updated_at || '',
      ];
    });

    const csvContent = [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((row) =>
        row
          .map((val) => {
            const str = String(val ?? '');
            return `"${str.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeCompanyName = (currentDrive?.company_name || 'Company').replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    link.href = url;
    link.setAttribute('download', `YojanaSethu_Shortlist_${safeCompanyName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered applications by stage
  const filteredApplications = useMemo(() => {
    if (pipelineFilter === 'all') return applications;
    return applications.filter((app) => {
      if (pipelineFilter === 'interview_completed') {
        return (
          app.notes?.includes('[STAGE: Interview Completed]') ||
          app.stage === 'interview_completed'
        );
      }
      return app.stage === pipelineFilter;
    });
  }, [applications, pipelineFilter]);

  return (
    <div className="space-y-6">
      {/* 1. Recruiter Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E1B4B] via-[#0F172A] to-[#1E1B4B] border border-purple-500/30 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
              <Briefcase className="w-3.5 h-3.5" />
              <span>RECRUITER INTELLIGENCE DESK</span>
              <span>•</span>
              <span>{currentDrive ? `${currentDrive.company_name} • Campus Drive` : 'NMAMIT Placement Desk'}</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Evidence-Ranked Talent Pipeline
            </h1>

            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated Contineo ERP eligibility screening (CGPA, backlogs, branch) combined with faculty-endorsed GitHub repositories and certificate audits.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center shrink-0 flex-wrap">
            <button
              onClick={() => {
                fetchCandidates(selectedDriveId);
                fetchApplications(selectedDriveId);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-md"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Desk</span>
            </button>

            <button
              onClick={handleExportCsv}
              disabled={applications.length === 0}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all"
              title="Download Shortlisted Candidates as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Shortlist CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button
            onClick={() => setActionSuccessMsg(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. SUMMARY METRIC CARDS (Total Candidates, Eligible, Shortlisted, Selected) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: TOTAL CANDIDATES */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              TOTAL CANDIDATES
            </span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white">
            {summaryMetrics.totalCohort} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Evaluated in Cohort
          </span>
        </div>

        {/* Card 2: ELIGIBLE CANDIDATES */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              ELIGIBLE CANDIDATES
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {summaryMetrics.eligibleCount} <span className="text-xs font-normal text-slate-400">Students</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Passed CGPA & Cutoff Gate
          </span>
        </div>

        {/* Card 3: SHORTLISTED */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              SHORTLISTED
            </span>
            <BookmarkCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-purple-600 dark:text-purple-400">
            {summaryMetrics.shortlistedCount} <span className="text-xs font-normal text-slate-400">In Pipeline</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Review & Interview Stages
          </span>
        </div>

        {/* Card 4: SELECTED (OFFERS) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-400 dark:hover:border-slate-700">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
              SELECTED
            </span>
            <Trophy className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {summaryMetrics.selectedCount} <span className="text-xs font-normal text-slate-400">Placed</span>
          </div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 block">
            Offers Extended
          </span>
        </div>
      </div>

      {/* 3. Drive Selector & Hard Eligibility Rules Bar */}
      <div id="placement-drives" className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 shrink-0">
              Active Placement Drive:
            </label>
            <select
              value={selectedDriveId}
              onChange={(e) => setSelectedDriveId(e.target.value)}
              disabled={drives.length === 0}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 w-full max-w-md"
            >
              {drives.length === 0 ? (
                <option value="">No Placement Drives Available in Database</option>
              ) : (
                drives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.company_name} — {d.role_title} ({d.ctc_lpa} LPA)
                  </option>
                ))
              )}
            </select>
          </div>

          {currentDrive && (
            <div id="cutoff-filter" className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 flex-wrap">
              <span>
                Min CGPA: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.min_cgpa.toFixed(2)}</strong>
              </span>
              <span>•</span>
              <span>
                Branches: <strong className="text-slate-900 dark:text-white">{currentDrive.eligible_branches.join(', ')}</strong>
              </span>
              <span>•</span>
              <span>
                Max Backlogs: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.max_active_backlogs}</strong>
              </span>
              <span>•</span>
              <span>
                Batch: <strong className="text-slate-900 dark:text-white font-mono">{currentDrive.batch_year}</strong>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4. Candidate Discovery, Search, Smart Filters & Clear All Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Keyword & Skill Talent Discovery</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Search by student skills (e.g., Python, AWS, React), project evidence, branch, or USN.
            </p>
          </div>

          {/* Verified Skills Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-purple-400 transition-colors self-start sm:self-center">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 w-3.5 h-3.5 cursor-pointer"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Verified Skills Only</span>
          </label>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="recruiter-candidate-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords: 'Python, AWS', 'Machine Learning', 'React', 'DSA', student name, or USN..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Skill Filter Pills */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold flex items-center gap-1">
              <Tag className="w-3 h-3 text-purple-500" />
              <span>Filter by In-Demand Student Skills:</span>
            </span>

            {(selectedSkills.length > 0 || searchQuery || verifiedOnly || selectedBranch !== 'all' || selectedSkill !== 'all' || selectedMinCgpa > 0) && (
              <button
                onClick={() => {
                  setSelectedSkills([]);
                  setSearchQuery('');
                  setVerifiedOnly(false);
                  setSelectedBranch('all');
                  setSelectedSkill('all');
                  setSelectedMinCgpa(0);
                }}
                className="text-purple-600 dark:text-purple-400 font-bold hover:underline"
              >
                Clear All Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {POPULAR_SKILLS.map((skill) => {
              const isSelected = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => {
                    setSelectedSkills((prev) =>
                      isSelected ? prev.filter((s) => s !== skill) : [...prev, skill]
                    );
                  }}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all flex items-center gap-1 border ${
                    isSelected
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Sparkles className={`w-2.5 h-2.5 ${isSelected ? 'text-amber-300' : 'text-purple-400'}`} />
                  <span>{skill}</span>
                  {isSelected && <X className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Branch Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Branch / Department
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Branches</option>
              {availableBranches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Skill Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Filter by Skill
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Skills</option>
              {availableSkills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Min CGPA Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Minimum CGPA
            </label>
            <select
              value={selectedMinCgpa}
              onChange={(e) => setSelectedMinCgpa(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value={0}>Any CGPA</option>
              <option value={7.0}>7.0+ CGPA</option>
              <option value={7.5}>7.5+ CGPA</option>
              <option value={8.0}>8.0+ CGPA</option>
              <option value={8.5}>8.5+ CGPA</option>
              <option value={9.0}>9.0+ CGPA</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Sort Candidates
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
            >
              <option value="score_desc">Match Score (High to Low)</option>
              <option value="cgpa_desc">CGPA (High to Low)</option>
              <option value="cgpa_asc">CGPA (Low to High)</option>
              <option value="name_asc">Candidate Name (A - Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & CLEAR ALL FILTERS Button */}
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
            <span>
              Active Filters: {selectedBranch !== 'all' && `Branch: ${selectedBranch} • `}
              {selectedSkill !== 'all' && `Skill: ${selectedSkill} • `}
              {selectedMinCgpa > 0 && `Min CGPA: ${selectedMinCgpa} • `}
              {searchQuery && `Search: "${searchQuery}"`}
            </span>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 hover:underline font-semibold self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Floating Selection Toolbar for Comparison & Batch Shortlisting */}
      {selectedCandidateIds.size > 0 && (
        <div className="sticky top-4 z-40 p-4 rounded-2xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-purple-500/40 shadow-2xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold font-mono">
              {selectedCandidateIds.size}
            </span>
            <span className="text-xs font-semibold">
              Candidate{selectedCandidateIds.size > 1 ? 's' : ''} Selected
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              (Across all pages • Select 2 to 4 to compare side-by-side)
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsComparisonModalOpen(true)}
              disabled={selectedCandidateIds.size < 2 || selectedCandidateIds.size > 4}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition-all"
              title={
                selectedCandidateIds.size < 2
                  ? 'Select at least 2 candidates to compare'
                  : selectedCandidateIds.size > 4
                  ? 'Maximum 4 candidates can be compared at once'
                  : 'Compare candidates side by side'
              }
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                Compare Selected ({selectedCandidateIds.size})
              </span>
            </button>

            <button
              onClick={handleBatchShortlist}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Shortlist Selected ({selectedCandidateIds.size})</span>
            </button>

            <button
              onClick={handleClearSelection}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* 5. Main Desk Tabs: Eligible vs Disqualified vs Shortlist Pipeline */}
      <div id="candidate-rankings" className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('eligible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'eligible'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Eligible Candidates ({filteredEligibleCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ineligible')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'ineligible'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Disqualified by Rules ({filteredIneligibleCandidates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shortlist')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === 'shortlist'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
            }`}
          >
            <BookmarkCheck className="w-4 h-4 text-purple-400" />
            <span>Shortlist Pipeline ({applications.length})</span>
          </button>
        </div>

        {/* Tab-specific actions: Select All / Deselect All Toggle */}
        {activeTab !== 'shortlist' ? (
          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={handleToggleSelectAll}
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              {allFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Deselect All Filtered</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>Select All Filtered ({totalFilteredCount})</span>
                </>
              )}
            </button>
            <span className="text-xs text-slate-400 hidden lg:inline">|</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 hidden lg:inline">
              Verified (+2 pts) &gt; Claimed (+1 pt)
            </span>
          </div>
        ) : (
          <button
            onClick={handleExportCsv}
            disabled={applications.length === 0}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1.5 self-end sm:self-center"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Spreadsheet</span>
          </button>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              fetchCandidates(selectedDriveId);
              fetchApplications(selectedDriveId);
            }}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold text-xs hover:bg-rose-500 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* 6. TAB CONTENT: ELIGIBLE / DISQUALIFIED / SHORTLIST */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 dark:text-slate-400">Evaluating student skill passports against drive criteria...</p>
        </div>
      ) : drives.length === 0 ? (
        <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No recruitment drives found in database.</p>
        </div>
      ) : activeTab === 'eligible' ? (
        filteredEligibleCandidates.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {hasActiveFilters
                ? 'No eligible candidates match the selected filters.'
                : 'No candidates currently meet all hard criteria for this drive.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="mt-2 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCandidates.map((candidate, idx) => {
              const studentId = candidate.student.profile.id;
              const isSelected = selectedCandidateIds.has(studentId);
              const isShortlisted = shortlistedStudentIds.has(studentId);
              const app = applications.find((a) => a.student_id === studentId);

              return (
                <CandidateCard
                  key={studentId}
                  candidate={candidate}
                  rank={idx + 1}
                  searchKeywords={activeSearchTerms}
                  drive={currentDrive}
                  isSelected={isSelected}
                  onToggleSelect={handleToggleSelectCandidate}
                  isShortlisted={isShortlisted}
                  shortlistStage={app?.stage || 'shortlisted'}
                  onShortlist={handleShortlistCandidate}
                  onUpdateStage={handleUpdateStageByStudentId}
                  onOpenNotes={handleOpenNotesForStudent}
                />
              );
            })}

            {/* Pagination / Load More Footer */}
            {displayedCandidates.length < filteredEligibleCandidates.length && (
              <div className="py-6 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-3">
                  Showing {displayedCandidates.length} of {filteredEligibleCandidates.length} candidates
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Load More Candidates ({filteredEligibleCandidates.length - displayedCandidates.length} remaining)</span>
                </button>
              </div>
            )}
          </div>
        )
      ) : activeTab === 'ineligible' ? (
        filteredIneligibleCandidates.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {hasActiveFilters
                ? 'No disqualified candidates match the selected filters.'
                : 'No candidates were disqualified for this drive.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="mt-2 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedCandidates.map((candidate, idx) => {
              const studentId = candidate.student.profile.id;
              const isSelected = selectedCandidateIds.has(studentId);
              const isShortlisted = shortlistedStudentIds.has(studentId);
              const app = applications.find((a) => a.student_id === studentId);

              return (
                <CandidateCard
                  key={studentId}
                  candidate={candidate}
                  rank={idx + 1}
                  drive={currentDrive}
                  isSelected={isSelected}
                  onToggleSelect={handleToggleSelectCandidate}
                  isShortlisted={isShortlisted}
                  shortlistStage={app?.stage || 'shortlisted'}
                  onShortlist={handleShortlistCandidate}
                  onUpdateStage={handleUpdateStageByStudentId}
                  onOpenNotes={handleOpenNotesForStudent}
                />
              );
            })}

            {/* Pagination / Load More Footer */}
            {displayedCandidates.length < filteredIneligibleCandidates.length && (
              <div className="py-6 text-center border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 mb-3">
                  Showing {displayedCandidates.length} of {filteredIneligibleCandidates.length} candidates
                </p>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Load More Candidates ({filteredIneligibleCandidates.length - displayedCandidates.length} remaining)</span>
                </button>
              </div>
            )}
          </div>
        )
      ) : (
        /* SHORTLIST MANAGEMENT PIPELINE TAB */
        <div className="space-y-6">
          {/* Sub-stage filter tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'all', label: 'All Shortlisted', count: applications.length },
              {
                id: 'shortlisted',
                label: 'Shortlisted',
                count: applications.filter((a) => a.stage === 'shortlisted').length,
              },
              {
                id: 'interview_scheduled',
                label: 'Interview Scheduled',
                count: applications.filter(
                  (a) => a.stage === 'interview_scheduled' && !a.notes?.includes('[STAGE: Interview Completed]')
                ).length,
              },
              {
                id: 'interview_completed',
                label: 'Interview Completed',
                count: applications.filter(
                  (a) => a.notes?.includes('[STAGE: Interview Completed]') || a.stage === 'interview_completed'
                ).length,
              },
              {
                id: 'selected',
                label: 'Selected / Offer',
                count: applications.filter((a) => a.stage === 'selected').length,
              },
              {
                id: 'rejected',
                label: 'Rejected',
                count: applications.filter((a) => a.stage === 'rejected').length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPipelineFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  pipelineFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Applications list */}
          {loadingApplications ? (
            <div className="py-16 text-center">
              <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-400">Loading shortlist applications...</p>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookmarkCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {applications.length === 0
                  ? 'No candidates have been shortlisted for this placement drive yet.'
                  : `No candidates in "${pipelineFilter.replace(/_/g, ' ')}" stage.`}
              </p>
              {applications.length === 0 && (
                <button
                  onClick={() => setActiveTab('eligible')}
                  className="mt-3 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold shadow hover:bg-purple-500 transition-colors"
                >
                  Browse Eligible Candidates to Shortlist
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => {
                const studentFullProfile = candidateStudentMap.get(app.student_id);
                const isInterviewCompleted =
                  app.notes?.includes('[STAGE: Interview Completed]') ||
                  app.stage === 'interview_completed';
                const currentDisplayStage = isInterviewCompleted
                  ? 'interview_completed'
                  : app.stage;

                return (
                  <div
                    key={app.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-purple-500/40"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Left: Student info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-bold text-slate-900 dark:text-white">
                            {app.student_name}
                          </span>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {app.student_usn}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            {app.student_department}
                          </span>
                          {app.is_contineo_verified && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 font-medium">
                              Contineo Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                          <span>
                            CGPA:{' '}
                            <strong className="text-slate-900 dark:text-white font-mono">
                              {Number(app.cgpa).toFixed(2)}
                            </strong>
                          </span>
                          <span>
                            Backlogs:{' '}
                            <strong
                              className={
                                app.active_backlogs > 0
                                  ? 'text-rose-500 font-mono'
                                  : 'text-emerald-500 font-mono'
                              }
                            >
                              {app.active_backlogs}
                            </strong>
                          </span>
                          <span>
                            Verified Skills:{' '}
                            <strong className="text-purple-600 dark:text-purple-400 font-mono">
                              {app.verified_skills_count} / {app.total_skills_count}
                            </strong>
                          </span>
                          {app.applied_at && (
                            <span className="text-slate-400">
                              Added: {new Date(app.applied_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Stage Control & Actions */}
                      <div className="flex items-center gap-2.5 flex-wrap self-end md:self-center">
                        {/* Stage Selector */}
                        <div className="flex items-center gap-1.5">
                          <label className="text-[11px] text-slate-400 font-medium">Stage:</label>
                          <select
                            value={currentDisplayStage}
                            onChange={(e) => handleUpdateStage(app.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all focus:outline-none ${
                              currentDisplayStage === 'selected'
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                                : currentDisplayStage === 'rejected'
                                ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/40'
                                : currentDisplayStage === 'interview_scheduled'
                                ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40'
                                : currentDisplayStage === 'interview_completed'
                                ? 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/40'
                                : 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40'
                            }`}
                          >
                            <option value="shortlisted">Shortlisted</option>
                            <option value="interview_scheduled">Interview Scheduled</option>
                            <option value="interview_completed">Interview Completed</option>
                            <option value="selected">Selected (Offer)</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </div>

                        {/* View Profile Action */}
                        {studentFullProfile && (
                          <button
                            onClick={() => setProfileModalStudent(studentFullProfile)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                            title="View student profile and resume"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Profile</span>
                          </button>
                        )}

                        {/* Edit Feedback & Notes Button */}
                        <button
                          onClick={() => {
                            setEditingAppNote({
                              id: app.id,
                              studentName: app.student_name,
                              stage: currentDisplayStage,
                              currentNote: app.notes || '',
                            });
                            setNoteInput(app.notes || '');
                            setFeedbackInput('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                          title="Add recruiter feedback or interview evaluation notes"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                          <span>Notes</span>
                        </button>

                        {/* Delete Application */}
                        <button
                          onClick={() => handleRemoveApplication(app.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Remove candidate from shortlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Recruiter Notes / Interview Feedback Box */}
                    {app.notes && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-purple-500 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-500 dark:text-slate-400">Recruiter Notes:</span>
                          <p className="whitespace-pre-line text-slate-600 dark:text-slate-300">{app.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 7. CANDIDATE COMPARISON MODAL */}
      <CandidateComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        candidates={selectedCandidateObjects}
        drive={currentDrive}
        onShortlistCandidate={handleShortlistCandidate}
        shortlistedStudentIds={shortlistedStudentIds}
      />

      {/* 8. STUDENT PROFILE MODAL */}
      {profileModalStudent && (
        <StudentProfileModal
          student={profileModalStudent}
          onClose={() => setProfileModalStudent(null)}
          drive={currentDrive}
          isShortlisted={shortlistedStudentIds.has(profileModalStudent.profile.id)}
          shortlistStage={
            applications.find((a) => a.student_id === profileModalStudent.profile.id)?.stage || 'shortlisted'
          }
          onShortlist={handleShortlistCandidate}
          onUpdateStage={handleUpdateStageByStudentId}
          onOpenNotes={handleOpenNotesForStudent}
          isSelectedForCompare={selectedCandidateIds.has(profileModalStudent.profile.id)}
          onToggleCompare={handleToggleSelectCandidate}
        />
      )}

      {/* 9. RECRUITER NOTES & FEEDBACK MODAL */}
      {editingAppNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in"
          onClick={() => setEditingAppNote(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-500" />
                  <span>Recruiter Feedback & Notes</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Candidate: <strong className="text-slate-700 dark:text-slate-200">{editingAppNote.studentName}</strong>
                </p>
              </div>
              <button
                onClick={() => setEditingAppNote(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  General Evaluation / Recruiter Notes
                </label>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Strong foundation in system design; impressive portfolio projects; approved for round 2."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Interview Round Feedback (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="e.g. Technical Round 1: Solved graph algorithms cleanly. Communication 9/10."
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-slate-900 dark:text-white outline-none focus:border-purple-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingAppNote(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNoteAndFeedback}
                disabled={isSavingNote}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isSavingNote ? 'Saving...' : 'Save Feedback & Notes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
