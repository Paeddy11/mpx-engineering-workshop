import { useEffect, useMemo, useState } from "react";
import Icon from "./components/Icon.jsx";
import { api } from "./lib/api.js";

const navigation = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "jobs", label: "Explore jobs", icon: "briefcase" },
  { id: "candidates", label: "Candidates", icon: "users" },
  { id: "workshop", label: "Workshop lab", icon: "flask" },
];

const categories = ["All", "Engineering", "Data", "Product", "Media"];

function ScoreRing({ score, compact = false }) {
  return (
    <div className={`score-ring ${compact ? "compact" : ""}`} style={{ "--score": `${score}%` }}>
      <div className="score-ring-inner">
        <strong>{score}%</strong>
        {!compact && <span>match</span>}
      </div>
    </div>
  );
}

function Header({ onMenu, onReset }) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <button className="mobile-menu" type="button" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" size={20} />
        </button>
        <div className="brand-mark"><Icon name="layers" size={23} strokeWidth={2.1} /></div>
        <div className="brand-name"><strong>JobMatch</strong><span>Lab</span></div>
        <span className="demo-pill"><span /> Workshop demo</span>
      </div>
      <div className="top-actions">
        <span className="synthetic-chip"><Icon name="shield" size={15} /> Synthetic data only</span>
        <button className="reset-view" type="button" onClick={onReset}>Reset view</button>
      </div>
    </header>
  );
}

