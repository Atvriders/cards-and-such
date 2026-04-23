import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface WYRSettings {
  rounds: "10" | "25" | "50";
}

export interface WYRDilemma {
  optionA: string;
  optionB: string;
  /** Simulated percentage who chose A (40-60 range typically) */
  percentA: number;
}

const RAW_DILEMMAS: Array<{ optionA: string; optionB: string; percentA: number }> = [
  { optionA: "Eat only pizza for a year", optionB: "Eat only sushi for a year", percentA: 58 },
  { optionA: "Be able to fly", optionB: "Be able to become invisible", percentA: 52 },
  { optionA: "Always be 10 minutes late", optionB: "Always be 20 minutes early", percentA: 44 },
  { optionA: "Have unlimited money but no free time", optionB: "Have unlimited free time but no money", percentA: 49 },
  { optionA: "Know when you will die", optionB: "Know how you will die", percentA: 47 },
  { optionA: "Be famous and miserable", optionB: "Be unknown and happy", percentA: 31 },
  { optionA: "Live in the past for one year", optionB: "Live in the future for one year", percentA: 39 },
  { optionA: "Speak every language fluently", optionB: "Play every instrument perfectly", percentA: 63 },
  { optionA: "Be able to stop time", optionB: "Be able to rewind time by 10 seconds", percentA: 54 },
  { optionA: "Have a pet dragon", optionB: "Be a dragon", percentA: 42 },
  { optionA: "Never need sleep", optionB: "Never need food", percentA: 61 },
  { optionA: "Be an expert chef", optionB: "Be an expert musician", percentA: 47 },
  { optionA: "Have the ability to read minds", optionB: "Have the ability to control minds", percentA: 56 },
  { optionA: "Always have to whisper", optionB: "Always have to shout", percentA: 53 },
  { optionA: "Live in a treehouse forever", optionB: "Live on a houseboat forever", percentA: 48 },
  { optionA: "Have fingers as long as your legs", optionB: "Have legs as short as your fingers", percentA: 59 },
  { optionA: "Age physically but not mentally", optionB: "Age mentally but not physically", percentA: 62 },
  { optionA: "Be surrounded by people who agree with everything", optionB: "Be surrounded by people who argue with everything", percentA: 44 },
  { optionA: "Be able to breathe underwater", optionB: "Be able to survive in space without a suit", percentA: 51 },
  { optionA: "Have perfect memory", optionB: "Be able to selectively forget anything", percentA: 46 },
  { optionA: "Only eat sweet foods", optionB: "Only eat savory foods", percentA: 50 },
  { optionA: "Have a rewind button for life (one use per day)", optionB: "Have a pause button for life (one use per day)", percentA: 55 },
  { optionA: "Fight one horse-sized duck", optionB: "Fight 100 duck-sized horses", percentA: 43 },
  { optionA: "Lose the ability to use smartphones", optionB: "Lose the ability to use computers", percentA: 37 },
  { optionA: "Only communicate via song", optionB: "Only communicate via interpretive dance", percentA: 64 },
  { optionA: "Have a photographic memory", optionB: "Have the ability to learn any skill in one hour", percentA: 48 },
  { optionA: "Live 200 years in the past", optionB: "Live 200 years in the future", percentA: 41 },
  { optionA: "Be the most attractive person in the room", optionB: "Be the smartest person in the room", percentA: 38 },
  { optionA: "Find true love but lose all your money", optionB: "Become extremely wealthy but never find true love", percentA: 55 },
  { optionA: "Have unlimited battery life on all devices", optionB: "Have unlimited storage on all devices", percentA: 67 },
  { optionA: "Discover a new planet", optionB: "Discover a new species", percentA: 44 },
  { optionA: "Be able to talk to animals", optionB: "Be able to talk to plants", percentA: 79 },
  { optionA: "Have your dream job but earn minimum wage", optionB: "Have a boring job but earn a million a year", percentA: 52 },
  { optionA: "Always be too hot", optionB: "Always be too cold", percentA: 43 },
  { optionA: "Have a clone of yourself", optionB: "Switch bodies with anyone for one day per week", percentA: 46 },
  { optionA: "Win a Nobel Prize", optionB: "Win an Olympic gold medal", percentA: 54 },
  { optionA: "Be the first person on Mars", optionB: "Discover the deepest part of the ocean", percentA: 62 },
  { optionA: "Eat a tablespoon of wasabi", optionB: "Eat a tablespoon of hot sauce", percentA: 41 },
  { optionA: "Give up TV forever", optionB: "Give up movies forever", percentA: 53 },
  { optionA: "Be immune to all diseases", optionB: "Never feel physical pain", percentA: 55 },
  { optionA: "Be able to teleport anywhere", optionB: "Be able to time travel but only forward", percentA: 59 },
  { optionA: "Have the power to heal others", optionB: "Have the power to bring back the dead once", percentA: 67 },
  { optionA: "Never have to work again", optionB: "Always love your job", percentA: 44 },
  { optionA: "Be able to eat anything without getting full", optionB: "Be able to eat anything without gaining weight", percentA: 46 },
  { optionA: "Have a personal robot assistant", optionB: "Have a personal AI that knows everything about you", percentA: 51 },
  { optionA: "Live without the internet for a year", optionB: "Live without music for a year", percentA: 55 },
  { optionA: "Know the outcome of every sports game in advance", optionB: "Know the exact weather for the next year", percentA: 63 },
  { optionA: "Be invisible for one hour a day", optionB: "Be able to fly for one hour a day", percentA: 48 },
  { optionA: "Spend a week in the Stone Age", optionB: "Spend a week in the year 3000", percentA: 32 },
  { optionA: "Have a personal chef", optionB: "Have a personal driver", percentA: 61 },
  { optionA: "Only be able to use stairs", optionB: "Only be able to use elevators", percentA: 57 },
  { optionA: "Have terrible short-term memory but amazing long-term memory", optionB: "Have amazing short-term memory but terrible long-term memory", percentA: 49 },
  { optionA: "Be the world's greatest artist", optionB: "Be the world's greatest athlete", percentA: 46 },
  { optionA: "Always have to say what you are thinking", optionB: "Never be able to speak again", percentA: 48 },
  { optionA: "Have unlimited vacation but a boring job", optionB: "Have an exciting job but zero vacation days", percentA: 54 },
];

