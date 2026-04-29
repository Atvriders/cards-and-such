import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface TansanQuizSettings { questions: "10"; }
export interface TansanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type TansanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Tansan is named after?", choices: ["Soda water (Japanese term)", "A river", "A mountain", "An emperor"], correct: 0 },
  { question: "Players try to avoid exceeding how many points?", choices: ["5", "10", "15", "21"], correct: 1 },
  { question: "The game uses?", choices: ["Cards", "Tiles", "Dice", "Stones"], correct: 1 },
  { question: "Tansan typically supports how many players?", choices: ["1", "2-5", "6-8", "12+"], correct: 1 },
  { question: "The complexity rating of Tansan is?", choices: ["Light (L)", "Medium (M)", "Heavy (H)", "Expert"], correct: 0 },
  { question: "Tansan's discard mechanic emphasizes?", choices: ["Safe play vs risk", "Memory", "Trick-taking", "Bluffing"], correct: 0 },
  { question: "A player who exceeds 10 'fizz' points?", choices: ["Wins immediately", "Is busted that round", "Reshuffles", "Skips a turn"], correct: 1 },
  { question: "Tansan was inspired by?", choices: ["Carbonated water bottles", "Sushi", "Sumo", "Tea ceremony"], correct: 0 },
  { question: "Tansan is best described as?", choices: ["Push-your-luck tile game", "Trick-taking", "Climbing", "Patience"], correct: 0 },
  { question: "The game's theme is uniquely ___?", choices: ["Japanese carbonated drinks", "Western beer", "American soda", "European wine"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: TansanQuizSettings): TansanQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: TansanQuizState, action: TansanQuizAction): TansanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: TansanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
