
"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  UserRound,
  BrainCircuit,
  BriefcaseBusiness,
  GraduationCap,
  FileCheck2,
  Award,
  Bell,
  Search,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Target,
  BookOpen,
  Code2,
  Menu,
  X,
  Sparkles,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/student", icon: LayoutDashboard },
  { label: "My Academic Truth", href: "/student/academic-truth", icon: GraduationCap },
  { label: "CGPA Calculator", href: "/student/cgpa-calculator", icon: Target },
  { label: "Career Roadmap", href: "/student/roadmap", icon: BrainCircuit },
  { label: "Skill Passport", href: "/student/skill-passport", icon: Award },
];

const skills = [
  { name: "Python", level: 82, color: "bg-violet-500" },
  { name: "Data Structures", level: 58, color: "bg-blue-500" },
  { name: "SQL & Databases", level: 72, color: "bg-emerald-500" },
  { name: "Machine Learning", level: 42, color: "bg-amber-500" },
];

const drives = [
  {
    company: "Infosys",
    role: "Systems Engineer",
    date: "28 Oct 2026",
    package: "3.6 LPA",
    color: "bg-blue-100 text-blue-700",
    initials: "I",
  },
  {
    company: "TCS",
    role: "Graduate Engineer Trainee",
    date: "02 Nov 2026",
    package: "4.5 LPA",
    color: "bg-purple-100 text-purple-700",
    initials: "T",
  },
  {
    company: "Accenture",
    role: "Associate Software Engineer",
    date: "06 Nov 2026",
    package: "4.5 LPA",
    color: "bg-rose-100 text-rose-700",
    initials: "A",
  },
];

const actions = [
  {
    title: "Improve your DSA skills",
    detail: "Practice arrays, strings and problem solving.",
    href: "/student/roadmap",
    icon: Code2,
    color: "bg-blue-50 text-blue-700",
    time: "30 min",
  },
  {
    title: "Complete your Skill Passport",
    detail: "Document your projects and technical skills.",
    href: "/student/skill-passport",
    icon: Award,
    color: "bg-violet-50 text-violet-700",
    time: "10 min",
  },
  {
    title: "Review your academic progress",
    detail: "Check your semester marks and CGPA.",
    href: "/student/academic-truth",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-700",
    time: "5 min",
  },
];

