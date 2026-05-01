// Shared cooperative game engine.
// Models a generic "player + AI ally vs threat" loop used by Pandemic, Forbidden,
// Spirit Island, Aeons End, LCG/coop, Hogwarts Battle, Sentinels, Magic Maze,
// Flashpoint, Crew, Hanabi-ish, Dominion-coop, Mage Knight Card, Thunderstone,
// Legendary Marvel, Tash Kalar, Sorcerer City, KeyForge, Summoner Wars,
// BattleCON, One Deck Galaxy, Tanto Cuore, Dungeon Lords, Four Souls,
// Undaunted, Grizzled, Apothecaria, Robinson Crusoe, Dead of Winter,
// Eldritch, Escape Aliens, Vast, Burgle Bros, Letter Jam, Space Alert, etc.
//
// Each round the player picks a tactic which has a base contribution and a
// chance to "succeed" (drawing strongly) or "fail" (recovering little). The
// AI ally contributes a fixed amount each round. After both, the threat
// system advances by raising the threat counter; if it crosses a threshold
// the player loses health/morale. The game ends with a score based on
// progress vs threat balance.

import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface CoopTactic {
  id: string;
  label: string;
  emoji: string;
  /** average effort applied this round on success */
  effort: number;
  /** chance 0..1 of full effort; otherwise half */
  reliability: number;
  /** how much threat reduction this tactic achieves (sub-zero allowed) */
  threatPush?: number;
  /** flavor description */
  desc: string;
}

export interface CoopEngineConfig {
  totalRounds: number;
  /** progress required to "win" */
  progressTarget: number;
  /** how much the threat advances per round, base */
  threatPerRound: number;
  /** how much player health/morale you have */
  startMorale: number;
  /** if threat exceeds this, lose 1 morale */
  threatBreakpoint: number;
  /** ally's flat per-round contribution */
  allyEffort: number;
  /** ally's chance to also push threat back by 1 */
  allyClutch: number;
  /** tactics player can choose each round */
  tactics: readonly CoopTactic[];
  /** flavor labels for state surfaces */
  progressLabel: string;
  threatLabel: string;
  moraleLabel: string;
  scenarioLabel: string;
  scenarioEmoji: string;
}

export interface CoopState {
  rngSeed: number;
  round: number;
  progress: number;
  threat: number;
  morale: number;
  log: readonly string[];
  lastTactic: string | null;
  lastRoll: number;
  lastEffort: number;
  lastAlly: number;
  lastThreatGain: number;
  phase: "choose" | "resolved" | "done";
  /** snapshot of difficulty knob baked in so reducer is pure */
  difficulty: number;
}

export function coopInitial(seed: number, cfg: CoopEngineConfig, difficulty = 1): CoopState {
  return {
    rngSeed: seed,
    round: 1,
    progress: 0,
    threat: 0,
    morale: cfg.startMorale,
    log: [],
    lastTactic: null,
    lastRoll: 0,
    lastEffort: 0,
    lastAlly: 0,
    lastThreatGain: 0,
    phase: "choose",
    difficulty,
  };
}

export function coopStep(
  state: CoopState,
  cfg: CoopEngineConfig,
  tacticId: string,
): CoopState {
  if (state.phase !== "choose") return state;
  const tac = cfg.tactics.find((t) => t.id === tacticId);
  if (!tac) return state;
  const rng = mulberry32(state.rngSeed);
  const r1 = rng();
  const r2 = rng();
  const r3 = rng();
  const diff = state.difficulty || 1;
  const success = r1 < tac.reliability;
  const effort = success ? tac.effort : Math.max(1, Math.floor(tac.effort / 2));
  const allyEffort = cfg.allyEffort + (r2 < cfg.allyClutch ? 1 : 0);
  const baseGain = effort + allyEffort;
  const threatPushBack = tac.threatPush ?? 0;
  // Threat advances by base * difficulty, less the tactic push and possibly 1 from ally clutch
  let threatGain = Math.round(cfg.threatPerRound * diff) - threatPushBack - (r2 < cfg.allyClutch ? 1 : 0);
  if (threatGain < 0) threatGain = 0;
  let nextThreat = state.threat + threatGain;
  let nextMorale = state.morale;
  if (nextThreat >= cfg.threatBreakpoint) {
    nextMorale -= 1;
    nextThreat = Math.max(0, nextThreat - cfg.threatBreakpoint);
  }
  const noise = Math.floor(r3 * 2);
  const progressNext = state.progress + baseGain + noise;
  const round = state.round + 1;
  const isLast = state.round >= cfg.totalRounds;
  const dead = nextMorale <= 0;
  const won = progressNext >= cfg.progressTarget;
  const done = isLast || dead || won;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const message =
    `R${state.round}: ${tac.emoji} ${tac.label} → ${success ? "strong" : "weak"} +${effort}, ally +${allyEffort}, threat ${threatGain >= 0 ? "+" + threatGain : threatGain}`;
  return {
    rngSeed: nextSeed,
    round,
    progress: progressNext,
    threat: nextThreat,
    morale: nextMorale,
    log: [message, ...state.log].slice(0, 8),
    lastTactic: tac.id,
    lastRoll: Math.floor(r1 * 100),
    lastEffort: effort,
    lastAlly: allyEffort,
    lastThreatGain: threatGain,
    phase: done ? "done" : "choose",
  };
}

export function coopScore(
  state: CoopState,
  cfg: CoopEngineConfig,
): { score: number; victory: boolean } | null {
  if (state.phase !== "done") return null;
  const won = state.progress >= cfg.progressTarget && state.morale > 0;
  const base = state.progress + state.morale * 5;
  const threatPenalty = state.threat;
  const winBonus = won ? 50 : 0;
  const score = Math.max(0, base + winBonus - threatPenalty);
  return { score, victory: won };
}
