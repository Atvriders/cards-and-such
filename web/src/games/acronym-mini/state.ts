import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface AcronymMiniSettings { questions: "8" | "10" | "12"; }
export interface AcronymMiniState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type AcronymMiniAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  {
    "question": "'NASA' stands for:",
    "choices": [
      "National Aeronautics and Space Administration",
      "National Aerial Science Agency",
      "North American Space Authority",
      "National Air & Sea Authority"
    ],
    "correct": 0
  },
  {
    "question": "'NATO' stands for:",
    "choices": [
      "North Atlantic Treaty Organization",
      "North African Treaty Organization",
      "Northern Atlantic Trade Org.",
      "National Atlantic Treaty Org."
    ],
    "correct": 0
  },
  {
    "question": "'FBI' stands for:",
    "choices": [
      "Federal Bureau of Investigation",
      "Federal Branch of Inquiry",
      "Federal Board of Information",
      "Field Bureau of Investigation"
    ],
    "correct": 0
  },
  {
    "question": "'CIA' stands for:",
    "choices": [
      "Central Intelligence Agency",
      "Central Investigation Agency",
      "Crime Intelligence Agency",
      "Civil Intelligence Agency"
    ],
    "correct": 0
  },
  {
    "question": "'NASA' is which type of word?",
    "choices": [
      "acronym (pronounced as a word)",
      "initialism",
      "abbreviation only",
      "contraction"
    ],
    "correct": 0
  },
  {
    "question": "'FBI' is which type?",
    "choices": [
      "initialism (pronounced letter by letter)",
      "acronym (as a word)",
      "contraction",
      "compound"
    ],
    "correct": 0
  },
  {
    "question": "'LASER' stands for:",
    "choices": [
      "Light Amplification by Stimulated Emission of Radiation",
      "Light Active Stimulated Energy Ray",
      "Laser Active Source Emitting Radiation",
      "Light And Sound Energy Ray"
    ],
    "correct": 0
  },
  {
    "question": "'RADAR' stands for:",
    "choices": [
      "Radio Detection and Ranging",
      "Radio Detection and Reading",
      "Radio Distance and Range",
      "Radial Detection and Ranging"
    ],
    "correct": 0
  },
  {
    "question": "'SCUBA' stands for:",
    "choices": [
      "Self-Contained Underwater Breathing Apparatus",
      "Sub-Caribbean Underwater Breathing Air",
      "Self-Controlled Underwater Buoy Apparatus",
      "Self-Contained Universal Breathing Aid"
    ],
    "correct": 0
  },
  {
    "question": "'AIDS' stands for:",
    "choices": [
      "Acquired Immunodeficiency Syndrome",
      "Acute Immune Disease Syndrome",
      "Auto-Immune Deficiency Syndrome",
      "Acquired Internal Disease Syndrome"
    ],
    "correct": 0
  },
  {
    "question": "'GIF' stands for:",
    "choices": [
      "Graphics Interchange Format",
      "General Image Format",
      "Graphics Internet Format",
      "Global Image File"
    ],
    "correct": 0
  },
  {
    "question": "'HTML' stands for:",
    "choices": [
      "HyperText Markup Language",
      "High-Tech Modern Language",
      "HyperText Modular Language",
      "Home Tool Markup Language"
    ],
    "correct": 0
  },
  {
    "question": "'URL' stands for:",
    "choices": [
      "Uniform Resource Locator",
      "Universal Resource Link",
      "Unified Reference Locator",
      "Uniform Reference Link"
    ],
    "correct": 0
  },
  {
    "question": "'PDF' stands for:",
    "choices": [
      "Portable Document Format",
      "Printable Data File",
      "Public Document File",
      "Portable Data File"
    ],
    "correct": 0
  },
  {
    "question": "'USB' stands for:",
    "choices": [
      "Universal Serial Bus",
      "United Serial Bus",
      "Universal System Bus",
      "Uniform Serial Bus"
    ],
    "correct": 0
  },
  {
    "question": "'CPU' stands for:",
    "choices": [
      "Central Processing Unit",
      "Central Power Unit",
      "Computer Processing Unit",
      "Core Programming Unit"
    ],
    "correct": 0
  },
  {
    "question": "'RAM' stands for:",
    "choices": [
      "Random Access Memory",
      "Read Access Memory",
      "Rapid Access Memory",
      "Run-Active Memory"
    ],
    "correct": 0
  },
  {
    "question": "'ROM' stands for:",
    "choices": [
      "Read-Only Memory",
      "Random-Only Memory",
      "Run-Only Memory",
      "Reset-Only Memory"
    ],
    "correct": 0
  },
  {
    "question": "'GPS' stands for:",
    "choices": [
      "Global Positioning System",
      "General Positioning System",
      "Geographic Positioning Service",
      "Global Position Sensor"
    ],
    "correct": 0
  },
  {
    "question": "'ATM' (banking) stands for:",
    "choices": [
      "Automated Teller Machine",
      "Automatic Transaction Machine",
      "Active Teller Machine",
      "Auto-Trade Machine"
    ],
    "correct": 0
  },
  {
    "question": "'PIN' stands for:",
    "choices": [
      "Personal Identification Number",
      "Private Identity Number",
      "Personal Integer Number",
      "Public Identification Number"
    ],
    "correct": 0
  },
  {
    "question": "'WHO' stands for:",
    "choices": [
      "World Health Organization",
      "Worldwide Hospital Organization",
      "World Healing Operations",
      "Worldwide Health Office"
    ],
    "correct": 0
  },
  {
    "question": "'UNESCO' stands for:",
    "choices": [
      "UN Educational, Scientific and Cultural Organization",
      "Union of European Science & Culture",
      "UN Economic & Social Council Org.",
      "UN Education and Science Council"
    ],
    "correct": 0
  },
  {
    "question": "'UNICEF' stands for:",
    "choices": [
      "UN Children's Fund (orig. International Children's Emergency Fund)",
      "Union of International Children's Fund",
      "United National Infant Care Fund",
      "UN Internal Children Education Fund"
    ],
    "correct": 0
  },
  {
    "question": "'WWW' stands for:",
    "choices": [
      "World Wide Web",
      "World Wireless Web",
      "Web Wide World",
      "Worldwide Wireless Web"
    ],
    "correct": 0
  },
  {
    "question": "'DNA' stands for:",
    "choices": [
      "Deoxyribonucleic Acid",
      "Diatomic Nucleic Acid",
      "Dynamic Nuclear Acid",
      "Double Nucleotide Acid"
    ],
    "correct": 0
  },
  {
    "question": "'RNA' stands for:",
    "choices": [
      "Ribonucleic Acid",
      "Recombinant Nuclear Acid",
      "Repeat Nucleic Acid",
      "Ribose Nuclear Acid"
    ],
    "correct": 0
  },
  {
    "question": "'IQ' stands for:",
    "choices": [
      "Intelligence Quotient",
      "Intelligence Quality",
      "Inner Quotient",
      "Intellectual Quality"
    ],
    "correct": 0
  },
  {
    "question": "'CEO' stands for:",
    "choices": [
      "Chief Executive Officer",
      "Chief Economic Officer",
      "Central Executive Officer",
      "Corporate Executive Officer"
    ],
    "correct": 0
  },
  {
    "question": "'ASAP' stands for:",
    "choices": [
      "As Soon As Possible",
      "After School And Practice",
      "Always Send A Plan",
      "All Set And Prepared"
    ],
    "correct": 0
  }
] as QuizQuestion[];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: AcronymMiniSettings): AcronymMiniState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: AcronymMiniState, action: AcronymMiniAction): AcronymMiniState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: AcronymMiniState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
