import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AcronymDefineQuizSettings { questions: "8" | "12"; }
export interface AcronymDefineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AcronymDefineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "NASA stands for:", choices: ["National Aeronautics and Space Administration","Northern Atlantic Space Agency","National Air Safety Authority","New Aerospace Standard Agency"], correct: 0 },
  { question: "NATO stands for:", choices: ["National Air Treaty Organization","North Atlantic Treaty Organization","Northern Allied Treaty Office","New Atlantic Trade Organization"], correct: 1 },
  { question: "LASER stands for:", choices: ["Light Amplification by Stimulated Emission of Radiation","Lambda Speed Energy Ray","Light Action Sustained Energy Ray","Laser Action System Energy Reflector"], correct: 0 },
  { question: "SCUBA stands for:", choices: ["Self Contained Underwater Breathing Apparatus","Submersible Compact Underwater Bath Apparatus","Sonar Controlled Underwater Bottom Apparatus","Self Cooling Underwater Body Apparatus"], correct: 0 },
  { question: "RADAR stands for:", choices: ["Radio Detection And Ranging","Range Adjusted Detection Antenna Radio","Reflected Audio Detection And Ranging","Radio Aerial Detection And Receiver"], correct: 0 },
  { question: "ASAP means:", choices: ["As Soon As Possible","All Set And Prepared","After School Action Plan","At Some Approved Pace"], correct: 0 },
  { question: "DIY means:", choices: ["Do It Yourself","Done In a Year","Down In Yard","Did It Yesterday"], correct: 0 },
  { question: "FYI means:", choices: ["For Your Information","From Yesterday Inc","Find Your Inbox","For Years Inc"], correct: 0 },
  { question: "FOMO stands for:", choices: ["Fear Of Missing Out","Friend Of My Owner","Form Of Major Order","First Of My Own"], correct: 0 },
  { question: "TBA stands for:", choices: ["To Be Announced","Time Before Action","The Best Account","Terms By Agreement"], correct: 0 },
  { question: "RSVP comes from French and means:", choices: ["Reply please","Right Side View Pass","Reserve Sit Vote Pass","Right Stay Vote Pass"], correct: 0 },
  { question: "DNA stands for:", choices: ["Designed New Atom","Deoxyribonucleic Acid","Direct Nucleic Atom","Daily New Acid"], correct: 1 },
  { question: "GPS stands for:", choices: ["Global Positioning System","General Power System","Group Pre-Set","Great Path Sensor"], correct: 0 },
  { question: "URL stands for:", choices: ["Uniform Resource Locator","Universal Read Line","Unified Resource Link","Used Reference List"], correct: 0 },
  { question: "HTML stands for:", choices: ["Hyper Text Markup Language","High Tech Modern Language","Home Tool Markup Language","Hyperlink Text Mode Language"], correct: 0 },
  { question: "PDF stands for:", choices: ["Portable Document Format","Printed Data File","Public Document Form","Plain Digital File"], correct: 0 },
  { question: "USB stands for:", choices: ["Universal Serial Bus","United Serial Branch","Unified System Block","Usable Software Box"], correct: 0 },
  { question: "RAM stands for:", choices: ["Random Access Memory","Read All Memory","Run And Manage","Remote Active Module"], correct: 0 },
  { question: "ROM stands for:", choices: ["Read Only Memory","Random Open Module","Run On Mode","Real Output Method"], correct: 0 },
  { question: "CEO stands for:", choices: ["Chief Executive Officer","Central Engineering Office","Company Executive Order","Chief Engineer Officer"], correct: 0 },
  { question: "ATM stands for:", choices: ["Automated Teller Machine","All Time Money","Account Transfer Method","Automatic Teller Module"], correct: 0 },
  { question: "CPU stands for:", choices: ["Central Processing Unit","Computer Power Unit","Core Program Unit","Central Print Unit"], correct: 0 },
  { question: "HVAC stands for:", choices: ["Heating, Ventilation, and Air Conditioning","High Voltage Alternating Current","Home Vacuum And Cleaning","Heated Volume And Climate"], correct: 0 },
  { question: "UNESCO stands for:", choices: ["United Nations Educational, Scientific and Cultural Organization","Universal Nations Economic Cooperation Office","Union of European States Cultural Office","United Nations Energy and Sustainability Council"], correct: 0 },
  { question: "UNICEF stands for:", choices: ["United Nations International Children's Emergency Fund","Universal Network for International Cultural Education Fund","Union of National Industries for Children","United National Institute for Children's Education"], correct: 0 },
  { question: "IQ stands for:", choices: ["Intelligence Quotient","Inner Quality","Intuition Quality","Inquiry Question"], correct: 0 },
  { question: "AKA means:", choices: ["Also Known As","All Kinds Allowed","Above Known Average","Always Keep Aside"], correct: 0 },
  { question: "BYOB means:", choices: ["Bring Your Own Bottle","Be Your Own Boss","Buy Your Own Books","Borrow Your Own Bag"], correct: 0 },
  { question: "ETA means:", choices: ["Estimated Time of Arrival","Early Transit Allowance","Easy Transport Access","Express Travel Auth"], correct: 0 },
  { question: "VIP stands for:", choices: ["Very Important Person","Verified Internet Profile","Virtual Identity Pass","Visual Image Project"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AcronymDefineQuizSettings): AcronymDefineQuizState {
  const rng = mulberry32(seed);
  const count = parseInt(settings.questions, 10);
  const pool = shuffle([...ALL_QUESTIONS], rng).slice(0, Math.min(count, ALL_QUESTIONS.length));
  const questions = pool.map(q => {
    const idx = q.choices.map((c, i) => ({ c, i }));
    const s = shuffle(idx, rng);
    const nc = s.findIndex(x => x.i === q.correct) as 0 | 1 | 2 | 3;
    return { ...q, choices: s.map(x => x.c) as [string, string, string, string], correct: nc };
  });
  return { questions, currentIndex: 0, selected: null, submitted: false, timeLeft: 15, score: 0, correctCount: 0, phase: "playing" };
}
export function reducer(state: AcronymDefineQuizState, action: AcronymDefineQuizAction): AcronymDefineQuizState {
  if (state.phase === "done") return state;
  switch (action.type) {
    case "select": return state.submitted ? state : { ...state, selected: action.choice };
    case "submit": {
      if (state.submitted || state.selected === null) return state;
      const q = state.questions[state.currentIndex]!;
      const ok = state.selected === q.correct;
      const pts = ok ? 100 + Math.floor(state.timeLeft * 10) : 0;
      return { ...state, submitted: true, score: state.score + pts, correctCount: state.correctCount + (ok ? 1 : 0), phase: "result" };
    }
    case "tick": {
      if (state.submitted) return state;
      const t = state.timeLeft - 1;
      return t <= 0 ? { ...state, timeLeft: 0, submitted: true, phase: "result" } : { ...state, timeLeft: t };
    }
    case "next": {
      const ni = state.currentIndex + 1;
      return ni >= state.questions.length ? { ...state, phase: "done" } : { ...state, currentIndex: ni, selected: null, submitted: false, timeLeft: 15, phase: "playing" };
    }
    default: return state;
  }
}
export function isTerminal(state: AcronymDefineQuizState): { score: number } | null { return state.phase === "done" ? { score: state.score } : null; }
