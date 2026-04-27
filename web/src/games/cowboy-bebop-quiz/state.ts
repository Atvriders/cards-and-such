import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface CowboyBebopQuizSettings { questions: "10" | "20"; }
export interface CowboyBebopQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type CowboyBebopQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "The ship is named?", choices: ["Bebop", "Swordfish", "Hammerhead", "Red Tail"], correct: 0 },
  { question: "Spike's ship?", choices: ["Bebop", "Swordfish II", "Hammerhead", "Red Tail"], correct: 1 },
  { question: "Spike's ex-syndicate?", choices: ["Red Dragon", "Black Snake", "White Tiger", "Iron Fist"], correct: 0 },
  { question: "Spike's nemesis?", choices: ["Vicious", "Mad Pierrot", "Whitney", "Gren"], correct: 0 },
  { question: "Spike's lost love?", choices: ["Faye", "Julia", "Annie", "Ed"], correct: 1 },
  { question: "Jet's former job?", choices: ["ISSP cop", "Doctor", "Pilot", "Soldier"], correct: 0 },
  { question: "Jet plays which instrument?", choices: ["Saxophone", "Bonsai", "Bass", "Trumpet"], correct: 0 },
  { question: "Faye Valentine's debt is in?", choices: ["Yen", "Woolongs", "Dollars", "Euros"], correct: 1 },
  { question: "Ed's full name?", choices: ["Edward Wong Hau Pepelu Tivrusky IV", "Edward Smith", "Edward Black", "Edward Anderson"], correct: 0 },
  { question: "Ed's pet?", choices: ["Ein", "Cat", "Bird", "Snake"], correct: 0 },
  { question: "Ein is a?", choices: ["Welsh Corgi", "Beagle", "Poodle", "Retriever"], correct: 0 },
  { question: "The series director?", choices: ["Watanabe", "Anno", "Miyazaki", "Oshii"], correct: 0 },
  { question: "Composer?", choices: ["Joe Hisaishi", "Yoko Kanno", "Kenji Kawai", "Hans Zimmer"], correct: 1 },
  { question: "Opening song is called?", choices: ["Tank!", "Real Folk Blues", "Blue", "Rain"], correct: 0 },
  { question: "Final episode song?", choices: ["Tank!", "Real Folk Blues", "Blue", "Stella by Starlight"], correct: 1 },
  { question: "Astral Gate disaster destroyed?", choices: ["Earth surface", "Mars", "The Moon", "Venus"], correct: 2 },
  { question: "Earth in Bebop is?", choices: ["Lush green", "Devastated", "Underwater", "Frozen"], correct: 1 },
  { question: "Spike's eyes are?", choices: ["Both real", "Both fake", "One real, one fake", "Neither shown"], correct: 2 },
  { question: "The movie is titled?", choices: ["Knockin' on Heaven's Door", "Real Folk Blues", "Honky Tonk Women", "Asteroid Blues"], correct: 0 },
  { question: "Number of episodes?", choices: ["13", "26", "52", "100"], correct: 1 },
  { question: "Aired in Japan starting?", choices: ["1996", "1998", "2000", "2002"], correct: 1 },
  { question: "Watanabe also directed?", choices: ["Samurai Champloo", "Bleach", "FMA", "Trigun"], correct: 0 },
  { question: "Spike's fighting style based on?", choices: ["Karate", "Jeet Kune Do", "Boxing", "Capoeira"], correct: 1 },
  { question: "Spike's hair color?", choices: ["Green and dark", "Blonde", "Red", "Black"], correct: 0 },
  { question: "Vicious wields a?", choices: ["Pistol", "Katana", "Axe", "Spear"], correct: 1 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: CowboyBebopQuizSettings): CowboyBebopQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(qq=>{const idx=qq.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===qq.correct) as 0|1|2|3;return{...qq,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: CowboyBebopQuizState, action: CowboyBebopQuizAction): CowboyBebopQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const qq=state.questions[state.currentIndex]!;const ok=state.selected===qq.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: CowboyBebopQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
