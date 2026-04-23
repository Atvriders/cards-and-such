import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

// Guess Who — 20 characters, 6 attributes each.
// Player asks yes/no questions, eliminates characters.
// First to correctly name the opponent's character wins.

export type HairColor = "brown" | "blonde" | "black" | "red" | "white";
export type EyeColor = "blue" | "brown" | "green";
export type FacialHair = "beard" | "mustache" | "none";
export type Accessory = "hat" | "glasses" | "none";
export type HairLength = "long" | "short" | "bald";
export type Nose = "big" | "small";

export interface Character {
  id: number;
  name: string;
  hair: HairColor;
  eyes: EyeColor;
  facialHair: FacialHair;
  accessory: Accessory;
  hairLength: HairLength;
  nose: Nose;
}

export const CHARACTERS: Character[] = [
  { id: 0, name: "Alex",    hair: "brown",  eyes: "blue",  facialHair: "none",     accessory: "none",    hairLength: "short", nose: "small" },
  { id: 1, name: "Betty",   hair: "blonde", eyes: "blue",  facialHair: "none",     accessory: "glasses", hairLength: "long",  nose: "small" },
  { id: 2, name: "Carlos",  hair: "black",  eyes: "brown", facialHair: "beard",    accessory: "none",    hairLength: "short", nose: "big"   },
  { id: 3, name: "Dana",    hair: "red",    eyes: "green", facialHair: "none",     accessory: "hat",     hairLength: "long",  nose: "small" },
  { id: 4, name: "Evan",    hair: "brown",  eyes: "brown", facialHair: "mustache", accessory: "none",    hairLength: "short", nose: "big"   },
  { id: 5, name: "Fiona",   hair: "blonde", eyes: "green", facialHair: "none",     accessory: "hat",     hairLength: "long",  nose: "small" },
  { id: 6, name: "Gary",    hair: "white",  eyes: "blue",  facialHair: "beard",    accessory: "glasses", hairLength: "bald",  nose: "big"   },
  { id: 7, name: "Hana",    hair: "black",  eyes: "brown", facialHair: "none",     accessory: "none",    hairLength: "long",  nose: "small" },
  { id: 8, name: "Ivan",    hair: "red",    eyes: "blue",  facialHair: "beard",    accessory: "hat",     hairLength: "short", nose: "big"   },
  { id: 9, name: "Julia",   hair: "blonde", eyes: "blue",  facialHair: "none",     accessory: "none",    hairLength: "long",  nose: "small" },
  { id: 10, name: "Ken",    hair: "brown",  eyes: "green", facialHair: "mustache", accessory: "glasses", hairLength: "short", nose: "small" },
  { id: 11, name: "Laura",  hair: "brown",  eyes: "brown", facialHair: "none",     accessory: "hat",     hairLength: "long",  nose: "big"   },
  { id: 12, name: "Mike",   hair: "black",  eyes: "blue",  facialHair: "mustache", accessory: "none",    hairLength: "short", nose: "small" },
  { id: 13, name: "Nina",   hair: "white",  eyes: "green", facialHair: "none",     accessory: "none",    hairLength: "long",  nose: "small" },
  { id: 14, name: "Omar",   hair: "black",  eyes: "brown", facialHair: "beard",    accessory: "hat",     hairLength: "bald",  nose: "big"   },
  { id: 15, name: "Paula",  hair: "red",    eyes: "blue",  facialHair: "none",     accessory: "glasses", hairLength: "long",  nose: "small" },
  { id: 16, name: "Quinn",  hair: "blonde", eyes: "brown", facialHair: "none",     accessory: "hat",     hairLength: "short", nose: "big"   },
  { id: 17, name: "Rosa",   hair: "brown",  eyes: "blue",  facialHair: "none",     accessory: "glasses", hairLength: "long",  nose: "small" },
  { id: 18, name: "Sam",    hair: "white",  eyes: "brown", facialHair: "beard",    accessory: "none",    hairLength: "bald",  nose: "big"   },
  { id: 19, name: "Tina",   hair: "black",  eyes: "green", facialHair: "none",     accessory: "hat",     hairLength: "long",  nose: "small" },
];

export type QuestionKey = "hair" | "eyes" | "facialHair" | "accessory" | "hairLength" | "nose";
export interface Question {
  key: QuestionKey;
  value: string;
  text: string;
}

export const QUESTIONS: Question[] = [
  { key: "hair",       value: "brown",    text: "Does your character have brown hair?" },
  { key: "hair",       value: "blonde",   text: "Does your character have blonde hair?" },
  { key: "hair",       value: "black",    text: "Does your character have black hair?" },
  { key: "hair",       value: "red",      text: "Does your character have red hair?" },
  { key: "hair",       value: "white",    text: "Does your character have white hair?" },
  { key: "eyes",       value: "blue",     text: "Does your character have blue eyes?" },
  { key: "eyes",       value: "brown",    text: "Does your character have brown eyes?" },
  { key: "eyes",       value: "green",    text: "Does your character have green eyes?" },
  { key: "facialHair", value: "beard",    text: "Does your character have a beard?" },
  { key: "facialHair", value: "mustache", text: "Does your character have a mustache?" },
  { key: "facialHair", value: "none",     text: "Does your character have no facial hair?" },
  { key: "accessory",  value: "hat",      text: "Is your character wearing a hat?" },
  { key: "accessory",  value: "glasses",  text: "Is your character wearing glasses?" },
  { key: "hairLength", value: "long",     text: "Does your character have long hair?" },
  { key: "hairLength", value: "short",    text: "Does your character have short hair?" },
  { key: "hairLength", value: "bald",     text: "Is your character bald?" },
  { key: "nose",       value: "big",      text: "Does your character have a big nose?" },
];

