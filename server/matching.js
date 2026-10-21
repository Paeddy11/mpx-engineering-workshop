import { broaderSkills } from "./skills.js";

const EXACT_SKILL_CREDIT = 1;
const RELATED_SKILL_CREDIT = 0.25;
const SKILL_SCORE_WEIGHT = 80;
const LOCATION_SCORE_WEIGHT = 20;

function normalized(value) {
  return value.trim().toLowerCase();
}

const normalizedBroaderSkills = new Map(
  Object.entries(broaderSkills).map(([skill, broader]) => [
    normalized(skill),
    new Set(broader.map(normalized)),
  ]),
);

function relatedSkillPath(candidateSkill, requiredSkill) {
  const candidate = normalized(candidateSkill);
  const required = normalized(requiredSkill);

  if (normalizedBroaderSkills.get(candidate)?.has(required)) {
    return `${candidateSkill} → ${requiredSkill}`;
  }

  if (normalizedBroaderSkills.get(required)?.has(candidate)) {
    return `${requiredSkill} → ${candidateSkill}`;
  }

  return null;
}

function matchRequiredSkill(requiredSkill, candidateSkills) {
  const exactSkill = candidateSkills.find((skill) => normalized(skill) === normalized(requiredSkill));
  if (exactSkill) {
    return {
      skill: requiredSkill,
      matched: true,
      matchType: "exact",
      matchedSkill: exactSkill,
      reason: "Exact skill",
      credit: EXACT_SKILL_CREDIT,
    };
  }

  for (const candidateSkill of candidateSkills) {
    const path = relatedSkillPath(candidateSkill, requiredSkill);
    if (path) {
      return {
        skill: requiredSkill,
        matched: true,
        matchType: "related",
        matchedSkill: candidateSkill,
        reason: `Related via ${path}`,
        credit: RELATED_SKILL_CREDIT,
      };
    }
  }

  return {
    skill: requiredSkill,
    matched: false,
    matchType: "missing",
    matchedSkill: null,
    reason: "Not found",
    credit: 0,
  };
}

export function scoreJob(job, candidate) {
  const skillBreakdown = job.skills.map((skill) => matchRequiredSkill(skill, candidate.skills));
  const matchedCount = skillBreakdown.filter((item) => item.matched).length;
  const exactMatchCount = skillBreakdown.filter((item) => item.matchType === "exact").length;
  const relatedMatchCount = skillBreakdown.filter((item) => item.matchType === "related").length;
  const earnedSkillCredit = skillBreakdown.reduce((total, item) => total + item.credit, 0);
  const skillScore = job.skills.length ? earnedSkillCredit / job.skills.length * SKILL_SCORE_WEIGHT : 0;
  const locationFits = job.location === candidate.location || job.workMode === "Remote";
  const score = Math.min(100, Math.max(0, Math.round(skillScore + (locationFits ? LOCATION_SCORE_WEIGHT : 0))));

  return {
    score,
    matchedCount,
    exactMatchCount,
    relatedMatchCount,
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
