'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Users,
  UserCheck,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Trash2,
  GraduationCap,
  Building2,
} from 'lucide-react';
import { MentorWithMenteesSummary } from '@/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AssignMentorModal({ isOpen, onClose, onSuccess }: Props) {
  const [mentors, setMentors] = useState<MentorWithMenteesSummary[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [selectedMentorId, setSelectedMentorId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [unassigningId, setUnassigningId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [studentSearch, setStudentSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/placements/mentees/assign');
      const data = await res.json();
      if (data.success) {
        setMentors(data.mentors || []);
        setUnassignedStudents(data.unassignedStudents || []);
        if (data.mentors?.length > 0 && !selectedMentorId) {
          setSelectedMentorId(data.mentors[0].id);
        }
      }
    } catch (e: any) {
      setFeedback({ text: e.message || 'Failed to load mentor rosters', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentMentor = mentors.find((m) => m.id === selectedMentorId) || mentors[0];
  const isCurrentMentorFull = currentMentor ? currentMentor.mentee_count >= 12 : false;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentorId || !selectedStudentId) {
      setFeedback({ text: 'Please select a student to assign.', type: 'error' });
      return;
    }

    if (isCurrentMentorFull) {
      setFeedback({
        text: 'Cannot assign: This mentor already has 12 mentees (maximum capacity).',
        type: 'error',
      });
      return;
    }

    setAssigning(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/placements/mentees/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mentorId: selectedMentorId,
          studentId: selectedStudentId,
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to assign mentee');
      }

      setFeedback({
        text: 'Student successfully allocated to faculty mentor!',
        type: 'success',
      });
      setSelectedStudentId('');
      setNotes('');
      await loadData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Network error occurred', type: 'error' });
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async (studentId: string) => {
    setUnassigningId(studentId);
    setFeedback(null);
    try {
      const res = await fetch(`/api/placements/mentees/assign?student_id=${encodeURIComponent(studentId)}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to remove mentee');
      }
      setFeedback({ text: 'Student unassigned successfully.', type: 'success' });
      await loadData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setFeedback({ text: err.message || 'Network error occurred', type: 'error' });
    } finally {
      setUnassigningId(null);
    }
  };

  const filteredUnassigned = unassignedStudents.filter((s) => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return (
      (s.full_name || '').toLowerCase().includes(q) ||
      (s.usn || '').toLowerCase().includes(q) ||
      (s.department_code || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0C1322] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-r from-indigo-900/20 via-blue-900/10 to-transparent flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  Placement Governance Desk
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  Limit: 12 Mentees Max / Mentor
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                Faculty Mentor & Mentee Allocation Gateway
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assign graduating students to official faculty mentors. Every teacher can supervise at most 12 mentees.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-6 py-3 text-xs flex items-center gap-2 border-b ${
              feedback.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>
        )}

        {/* Modal Body: Split View */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left Column: Mentors List (5 cols) */}
          <div className="md:col-span-5 p-5 space-y-3 bg-slate-50/50 dark:bg-slate-950/30 overflow-y-auto max-h-[60vh]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Faculty Mentors ({mentors.length})
              </span>
              <button
                onClick={loadData}
                disabled={loading}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                title="Refresh Rosters"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-slate-400">Loading mentors...</div>
            ) : mentors.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No mentors found.</div>
            ) : (
              mentors.map((m) => {
                const isSelected = m.id === selectedMentorId;
                const percent = Math.min(100, Math.round((m.mentee_count / 12) * 100));

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMentorId(m.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 shadow-sm'
                        : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {m.full_name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {m.designation || 'Faculty Mentor'}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400">{m.email}</p>
                      </div>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {m.department_code || 'ISE'}
                      </span>
                    </div>

                    {/* Mentee Capacity Bar */}
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Mentees</span>
                        <span
                          className={
                            m.mentee_count >= 12
                              ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                              : 'text-indigo-600 dark:text-indigo-400'
                          }
                        >
                          {m.mentee_count} / 12 Max
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            m.mentee_count >= 12 ? 'bg-amber-500' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="text-[9px] text-right text-slate-400">
                        {m.mentee_count >= 12
                          ? 'Capacity Full'
                          : `${12 - m.mentee_count} slots open`}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Manage Selected Mentor (7 cols) */}
          <div className="md:col-span-7 p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            {currentMentor ? (
              <>
                {/* Active Mentor Header */}
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Active Supervised Cohort
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {currentMentor.full_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentMentor.designation} • {currentMentor.department_name || currentMentor.department_code}
                    </p>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                        isCurrentMentorFull
                          ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                      }`}
                    >
                      {currentMentor.mentee_count} / 12 Mentees
                    </span>
                  </div>
                </div>

                {/* Form to Assign New Student */}
                <form onSubmit={handleAssign} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 bg-white dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4 text-indigo-500" />
                      <span>Allocate New Mentee</span>
                    </h4>
                    {isCurrentMentorFull && (
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        12-Mentee Limit Reached
                      </span>
                    )}
                  </div>

                  {isCurrentMentorFull ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <strong className="block font-bold">Maximum Mentee Limit Reached</strong>
                        <span>
                          {currentMentor.full_name} has already reached the maximum institutional allocation limit of 12 mentees. To allocate another student, please select another mentor or unassign an existing mentee.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Search / Select Student */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Select Unassigned Student:
                        </label>
                        <select
                          value={selectedStudentId}
                          onChange={(e) => setSelectedStudentId(e.target.value)}
                          disabled={assigning}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Choose student from pool ({unassignedStudents.length} available) --</option>
                          {unassignedStudents.map((st) => (
                            <option key={st.id} value={st.id}>
                              {st.full_name} ({st.usn || 'No USN'}) - {st.department_code || 'GEN'} (CGPA: {st.cgpa ? Number(st.cgpa).toFixed(2) : 'N/A'})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes / Special Instructions */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Placement Allocation Notes (Optional):
                        </label>
                        <input
                          type="text"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="e.g. Focus on Tier 1 Dream drives and SQL/DSA proofs"
                          className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={assigning || !selectedStudentId}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                      >
                        {assigning ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Allocating Student...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Confirm Mentee Allocation</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </form>

                {/* Currently Assigned Mentees Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Currently Assigned Mentees ({currentMentor.mentees.length})
                    </h4>
                  </div>

                  {currentMentor.mentees.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                      No mentees currently assigned to {currentMentor.full_name}.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                      {currentMentor.mentees.map((st) => (
                        <div
                          key={st.id}
                          className="p-3 bg-white dark:bg-slate-900/70 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {st.full_name}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="font-mono">{st.usn}</span>
                              <span>•</span>
                              <span>{st.department_code || 'ISE'}</span>
                              <span>•</span>
                              <span>CGPA: <strong>{st.cgpa ? Number(st.cgpa).toFixed(2) : '8.50'}</strong></span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleUnassign(st.id)}
                            disabled={unassigningId === st.id}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="Remove from mentor"
                          >
                            {unassigningId === st.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-xs text-slate-400">
                Select a faculty mentor from the left roster to manage their assigned cohort.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Strict Capacity Gate: Maximum 12 Mentees enforced in database.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close Desk
          </button>
        </div>
      </div>
    </div>
  );
}
