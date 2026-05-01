import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BatmanQuizSettings { questions: "10" | "20"; }
export interface BatmanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BatmanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Batman's secret identity is?", choices: ["Bruce Wayne", "Clark Kent", "Hal Jordan", "Barry Allen"], correct: 0 },
  { question: "Batman's loyal butler?", choices: ["Alfred Pennyworth", "Lucius Fox", "Jim Gordon", "Harvey Dent"], correct: 0 },
  { question: "The first Robin's name?", choices: ["Dick Grayson", "Jason Todd", "Tim Drake", "Damian Wayne"], correct: 0 },
  { question: "Joker's archenemy is?", choices: ["Batman", "Superman", "Flash", "Aquaman"], correct: 0 },
  { question: "Batman's home city?", choices: ["Gotham City", "Metropolis", "Coast City", "Central City"], correct: 0 },
  { question: "Bruce Wayne's parents were named?", choices: ["Thomas and Martha", "Jonathan and Martha", "Henry and Mary", "Howard and Maria"], correct: 0 },
  { question: "Where were Bruce's parents murdered?", choices: ["Crime Alley", "Wayne Manor", "Arkham", "Iceberg Lounge"], correct: 0 },
  { question: "Batman's company?", choices: ["Wayne Enterprises", "LexCorp", "Stark Industries", "Queen Consolidated"], correct: 0 },
  { question: "The supercriminal asylum in Gotham?", choices: ["Arkham Asylum", "Belle Reve", "Iron Heights", "Blackgate"], correct: 0 },
  { question: "The villain Two-Face's identity?", choices: ["Harvey Dent", "Edward Nygma", "Oswald Cobblepot", "Victor Fries"], correct: 0 },
  { question: "The Penguin's real name?", choices: ["Oswald Cobblepot", "Edward Nygma", "Harvey Dent", "Jervis Tetch"], correct: 0 },
  { question: "The Riddler's real name?", choices: ["Edward Nygma (Nigma)", "Jonathan Crane", "Selina Kyle", "Bane"], correct: 0 },
  { question: "Mr. Freeze's real name?", choices: ["Victor Fries", "Garfield Lynns", "Waylon Jones", "Basil Karlo"], correct: 0 },
  { question: "Catwoman's real name?", choices: ["Selina Kyle", "Pamela Isley", "Harleen Quinzel", "Talia al Ghul"], correct: 0 },
  { question: "Poison Ivy's real name?", choices: ["Pamela Isley", "Selina Kyle", "Harleen Quinzel", "Renee Montoya"], correct: 0 },
  { question: "Harley Quinn's real name?", choices: ["Harleen Quinzel", "Selina Kyle", "Pamela Isley", "Barbara Gordon"], correct: 0 },
  { question: "The Scarecrow uses what to terrify?", choices: ["Fear toxin", "Lightning", "Acid", "Sleep gas"], correct: 0 },
  { question: "Bane is famous for?", choices: ["Breaking Batman's back", "Robbing the Fed", "Eating fish", "Riddles"], correct: 0 },
  { question: "Ra's al Ghul leads?", choices: ["League of Assassins/Shadows", "Joker's gang", "Court of Owls", "GCPD"], correct: 0 },
  { question: "Batgirl's first identity (Barbara Gordon's father)?", choices: ["Commissioner Gordon", "Mayor Hill", "Alfred", "Lucius"], correct: 0 },
  { question: "The signal projected on the sky?", choices: ["Bat-Signal", "Spotlight", "Owl-Signal", "Sky Beacon"], correct: 0 },
  { question: "Batman's vehicle?", choices: ["Batmobile", "Batwing", "Bat-Cycle", "All of these"], correct: 3 },
  { question: "Batman is called the World's Greatest?", choices: ["Detective", "Athlete", "Inventor", "Strategist"], correct: 0 },
  { question: "Damian Wayne's mother is?", choices: ["Talia al Ghul", "Selina Kyle", "Vicki Vale", "Catherine"], correct: 0 },
  { question: "Tim Drake's hero identity?", choices: ["Robin (third)", "Red Hood", "Nightwing", "Spoiler"], correct: 0 },
  { question: "Jason Todd's later identity?", choices: ["Red Hood", "Nightwing", "Red Robin", "Black Bat"], correct: 0 },
  { question: "Dick Grayson's adult hero name?", choices: ["Nightwing", "Red Robin", "Red Hood", "Batwing"], correct: 0 },
  { question: "Batman first appeared in?", choices: ["Detective Comics #27 (1939)", "Action Comics #1", "Batman #1", "Adventure Comics"], correct: 0 },
  { question: "Batman's creator (with Bill Finger)?", choices: ["Bob Kane", "Stan Lee", "Joe Shuster", "Frank Miller"], correct: 0 },
  { question: "The Court of Owls hides in?", choices: ["Gotham (secret society)", "Metropolis", "Star City", "Bludhaven"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: BatmanQuizSettings): BatmanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: BatmanQuizState, action: BatmanQuizAction): BatmanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: BatmanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
