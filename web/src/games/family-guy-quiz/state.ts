import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface FamilyGuySettings { questions: "10" | "20" | "30"; }
export interface FamilyGuyState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type FamilyGuyAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Family Guy creator?", choices: ["Seth MacFarlane","Matt Groening","Trey Parker","Mike Judge"], correct: 0 },
  { question: "The Griffins live in?", choices: ["Quahog","Springfield","Pawnee","Stoolbend"], correct: 0 },
  { question: "Peter Griffin's wife?", choices: ["Lois","Marge","Linda","Lana"], correct: 0 },
  { question: "Stewie is?", choices: ["A baby","A teen","An adult","A dog"], correct: 0 },
  { question: "Brian is?", choices: ["A dog","A cat","A baby","A friend"], correct: 0 },
  { question: "Family Guy aired first in?", choices: ["1999","2001","1995","2003"], correct: 0 },
  { question: "Cleveland's spinoff is called?", choices: ["The Cleveland Show","Cleveland Rocks","Cleveland Steamer","Cleveland's"], correct: 0 },
  { question: "Joe Swanson is a?", choices: ["Cop","Doctor","Lawyer","Mailman"], correct: 0 },
  { question: "Quagmire's catchphrase?", choices: ["Giggity","Hellooo nurse","What","Yo"], correct: 0 },
  { question: "Peter works at?", choices: ["Pawtucket Brewery","Toy Factory","Bank","Hospital"], correct: 0 },
  { question: "Lois's father?", choices: ["Carter Pewterschmidt","Frank","Bob","John"], correct: 0 },
  { question: "Stewie's catchphrase?", choices: ["Victory is mine","Smash!","Hello","Yes!"], correct: 0 },
  { question: "Chris is what age range?", choices: ["Teen","Baby","20s","Old"], correct: 0 },
  { question: "Meg's voice actor?", choices: ["Mila Kunis","Lacey Chabert (early)","Both","Seth"], correct: 2 },
  { question: "Brian's love interest often?", choices: ["Jillian","Lois","Quagmire's wife","Meg"], correct: 0 },
  { question: "Stewie's mother in his eyes?", choices: ["The Vile Woman","Mommy","Lois","Mum"], correct: 0 },
  { question: "Peter's BFF (best friend)?", choices: ["Cleveland","Joe","Quagmire","Brian"], correct: 3 },
  { question: "Peter's chicken fight rival?", choices: ["Ernie the Giant Chicken","Big Bird","Donald","Bob"], correct: 0 },
  { question: "Adam West plays?", choices: ["Mayor of Quahog","Sheriff","Doctor","Teacher"], correct: 0 },
  { question: "Grim Reaper makes appearance?", choices: ["Yes","No","Maybe","Once"], correct: 0 },
  { question: "Show was canceled and revived in?", choices: ["2005","2007","2003","2010"], correct: 0 },
  { question: "Stewie has time machine?", choices: ["Yes","No","In dreams","Once"], correct: 0 },
  { question: "Brian writes a novel called?", choices: ["Faster Than the Speed of Love","Brian Bites","Doggy Dish","Beyond"], correct: 0 },
  { question: "Cutaway gags are show's?", choices: ["Trademark","Rare","Once per ep","Forbidden"], correct: 0 },
  { question: "Peter's father?", choices: ["Francis","Mickey","Frank","Pat"], correct: 0 },
  { question: "Bird is the Word episode?", choices: ["Surfin' Bird","Word","Bird","Surf"], correct: 0 },
  { question: "Lois's maiden name?", choices: ["Pewterschmidt","Smith","Lyons","Reilly"], correct: 0 },
  { question: "Death talks to Peter?", choices: ["Yes","Never","Once","Always"], correct: 0 },
  { question: "Show's network?", choices: ["FOX","NBC","ABC","CBS"], correct: 0 },
  { question: "Brian dies temporarily in season?", choices: ["12","11","10","13"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: FamilyGuySettings): FamilyGuyState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: FamilyGuyState, action: FamilyGuyAction): FamilyGuyState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: FamilyGuyState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
