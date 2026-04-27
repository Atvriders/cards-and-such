import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MetalGearSettings { questions: "10" | "20" | "30"; }
export interface MetalGearState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MetalGearAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "MG creator/director?", choices: ["Hideo Kojima","Shigeru Miyamoto","Hironobu Sakaguchi","Tetsuya Mizuguchi"], correct: 0 },
  { question: "First Metal Gear year?", choices: ["1987","1985","1990","1992"], correct: 0 },
  { question: "MGS1 console?", choices: ["PSX","N64","PS2","PC"], correct: 0 },
  { question: "MGS1 year?", choices: ["1998","1996","2000","2002"], correct: 0 },
  { question: "Main protagonist?", choices: ["Solid Snake / Big Boss","Mario","Cloud","Sonic"], correct: 0 },
  { question: "Solid Snake's real name?", choices: ["David","Jack","John","Adam"], correct: 0 },
  { question: "Snake's creator (clone)?", choices: ["Big Boss","Liquid","Solidus","Ocelot"], correct: 0 },
  { question: "MGS2 protagonist (latter half)?", choices: ["Raiden","Snake","Big Boss","Otacon"], correct: 0 },
  { question: "Otacon is a?", choices: ["Engineer/scientist","Soldier","Pilot","Doctor"], correct: 0 },
  { question: "Tactical espionage genre?", choices: ["Stealth action","Shooter","RPG","Racing"], correct: 0 },
  { question: "MGS3 setting?", choices: ["Cold War 1960s jungle","Modern day","Future","WWII"], correct: 0 },
  { question: "MGS3 protagonist?", choices: ["Naked Snake (Big Boss)","Solid Snake","Raiden","Old Snake"], correct: 0 },
  { question: "The Boss is Snake's?", choices: ["Mentor","Mother","Sister","Daughter"], correct: 0 },
  { question: "MGS4 console?", choices: ["PS3","PS2","PS4","Xbox 360"], correct: 0 },
  { question: "MGS4 year?", choices: ["2008","2006","2010","2012"], correct: 0 },
  { question: "MGSV: The Phantom Pain year?", choices: ["2015","2013","2017","2019"], correct: 0 },
  { question: "Outer Heaven is?", choices: ["Snake's mercenary nation","Country","Base","City"], correct: 0 },
  { question: "Liquid Snake's relation?", choices: ["Brother / clone","Father","Friend","Boss"], correct: 0 },
  { question: "Codec is used for?", choices: ["Communication","Weapons","Travel","Cooking"], correct: 0 },
  { question: "Iconic exclamation?", choices: ["!","?","*","+"], correct: 0 },
  { question: "Cardboard box use?", choices: ["Hide / stealth","Carry","Explode","Decorate"], correct: 0 },
  { question: "Psycho Mantis fight (MGS1)?", choices: ["Reads memory card","Normal fight","Boss fight only","Cutscene"], correct: 0 },
  { question: "Revolver Ocelot's gun?", choices: ["Single Action Army","Glock","MP5","AK"], correct: 0 },
  { question: "Vamp can?", choices: ["Walk on water","Fly","Teleport","None"], correct: 0 },
  { question: "MGS publisher?", choices: ["Konami","Sony","Sega","Capcom"], correct: 0 },
  { question: "PT (cancelled) was for?", choices: ["Silent Hills","MGS6","Death Stranding","Snake Eater"], correct: 0 },
  { question: "MGSV antagonist?", choices: ["Skull Face","Liquid","Ocelot","Volgin"], correct: 0 },
  { question: "Quiet (MGSV) breathes through?", choices: ["Skin (parasite)","Lungs","Mask","Suit"], correct: 0 },
  { question: "Diamond Dogs is?", choices: ["Snake's mercenary group","Band","Movie","Book"], correct: 0 },
  { question: "MGS3 ending mission?", choices: ["Virtuous Mission","Snake Eater","The End","Volgin"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MetalGearSettings): MetalGearState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MetalGearState, action: MetalGearAction): MetalGearState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MetalGearState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
