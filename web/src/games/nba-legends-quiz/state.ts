import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface NbaLegendsQuizSettings { questions: "10" | "20" | "30"; }
export interface NbaLegendsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type NbaLegendsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is widely considered the NBA's GOAT?", choices: ["Michael Jordan (debate with LeBron)","Just MJ","Both candidates","Just LeBron"], correct: 2 },
  { question: "How many NBA championships did Michael Jordan win?", choices: ["6","5","7","4"], correct: 0 },
  { question: "With what team did Jordan win his championships?", choices: ["Chicago Bulls","Lakers","Just Bulls","Heat"], correct: 2 },
  { question: "Who's the all-time leading scorer in NBA history?", choices: ["LeBron James","Kareem Abdul-Jabbar","Karl Malone","Jordan"], correct: 0 },
  { question: "Who held the previous all-time scoring record?", choices: ["Kareem Abdul-Jabbar","Karl Malone","Wilt","Jordan"], correct: 0 },
  { question: "Who has the most NBA championships as a player?", choices: ["Bill Russell (11)","Sam Jones","Both","Just Russell"], correct: 2 },
  { question: "How many championships did Bill Russell win?", choices: ["11","10","8","9"], correct: 0 },
  { question: "Who scored 100 points in a single NBA game?", choices: ["Wilt Chamberlain","Jordan","Kobe","Just Wilt"], correct: 2 },
  { question: "In what year did Wilt score 100?", choices: ["1962","1972","1982","1969"], correct: 0 },
  { question: "Who's known as the Black Mamba?", choices: ["Kobe Bryant","LeBron","Jordan","Iverson"], correct: 0 },
  { question: "How many championships did Kobe win?", choices: ["5","4","6","3"], correct: 0 },
  { question: "Who's Magic Johnson's longtime rival?", choices: ["Larry Bird","Michael Jordan","Just Bird","Both"], correct: 2 },
  { question: "What position did Magic Johnson play (mostly)?", choices: ["Point guard","Center","Forward","Guard"], correct: 0 },
  { question: "What's Larry Bird's team?", choices: ["Boston Celtics","Lakers","Just Celtics","Both"], correct: 2 },
  { question: "What's Magic Johnson's team?", choices: ["LA Lakers","Celtics","Just Lakers","Both"], correct: 2 },
  { question: "Who's known as The Admiral?", choices: ["David Robinson","Tim Duncan","Patrick Ewing","Hakeem"], correct: 0 },
  { question: "Who's known as Hakeem the Dream?", choices: ["Hakeem Olajuwon","David Robinson","Patrick Ewing","Bill Walton"], correct: 0 },
  { question: "What team did Hakeem win championships with?", choices: ["Houston Rockets","Lakers","Bulls","Spurs"], correct: 0 },
  { question: "What position did Wilt Chamberlain play?", choices: ["Center","Forward","Guard","Both center and forward"], correct: 0 },
  { question: "How many MVPs did MJ win?", choices: ["5","6","4","3"], correct: 0 },
  { question: "How many MVPs did Kareem win?", choices: ["6","5","4","7"], correct: 0 },
  { question: "How many Finals MVPs did MJ win?", choices: ["6","5","4","3"], correct: 0 },
  { question: "What's LeBron James's first team?", choices: ["Cleveland Cavaliers","Heat","Lakers","Spurs"], correct: 0 },
  { question: "How many NBA championships does LeBron have?", choices: ["4","3","5","6"], correct: 0 },
  { question: "Who's the only player to win MVP, championship, and Finals MVP all in same team move? (multiple did)", choices: ["LeBron, KD have done feats","Just LeBron","Both","Just KD"], correct: 0 },
  { question: "What's Tim Duncan's team?", choices: ["San Antonio Spurs","Lakers","Bulls","Just Spurs"], correct: 2 },
  { question: "How many championships did Duncan win?", choices: ["5","4","3","6"], correct: 0 },
  { question: "Who's Shaq's nickname?", choices: ["The Big Aristotle, Diesel, etc.","Just Shaq","Both","Many nicknames"], correct: 0 },
  { question: "Who's known as The Glove?", choices: ["Gary Payton","Allen Iverson","Iverson","Both"], correct: 0 },
  { question: "Who's known as Mr. Clutch?", choices: ["Jerry West","Robert Horry","Both","Just West"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: NbaLegendsQuizSettings): NbaLegendsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: NbaLegendsQuizState, action: NbaLegendsQuizAction): NbaLegendsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: NbaLegendsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