export interface WYRState {
  settings: WYRSettings;
  dilemmas: WYRDilemma[];
  currentIndex: number;
  chosen: "A" | "B" | null;
  submitted: boolean;
  majorityMatches: number;
  phase: "playing" | "result" | "done";
}

export type WYRAction =
  | { type: "choose"; option: "A" | "B" }
  | { type: "next" };

export function initialState(seed: number, settings: WYRSettings): WYRState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.rounds, 10);

  const pool = [...RAW_DILEMMAS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  const dilemmas = pool.slice(0, Math.min(count, pool.length));

  return {
    settings,
    dilemmas,
    currentIndex: 0,
    chosen: null,
    submitted: false,
    majorityMatches: 0,
    phase: "playing",
  };
}

export function reducer(state: WYRState, action: WYRAction): WYRState {
  if (state.phase === "done") return state;

  switch (action.type) {
    case "choose": {
      if (state.submitted) return state;
      const d = state.dilemmas[state.currentIndex]!;
      const agreedWithMajority = (action.option === "A" && d.percentA >= 50) || (action.option === "B" && d.percentA < 50);
      return {
        ...state,
        chosen: action.option,
        submitted: true,
        majorityMatches: state.majorityMatches + (agreedWithMajority ? 1 : 0),
        phase: "result",
      };
    }

    case "next": {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.dilemmas.length) {
        return { ...state, phase: "done" };
      }
      return {
        ...state,
        currentIndex: nextIndex,
        chosen: null,
        submitted: false,
        phase: "playing",
      };
    }

    default:
      return state;
  }
}

export function isTerminal(state: WYRState): { score: number } | null {
  if (state.phase === "done") return { score: state.majorityMatches };
  return null;
}
