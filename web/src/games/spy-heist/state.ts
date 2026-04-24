import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export const TOTAL_STAGES = 6;

export type ChoiceType = "stealth" | "distract" | "hack" | "bribe" | "rush";

export interface StageChoice {
  label: string;
  type: ChoiceType;
  successChance: number; // 0-100
  rewardOnSuccess: number;
  penaltyOnFail: number;
  heatGain: number; // detection risk added
}

export interface Stage {
  name: string;
  description: string;
  choices: readonly StageChoice[];
}

export interface SpyHeistState {
  rngSeed: number;
  stage: number; // 1..TOTAL_STAGES
  heat: number; // 0-100 detection level
  loot: number; // coins collected
  phase: "choose" | "result" | "done" | "caught";
  lastResult: string;
  log: readonly string[];
}

export type SpyHeistAction =
  | { type: "choose"; choiceIndex: number }
  | { type: "advance" };

export const STAGES: Stage[] = [
  {
    name: "Museum Exterior",
    description: "Approach the museum without raising alarms.",
    choices: [
      { label: "Slip through the crowd", type: "stealth",  successChance: 85, rewardOnSuccess: 10, penaltyOnFail: 0,  heatGain: 5  },
      { label: "Pick the side gate",     type: "hack",     successChance: 70, rewardOnSuccess: 20, penaltyOnFail: 0,  heatGain: 15 },
      { label: "Bribe the guard",        type: "bribe",    successChance: 60, rewardOnSuccess: 15, penaltyOnFail: 15, heatGain: 20 },
    ],
  },
  {
    name: "Security Room",
    description: "Disable cameras without triggering the alarm.",
    choices: [
      { label: "Hack the system",        type: "hack",     successChance: 65, rewardOnSuccess: 25, penaltyOnFail: 10, heatGain: 20 },
      { label: "Cut the power briefly",  type: "rush",     successChance: 50, rewardOnSuccess: 30, penaltyOnFail: 5,  heatGain: 30 },
      { label: "Distract the operator",  type: "distract", successChance: 75, rewardOnSuccess: 15, penaltyOnFail: 5,  heatGain: 10 },
    ],
  },
  {
    name: "Vault Corridor",
    description: "Navigate the laser-grid hallway.",
    choices: [
      { label: "Crawl beneath lasers",   type: "stealth",  successChance: 70, rewardOnSuccess: 20, penaltyOnFail: 10, heatGain: 10 },
      { label: "Jam the sensors",        type: "hack",     successChance: 60, rewardOnSuccess: 35, penaltyOnFail: 15, heatGain: 25 },
      { label: "Sprint and hope",        type: "rush",     successChance: 40, rewardOnSuccess: 40, penaltyOnFail: 0,  heatGain: 40 },
    ],
  },
  {
    name: "The Vault",
    description: "Crack the combination lock.",
    choices: [
      { label: "Listen carefully",       type: "stealth",  successChance: 60, rewardOnSuccess: 50, penaltyOnFail: 0,  heatGain: 5  },
      { label: "Electronic override",    type: "hack",     successChance: 55, rewardOnSuccess: 60, penaltyOnFail: 10, heatGain: 20 },
      { label: "Brute force it",         type: "rush",     successChance: 35, rewardOnSuccess: 70, penaltyOnFail: 5,  heatGain: 35 },
    ],
  },
  {
    name: "Escape Route",
    description: "Slip out with the loot.",
    choices: [
      { label: "Sewers exit",            type: "stealth",  successChance: 80, rewardOnSuccess: 10, penaltyOnFail: 5,  heatGain: 5  },
      { label: "Helicopter pickup",      type: "bribe",    successChance: 65, rewardOnSuccess: 20, penaltyOnFail: 0,  heatGain: 15 },
      { label: "Car chase",              type: "rush",     successChance: 50, rewardOnSuccess: 30, penaltyOnFail: 10, heatGain: 30 },
    ],
  },
  {
    name: "Border Crossing",
    description: "Cross the border with the stolen goods.",
    choices: [
      { label: "Forged documents",       type: "bribe",    successChance: 70, rewardOnSuccess: 30, penaltyOnFail: 20, heatGain: 10 },
      { label: "Hidden compartment",     type: "stealth",  successChance: 75, rewardOnSuccess: 20, penaltyOnFail: 0,  heatGain: 10 },
      { label: "Pay off the official",   type: "bribe",    successChance: 55, rewardOnSuccess: 40, penaltyOnFail: 30, heatGain: 25 },
    ],
  },
];

export function initialState(seed: number): SpyHeistState {
  const rng = mulberry32(seed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    rngSeed: nextSeed,
    stage: 1,
    heat: 0,
    loot: 0,
    phase: "choose",
    lastResult: "",
    log: [],
  };
}

export function reducer(state: SpyHeistState, action: SpyHeistAction): SpyHeistState {
  if (state.phase === "done" || state.phase === "caught") return state;

  switch (action.type) {
    case "choose": {
      if (state.phase !== "choose") return state;
      const stageData = STAGES[state.stage - 1];
      if (!stageData) return state;
      const choice = stageData.choices[action.choiceIndex];
      if (!choice) return state;

      const rng = mulberry32(state.rngSeed);
      const nextSeed = Math.floor(rng() * 2 ** 31);
      const roll = Math.floor(rng() * 100);
      const success = roll < choice.successChance;

      const newHeat = Math.min(100, state.heat + choice.heatGain);
      const newLoot = success
        ? state.loot + choice.rewardOnSuccess
        : Math.max(0, state.loot - choice.penaltyOnFail);

      const resultMsg = success
        ? `✅ ${choice.label} succeeded! +${choice.rewardOnSuccess} loot`
        : `❌ ${choice.label} failed! -${choice.penaltyOnFail} loot`;

      // Caught if heat >= 100
      if (newHeat >= 100) {
        return {
          ...state,
          rngSeed: nextSeed,
          heat: 100,
          loot: newLoot,
          phase: "caught",
          lastResult: resultMsg + " — CAUGHT!",
          log: [...state.log, resultMsg + " — CAUGHT!"],
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        heat: newHeat,
        loot: newLoot,
        phase: "result",
        lastResult: resultMsg,
        log: [...state.log, resultMsg],
      };
    }

    case "advance": {
      if (state.phase !== "result") return state;
      const nextStage = state.stage + 1;
      if (nextStage > TOTAL_STAGES) {
        return { ...state, stage: nextStage, phase: "done" };
      }
      return { ...state, stage: nextStage, phase: "choose" };
    }
  }
}

export function isTerminal(state: SpyHeistState): { score: number } | null {
  if (state.phase === "done") return { score: Math.max(0, Math.min(100, Math.round((state.loot / 200) * 100))) };
  if (state.phase === "caught") return { score: Math.max(0, Math.min(50, Math.round((state.loot / 200) * 50))) };
  return null;
}
