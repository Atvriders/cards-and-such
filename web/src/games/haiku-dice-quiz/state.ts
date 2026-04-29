import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface HaikuDiceQuizSettings { questions: "10"; }
export interface HaikuDiceQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type HaikuDiceQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Haiku Dice is themed around?", choices: ["Math drills", "Japanese poetry / haiku", "Sumo", "Tea"], correct: 1 },
  { question: "A haiku traditionally has how many syllables?", choices: ["5-7-5", "7-7-5", "5-5-5", "10-10"], correct: 0 },
  { question: "The dice in Haiku Dice are imprinted with?", choices: ["Numbers", "Kana / syllables", "Animals", "Colors"], correct: 1 },
  { question: "Haiku Dice is best classified as?", choices: ["Trick-taking", "Roll-and-write style poetry", "Push-your-luck", "Climbing"], correct: 1 },
  { question: "Scoring is based on?", choices: ["Total dots rolled", "Quality of poems formed", "Match-3 bonuses", "Speed only"], correct: 1 },
  { question: "Haiku is associated with which season tradition?", choices: ["Spring only", "All four seasons (kigo)", "Summer only", "Winter only"], correct: 1 },
  { question: "A famous haiku poet is?", choices: ["Matsuo Basho", "Beethoven", "Shakespeare", "Tagore"], correct: 0 },
  { question: "Haiku Dice usually plays?", choices: ["1 player", "2-6 players", "10+ players", "Solo only"], correct: 1 },
  { question: "The first line of a haiku has how many syllables?", choices: ["3", "5", "7", "11"], correct: 1 },
  { question: "The kigo in haiku is a?", choices: ["Season-word", "Number marker", "Wild card", "Bonus die"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, _settings: HaikuDiceQuizSettings): HaikuDiceQuizState {
  const rng=mulberry32(seed);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,10);
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: HaikuDiceQuizState, action: HaikuDiceQuizAction): HaikuDiceQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: HaikuDiceQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
