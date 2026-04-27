import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface BatmanQuizSettings { questions: "10" | "20"; }
export interface BatmanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type BatmanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Batman's secret identity?", choices: ["Bruce Wayne", "Clark Kent", "Hal Jordan", "Barry Allen"], correct: 0 },
  { question: "Batman's loyal butler?", choices: ["Alfred Pennyworth", "Lucius Fox", "Jim Gordon", "Harvey Dent"], correct: 0 },
  { question: "The first Robin's name?", choices: ["Dick Grayson", "Jason Todd", "Tim Drake", "Damian Wayne"], correct: 0 },
  { question: "Joker's archenemy is?", choices: ["Batman", "Superman", "Flash", "Aquaman"], correct: 0 },
  { question: "Batman's city is?", choices: ["Gotham", "Metropolis", "Star City", "Central City"], correct: 0 },
  { question: "Catwoman's real name?", choices: ["Selina Kyle", "Pamela Isley", "Harleen Quinzel", "Talia al Ghul"], correct: 0 },
  { question: "Two-Face's real name?", choices: ["Harvey Dent", "Edward Nigma", "Oswald Cobblepot", "Jonathan Crane"], correct: 0 },
  { question: "Penguin's real name?", choices: ["Oswald Cobblepot", "Edward Nigma", "Harvey Dent", "Jervis Tetch"], correct: 0 },
  { question: "Riddler's real name?", choices: ["Edward Nigma", "Oswald Cobblepot", "Harvey Dent", "Victor Zsasz"], correct: 0 },
  { question: "Mr. Freeze's true name?", choices: ["Victor Fries", "Hugo Strange", "Jonathan Crane", "Basil Karlo"], correct: 0 },
  { question: "Scarecrow's real name?", choices: ["Jonathan Crane", "Edward Nigma", "Harvey Dent", "Selina Kyle"], correct: 0 },
  { question: "Bane's claim to fame?", choices: ["Broke the Bat", "Killed Joker", "Took over Gotham", "Saved Robin"], correct: 0 },
  { question: "Batman's trainer (DC)?", choices: ["Henri Ducard", "Ra's al Ghul", "Both", "Neither"], correct: 2 },
  { question: "Damian Wayne's mother?", choices: ["Talia al Ghul", "Catwoman", "Harley Quinn", "Vicki Vale"], correct: 0 },
  { question: "Police Commissioner of Gotham?", choices: ["Jim Gordon", "Harvey Bullock", "Renee Montoya", "Sarah Essen"], correct: 0 },
  { question: "Wayne Enterprises CEO under Bruce?", choices: ["Lucius Fox", "Alfred", "Tim Drake", "Dick Grayson"], correct: 0 },
  { question: "Joker's signature weapon?", choices: ["Crowbar", "Joker venom", "Knife", "All of these"], correct: 3 },
  { question: "Batgirl's original civilian name?", choices: ["Barbara Gordon", "Cassandra Cain", "Stephanie Brown", "Selina Kyle"], correct: 0 },
  { question: "Nightwing was originally?", choices: ["Robin (Dick Grayson)", "Joker", "Robin (Tim)", "Red Hood"], correct: 0 },
  { question: "Red Hood was originally?", choices: ["Joker (pre-fall)", "Jason Todd (resurrected)", "Both", "Tim Drake"], correct: 2 },
  { question: "The Bat-Signal projects on?", choices: ["Clouds", "Sky", "City Hall", "Wayne Tower"], correct: 0 },
  { question: "Asylum holding most villains?", choices: ["Arkham", "Belle Reve", "Iron Heights", "Stryker's"], correct: 0 },
  { question: "Batman's first comic appearance?", choices: ["Detective Comics #27", "Action Comics #1", "Batman #1", "World's Finest #1"], correct: 0 },
  { question: "Batman first comic year?", choices: ["1939", "1938", "1940", "1941"], correct: 0 },
  { question: "Batman's creator credited as?", choices: ["Bob Kane and Bill Finger", "Stan Lee", "Jerry Siegel", "Joe Shuster"], correct: 0 },
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
