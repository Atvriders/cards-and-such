import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StatueLibertyQuizSettings { questions: "10" | "20"; }
export interface StatueLibertyQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StatueLibertyQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What country gifted the Statue of Liberty to the USA?", choices: ["UK", "France", "Germany", "Italy"], correct: 1 },
  { question: "When was the Statue of Liberty dedicated?", choices: ["1776", "1865", "1886", "1900"], correct: 2 },
  { question: "Where is the Statue of Liberty located?", choices: ["Manhattan", "Liberty Island, New York", "Staten Island", "Brooklyn"], correct: 1 },
  { question: "Who designed the Statue of Liberty?", choices: ["Frédéric Auguste Bartholdi", "Gustave Eiffel", "Le Corbusier", "Jean Nouvel"], correct: 0 },
  { question: "Who designed the internal iron framework?", choices: ["Eiffel", "Bartholdi", "Stanford White", "Olmsted"], correct: 0 },
  { question: "How tall is the Statue of Liberty (head to toe)?", choices: ["~30m", "~46m (151 ft)", "~80m", "~100m"], correct: 1 },
  { question: "How tall is the statue from ground to torch?", choices: ["~60m", "~93m", "~150m", "~250m"], correct: 1 },
  { question: "What does the statue's torch represent?", choices: ["Freedom/Enlightenment", "War", "Trade", "Industry"], correct: 0 },
  { question: "What is in the statue's left hand?", choices: ["Sword", "Tablet (Declaration of Independence date)", "Torch", "Crown"], correct: 1 },
  { question: "What inscription is on the tablet?", choices: ["July 4 1776 (in Roman numerals)", "Declaration of Independence", "USA", "Liberty"], correct: 0 },
  { question: "What material is the Statue of Liberty's exterior made of?", choices: ["Bronze", "Copper sheets (now greenish from oxidation)", "Iron", "Aluminum"], correct: 1 },
  { question: "Why is the Statue of Liberty green?", choices: ["Painted", "Copper patina (oxidation)", "Algae", "Limestone"], correct: 1 },
  { question: "What does the broken chain at her feet symbolize?", choices: ["Freedom from oppression", "Unity", "Peace", "Industry"], correct: 0 },
  { question: "How many points are on the statue's crown?", choices: ["3", "5", "7", "12"], correct: 2 },
  { question: "What do the 7 crown points represent?", choices: ["Seven seas/continents", "Seven days", "Seven sisters", "Seven generals"], correct: 0 },
  { question: "Whose famous poem is at the pedestal?", choices: ["Walt Whitman", "Emma Lazarus", "Frost", "Dickinson"], correct: 1 },
  { question: "What is the famous line from that poem?", choices: ["Give me your tired, your poor...", "Four score and seven", "I have a dream", "Live free or die"], correct: 0 },
  { question: "How many people can fit in the crown viewing area?", choices: ["~5", "~30", "~100", "~1000"], correct: 1 },
  { question: "When was the statue restored for its 100th birthday?", choices: ["1976", "1986", "1996", "2006"], correct: 1 },
  { question: "What island near Liberty was an immigration center?", choices: ["Ellis Island", "Governors Island", "Staten Island", "Roosevelt Island"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StatueLibertyQuizSettings): StatueLibertyQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StatueLibertyQuizState, action: StatueLibertyQuizAction): StatueLibertyQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StatueLibertyQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
