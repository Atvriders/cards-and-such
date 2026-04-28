import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EiffelTowerQuizSettings { questions: "10" | "20"; }
export interface EiffelTowerQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EiffelTowerQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Where is the Eiffel Tower located?", choices: ["London", "Paris", "Berlin", "Rome"], correct: 1 },
  { question: "Who designed the Eiffel Tower?", choices: ["Antoni Gaudí", "Gustave Eiffel", "Le Corbusier", "Frank Lloyd Wright"], correct: 1 },
  { question: "In what year was the Eiffel Tower completed?", choices: ["1879", "1889", "1899", "1905"], correct: 1 },
  { question: "How tall is the Eiffel Tower (with antennas)?", choices: ["~200m", "~330m", "~450m", "~650m"], correct: 1 },
  { question: "What was the Eiffel Tower built for?", choices: ["1889 World's Fair", "Paris Olympics", "Napoleon's coronation", "WWI memorial"], correct: 0 },
  { question: "How many years was the Eiffel Tower the world's tallest structure?", choices: ["10", "20", "41", "60"], correct: 2 },
  { question: "What surpassed the Eiffel Tower in 1930?", choices: ["Empire State Building", "Chrysler Building", "Shanghai Tower", "Petronas Towers"], correct: 1 },
  { question: "What material is the Eiffel Tower made of?", choices: ["Stone", "Wrought iron", "Cast steel", "Aluminum"], correct: 1 },
  { question: "How many steps to reach the top?", choices: ["~675", "~1665", "~2500", "~5000"], correct: 1 },
  { question: "How much does the Eiffel Tower weigh?", choices: ["~5,000 t", "~10,100 t", "~25,000 t", "~50,000 t"], correct: 1 },
  { question: "What was the original planned lifespan of the Eiffel Tower?", choices: ["10 years", "20 years", "100 years", "Permanent"], correct: 1 },
  { question: "How is the Eiffel Tower painted to combat rust?", choices: ["Every 7 years", "Once and never", "Every 25 years", "Quarterly"], correct: 0 },
  { question: "How many people visit the Eiffel Tower annually?", choices: ["~700K", "~7M", "~25M", "~100M"], correct: 1 },
  { question: "What is on top of the Eiffel Tower?", choices: ["A restaurant", "Broadcast antennas/observatory", "Hotel", "Gallery"], correct: 1 },
  { question: "Who initially criticized the Eiffel Tower as ugly?", choices: ["Napoleon III", "Parisian artists", "British tourists", "All Frenchmen"], correct: 1 },
  { question: "What color is the Eiffel Tower painted today?", choices: ["Black", "Brown ('Eiffel Tower brown')", "White", "Green"], correct: 1 },
  { question: "How many lights illuminate the Eiffel Tower at night?", choices: ["~5,000", "~20,000", "~40,000", "~100,000"], correct: 1 },
  { question: "Light show at Eiffel Tower runs for how long each hour?", choices: ["5 minutes", "10 minutes", "30 minutes", "Continuous"], correct: 0 },
  { question: "How many elevators are in the tower?", choices: ["3", "5", "9", "12"], correct: 2 },
  { question: "Which Paris park is the Eiffel Tower next to?", choices: ["Bois de Vincennes", "Champ de Mars", "Tuileries", "Luxembourg Gardens"], correct: 1 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EiffelTowerQuizSettings): EiffelTowerQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EiffelTowerQuizState, action: EiffelTowerQuizAction): EiffelTowerQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EiffelTowerQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
