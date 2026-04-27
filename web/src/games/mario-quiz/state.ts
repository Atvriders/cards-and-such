import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarioSettings { questions: "10" | "20" | "30"; }
export interface MarioState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarioAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Mario's brother?", choices: ["Luigi","Wario","Donkey","Peach"], correct: 0 },
  { question: "Princess Mario rescues?", choices: ["Peach","Daisy","Rosalina","Zelda"], correct: 0 },
  { question: "Main villain?", choices: ["Bowser","Wario","Donkey","Kamek"], correct: 0 },
  { question: "Mario's profession?", choices: ["Plumber","Carpenter","Doctor","Cook"], correct: 0 },
  { question: "Power-up that grows Mario?", choices: ["Super Mushroom","Fire Flower","Star","Tanooki"], correct: 0 },
  { question: "Yoshi is a?", choices: ["Dinosaur","Turtle","Bird","Fish"], correct: 0 },
  { question: "Mario debuted in (1981)?", choices: ["Donkey Kong","Super Mario","Mario Bros","DK Jr"], correct: 0 },
  { question: "First Super Mario Bros year?", choices: ["1985","1983","1990","1987"], correct: 0 },
  { question: "Bowser's son?", choices: ["Bowser Jr","Wario","Koopa","Bob"], correct: 0 },
  { question: "Coins required for 1UP (classic)?", choices: ["100","50","200","1000"], correct: 0 },
  { question: "Ground enemies that walk?", choices: ["Goombas","Koopas","Bloopers","Cheep Cheeps"], correct: 0 },
  { question: "Turtles in shells?", choices: ["Koopa Troopas","Goombas","Bullets","Hammers"], correct: 0 },
  { question: "World 1-1 ends with?", choices: ["Flagpole","Castle","Cave","Pipe"], correct: 0 },
  { question: "Star power makes Mario?", choices: ["Invincible","Big","Fast only","Float"], correct: 0 },
  { question: "Mario Kart's first console?", choices: ["SNES","NES","N64","GameCube"], correct: 0 },
  { question: "Mario 64 console?", choices: ["N64","SNES","GameCube","Wii"], correct: 0 },
  { question: "Tanooki suit lets Mario?", choices: ["Fly/become statue","Swim","Dig","Shoot"], correct: 0 },
  { question: "Yoshi's Island game year?", choices: ["1995","1990","2000","1998"], correct: 0 },
  { question: "Smash Bros first game?", choices: ["1999","1996","2001","2003"], correct: 0 },
  { question: "Mario Galaxy console?", choices: ["Wii","GameCube","Wii U","Switch"], correct: 0 },
  { question: "Wario is Mario's?", choices: ["Rival","Brother","Cousin","Father"], correct: 0 },
  { question: "Rosalina debuted in?", choices: ["Super Mario Galaxy","Galaxy 2","3D Land","Odyssey"], correct: 0 },
  { question: "Ghost enemy?", choices: ["Boo","Goomba","Koopa","Bullet"], correct: 0 },
  { question: "Toad's role?", choices: ["Mushroom retainer","Villain","Princess","Plumber"], correct: 0 },
  { question: "Mario Odyssey console?", choices: ["Switch","Wii U","3DS","Wii"], correct: 0 },
  { question: "Cappy is Mario's?", choices: ["Hat companion","Brother","Pet","Tool"], correct: 0 },
  { question: "Donkey Kong original villain?", choices: ["Yes","No","Sometimes","Once"], correct: 0 },
  { question: "Mario's last name (rare canon)?", choices: ["Mario","Brothers","Kart","Smith"], correct: 0 },
  { question: "NSMB Wii multiplayer count?", choices: ["4","2","8","1"], correct: 0 },
  { question: "Mario voice actor?", choices: ["Charles Martinet","Jack Black","Chris Pratt (film)","Both 1 & 3"], correct: 3 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MarioSettings): MarioState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MarioState, action: MarioAction): MarioState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MarioState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
