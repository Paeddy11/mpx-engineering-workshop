import assert from "node:assert/strict";
import test from "node:test";
import { scoreJob, rankJobs } from "../server/matching.js";
import { primaryJobs } from "../server/seed-data.js";
import { getCandidateById } from "../server/candidates.js";

test("exact and related skill matches produce an explainable score", () => {
  const result = scoreJob(primaryJobs[0], getCandidateById("candidate-001"));
  assert.equal(result.score, 85);
  assert.equal(result.matchedCount, 4);
  assert.equal(result.exactMatchCount, 3);
  assert.equal(result.relatedMatchCount, 1);
  assert.deepEqual(result.skillBreakdown.map((item) => item.matchType), ["exact", "exact", "exact", "related"]);
  assert.deepEqual(result.skillBreakdown.map((item) => item.credit), [1, 1, 1, 0.25]);
  assert.equal(result.locationFits, true);
});

test("a specific candidate skill earns partial credit for a broader requirement", () => {
  const job = { location: "Bern", workMode: "Hybrid", skills: ["Frontend development"] };
  const candidate = { location: "Zurich", skills: ["React"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 20);
  assert.equal(result.matchedCount, 1);
  assert.equal(result.relatedMatchCount, 1);
  assert.equal(result.skillBreakdown[0].matchType, "related");
  assert.equal(result.skillBreakdown[0].reason, "Related via React → Frontend development");
});

test("a broader candidate skill also relates to a specific requirement", () => {
  const job = { location: "Bern", workMode: "Hybrid", skills: ["React"] };
  const candidate = { location: "Zurich", skills: ["Frontend development"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 20);
  assert.equal(result.skillBreakdown[0].matchType, "related");
  assert.equal(result.skillBreakdown[0].reason, "Related via React → Frontend development");
});

test("an unrelated skill remains missing", () => {
  const job = { location: "Bern", workMode: "Hybrid", skills: ["Frontend development"] };
  const candidate = { location: "Zurich", skills: ["Accounting"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 0);
  assert.equal(result.matchedCount, 0);
  assert.equal(result.skillBreakdown[0].matchType, "missing");
  assert.equal(result.skillBreakdown[0].reason, "Not found");
});

test("related credit combines with the remote location bonus", () => {
  const job = { location: "Bern", workMode: "Remote", skills: ["Frontend development"] };
  const candidate = { location: "Zurich", skills: ["React"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 40);
  assert.equal(result.locationFits, true);
  assert.equal(result.relatedMatchCount, 1);
});

test("an exact match takes precedence over related skills and scores stay bounded", () => {
  const job = { location: "Zurich", workMode: "Hybrid", skills: ["React"] };
  const candidate = { location: "Zurich", skills: ["Frontend development", "React"] };
  const result = scoreJob(job, candidate);
  assert.equal(result.score, 100);
  assert.equal(result.exactMatchCount, 1);
  assert.equal(result.relatedMatchCount, 0);
  assert.equal(result.skillBreakdown[0].matchType, "exact");
  assert.deepEqual(scoreJob(job, candidate), result);
});

test("remote roles count as a location fit and ranking is stable", () => {
  const candidate = getCandidateById("candidate-003");
  const ranked = rankJobs(primaryJobs, candidate);
  assert.equal(ranked[0].id, "job-103");
  assert.equal(ranked[0].match.locationFits, true);
});
