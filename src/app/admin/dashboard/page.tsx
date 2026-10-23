'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  Check,
  AlertCircle,
  Loader2,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { getRoleLabel } from '@/lib/rbac';

interface RoleRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  requested_role: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface UserSummary {
  id: string;
  full_name: string;
  email: string;
  role: string;
  department?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'users'>('requests');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch pending role requests
      const reqRes = await fetch('/api/admin/role-requests');
      const reqJson = await reqRes.json();
      if (reqJson.requests) {
        setRequests(reqJson.requests);
      }

      // 2. Fetch profiles / users from DB
      const profRes = await fetch('/api/students');
      const profJson = await profRes.json();
      if (profJson.students) {
        setUsers(
          profJson.students.map((s: any) => ({
            id: s.id,
            full_name: s.name,
            email: s.email,
            role: 'student',
            department: s.branch,
            created_at: s.created_at || new Date().toISOString(),
          }))
        );
      }
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (request: RoleRequest, action: 'approve' | 'reject') => {
    setActionLoading(request.id);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/role-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: request.id,
          userId: request.user_id,
          action,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setStatusMessage({ text: json.error || 'Failed to process request.', type: 'error' });
      } else {
        setStatusMessage({
          text: `Request for ${request.email} successfully ${action}d!`,
          type: 'success',
        });
        await loadData();
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message || 'Network error', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            System Governance & RBAC Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            YojanaSethu Role Approvals, Privileged Access Gates, & Campus Directory
          </p>
        </div>
      </div>
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Pending Approvals
                </p>
                <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {pendingRequests.length}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Active Students
                </p>
                <h3 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                  120
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Verified Mentors
                </p>
                <h3 className="text-2xl font-bold text-sky-600 dark:text-sky-400 mt-1">
                  2
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Industry Recruiters
                </p>
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  1
                </h3>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Tabs & Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'requests'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Role Requests ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              User Directory
            </button>
          </div>

          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Tab 1: Role Requests Table */}
        {activeTab === 'requests' && (
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Privileged Role Access Approvals
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mentor, Recruiter, and Placement Officer account requests awaiting Administrator verification.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <span>Loading pending requests...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
                <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No Pending Role Requests
                </p>
                <p className="mt-1">
                  All mentor, recruiter, and placement accounts have been reviewed.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Requested Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                          {req.full_name || 'Authorized Applicant'}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {req.email}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
                            {getRoleLabel(req.requested_role)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'pending'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : req.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300'
                            }`}
                          >
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {req.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleAction(req, 'approve')}
                                disabled={actionLoading === req.id}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                              >
                                {actionLoading === req.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                Approve
                              </button>
                              <button
                                onClick={() => handleAction(req, 'reject')}
                                disabled={actionLoading === req.id}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-400 font-bold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                              >
                                <XCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-medium">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: User Directory */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white/70 dark:bg-slate-900/60 shadow-sm">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Institutional Account Directory
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  125 authenticated records across Autonomous College ERP & Recruiter Gateway
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name, email, branch..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Department / Branch</th>
                    <th className="py-3 px-4">System Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {/* Seeded Privileged Users */}
                  <tr className="bg-indigo-50/20 dark:bg-indigo-950/20 font-medium">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Prof. Sudesh Rao</td>
                    <td className="py-3 px-4 font-mono text-[11px]">tpo@nmamit.in</td>
                    <td className="py-3 px-4">Training & Placement Cell</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        Placement / Admin
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-sky-50/20 dark:bg-sky-950/20 font-medium">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Dr. K. Sharma</td>
                    <td className="py-3 px-4 font-mono text-[11px]">sharma.faculty@nmamit.in</td>
                    <td className="py-3 px-4">Information Science (ISE)</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                        Faculty Mentor
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-sky-50/20 dark:bg-sky-950/20 font-medium">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Dr. Rajesh Shetty</td>
                    <td className="py-3 px-4 font-mono text-[11px]">shetty.faculty@nmamit.in</td>
                    <td className="py-3 px-4">Computer Science (CSE)</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                        Faculty Mentor
                      </span>
                    </td>
                  </tr>
                  <tr className="bg-emerald-50/20 dark:bg-emerald-950/20 font-medium">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">Priya Nair</td>
                    <td className="py-3 px-4 font-mono text-[11px]">priya.nair@nexusai.com</td>
                    <td className="py-3 px-4">NexusAI Partner Talent</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        Industry Recruiter
                      </span>
                    </td>
                  </tr>

                  {/* Student cohort */}
                  {users
                    .filter((u) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        u.full_name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q) ||
                        (u.department && u.department.toLowerCase().includes(q))
                      );
                    })
                    .slice(0, 30)
                    .map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                          {st.full_name}
                        </td>
                        <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px]">
                          {st.email}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">
                          {st.department || 'Autonomous ISE/CSE'}
                        </td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Student
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
    </div>
  );
}
