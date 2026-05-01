#!/usr/bin/env node
import { writeDeductionGame, exists } from "./scaffold-deduction.mjs";
import { DEDUCTION_SPECS } from "./deduction-specs.mjs";

let written = 0, missing = 0;
for (const spec of DEDUCTION_SPECS) {
  if (!exists(spec.folder)) { missing++; continue; }
  writeDeductionGame(spec);
  written++;
}
console.log(JSON.stringify({ written, missing }, null, 2));
