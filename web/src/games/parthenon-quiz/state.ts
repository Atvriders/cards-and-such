import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ParthenonQuizSettings { questions: "10" | "20"; }
export interface ParthenonQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ParthenonQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "City of the Parthenon?", choices: ["Rome", "Athens", "Sparta", "Thebes"], correct: 1 },
  { question: "Hill the Parthenon stands on?", choices: ["Mount Olympus", "Acropolis", "Areopagus", "Lycabettus"], correct: 1 },
  { question: "Goddess to whom it was dedicated?", choices: ["Hera", "Aphrodite", "Athena", "Artemis"], correct: 2 },
  { question: "Built in which century BCE?", choices: ["7th", "5th", "3rd", "1st"], correct: 1 },
  { question: "Statesman who oversaw construction?", choices: ["Pericles", "Solon", "Cleisthenes", "Themistocles"], correct: 0 },
  { question: "Architects of the Parthenon?", choices: ["Phidias only", "Iktinos & Kallikrates", "Sinan", "Hippodamus"], correct: 1 },
  { question: "Sculptor of decorations?", choices: ["Phidias", "Praxiteles", "Lysippos", "Polykleitos"], correct: 0 },
  { question: "Material of the Parthenon?", choices: ["Limestone", "Pentelic marble", "Sandstone", "Granite"], correct: 1 },
  { question: "Architectural order of columns?", choices: ["Ionic", "Doric", "Corinthian", "Composite"], correct: 1 },
  { question: "Number of outer columns (approx)?", choices: ["~20", "~46", "~80", "~120"], correct: 1 },
  { question: "Original interior statue depicted?", choices: ["Athena Parthenos", "Zeus", "Apollo", "Nike"], correct: 0 },
  { question: "Statue's chryselephantine refers to?", choices: ["Gold & ivory", "Marble & bronze", "Wood & iron", "Silver only"], correct: 0 },
  { question: "Frieze depicts what procession?", choices: ["Olympic", "Panathenaic", "Triumph", "Funeral"], correct: 1 },
  { question: "Damaged in 1687 explosion by?", choices: ["Romans", "Venetians", "Ottomans (powder magazine)", "French"], correct: 2 },
  { question: "Sculptures removed by Lord Elgin to?", choices: ["British Museum", "Louvre", "Vatican", "Met"], correct: 0 },
  { question: "Greece's modern museum housing surviving sculptures?", choices: ["National", "Acropolis Museum", "Benaki", "Cycladic"], correct: 1 },
  { question: "Optical refinement: columns slightly?", choices: ["Curved (entasis)", "Square", "Twisted", "Hollow"], correct: 0 },
  { question: "Stylobate slightly?", choices: ["Curved upward", "Flat", "Sloped down", "Bent"], correct: 0 },
  { question: "Length of the Parthenon (approx)?", choices: ["~30 m", "~70 m", "~100 m", "~200 m"], correct: 1 },
  { question: "Used as Christian church around?", choices: ["3rd c.", "6th c.", "10th c.", "15th c."], correct: 1 },
  { question: "Used as a mosque starting?", choices: ["Roman era", "Byzantine era", "Ottoman era", "Modern era"], correct: 2 },
  { question: "Year UNESCO World Heritage listing?", choices: ["1977", "1987", "1997", "2007"], correct: 1 },
  { question: "Greek word 'Parthenon' refers to?", choices: ["Virgin's chamber", "Marketplace", "Tomb", "Temple to Zeus"], correct: 0 },
  { question: "Acropolis means in Greek?", choices: ["High city", "Holy temple", "Athena's house", "Stone hill"], correct: 0 },
  { question: "Largest gate to Acropolis?", choices: ["Erechtheion", "Propylaia", "Parthenon", "Theseion"], correct: 1 },
  { question: "Temple with caryatids near Parthenon?", choices: ["Erechtheion", "Hephaisteion", "Stoa", "Tholos"], correct: 0 },
  { question: "Caryatids are columns shaped like?", choices: ["Trees", "Women", "Animals", "Spirals"], correct: 1 },
  { question: "Modern restoration team is called?", choices: ["Parthenon Project", "Acropolis Restoration", "Athens Trust", "Hellenic Build"], correct: 1 },
  { question: "Major pollutant damaging marble today?", choices: ["Sulfur dioxide", "Salt", "Wind", "Sand"], correct: 0 },
  { question: "Iconic Parthenon view photo location?", choices: ["Pnyx", "Filopappou", "Lycabettus", "All of these"], correct: 3 }
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
