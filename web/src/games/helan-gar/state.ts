import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

/**
 * Helan går (Halvan, Tersen, Kvarten, Kvarten, Femman, Sexan)
 * Swedish dice drinking game — adapted as a scoring game.
 * Roll 2 dice. Target combinations in order:
 *   Helan  (1+2=3 or doubles 1) → must get 1-2
 *   Halvan (1+2 both dice again, or any pair of dice) — simplified
 *
 * Simplified rules for digital play:
 * You have 6 rounds. Each round has a target sum (3,4,5,6,7,8 for the 6 stages).
 * Roll 2 dice up to 3 times per round. If you hit the target sum: score points.
 * Miss all 3 rolls: lose points. Score tracked over 6 rounds.
 *
 * Canonical: 6 stages matching traditional Helan → Sexan drinks.
 * Each stage: target sum = stage + 2 (stage 1=3, stage 2=4, ..., stage 6=8).
 * Hit: +stage points. Miss: -1 point.
 */

export interface HelanGarSettings {
  stages: "6" | "3";
}

export interface HelanGarState {
  settings: HelanGarSettings;
  rngSeed: number;
  stage: number;
  totalStages: number;
  score: number;
  currentRoll: [number, number] | null;
  rollsLeft: number;
  hitThisStage: boolean;
  phase: "preRoll" | "rolled" | "stageOver" | "done";
  lastMsg: string;
}

export type HelanGarAction =
  | { type: "roll" }
  | { type: "nextStage" };

const STAGE_NAMES = ["Helan", "Halvan", "Tersen", "Kvarten", "Femman", "Sexan"];

function rollTwo(seed: number): { d1: number; d2: number; nextSeed: number } {
  let s = seed >>> 0;
  const r1 = mulberry32(s);
  const v1 = r1();
  const s1 = (Math.floor(v1 * 2 ** 31)) >>> 0;
  const r2 = mulberry32(s1);
  const v2 = r2();
  const s2 = (Math.floor(v2 * 2 ** 31)) >>> 0;
  const rA = mulberry32(s);
  const d1 = Math.floor(rA() * 6) + 1;
  const rB = mulberry32(s1);
  const d2 = Math.floor(rB() * 6) + 1;
  return { d1, d2, nextSeed: s2 };
}

export function stageName(stage: number): string {
  return STAGE_NAMES[stage - 1] ?? `Stage ${stage}`;
}

export function stageTarget(stage: number): number {
  return stage + 2; // 1→3, 2→4, 3→5, 4→6, 5→7, 6→8
}

export function initialState(seed: number, settings: HelanGarSettings): HelanGarState {
  const totalStages = Number(settings.stages);
  return {
    settings,
    rngSeed: seed >>> 0,
    stage: 1,
    totalStages,
    score: 0,
    currentRoll: null,
    rollsLeft: 3,
    hitThisStage: false,
    phase: "preRoll",
    lastMsg: "",
  };
}

export function reducer(state: HelanGarState, action: HelanGarAction): HelanGarState {
  switch (action.type) {
    case "roll": {
      if (state.phase !== "preRoll" && state.phase !== "rolled") return state;
      if (state.rollsLeft <= 0) return state;

      const { d1, d2, nextSeed } = rollTwo(state.rngSeed);
      const sum = d1 + d2;
      const target = stageTarget(state.stage);
      const hit = sum === target;
      const newRollsLeft = state.rollsLeft - 1;

      if (hit) {
        const pts = state.stage;
        return {
          ...state,
          rngSeed: nextSeed,
          currentRoll: [d1, d2],
          rollsLeft: newRollsLeft,
          hitThisStage: true,
          score: state.score + pts,
          phase: "stageOver",
          lastMsg: `${stageName(state.stage)}! Rolled ${d1}+${d2}=${sum}. +${pts} point${pts > 1 ? "s" : ""}!`,
        };
      }

      if (newRollsLeft <= 0) {
        // Failed stage
        return {
          ...state,
          rngSeed: nextSeed,
          currentRoll: [d1, d2],
          rollsLeft: 0,
          hitThisStage: false,
          score: state.score - 1,
          phase: "stageOver",
          lastMsg: `Missed ${stageName(state.stage)}! Rolled ${d1}+${d2}=${sum} (needed ${target}). −1 point.`,
        };
      }

      return {
        ...state,
        rngSeed: nextSeed,
        currentRoll: [d1, d2],
        rollsLeft: newRollsLeft,
        phase: "rolled",
        lastMsg: `Rolled ${d1}+${d2}=${sum} — need ${target} for ${stageName(state.stage)}. ${newRollsLeft} roll${newRollsLeft > 1 ? "s" : ""} left.`,
      };
    }

    case "nextStage": {
      if (state.phase !== "stageOver") return state;
      const newStage = state.stage + 1;
      const done = newStage > state.totalStages;
      return {
        ...state,
        stage: newStage,
        currentRoll: null,
        rollsLeft: 3,
        hitThisStage: false,
        phase: done ? "done" : "preRoll",
        lastMsg: done ? state.lastMsg : "",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: HelanGarState): { score: number } | null {
  if (state.phase !== "done") return null;
  return { score: Math.max(0, state.score + 10) }; // offset for non-negative
}
