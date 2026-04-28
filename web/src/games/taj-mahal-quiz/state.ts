import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TajMahalQuizSettings { questions: "10" | "20"; }
export interface TajMahalQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TajMahalQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is the Taj Mahal located?", choices: ["Delhi, India", "Agra, India", "Mumbai, India", "Lahore, Pakistan"], correct: 1 },
  { question: "Who commissioned the Taj Mahal?", choices: ["Akbar", "Shah Jahan", "Aurangzeb", "Babur"], correct: 1 },
  { question: "Why was the Taj Mahal built?", choices: ["A palace", "A mosque", "A mausoleum for Mumtaz Mahal", "A fort"], correct: 2 },
  { question: "When did construction begin on the Taj Mahal?", choices: ["1500", "1632", "1700", "1850"], correct: 1 },
  { question: "How long did construction take?", choices: ["5 years", "10 years", "~20-22 years", "50 years"], correct: 2 },
  { question: "What material is the Taj Mahal famous for being made of?", choices: ["Granite", "White marble", "Sandstone", "Gold"], correct: 1 },
  { question: "Where was the marble for the Taj Mahal sourced?", choices: ["Italy", "Makrana, Rajasthan", "Egypt", "Greece"], correct: 1 },
  { question: "Approximately how many workers built the Taj Mahal?", choices: ["~1,000", "~5,000", "~20,000", "~100,000"], correct: 2 },
  { question: "Which dynasty did Shah Jahan belong to?", choices: ["Mughal", "Mauryan", "Gupta", "Maratha"], correct: 0 },
  { question: "What's directly across from the Taj Mahal?", choices: ["A minaret", "A mosque (and twin guesthouse)", "Garden only", "Royal palace"], correct: 1 },
  { question: "What flower decorates much of the Taj Mahal's marble?", choices: ["Lotus", "Inlaid floral motifs (pietra dura)", "Roses", "Tulips"], correct: 1 },
  { question: "How tall is the central dome (with finial)?", choices: ["~30m", "~73m", "~150m", "~250m"], correct: 1 },
  { question: "Which UNESCO designation does the Taj Mahal hold?", choices: ["Cultural World Heritage Site", "Natural Site", "Mixed Site", "Wonder list only"], correct: 0 },
  { question: "In what year was the Taj Mahal named a New 7 Wonder?", choices: ["1985", "2000", "2007", "2020"], correct: 2 },
  { question: "Who is buried inside the Taj Mahal?", choices: ["Shah Jahan only", "Mumtaz Mahal only", "Both Shah Jahan and Mumtaz Mahal", "Aurangzeb"], correct: 2 },
  { question: "What was Mumtaz Mahal's relationship to Shah Jahan?", choices: ["Mother", "Wife", "Daughter", "Sister"], correct: 1 },
  { question: "How many minarets stand at the Taj Mahal?", choices: ["2", "4", "6", "8"], correct: 1 },
  { question: "What architectural style does the Taj Mahal exemplify?", choices: ["Mughal", "Gothic", "Roman", "Egyptian"], correct: 0 },
  { question: "What semi-precious stones inlay the Taj Mahal?", choices: ["Lapis lazuli, jade, etc", "Diamonds only", "Emeralds only", "None"], correct: 0 },
  { question: "The Taj Mahal sits on a bank of which river?", choices: ["Ganges", "Yamuna", "Indus", "Brahmaputra"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: TajMahalQuizSettings): TajMahalQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TajMahalQuizState, action: TajMahalQuizAction): TajMahalQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TajMahalQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