function Sidebar({ activeSection, setActiveSection, open, setOpen }) {
  return (
    <>
      {open && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="nav-heading">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${activeSection === item.id ? "active" : ""}`}
              type="button"
              onClick={() => { setActiveSection(item.id); setOpen(false); }}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
              {item.id === "workshop" && <span className="nav-count">3</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="sidebar-tip-icon"><Icon name="sparkles" size={17} /></span>
            <strong>Build the next match.</strong>
            <p>A realistic codebase for your Codex workshop.</p>
          </div>
          <div className="sidebar-footnote"><span className="status-dot" /> Local demo environment</div>
        </div>
      </aside>
    </>
  );
}

function OverviewHero({ onExplore }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow"><span /> THE MARKETPLACE LAB</span>
        <h1>Better matches start<br />with better engineering.</h1>
        <p>Explore jobs, inspect match signals, and improve the engine through an end-to-end software factory workflow.</p>
        <button className="hero-button" type="button" onClick={onExplore}>Explore matches <Icon name="arrow" size={17} /></button>
      </div>
      <div className="hero-art" aria-hidden="true">
        <span className="hero-orbit orbit-one" />
        <span className="hero-orbit orbit-two" />
        <div className="hero-person">MB</div>
        <div className="hero-connection" />
        <div className="hero-job"><Icon name="briefcase" size={22} /></div>
        <div className="hero-match"><Icon name="sparkles" size={15} /> Good match</div>
      </div>
    </section>
  );
}

function MetricCard({ icon, label, value, detail, tone }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon name={icon} size={20} /></div>
      <div><span className="metric-label">{label}</span><strong>{value}</strong><small>{detail}</small></div>
    </div>
  );
}

function JobCard({ job, selected, onSelect }) {
  return (
    <button type="button" className={`job-card ${selected ? "selected" : ""}`} onClick={() => onSelect(job.id)}>
      <div className="job-card-icon">{job.company.split(" ").map((word) => word[0]).slice(0, 2).join("")}</div>
      <div className="job-card-body">
        <div className="job-card-topline"><span className="job-company">{job.company}</span><span className="job-posted">{job.postedDaysAgo}d ago</span></div>
        <h3>{job.title}</h3>
        <div className="job-meta"><span><Icon name="map" size={13} />{job.location}</span><span className="meta-divider">·</span><span>{job.workMode}</span><span className="meta-divider">·</span><span>{job.type}</span></div>
        <div className="job-tags">
          {job.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
          {job.skills.length > 3 && <span>+{job.skills.length - 3}</span>}
        </div>
      </div>
      <div className="job-card-score"><ScoreRing score={job.match.score} compact /><span>match score</span></div>
    </button>
  );
}

function JobResults({ jobs, selectedJobId, onSelect, query, setQuery, category, setCategory, title = "Recommended for you" }) {
  return (
    <section className="results-section">
      <div className="section-title-row">
        <div><span className="section-kicker">DISCOVER</span><h2>{title}</h2><p>Matched to the selected candidate profile</p></div>
        <span className="result-count">{jobs.length} listings</span>
      </div>
      <div className="search-box"><Icon name="search" size={19} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search roles, companies or skills" aria-label="Search jobs" /><span className="search-shortcut">⌘ K</span></div>
      <div className="category-filters" aria-label="Job categories">
        {categories.map((item) => <button type="button" key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <div className="job-list">
        {jobs.map((job) => <JobCard key={job.id} job={job} selected={job.id === selectedJobId} onSelect={onSelect} />)}
        {jobs.length === 0 && <div className="empty-state"><Icon name="search" size={26} /><strong>No roles found</strong><p>Try another search term or category.</p></div>}
      </div>
    </section>
  );
}

function CandidateList({ candidates, selectedCandidateId, onSelect }) {
  return (
    <section className="results-section">
      <div className="section-title-row"><div><span className="section-kicker">TALENT POOL</span><h2>Candidate profiles</h2><p>Select a fictional profile to see its job matches.</p></div><span className="result-count">{candidates.length} profiles</span></div>
      <div className="candidate-list">
        {candidates.map((candidate) => (
          <button key={candidate.id} type="button" className={`candidate-card ${candidate.id === selectedCandidateId ? "selected" : ""}`} onClick={() => onSelect(candidate.id)}>
            <div className="candidate-avatar">{candidate.initials}</div>
            <div className="candidate-info"><strong>{candidate.name}</strong><span>{candidate.role} · {candidate.location}</span><div className="candidate-skill-row">{candidate.skills.slice(0, 4).map((skill) => <small key={skill}>{skill}</small>)}</div></div>
            <Icon name="chevron" size={17} />
          </button>
        ))}
      </div>
    </section>
  );
}

function WorkshopPanel() {
  const cards = [
    { step: "01", icon: "git", label: "BUILD", title: "Parallel development", body: "Work through scoped engineering tasks in separate Codex worktrees, then bring the results together.", detail: "Hands-on implementation" },
    { step: "02", icon: "shield", label: "SECURE", title: "Investigate the scan", body: "Run Codex Security Cloud against your demo repository and review a finding before opening a fix PR.", detail: "Seeded synthetic profile data" },
    { step: "03", icon: "sparkles", label: "AUTOMATE", title: "Build the factory", body: "Use an approved issue to implement a small change and open a PR ready for review.", detail: "Task 9" },
  ];

  return (
    <section className="results-section">
      <div className="section-title-row"><div><span className="section-kicker">HANDS-ON WORKSHOP</span><h2>Your factory, end to end</h2><p>Work through every stage in your own repository.</p></div></div>
      <div className="workshop-intro"><Icon name="flask" size={21} /><div><strong>Built for learning by doing</strong><p>All roles and candidates are fictional. Follow the repository workbook for exact tasks and verification steps.</p></div></div>
      <div className="workshop-cards">{cards.map((card) => (
        <div className="workshop-card" key={card.step}>
          <div className="workshop-card-head"><span>{card.step}</span><div><Icon name={card.icon} size={21} /></div></div>
          <small>{card.label}</small><h3>{card.title}</h3><p>{card.body}</p><span className="workshop-detail">{card.detail}</span>
        </div>
      ))}</div>
      <div className="factory-flow"><strong>The workflow</strong><div><span>GitHub Issue</span><Icon name="arrow" size={15} /><span>Codex</span><Icon name="arrow" size={15} /><span>Tests</span><Icon name="arrow" size={15} /><span>Draft PR</span><Icon name="arrow" size={15} /><span>Human review</span></div></div>
    </section>
  );
}

function Inspector({ candidate, candidates, selectedCandidateId, onCandidateChange, selectedJob, topScore }) {
  return (
    <aside className="inspector">
      <div className="inspector-title"><div><h2>Match insights</h2><p>Live, explainable scoring</p></div><span className="live-dot" /></div>
      <div className="inspector-card candidate-inspector">
        <div className="inspector-card-kicker">CANDIDATE PROFILE</div>
        <div className="inspector-candidate"><div className="candidate-avatar">{candidate?.initials ?? "--"}</div><div><strong>{candidate?.name ?? "Loading..."}</strong><span>{candidate?.role ?? ""}</span></div></div>
        <label className="candidate-picker-label" htmlFor="candidate-picker">Viewing matches for</label>
        <select id="candidate-picker" value={selectedCandidateId} onChange={(event) => onCandidateChange(event.target.value)}>
          {candidates.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <div className="candidate-detail-line"><Icon name="map" size={15} /> {candidate?.location} <span>·</span> {candidate?.experienceYears} years experience</div>
        <div className="inspector-divider" />
        <span className="inspector-card-kicker">SKILLS</span>
        <div className="inspector-skills">{candidate?.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
      </div>

      {selectedJob && <div className="inspector-card match-inspector">
        <div className="inspector-card-kicker">SELECTED ROLE</div>
        <div className="selected-role-title"><strong>{selectedJob.title}</strong><span>{selectedJob.company}</span></div>
        <div className="large-score-row"><ScoreRing score={selectedJob.match.score} /><div><strong>{selectedJob.match.matchedCount} of {selectedJob.match.requiredCount}</strong><span>skills matched exactly</span></div></div>
        <div className="inspector-divider" />
        <div className="breakdown-title">Why this match?</div>
        <div className="skill-breakdown">{selectedJob.match.skillBreakdown.map((item) => (
          <div key={item.skill}><span className={item.matched ? "breakdown-icon matched" : "breakdown-icon"}>{item.matched ? <Icon name="check" size={13} /> : "·"}</span><span>{item.skill}</span><small>{item.reason}</small></div>
        ))}</div>
        <div className="location-fit"><Icon name="map" size={15} /><span>{selectedJob.match.locationFits ? "Location works for this candidate" : "Location may need discussion"}</span></div>
      </div>}

      <div className="inspector-note"><Icon name="chart" size={17} /><span>Top match in this profile: <strong>{topScore}%</strong></span></div>
      <p className="inspector-footnote">This is a workshop model, not a hiring decision system.</p>
    </aside>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [overview, setOverview] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("candidate-001");
  const [matches, setMatches] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("job-101");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.overview(), api.candidates()])
      .then(([summary, people]) => {
        if (!active) return;
        setOverview(summary);
        setCandidates(people.candidates);
      })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    api.matches(selectedCandidateId)
      .then((result) => { if (active) setMatches(result.jobs); })
      .catch((loadError) => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [selectedCandidateId]);

  useEffect(() => { document.title = "JobMatch Lab"; }, []);

  const candidate = candidates.find((item) => item.id === selectedCandidateId);
  const selectedJob = matches.find((job) => job.id === selectedJobId) ?? matches[0];
  const filteredJobs = useMemo(() => matches.filter((job) => {
    const matchesCategory = category === "All" || job.category === category;
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery = !normalizedQuery || [job.title, job.company, job.description, ...job.skills]
      .some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesCategory && matchesQuery;
  }), [matches, category, query]);

  function resetView() {
    setActiveSection("overview");
    setSelectedCandidateId("candidate-001");
    setSelectedJobId("job-101");
    setQuery("");
    setCategory("All");
  }

  if (error && !overview) {
    return <div className="loading-screen"><div className="brand-mark"><Icon name="layers" size={25} /></div><h1>JobMatch Lab could not load</h1><p>{error}</p><button type="button" onClick={() => window.location.reload()}>Try again</button></div>;
  }

  if (!overview || !candidate || !matches.length) {
    return <div className="loading-screen"><div className="brand-mark"><Icon name="layers" size={25} /></div><p>Preparing the lab...</p></div>;
  }

  return (
    <div className="app-shell">
      <Header onMenu={() => setMobileOpen(true)} onReset={resetView} />
      <div className="workspace">
        <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} open={mobileOpen} setOpen={setMobileOpen} />
        <main className="main-content">
          {activeSection === "overview" && <>
            <OverviewHero onExplore={() => setActiveSection("jobs")} />
            <div className="metrics">
              <MetricCard icon="briefcase" label="Job listings" value={overview.catalog.visibleListings} detail="Across direct and partner feeds" tone="purple" />
              <MetricCard icon="users" label="Candidate profiles" value={overview.candidateCount} detail="Fictional workshop profiles" tone="blue" />
              <MetricCard icon="chart" label="Top match" value={`${matches[0]?.match.score ?? 0}%`} detail={matches[0]?.title ?? "No role"} tone="green" />
            </div>
            <JobResults jobs={filteredJobs.slice(0, 4)} selectedJobId={selectedJob?.id} onSelect={setSelectedJobId} query={query} setQuery={setQuery} category={category} setCategory={setCategory} />
          </>}
          {activeSection === "jobs" && <JobResults jobs={filteredJobs} selectedJobId={selectedJob?.id} onSelect={setSelectedJobId} query={query} setQuery={setQuery} category={category} setCategory={setCategory} title="Explore open roles" />}
          {activeSection === "candidates" && <CandidateList candidates={candidates} selectedCandidateId={selectedCandidateId} onSelect={setSelectedCandidateId} />}
          {activeSection === "workshop" && <WorkshopPanel />}
        </main>
        <Inspector candidate={candidate} candidates={candidates} selectedCandidateId={selectedCandidateId} onCandidateChange={setSelectedCandidateId} selectedJob={selectedJob} topScore={matches[0]?.match.score ?? 0} />
      </div>
    </div>
  );
}
