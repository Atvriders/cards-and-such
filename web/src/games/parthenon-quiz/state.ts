import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ParthenonQuizSettings { questions: "10" | "20"; }
export interface ParthenonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ParthenonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is the Parthenon located?", choices: ["Rome", "Athens, Greece", "Olympia", "Ephesus"], correct: 1 },
  { question: "Which goddess is the Parthenon dedicated to?", choices: ["Aphrodite", "Athena", "Hera", "Artemis"], correct: 1 },
  { question: "When was the Parthenon completed?", choices: ["776 BC", "447-432 BC", "150 BC", "AD 100"], correct: 1 },
  { question: "Who oversaw the Parthenon's design?", choices: ["Pericles (politically); Phidias (sculptor)", "Caesar", "Plato", "Homer"], correct: 0 },
  { question: "Who were the architects of the Parthenon?", choices: ["Ictinus and Callicrates", "Vitruvius", "Daedalus", "Thales"], correct: 0 },
  { question: "What architectural style is the Parthenon?", choices: ["Doric", "Ionic", "Corinthian", "Tuscan"], correct: 0 },
  { question: "How many columns surround the Parthenon's perimeter?", choices: ["32", "46", "58", "72"], correct: 1 },
  { question: "How tall are the Parthenon's columns?", choices: ["~5m", "~10m", "~17m", "~30m"], correct: 1 },
  { question: "What was inside the Parthenon's main chamber (cella)?", choices: ["Statue of Athena", "Bust of Caesar", "Empty altar", "Treasury only"], correct: 0 },
  { question: "Who sculpted the Athena Parthenos statue?", choices: ["Phidias", "Praxiteles", "Lysippos", "Polykleitos"], correct: 0 },
  { question: "What hill is the Parthenon located on?", choices: ["Areopagus", "Acropolis", "Mt. Lycabettus", "Pnyx"], correct: 1 },
  { question: "What event famously damaged the Parthenon in 1687?", choices: ["Earthquake", "Venetian artillery exploded gunpowder stored inside", "Lightning", "Fire"], correct: 1 },
  { question: "Where are the 'Elgin Marbles' currently held?", choices: ["British Museum", "Louvre", "Athens", "Vatican"], correct: 0 },
  { question: "Who is named in the 'Elgin Marbles' debate?", choices: ["Lord Elgin (took them) vs Greek government", "Plato", "Caesar", "Homer"], correct: 0 },
  { question: "What was the Parthenon used for during the Byzantine era?", choices: ["A Christian church", "Synagogue", "Pagan temple", "Storage"], correct: 0 },
  { question: "What was it converted to under the Ottomans?", choices: ["A mosque", "A bazaar", "A school", "A barracks"], correct: 0 },
  { question: "Which architectural feature corrects optical illusions?", choices: ["Entasis (column curvature)", "Color paint", "Spires", "Domes"], correct: 0 },
  { question: "What material is the Parthenon made of?", choices: ["Pentelic marble", "Limestone only", "Sandstone", "Concrete"], correct: 0 },
  { question: "What ancient festival was the Parthenon central to?", choices: ["Panathenaia", "Olympia", "Eleusinia", "Saturnalia"], correct: 0 },
  { question: "Was the Parthenon originally painted?", choices: ["No, it was always white", "Yes, in colors", "Only gold", "Only red"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ParthenonQuizSettings): ParthenonQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ParthenonQuizState, action: ParthenonQuizAction): ParthenonQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ParthenonQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
