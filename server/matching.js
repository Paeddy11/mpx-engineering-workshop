function normalized(value) {
  return value.trim().toLowerCase();
}

export function scoreJob(job, candidate) {
  const candidateSkills = new Set(candidate.skills.map(normalized));
  const skillBreakdown = job.skills.map((skill) => ({
    skill,
    matched: candidateSkills.has(normalized(skill)),
    reason: candidateSkills.has(normalized(skill)) ? "Exact skill" : "Not found",
  }));
  const matchedCount = skillBreakdown.filter((item) => item.matched).length;
  const skillScore = job.skills.length ? matchedCount / job.skills.length : 0;
  const locationFits = job.location === candidate.location || job.workMode === "Remote";
  const score = Math.round(skillScore * 80 + (locationFits ? 20 : 0));

  return {
    score,
    matchedCount,
    requiredCount: job.skills.length,
    locationFits,
    skillBreakdown,
  };
}

export function rankJobs(jobs, candidate) {
  return jobs
    .map((job) => ({ ...job, match: scoreJob(job, candidate) }))
    .sort((a, b) => b.match.score - a.match.score || a.title.localeCompare(b.title));
}
