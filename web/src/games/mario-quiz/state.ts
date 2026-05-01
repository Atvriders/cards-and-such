import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MarioSettings { questions: "10" | "20" | "30"; }
export interface MarioState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MarioAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who is Mario's twin brother?", choices: ["Luigi","Wario","Waluigi","Donkey Kong"], correct: 0 },
  { question: "What princess does Mario most often rescue?", choices: ["Princess Peach","Princess Daisy","Princess Zelda","Rosalina"], correct: 0 },
  { question: "Who is Mario's archenemy and the king of the Koopas?", choices: ["Bowser","Wario","King Boo","Kamek"], correct: 0 },
  { question: "What is Mario's profession in the original cartoons and games?", choices: ["Plumber","Carpenter","Doctor","Chef"], correct: 0 },
  { question: "Which power-up first transforms Mario into Super Mario?", choices: ["Super Mushroom","Fire Flower","Super Star","Tanooki Leaf"], correct: 0 },
  { question: "What species is Mario's green dinosaur companion Yoshi?", choices: ["Dinosaur","Turtle","Lizard","Dragon"], correct: 0 },
  { question: "In which 1981 arcade game did Mario (then \"Jumpman\") debut?", choices: ["Donkey Kong","Mario Bros.","Popeye","Radar Scope"], correct: 0 },
  { question: "In what year did the original Super Mario Bros. release on the Famicom/NES?", choices: ["1985","1983","1987","1990"], correct: 0 },
  { question: "What is the name of Bowser's youngest son and frequent sidekick?", choices: ["Bowser Jr.","Iggy","Ludwig","Larry"], correct: 0 },
  { question: "How many coins traditionally earn Mario a 1-Up in classic 2D titles?", choices: ["100","50","200","1000"], correct: 0 },
  { question: "What brown mushroom-shaped enemy is the most common foot soldier of Bowser?", choices: ["Goomba","Koopa Troopa","Shy Guy","Boo"], correct: 0 },
  { question: "What item did Princess Peach bake for Mario at the end of Super Mario 64?", choices: ["A cake","Cookies","A pie","Spaghetti"], correct: 0 },
  { question: "What 3D platformer launched alongside the Nintendo 64 in 1996?", choices: ["Super Mario 64","Super Mario Sunshine","Super Mario Galaxy","Super Mario 3D World"], correct: 0 },
  { question: "What spray-pack tool does Mario use throughout Super Mario Sunshine?", choices: ["F.L.U.D.D.","Poltergust","Cappy","Sprixie"], correct: 0 },
  { question: "On which Nintendo console did the original Super Mario Kart launch in 1992?", choices: ["Super Nintendo (SNES)","NES","Nintendo 64","GameCube"], correct: 0 },
  { question: "What does the Tanooki Leaf in Super Mario Bros. 3 let Mario do?", choices: ["Fly and turn into a statue","Shoot fireballs","Swim faster","Become invincible"], correct: 0 },
  { question: "What sentient hat possesses enemies for Mario in Super Mario Odyssey?", choices: ["Cappy","Tippi","Cackletta","Fawful"], correct: 0 },
  { question: "Who is Mario's greedy yellow-clad doppelganger and rival?", choices: ["Wario","Waluigi","Foreman Spike","Mr. L"], correct: 0 },
  { question: "Which game introduced the cosmic observatory caretaker Rosalina?", choices: ["Super Mario Galaxy","Super Mario 3D World","Super Mario Odyssey","New Super Mario Bros. Wii"], correct: 0 },
  { question: "What is the name of Mario's loyal mushroom-headed retainer?", choices: ["Toad","Toadette","Toadsworth","Captain Toad"], correct: 0 },
  { question: "On which console did Super Mario Odyssey release in 2017?", choices: ["Nintendo Switch","Wii U","3DS","Wii"], correct: 0 },
  { question: "What white ghostly enemy hides its face when Mario looks at it?", choices: ["Boo","Lakitu","Blooper","Dry Bones"], correct: 0 },
  { question: "Which Mario game popularized the FLUDD water-pack mechanic in 2002?", choices: ["Super Mario Sunshine","Super Mario 64","Super Mario Galaxy","Luigi's Mansion"], correct: 0 },
  { question: "What cloud-riding enemy throws Spinies down at Mario?", choices: ["Lakitu","Bullet Bill","Hammer Bro","Magikoopa"], correct: 0 },
  { question: "Which Game Boy title introduced Wario as the main villain in 1992?", choices: ["Super Mario Land 2: 6 Golden Coins","Super Mario Land","Wario Land","Mario's Picross"], correct: 0 },
  { question: "What kingdom does Princess Daisy rule?", choices: ["Sarasaland","Mushroom Kingdom","Beanbean Kingdom","Sprixie Kingdom"], correct: 0 },
  { question: "In Mario Kart, what blue-shelled item homes in on the leading racer?", choices: ["Spiny Shell (Blue Shell)","Red Shell","Green Shell","Bob-omb"], correct: 0 },
  { question: "What handheld debuted Super Mario Land in 1989?", choices: ["Game Boy","Game Gear","Virtual Boy","Game Boy Color"], correct: 0 },
  { question: "Which 2007 game saw Mario travel between miniature planets with their own gravity?", choices: ["Super Mario Galaxy","Super Mario Sunshine","Super Mario 3D World","Super Mario Odyssey"], correct: 0 },
  { question: "Who has been the long-running English voice of Mario from 1991 to 2023?", choices: ["Charles Martinet","Chris Pratt","Lou Albano","Walker Boone"], correct: 0 },
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
