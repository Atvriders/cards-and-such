#!/usr/bin/env node
import { writeCoopGame, writeQuizGame, exists } from "./scaffold-coop-party.mjs";
import { COOP_SPECS } from "./coop-specs.mjs";
import { QUIZ_SPECS } from "./quiz-specs.mjs";

const skipCoop = new Set(["pandemic-base"]); // overhauled by hand

let coopWritten = 0, coopSkipped = 0, coopMissing = 0;
for (const spec of COOP_SPECS) {
  if (skipCoop.has(spec.folder)) { coopSkipped++; continue; }
  if (!exists(spec.folder)) { coopMissing++; continue; }
  writeCoopGame(spec);
  coopWritten++;
}

let quizWritten = 0, quizMissing = 0;
for (const spec of QUIZ_SPECS) {
  if (!exists(spec.folder)) { quizMissing++; continue; }
  writeQuizGame(spec);
  quizWritten++;
}

console.log(JSON.stringify({ coopWritten, coopSkipped, coopMissing, quizWritten, quizMissing }, null, 2));
