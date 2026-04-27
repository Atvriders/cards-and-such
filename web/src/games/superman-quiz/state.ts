import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SupermanQuizSettings { questions: "10" | "20"; }
export interface SupermanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SupermanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Superman's birth name?", choices: ["Kal-El", "Bruce Wayne", "Clark Kent Jr.", "Jor-El"], correct: 0 },
  { question: "Superman's Earth name?", choices: ["Clark Kent", "Tom Welling", "Kal Smith", "Henry"], correct: 0 },
  { question: "Superman's home planet?", choices: ["Krypton", "Mars", "Daxam", "Apokolips"], correct: 0 },
  { question: "Superman's father (Krypton)?", choices: ["Jor-El", "Lara Lor-Van", "Zor-El", "Seyg-El"], correct: 0 },
  { question: "Superman's adoptive parents?", choices: ["Kents", "Waynes", "Allens", "Wests"], correct: 0 },
  { question: "Superman's hometown on Earth?", choices: ["Smallville", "Metropolis", "Star City", "Central City"], correct: 0 },
  { question: "Superman lives and works in?", choices: ["Smallville", "Metropolis", "Gotham", "Coast City"], correct: 1 },
  { question: "Newspaper Clark works for?", choices: ["Daily Planet", "Daily Bugle", "Gotham Gazette", "Star Tribune"], correct: 0 },
  { question: "Editor-in-chief of Daily Planet?", choices: ["Perry White", "J. Jonah Jameson", "Cat Grant", "Steve Lombard"], correct: 0 },
  { question: "Photographer pal at Planet?", choices: ["Jimmy Olsen", "Pete Ross", "Steve Lombard", "Eddie Brock"], correct: 0 },
  { question: "Lois Lane is Clark's?", choices: ["Wife/love interest", "Sister", "Cousin", "Boss"], correct: 0 },
  { question: "Superman's archenemy?", choices: ["Lex Luthor", "Joker", "Sinestro", "Black Adam"], correct: 0 },
  { question: "Lex's company?", choices: ["LexCorp", "Wayne Enterprises", "Stark", "Queen Industries"], correct: 0 },
  { question: "Brainiac is from?", choices: ["Colu", "Krypton", "Earth", "Mars"], correct: 0 },
  { question: "General Zod's planet?", choices: ["Krypton", "Daxam", "Apokolips", "Earth"], correct: 0 },
  { question: "Doomsday famously?", choices: ["Killed Superman", "Saved Lois", "Married Selina", "Joined JLA"], correct: 0 },
  { question: "Bizarro speaks in?", choices: ["Opposites", "Rhymes", "Latin", "Code"], correct: 0 },
  { question: "Superman's weakness?", choices: ["Kryptonite", "Magic", "Yellow sun loss", "All of these"], correct: 3 },
  { question: "Green Kryptonite effect?", choices: ["Weakness", "Power-up", "Mind control", "Cures all"], correct: 0 },
  { question: "Red Kryptonite causes?", choices: ["Random effects", "Death", "Healing", "Flight"], correct: 0 },
  { question: "Fortress of Solitude is in the?", choices: ["Arctic", "Sahara", "Pacific", "Andes"], correct: 0 },
  { question: "Mister Mxyzptlk is from the?", choices: ["5th dimension", "Krypton", "Hell", "Mirror world"], correct: 0 },
  { question: "Supergirl's name?", choices: ["Kara Zor-El", "Lara", "Lyla", "Kandi"], correct: 0 },
  { question: "Krypto is a?", choices: ["Dog", "Cat", "Horse", "Bird"], correct: 0 },
  { question: "Superman first appeared in?", choices: ["Action Comics #1", "Detective Comics #27", "Superman #1", "World's Finest #1"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: SupermanQuizSettings): SupermanQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: SupermanQuizState, action: SupermanQuizAction): SupermanQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: SupermanQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
