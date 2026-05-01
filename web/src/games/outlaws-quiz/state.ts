import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OutlawsQuizSettings { questions: "10" | "20" | "30"; }
export interface OutlawsQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OutlawsQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Jesse James was killed by?", choices: ["Robert Ford","Wyatt Earp","Pat Garrett","Pinkertons"], correct: 0 },
  { question: "Jesse James died in?", choices: ["1882","1888","1892","1900"], correct: 0 },
  { question: "Billy the Kid's birth name was?", choices: ["Henry McCarty","William Bonney","John Wesley","Jim Miller"], correct: 0 },
  { question: "Billy the Kid was killed by?", choices: ["Pat Garrett","Wyatt Earp","Jesse James","Frank James"], correct: 0 },
  { question: "Wyatt Earp's most famous gunfight was at?", choices: ["O.K. Corral","Northfield","Coffeyville","Adobe Walls"], correct: 0 },
  { question: "The O.K. Corral is in?", choices: ["Tombstone, AZ","Dodge City, KS","Deadwood, SD","Abilene, TX"], correct: 0 },
  { question: "Doc Holliday was a?", choices: ["Dentist/gambler","Sheriff","Doctor of medicine only","Reverend"], correct: 0 },
  { question: "Bonnie and Clyde were killed in?", choices: ["1934","1928","1940","1932"], correct: 0 },
  { question: "Bonnie and Clyde were ambushed in?", choices: ["Louisiana","Texas","Oklahoma","Arkansas"], correct: 0 },
  { question: "Clyde Barrow's gang specialized in?", choices: ["Bank/store robberies","Train robberies only","Smuggling","Cattle rustling"], correct: 0 },
  { question: "John Dillinger was killed in?", choices: ["Chicago","Detroit","NYC","Indianapolis"], correct: 0 },
  { question: "Dillinger was shot outside the?", choices: ["Biograph Theater","Ford's Theatre","Apollo","Roxy"], correct: 0 },
  { question: "Pretty Boy Floyd was a contemporary of?", choices: ["Dillinger","Jesse James","Billy the Kid","Wyatt Earp"], correct: 0 },
  { question: "Baby Face Nelson's real name was?", choices: ["Lester Joseph Gillis","Charles Floyd","George Kelly","John Wojciechowski"], correct: 0 },
  { question: "Ma Barker led the?", choices: ["Barker-Karpis gang","Dalton gang","James-Younger gang","Wild Bunch"], correct: 0 },
  { question: "Butch Cassidy led the?", choices: ["Wild Bunch","Wild Bill gang","Hole-in-the-Wall only","All of these"], correct: 3 },
  { question: "Butch Cassidy's partner was?", choices: ["The Sundance Kid","Billy the Kid","Jesse James","Doc Holliday"], correct: 0 },
  { question: "Butch and Sundance reportedly died in?", choices: ["Bolivia","Argentina","Mexico","Peru"], correct: 0 },
  { question: "Belle Starr was known as?", choices: ["Bandit Queen","Calamity Jane","Annie Oakley","Black Widow"], correct: 0 },
  { question: "Calamity Jane's real name was?", choices: ["Martha Jane Cannary","Annie Oakley","Belle Starr","Etta Place"], correct: 0 },
  { question: "The James-Younger Gang's disastrous raid was at?", choices: ["Northfield, MN","Coffeyville, KS","Deadwood, SD","Tombstone, AZ"], correct: 0 },
  { question: "The Dalton Gang's disastrous raid was at?", choices: ["Coffeyville, KS","Northfield, MN","Liberty, MO","Tombstone, AZ"], correct: 0 },
  { question: "Wild Bill Hickok was killed in?", choices: ["Deadwood, SD","Dodge City, KS","Abilene, TX","Tombstone, AZ"], correct: 0 },
  { question: "Hickok's death hand is called?", choices: ["Dead Man's Hand (aces and eights)","Royal flush","Full house","Two pair queens"], correct: 0 },
  { question: "The Pinkerton agency pursued?", choices: ["Outlaws like the James gang","Only counterfeiters","Only spies","Cattle rustlers only"], correct: 0 },
  { question: "Frank James was Jesse James'?", choices: ["Brother","Cousin","Son","Father"], correct: 0 },
  { question: "Black Bart famously robbed?", choices: ["Stagecoaches in California","Trains in Texas","Banks in Iowa","Stores in Kansas"], correct: 0 },
  { question: "Black Bart left behind?", choices: ["Poems","Songs","Drawings","Letters to his wife"], correct: 0 },
  { question: "Bass Reeves was a famous African-American?", choices: ["Deputy U.S. Marshal","Outlaw","Cattle baron","Rancher"], correct: 0 },
  { question: "Tom Horn was a hired?", choices: ["Range detective/killer","Sheriff","Outlaw banker","Marshal"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OutlawsQuizSettings): OutlawsQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OutlawsQuizState, action: OutlawsQuizAction): OutlawsQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OutlawsQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
