import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface AcronymQuizSettings {
  questionCount: "5" | "10" | "15";
}

export interface AcronymEntry {
  acronym: string;
  answer: string;
  choices: string[];
}

export interface AcronymQuizState {
  settings: AcronymQuizSettings;
  entries: AcronymEntry[];
  current: number;
  selected: number | null;
  score: number;
  done: boolean;
}

export type AcronymQuizAction =
  | { type: "select"; index: number }
  | { type: "next" };

const BANK: { acronym: string; answer: string }[] = [
  { acronym: "NASA", answer: "National Aeronautics and Space Administration" },
  { acronym: "FBI", answer: "Federal Bureau of Investigation" },
  { acronym: "CIA", answer: "Central Intelligence Agency" },
  { acronym: "NATO", answer: "North Atlantic Treaty Organization" },
  { acronym: "WHO", answer: "World Health Organization" },
  { acronym: "UN", answer: "United Nations" },
  { acronym: "UNESCO", answer: "United Nations Educational Scientific and Cultural Organization" },
  { acronym: "UNICEF", answer: "United Nations International Children's Emergency Fund" },
  { acronym: "GDP", answer: "Gross Domestic Product" },
  { acronym: "DNA", answer: "Deoxyribonucleic Acid" },
  { acronym: "RNA", answer: "Ribonucleic Acid" },
  { acronym: "CPU", answer: "Central Processing Unit" },
  { acronym: "GPS", answer: "Global Positioning System" },
  { acronym: "WiFi", answer: "Wireless Fidelity" },
  { acronym: "USB", answer: "Universal Serial Bus" },
  { acronym: "HTML", answer: "HyperText Markup Language" },
  { acronym: "URL", answer: "Uniform Resource Locator" },
  { acronym: "HTTP", answer: "HyperText Transfer Protocol" },
  { acronym: "PDF", answer: "Portable Document Format" },
  { acronym: "ASAP", answer: "As Soon As Possible" },
  { acronym: "AWOL", answer: "Absent Without Official Leave" },
  { acronym: "RADAR", answer: "Radio Detection And Ranging" },
  { acronym: "LASER", answer: "Light Amplification by Stimulated Emission of Radiation" },
  { acronym: "SCUBA", answer: "Self-Contained Underwater Breathing Apparatus" },
  { acronym: "SONAR", answer: "Sound Navigation And Ranging" },
  { acronym: "POTUS", answer: "President Of The United States" },
  { acronym: "SCOTUS", answer: "Supreme Court Of The United States" },
  { acronym: "CDC", answer: "Centers for Disease Control and Prevention" },
  { acronym: "IRS", answer: "Internal Revenue Service" },
  { acronym: "NFL", answer: "National Football League" },
  { acronym: "NBA", answer: "National Basketball Association" },
  { acronym: "MLB", answer: "Major League Baseball" },
  { acronym: "FIFA", answer: "Federation Internationale de Football Association" },
  { acronym: "IOC", answer: "International Olympic Committee" },
  { acronym: "ATM", answer: "Automated Teller Machine" },
];

const DISTRACTORS: string[] = [
  "National Aviation Space Agency",
  "Federal Bureau of Investigations",
  "Central Intelligence Administration",
  "North American Treaty Organization",
  "World Health Administration",
  "United Networks",
  "Universal Nations Educational Society",
  "United Nations International Children's Fund",
  "Global Domestic Product",
  "Deoxynucleic Acid",
  "Ribose Nucleic Acid",
  "Core Processing Unit",
  "Geographic Positioning System",
  "Wide-Area Frequency Interface",
  "Universal Sync Bus",
  "Hyperlink Text Markup Language",
  "Uniform Resource Link",
  "Hyperlink Transfer Protocol",
  "Portable Data File",
  "As Soon As Possible (Alternate)",
  "Absence Without Official Leave",
  "Radio Distance And Ranging",
  "Light Activated Stimulated Emission Radiation",
  "Submersible Compressed Underwater Breathing Apparatus",
  "Submarine Object Navigation And Ranging",
  "President of the US",
  "Supreme Court of the United States (Alt)",
  "Center for Disease Control",
  "Internal Revenue System",
  "National Federation League",
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export function initialState(seed: number, settings: AcronymQuizSettings): AcronymQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questionCount, 10);
  const shuffledBank = shuffle(BANK, rng);
  const chosen = shuffledBank.slice(0, count);

  const entries: AcronymEntry[] = chosen.map((item) => {
    const wrongPool = shuffle(
      DISTRACTORS.filter((d) => d !== item.answer),
      rng,
    ).slice(0, 3);
    const choices = shuffle([item.answer, ...wrongPool], rng);
    return { acronym: item.acronym, answer: item.answer, choices };
  });

  return {
    settings,
    entries,
    current: 0,
    selected: null,
    score: 0,
    done: false,
  };
}

export function reducer(state: AcronymQuizState, action: AcronymQuizAction): AcronymQuizState {
  if (state.done) return state;
  switch (action.type) {
    case "select": {
      if (state.selected !== null) return state;
      const entry = state.entries[state.current]!;
      const correct = entry.choices[action.index] === entry.answer;
      return {
        ...state,
        selected: action.index,
        score: correct ? state.score + 10 : state.score,
      };
    }
    case "next": {
      if (state.selected === null) return state;
      const nextIdx = state.current + 1;
      if (nextIdx >= state.entries.length) {
        return { ...state, done: true };
      }
      return { ...state, current: nextIdx, selected: null };
    }
    default:
      return state;
  }
}

export function isTerminal(state: AcronymQuizState): { score: number } | null {
  if (state.done) return { score: state.score };
  return null;
}
