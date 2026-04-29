import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface DouDizhuQuizSettings { questions: "10"; }
export interface DouDizhuQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type DouDizhuQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "How many players take part in a typical Dou Dizhu game?", choices: ["2", "3", "4", "5"], correct: 1 },
  { question: "The landlord receives how many bonus cards?", choices: ["1", "2", "3", "4"], correct: 2 },
  { question: "The deck used in Dou Dizhu contains?", choices: ["52 cards", "54 cards including 2 jokers", "48 cards", "100 cards"], correct: 1 },
  { question: "The two peasants form a temporary?", choices: ["Trump suit", "Alliance against the landlord", "Solo bid", "Defensive wall"], correct: 1 },
  { question: "Which card outranks all others?", choices: ["Big Joker (red)", "2 of Spades", "Ace of Spades", "King"], correct: 0 },
  { question: "What does 'Dou Dizhu' literally mean?", choices: ["Beat the king", "Fight the landlord", "Capture the flag", "Kill the dealer"], correct: 1 },
  { question: "A 'bomb' in Dou Dizhu is?", choices: ["A pair", "Four of a kind", "A run of five", "A triple"], correct: 1 },
  { question: "The dual jokers played together are called?", choices: ["Wild pair", "Rocket", "Storm", "Thunder"], correct: 1 },
  { question: "Dou Dizhu originated in which country?", choices: ["Japan", "Korea", "China", "Taiwan"], correct: 2 },
  { question: "The landlord wins by?", choices: ["Capturing all peasants' cards", "Shedding all cards first", "Reaching 100 points", "Holding the highest card"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: DouDizhuQuizSettings): DouDizhuQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: DouDizhuQuizState, action: DouDizhuQuizAction): DouDizhuQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: DouDizhuQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