export default function StudentDashboard() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredDrives = drives.filter((drive) =>
    `${drive.company} ${drive.role}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {menuOpen && (
        <button
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <Link href="/student" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight">YojanaSethu</p>
              <p className="text-xs text-slate-500">Student workspace</p>
            </div>
          </Link>
          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-7">
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = item.label === "Dashboard";

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <Icon size={19} />
                  {item.label}
                  {active && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mx-4 mt-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
            <Sparkles size={19} />
          </div>
          <p className="font-semibold">Your next milestone</p>
          <p className="mt-1 text-xs leading-5 text-indigo-100">
            Strengthen your skills and get ready for your next placement drive.
          </p>
          <Link
            href="/student/roadmap"
            className="mt-4 flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50"
          >
            View roadmap <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-auto border-t border-slate-100 p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Student Account</p>
              <p className="truncate text-xs text-slate-500">Placement candidate</p>
            </div>
            <UserRound size={18} className="text-slate-400" />
          </div>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
            >
              <Menu size={22} />
            </button>
            <div>
              <p className="text-xs text-slate-500">Student portal / Overview</p>
              <h1 className="mt-1 text-lg font-bold">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Career journey active
            </span>
            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-8">
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white sm:p-9">
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[40px] border-white/5" />
            <div className="pointer-events-none absolute right-32 top-24 h-32 w-32 rounded-full bg-white/5" />

            <div className="relative max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-indigo-50">
                <Sparkles size={14} /> Your personalized career space
              </span>
              <h2 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Your future starts with your next step.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100 sm:text-base">
                Track your skills, explore placement opportunities and discover
                what you can improve to reach your career goals.
              </p>
              <Link
                href="/student/roadmap"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg shadow-indigo-950/10 transition hover:-translate-y-0.5 hover:bg-indigo-50"
              >
                Explore my roadmap <ArrowUpRight size={17} />
              </Link>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Placement readiness</span>
                <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Target size={20} /></span>
              </div>
              <div className="mt-5 flex items-end justify-between">
                <p className="text-3xl font-extrabold">68%</p>
                <span className="mb-1 text-xs font-medium text-slate-400">Demo value</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[68%] rounded-full bg-indigo-600" />
              </div>
              <p className="mt-3 text-xs text-slate-500">Based on illustrative skill data</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Skills in progress</span>
                <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><TrendingUp size={20} /></span>
              </div>
              <p className="mt-5 text-3xl font-extrabold">4</p>
              <p className="mt-3 text-xs text-slate-500">Keep learning and tracking progress</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Upcoming drives</span>
                <span className="rounded-xl bg-amber-50 p-2.5 text-amber-600"><BriefcaseBusiness size={20} /></span>
              </div>
              <p className="mt-5 text-3xl font-extrabold">{drives.length}</p>
              <p className="mt-3 text-xs text-slate-500">Sample company opportunities</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Profile completion</span>
                <span className="rounded-xl bg-violet-50 p-2.5 text-violet-600"><CheckCircle2 size={20} /></span>
              </div>
              <p className="mt-5 text-3xl font-extrabold">75%</p>
              <Link href="/student/skill-passport" className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                Complete your profile <ArrowRight size={13} />
              </Link>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Your skill profile</h3>
                  <p className="mt-1 text-sm text-slate-500">Track the skills you're developing.</p>
                </div>
                <Link href="/student/roadmap" className="whitespace-nowrap text-xs font-semibold text-indigo-600 hover:underline">
                  View roadmap →
                </Link>
              </div>

              <div className="mt-7 space-y-6">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-700">{skill.name}</span>
                      <span className="text-sm font-bold text-slate-700">{skill.level}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${skill.color}`} style={{ width: `${skill.level}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={20} className="mt-0.5 shrink-0 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-indigo-950">Suggested focus</p>
                    <p className="mt-1 text-sm leading-5 text-indigo-800">
                      Spend more time on data structures and machine learning,
                      then reassess your skills with practical exercises.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Your next actions</h3>
                  <p className="mt-1 text-sm text-slate-500">Small steps towards your goal.</p>
                </div>
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><CheckCircle2 size={19} /></span>
              </div>

              <div className="mt-5 space-y-3">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={action.title}
                      href={action.href}
                      className="group flex items-start gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/40"
                    >
                      <span className={`rounded-xl p-2.5 ${action.color}`}><Icon size={19} /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-800">{action.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">{action.detail}</span>
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-400"><Clock3 size={12} /> {action.time}</span>
                      </span>
                      <ArrowUpRight size={16} className="shrink-0 text-slate-400 transition group-hover:text-indigo-600" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="text-lg font-bold">Upcoming placement drives</h3>
                <p className="mt-1 text-sm text-slate-500">Explore opportunities and prepare ahead.</p>
              </div>
              <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-indigo-400">
                <Search size={17} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search companies..."
                  className="w-full bg-transparent text-sm outline-none sm:w-48"
                />
              </label>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400">
                    <th className="pb-3 font-semibold">Company / Role</th>
                    <th className="pb-3 font-semibold">Package</th>
                    <th className="pb-3 font-semibold">Drive date</th>
                    <th className="pb-3 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDrives.map((drive) => (
                    <tr key={drive.company} className="border-b border-slate-50 last:border-0">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold ${drive.color}`}>
                            {drive.initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{drive.company}</p>
                            <p className="mt-1 text-xs text-slate-500">{drive.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm font-semibold text-slate-700">{drive.package}</td>
                      <td className="py-4">
                        <span className="inline-flex items-center gap-2 text-sm text-slate-600"><CalendarDays size={15} /> {drive.date}</span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => window.alert("Demo only: connect this action to your real placement-drive details and application flow.")}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-indigo-300 hover:text-indigo-700"
                        >
                          View details <ArrowUpRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredDrives.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-slate-500">
                        No matching companies found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Demo data only. Replace sample companies, dates, packages and skill scores with authorized live data before presenting.
            </p>
          </section>

          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row">
            <p>YojanaSethu · Student career workspace</p>
            <p>Learn. Build. Prepare. Grow.</p>
          </footer>
        </div>
      </main>
    </div>
  );
}
