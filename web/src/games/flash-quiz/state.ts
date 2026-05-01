import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FlashQuizSettings { questions: "10" | "20"; }
export interface FlashQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FlashQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The Flash's main civilian identity (modern)?", choices: ["Barry Allen", "Wally West", "Jay Garrick", "Bart Allen"], correct: 0 },
  { question: "How did Barry Allen get his powers?", choices: ["Lightning + chemicals", "Cosmic rays", "Mutation", "Magic"], correct: 0 },
  { question: "The source of speedster powers?", choices: ["The Speed Force", "The Phantom Zone", "Cosmic awareness", "Adamantium"], correct: 0 },
  { question: "Barry Allen's home city?", choices: ["Central City", "Gotham", "Metropolis", "Star City"], correct: 0 },
  { question: "Barry Allen's profession?", choices: ["Forensic scientist (CSI)", "Lawyer", "Journalist", "Doctor"], correct: 0 },
  { question: "Barry Allen's wife?", choices: ["Iris West", "Linda Park", "Jesse Quick", "Patty Spivot"], correct: 0 },
  { question: "First Flash (Golden Age)?", choices: ["Jay Garrick", "Barry Allen", "Wally West", "Bart Allen"], correct: 0 },
  { question: "Wally West originally was?", choices: ["Kid Flash, then The Flash", "Reverse Flash", "Black Flash", "Impulse"], correct: 0 },
  { question: "Flash's archenemy from the future?", choices: ["Reverse-Flash (Eobard Thawne)", "Black Flash", "Savitar", "Zoom (Hunter)"], correct: 0 },
  { question: "Captain Cold's real name?", choices: ["Leonard Snart", "Sam Scudder", "Mick Rory", "James Jesse"], correct: 0 },
  { question: "Heat Wave's real name?", choices: ["Mick Rory", "Sam Scudder", "Leonard Snart", "Roscoe Dillon"], correct: 0 },
  { question: "Mirror Master's real name?", choices: ["Sam Scudder", "Mick Rory", "Roscoe Dillon", "James Jesse"], correct: 0 },
  { question: "Trickster's real name?", choices: ["James Jesse / Axel Walker", "Sam Scudder", "Roscoe Dillon", "Mick Rory"], correct: 0 },
  { question: "Top's real name?", choices: ["Roscoe Dillon", "Sam Scudder", "James Jesse", "Mick Rory"], correct: 0 },
  { question: "The Rogues are foes of?", choices: ["The Flash", "Batman", "Superman", "Green Lantern"], correct: 0 },
  { question: "Bart Allen is also called?", choices: ["Impulse / Kid Flash II", "Reverse-Flash", "Zoom", "Savitar"], correct: 0 },
  { question: "Jay Garrick's helmet resembles?", choices: ["A Mercury (winged) helmet", "Spartan helmet", "Knight helm", "Football helmet"], correct: 0 },
  { question: "Wally West's wife?", choices: ["Linda Park", "Iris West", "Patty Spivot", "Jesse Quick"], correct: 0 },
  { question: "Reverse-Flash's color scheme?", choices: ["Yellow (with red lightning)", "Blue", "Green", "Black"], correct: 0 },
  { question: "Zoom (Hunter Zolomon) was Wally's?", choices: ["Friend turned enemy", "Father", "Cousin", "Mentor"], correct: 0 },
  { question: "Black Flash represents?", choices: ["Death for speedsters", "Evil twin", "Robot Flash", "Time travel"], correct: 0 },
  { question: "Crisis on Infinite Earths killed?", choices: ["Barry Allen (1985)", "Wally West", "Jay Garrick", "Bart Allen"], correct: 0 },
  { question: "Flashpoint storyline created by?", choices: ["Geoff Johns", "Grant Morrison", "Brian Bendis", "Mark Waid"], correct: 0 },
  { question: "The Flash first appeared in?", choices: ["Flash Comics #1 (1940)", "Detective Comics #1", "Action Comics #1", "All-Star #1"], correct: 0 },
  { question: "Barry Allen's debut issue (Silver Age)?", choices: ["Showcase #4 (1956)", "Flash Comics #1", "Adventure #1", "Action #1"], correct: 0 },
  { question: "The CW Flash TV series star?", choices: ["Grant Gustin", "Ezra Miller", "John Wesley Shipp (older)", "Tom Cavanagh"], correct: 0 },
  { question: "Jesse Quick is daughter of?", choices: ["Johnny Quick and Liberty Belle", "Barry Allen", "Wally West", "Jay Garrick"], correct: 0 },
  { question: "Flash Museum is located in?", choices: ["Central City", "Keystone City", "Gotham", "Metropolis"], correct: 0 },
  { question: "Keystone City is home to?", choices: ["Jay Garrick (Golden Age Flash)", "Superman", "Aquaman", "Green Arrow"], correct: 0 },
  { question: "Barry Allen's mother was killed by?", choices: ["Reverse-Flash (Eobard Thawne)", "Zoom", "Trickster", "Captain Cold"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FlashQuizSettings): FlashQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FlashQuizState, action: FlashQuizAction): FlashQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FlashQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
