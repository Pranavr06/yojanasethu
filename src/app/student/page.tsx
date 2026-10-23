
"use client";

import { useState } from "react";
import {
  LayoutDashboard, FileText, BrainCircuit, Code2, Award,
  BriefcaseBusiness, GraduationCap, Menu, X, Upload,
  Trash2, Search, Target, BookOpen, Sparkles, CheckCircle2,
  ArrowRight, Download, Briefcase, ShieldCheck, Calculator,
  Calendar, ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";

const skills = [
  { name: "Python", level: 80 },
  { name: "DSA", level: 55 },
  { name: "SQL", level: 70 },
  { name: "Machine Learning", level: 40 },
];

const companies = [
  { name: "Infosys", role: "Systems Engineer", year: "2026", package: "Sample: 3.6 LPA" },
  { name: "TCS", role: "Graduate Engineer Trainee", year: "2026", package: "Sample: 4.5 LPA" },
  { name: "Accenture", role: "Software Engineer", year: "2025", package: "Sample: 4.5 LPA" },
];

const topics = [
  "Variables and data types",
  "Conditions and loops",
  "Functions",
  "Arrays and strings",
  "Linked lists",
  "Stacks and queues",
  "Trees and graphs",
  "Sorting and searching",
];

const nav = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "resume", label: "Resume Builder", icon: FileText },
  { id: "coach", label: "AI Career Coach", icon: BrainCircuit },
  { id: "learn", label: "Learn Programming", icon: BookOpen },
  { id: "dsa", label: "DSA Tracker", icon: Code2 },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "placements", label: "Placement History", icon: BriefcaseBusiness },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("overview");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [language, setLanguage] = useState("Python");
  const [done, setDone] = useState<string[]>([]);
  const [certificates, setCertificates] = useState<File[]>([]);
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [resume, setResume] = useState({
    name: "",
    email: "",
    phone: "",
    education: "",
    skills: "",
    projects: "",
    objective: "",
  });

  function goTo(id: string) {
    setActive(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch = `${company.name} ${company.role}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesSearch && (year === "all" || company.year === year);
  });

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-indigo-500";
  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {menuOpen && (
        <button
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform md:translate-x-0 ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b p-5">
          <h1 className="text-xl font-extrabold text-indigo-700">
            YojanaSethu
          </h1>
          <p className="mt-1 text-xs text-slate-500">Student Career Portal</p>
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute right-3 top-4 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm font-medium ${
                  active === item.id
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}

          <div className="mt-5 border-t pt-4">
            <p className="px-3 pb-2 text-xs font-bold uppercase text-slate-400">
              Existing modules
            </p>
            <a className="block rounded-lg p-3 text-sm hover:bg-slate-50" href="/student/academic-truth">
              Academic Records
            </a>
            <a className="block rounded-lg p-3 text-sm hover:bg-slate-50" href="/student/cgpa-calculator">
              CGPA Calculator
            </a>
            <a className="block rounded-lg p-3 text-sm hover:bg-slate-50" href="/student/roadmap">
              Career Roadmap
            </a>
            <a className="block rounded-lg p-3 text-sm hover:bg-slate-50" href="/student/skill-passport">
              Skill Passport
            </a>
          </div>
        </nav>

        <div className="border-t p-4 text-sm">
          <p className="font-semibold">Student Account</p>
          <p className="mt-1 text-xs text-slate-500">Demo workspace</p>
        </div>
      </aside>

      <main className="min-h-screen md:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white/95 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              onClick={() => setMenuOpen(true)}
              className="md:hidden"
            >
              <Menu />
            </button>
            <h2 className="font-bold">My Career Dashboard</h2>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
            Demo mode
          </span>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-8">
          <section id="overview" className="scroll-mt-24 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 p-7 text-white sm:p-10">
            <div className="flex items-center gap-2 text-sm text-indigo-100">
              <Sparkles size={17} /> Your student career workspace
            </div>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-4xl">
              Build skills. Prepare for placements. Shape your future.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
              Manage your resume, track programming practice, organize
              certificates and explore placement opportunities in one place.
            </p>
            <button
              onClick={() => goTo("resume")}
              className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700"
            >
              Build my resume →
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Career readiness", value: "Not assessed", icon: Target },
              { label: "Skills to develop", value: "4", icon: BrainCircuit },
              { label: "Sample company drives", value: "3", icon: BriefcaseBusiness },
              { label: "Certificates added", value: String(certificates.length), icon: Award },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className={cardClass}>
                  <Icon className="text-indigo-600" size={23} />
                  <p className="mt-4 text-sm text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-extrabold">{stat.value}</p>
                </div>
              );
            })}
          </section>

          <section className="grid gap-6 xl:grid-cols-2">
            <div className={cardClass}>
              <h3 className="text-lg font-bold">My skills</h3>
              <p className="mt-1 text-sm text-slate-500">
                Illustrative levels, not assessed results.
              </p>
              <div className="mt-6 space-y-5">
                {skills.map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>{skill.name}</span>
                      <strong>{skill.level}%</strong>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <h3 className="text-lg font-bold">Recommended next steps</h3>
              <div className="mt-4 space-y-3">
                {[
                  ["Create your resume", "Add your education, skills and projects.", "resume"],
                  ["Practise DSA", "Track the topics you have completed.", "dsa"],
                  ["Upload certificates", "Organize your achievements.", "certificates"],
                ].map(([title, detail, id]) => (
                  <button
                    key={id}
                    onClick={() => goTo(id)}
                    className="flex w-full items-center gap-3 rounded-xl border p-4 text-left hover:bg-indigo-50"
                  >
                    <CheckCircle2 className="shrink-0 text-indigo-600" />
                    <span className="flex-1">
                      <strong className="block text-sm">{title}</strong>
                      <span className="mt-1 block text-xs text-slate-500">{detail}</span>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section id="resume" className="scroll-mt-24 space-y-4">
            <div>
              <h2 className="text-2xl font-extrabold">Resume Builder</h2>
              <p className="mt-1 text-sm text-slate-500">
                Fill in your information to preview a basic resume.
              </p>
            </div>
            <div className="grid gap-6 xl:grid-cols-2">
              <div className={cardClass}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    ["name", "Full name"],
                    ["email", "Email"],
                    ["phone", "Phone"],
                    ["education", "Education / college"],
                    ["skills", "Technical skills"],
                  ].map(([key, label]) => (
                    <label key={key} className="text-sm font-medium">
                      {label}
                      <input
                        className={inputClass}
                        value={resume[key as keyof typeof resume]}
                        onChange={(e) =>
                          setResume({ ...resume, [key]: e.target.value })
                        }
                        placeholder={label}
                      />
                    </label>
                  ))}
                  <label className="text-sm font-medium sm:col-span-2">
                    Career objective
                    <textarea
                      className={inputClass}
                      rows={3}
                      value={resume.objective}
                      onChange={(e) =>
                        setResume({ ...resume, objective: e.target.value })
                      }
                      placeholder="Describe the role you want."
                    />
                  </label>
                  <label className="text-sm font-medium sm:col-span-2">
                    Projects and experience
                    <textarea
                      className={inputClass}
                      rows={4}
                      value={resume.projects}
                      onChange={(e) =>
                        setResume({ ...resume, projects: e.target.value })
                      }
                      placeholder="Describe your projects and contributions."
                    />
                  </label>
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-5 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white"
                >
                  <Download size={16} className="mr-2 inline" />
                  Print / Save as PDF
                </button>
              </div>

              <div className={`${cardClass} print:border-0 print:shadow-none`}>
                <h3 className="text-xl font-extrabold">{resume.name || "Your Name"}</h3>
                <p className="mt-2 break-words text-sm text-slate-500">
                  {[resume.email, resume.phone].filter(Boolean).join(" | ")}
                </p>
                <hr className="my-5" />
                <h4 className="font-bold">CAREER OBJECTIVE</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm">{resume.objective || "Your objective will appear here."}</p>
                <h4 className="mt-5 font-bold">EDUCATION</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm">{resume.education || "Your education details"}</p>
                <h4 className="mt-5 font-bold">TECHNICAL SKILLS</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm">{resume.skills || "Your skills"}</p>
                <h4 className="mt-5 font-bold">PROJECTS</h4>
                <p className="mt-2 whitespace-pre-wrap text-sm">{resume.projects || "Your projects"}</p>
              </div>
            </div>
          </section>

<section id="coach" className="scroll-mt-24">
            <div className={cardClass}>
              <BrainCircuit size={28} className="text-indigo-600" />
              <h2 className="mt-3 text-2xl font-extrabold">AI Career Coach</h2>
              <p className="mt-2 text-sm text-slate-500">
                AI analysis will be connected later. Select a target role to
                prepare your career plan.
              </p>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className={inputClass}
              >
                <option>AI Engineer</option>
                <option>Software Developer</option>
                <option>Data Analyst</option>
                <option>Frontend Developer</option>
                <option>Backend Developer</option>
              </select>
              <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-900">
                Your selected goal: <strong>{targetRole}</strong>. Focus on
                fundamentals, projects, assessments and interview preparation.
              </div>
              <p className="mt-3 text-xs text-slate-400">
                This is general guidance, not a live AI-generated assessment.
              </p>
            </div>
          </section>

          <section id="learn" className="scroll-mt-24">
            <div className={cardClass}>
              <h2 className="text-2xl font-extrabold">Learn Programming</h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose a language and track the fundamentals you complete.
              </p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={inputClass}
              >
                <option>Python</option>
                <option>Java</option>
                <option>C++</option>
              </select>
              <div className="mt-5 space-y-3">
                {["Variables and types", "Conditions and loops", "Functions", "Arrays and strings", "Object-oriented programming", "Basic input/output"].map((topic) => {
                  const key = `${language}:${topic}`;
                  return (
                    <label key={key} className="flex items-center gap-3 rounded-xl border p-3 text-sm">
                      <input
                        type="checkbox"
                        checked={done.includes(key)}
                        onChange={() => setDone(done.includes(key) ? done.filter((x) => x !== key) : [...done, key])}
                      />
                      {topic}
                    </label>
                  );
                })}
              </div>
              <p className="mt-4 text-sm font-semibold text-indigo-700">
                Completed: {done.length} topics across your selected languages
              </p>
            </div>
          </section>

          <section id="dsa" className="scroll-mt-24">
            <div className={cardClass}>
              <h2 className="text-2xl font-extrabold">DSA Practice Tracker</h2>
              <p className="mt-2 text-sm text-slate-500">
                Check off topics as you practise them. Coding execution is not included.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {topics.map((topic) => (
                  <label key={topic} className="flex items-center gap-3 rounded-xl border p-4 text-sm">
                    <input
                      type="checkbox"
                      checked={done.includes(`DSA:${topic}`)}
                      onChange={() => {
                        const key = `DSA:${topic}`;
                        setDone(done.includes(key) ? done.filter((x) => x !== key) : [...done, key]);
                      }}
                    />
                    {topic}
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section id="certificates" className="scroll-mt-24">
            <div className={cardClass}>
              <h2 className="text-2xl font-extrabold">Certificates</h2>
              <p className="mt-2 text-sm text-slate-500">
                Choose PDF or image files to list them in this browser session.
                This does not upload them to a server or verify authenticity.
              </p>
              <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white">
                <Upload size={18} /> Select certificate files
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(e) => setCertificates([...certificates, ...Array.from(e.target.files || [])])}
                />
              </label>
              <div className="mt-5 space-y-3">
                {certificates.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border p-3">
                    <FileText className="text-indigo-600" />
                    <span className="flex-1 break-all text-sm">{file.name}</span>
                    <span className="text-xs text-amber-700">Pending review</span>
                    <button aria-label={`Remove ${file.name}`} onClick={() => setCertificates(certificates.filter((_, i) => i !== index))}>
                      <Trash2 size={17} className="text-rose-600" />
                    </button>
                  </div>
                ))}
                {certificates.length === 0 && <p className="text-sm text-slate-400">No certificates selected yet.</p>}
              </div>
            </div>
          </section>

          <section id="placements" className="scroll-mt-24">
            <div className={cardClass}>
              <h2 className="text-2xl font-extrabold">Placement History</h2>
              <p className="mt-2 text-sm text-slate-500">
                Illustrative records only. Replace with verified college placement data.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-2 rounded-xl border px-3">
                  <Search size={18} className="text-slate-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search companies or roles" className="w-full py-3 text-sm outline-none" />
                </label>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="rounded-xl border p-3 text-sm">
                  <option value="all">All years</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
              <div className="mt-5 space-y-3">
                {filteredCompanies.map((company) => (
                  <div key={company.name} className="flex flex-col gap-2 rounded-xl border p-4 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <h3 className="font-bold">{company.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{company.role} · {company.year}</p>
                    </div>
                    <span className="text-sm font-semibold text-indigo-700">{company.package}</span>
                  </div>
                ))}
                {filteredCompanies.length === 0 && <p className="text-sm text-slate-500">No matching companies found.</p>}
              </div>
            </div>
          </section>

          <footer className="border-t py-5 text-xs text-slate-400">
            YojanaSethu Student Portal · Frontend prototype
          </footer>
</div>
      </main>
    </div>
  );
}
