import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface SupermanQuizSettings { questions: "10" | "20"; }
export interface SupermanQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type SupermanQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Superman's home planet?", choices: ["Krypton", "Mars", "Oa", "Tamaran"], correct: 0 },
  { question: "Superman's secret identity?", choices: ["Clark Kent", "Bruce Wayne", "Barry Allen", "Hal Jordan"], correct: 0 },
  { question: "Superman's Kryptonian name?", choices: ["Kal-El", "Jor-El", "Zod", "Lar Gand"], correct: 0 },
  { question: "Superman's father (biological)?", choices: ["Jor-El", "Jonathan Kent", "Zod", "Brainiac"], correct: 0 },
  { question: "Superman's mother (biological)?", choices: ["Lara Lor-Van", "Martha Kent", "Lois Lane", "Lyla"], correct: 0 },
  { question: "Superman's adoptive parents?", choices: ["Jonathan and Martha Kent", "Thomas and Martha Wayne", "Howard and Maria", "Henry and Mary"], correct: 0 },
  { question: "Superman's home city as a hero?", choices: ["Metropolis", "Gotham", "Central City", "Star City"], correct: 0 },
  { question: "Superman's weakness?", choices: ["Kryptonite", "Magic", "Lead in lungs", "Both Kryptonite and magic"], correct: 3 },
  { question: "Superman's main human love interest?", choices: ["Lois Lane", "Lana Lang", "Cat Grant", "Diana Prince"], correct: 0 },
  { question: "Superman's main archenemy?", choices: ["Lex Luthor", "Joker", "Brainiac", "Doomsday"], correct: 0 },
  { question: "The newspaper Clark works at?", choices: ["Daily Planet", "Daily Bugle", "Gotham Gazette", "Star Tribune"], correct: 0 },
  { question: "Editor-in-chief at the Daily Planet?", choices: ["Perry White", "J. Jonah Jameson", "Cat Grant", "Steve Lombard"], correct: 0 },
  { question: "Photographer/cub reporter at Daily Planet?", choices: ["Jimmy Olsen", "Peter Parker", "Cat Grant", "Vicki Vale"], correct: 0 },
  { question: "Superman first appeared in?", choices: ["Action Comics #1 (1938)", "Detective Comics #27", "Superman #1", "Adventure Comics"], correct: 0 },
  { question: "Superman's creators?", choices: ["Siegel and Shuster", "Lee and Kirby", "Kane and Finger", "Moore and Gibbons"], correct: 0 },
  { question: "The fortress hidden in the Arctic?", choices: ["Fortress of Solitude", "Watchtower", "Hall of Justice", "Sanctum Sanctorum"], correct: 0 },
  { question: "Doomsday is famous for?", choices: ["Killing Superman", "Reviving Superman", "Inventing Kryptonite", "Founding the JLA"], correct: 0 },
  { question: "Brainiac is what kind of villain?", choices: ["Alien android intellect", "Wizard", "Scientist", "Mafia boss"], correct: 0 },
  { question: "Krypto is Superman's?", choices: ["Dog", "Cat", "Horse", "Brother"], correct: 0 },
  { question: "General Zod's signature line?", choices: ["Kneel before Zod", "Up, up, and away", "I am vengeance", "Hulk smash"], correct: 0 },
  { question: "Supergirl's name is?", choices: ["Kara Zor-El", "Kara Kent", "Linda Lee", "Kara Danvers (in TV)"], correct: 0 },
  { question: "Superman's powers come from?", choices: ["Yellow sun radiation", "Magic ring", "Mutation", "Serum"], correct: 0 },
  { question: "Bizarro is Superman's?", choices: ["Imperfect clone/mirror", "Brother", "Cousin", "Robot"], correct: 0 },
  { question: "The hero called Superboy (Conner Kent) is a?", choices: ["Clone of Superman and Lex Luthor", "Time-traveler", "Alien orphan", "Robot"], correct: 0 },
  { question: "Superman's S-symbol stands for?", choices: ["House of El (hope)", "Superman", "Strength", "Star"], correct: 0 },
  { question: "Lex Luthor's profession?", choices: ["Billionaire industrialist/scientist", "Lawyer", "Wrestler", "Senator only"], correct: 0 },
  { question: "Superman's vision powers include?", choices: ["Heat, X-ray, telescopic, microscopic", "Heat only", "X-ray only", "Just super sight"], correct: 0 },
  { question: "Mr. Mxyzptlk is a?", choices: ["5th-dimensional imp", "Robot", "Alien tyrant", "Wizard"], correct: 0 },
  { question: "The Phantom Zone is?", choices: ["A Kryptonian prison dimension", "A planet", "An asteroid", "An ancient city"], correct: 0 },
  { question: "Smallville is in which US state?", choices: ["Kansas", "Iowa", "Nebraska", "Missouri"], correct: 0 },
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