export interface GuessWhoSettings {
  dummy: "yes";
}

export type GuessWhoPhase = "asking" | "guessing" | "win" | "loss";

export interface GuessWhoState {
  settings: GuessWhoSettings;
  rngSeed: number;
  playerCharId: number;    // bot's secret character (player must guess this)
  botCharId: number;       // player's secret character (bot must guess this)
  playerEliminated: boolean[]; // which characters player has eliminated (indices into CHARACTERS)
  lastQuestion: Question | null;
  lastAnswer: boolean | null;
  questionsAsked: number;
  phase: GuessWhoPhase;
  message: string;
  // Bot tracks which characters still viable for it
  botCandidates: number[];
}

export type GuessWhoAction =
  | { type: "ask"; questionIdx: number }
  | { type: "guess"; charId: number };

export function initialState(seed: number, settings: GuessWhoSettings): GuessWhoState {
  const rng = mulberry32(seed);
  const playerCharId = Math.floor(rng() * CHARACTERS.length);
  let botCharId = Math.floor(rng() * CHARACTERS.length);
  if (botCharId === playerCharId) botCharId = (botCharId + 1) % CHARACTERS.length;
  const nextSeed = Math.floor(rng() * 2 ** 31);
  return {
    settings,
    rngSeed: nextSeed,
    playerCharId,
    botCharId,
    playerEliminated: new Array(CHARACTERS.length).fill(false),
    lastQuestion: null,
    lastAnswer: null,
    questionsAsked: 0,
    phase: "asking",
    message: `Bot has a secret character. Ask questions to figure out who it is! (Bot's secret is hidden — yours is also secret from them.)`,
    botCandidates: CHARACTERS.map((c) => c.id).filter((id) => id !== botCharId),
  };
}

function botEliminate(candidates: number[], q: Question): number[] {
  // Bot asks about its remaining candidates and eliminates
  return candidates.filter((id) => {
    const ch = CHARACTERS[id]!;
    return String(ch[q.key]) !== q.value;
  });
}

function botGuess(state: GuessWhoState): GuessWhoState {
  // Bot picks a random question about remaining candidates and eliminates
  if (state.botCandidates.length <= 1) {
    // Bot can guess the player's character
    const guessedId = state.botCandidates[0] ?? state.botCharId;
    const correct = guessedId === state.playerCharId;
    return {
      ...state,
      phase: correct ? "loss" : "asking",
      message: correct
        ? `Bot guessed your character (${CHARACTERS[state.playerCharId]!.name})! You lose.`
        : `Bot guessed wrong! Keep asking.`,
    };
  }

  // Pick a question that splits the candidates best
  const rng = mulberry32(state.rngSeed);
  const nextSeed = Math.floor(rng() * 2 ** 31);
  const qIdx = Math.floor(rng() * QUESTIONS.length);
  const q = QUESTIONS[qIdx]!;
  const targetChar = CHARACTERS[state.playerCharId]!;
  const answer = String(targetChar[q.key]) === q.value;
  const newCandidates = state.botCandidates.filter((id) => {
    const ch = CHARACTERS[id]!;
    const matches = String(ch[q.key]) === q.value;
    return matches === answer;
  });

  return {
    ...state,
    rngSeed: nextSeed,
    botCandidates: newCandidates.length > 0 ? newCandidates : state.botCandidates,
  };
}

export function reducer(state: GuessWhoState, action: GuessWhoAction): GuessWhoState {
  if (state.phase === "win" || state.phase === "loss") return state;

  switch (action.type) {
    case "ask": {
      const q = QUESTIONS[action.questionIdx];
      if (!q) return state;
      const targetChar = CHARACTERS[state.playerCharId]!;
      const answer = String(targetChar[q.key]) === q.value;
      // Eliminate characters from player's board
      const newEliminated = [...state.playerEliminated];
      for (let i = 0; i < CHARACTERS.length; i++) {
        const ch = CHARACTERS[i]!;
        const matches = String(ch[q.key]) === q.value;
        if (matches !== answer) newEliminated[i] = true;
      }
      // Bot takes a turn
      const afterBot = botGuess({
        ...state,
        playerEliminated: newEliminated,
        lastQuestion: q,
        lastAnswer: answer,
        questionsAsked: state.questionsAsked + 1,
        message: `You asked: "${q.text}" — Answer: ${answer ? "Yes!" : "No!"}`,
      });
      return afterBot;
    }

    case "guess": {
      const correct = action.charId === state.playerCharId;
      return {
        ...state,
        phase: correct ? "win" : "loss",
        message: correct
          ? `Correct! Bot's character was ${CHARACTERS[state.playerCharId]!.name}! You win!`
          : `Wrong! Bot's character was ${CHARACTERS[state.playerCharId]!.name}. You lose!`,
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: GuessWhoState): { score: number } | null {
  if (state.phase !== "win" && state.phase !== "loss") return null;
  return { score: state.phase === "win" ? 100 : 0 };
}
