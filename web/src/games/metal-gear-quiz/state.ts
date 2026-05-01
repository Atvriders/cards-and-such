import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MetalGearSettings { questions: "10" | "20" | "30"; }
export interface MetalGearState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MetalGearAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who created and directed the Metal Gear series?", choices: ["Hideo Kojima","Shigeru Miyamoto","Hironobu Sakaguchi","Goichi Suda"], correct: 0 },
  { question: "In what year did the original Metal Gear release on the MSX2?", choices: ["1987","1985","1990","1992"], correct: 0 },
  { question: "On which console did Metal Gear Solid debut in 1998?", choices: ["PlayStation","Nintendo 64","PlayStation 2","Sega Saturn"], correct: 0 },
  { question: "In what year did Metal Gear Solid release in North America?", choices: ["1998","1996","2000","2002"], correct: 0 },
  { question: "Who is the cloned protagonist of Metal Gear Solid 1?", choices: ["Solid Snake","Big Boss","Raiden","Venom Snake"], correct: 0 },
  { question: "What is Solid Snake's real name?", choices: ["David","John","Jack","Adam"], correct: 0 },
  { question: "Solid Snake was cloned from which legendary soldier?", choices: ["Big Boss (Naked Snake)","Liquid Snake","Solidus Snake","Gray Fox"], correct: 0 },
  { question: "Who becomes the playable protagonist for most of Metal Gear Solid 2?", choices: ["Raiden","Solid Snake","Big Boss","Otacon"], correct: 0 },
  { question: "Who is Snake's nerdy engineer best friend from MGS1 onward?", choices: ["Otacon (Hal Emmerich)","Mei Ling","Roy Campbell","Master Miller"], correct: 0 },
  { question: "What giant bipedal nuclear-equipped tank gives the series its name?", choices: ["Metal Gear","Shagohod","Gekko","Sahelanthropus"], correct: 0 },
  { question: "What 2004 PS2 prequel introduces Naked Snake (Big Boss)?", choices: ["Metal Gear Solid 3: Snake Eater","MGS2","MGS4","MGS Peace Walker"], correct: 0 },
  { question: "In what region does MGS3 take place?", choices: ["Soviet jungle (Tselinoyarsk)","Shadow Moses","Big Shell","Africa"], correct: 0 },
  { question: "Who is the female mentor and final boss of MGS3?", choices: ["The Boss","EVA","Sniper Wolf","Quiet"], correct: 0 },
  { question: "Who is the silver-haired arms dealer/villain throughout MGS3 and beyond?", choices: ["Revolver Ocelot","Liquid Snake","Solidus Snake","Skull Face"], correct: 0 },
  { question: "What 2008 PS3 entry concludes Solid Snake's story?", choices: ["Metal Gear Solid 4: Guns of the Patriots","MGS3","MGS5","MGS Peace Walker"], correct: 0 },
  { question: "What 2010 PSP entry stars Big Boss building a private army?", choices: ["Metal Gear Solid: Peace Walker","MGS Portable Ops","MGS Ground Zeroes","MGS V"], correct: 0 },
  { question: "What 2014 prologue precedes Metal Gear Solid V?", choices: ["Ground Zeroes","Peace Walker","Portable Ops","Snake Eater"], correct: 0 },
  { question: "What 2015 open-world entry is the final Kojima Metal Gear?", choices: ["Metal Gear Solid V: The Phantom Pain","MGS4","MGS Peace Walker","Metal Gear Survive"], correct: 0 },
  { question: "Who is the silent female sniper companion in MGS V?", choices: ["Quiet","Sniper Wolf","EVA","The Boss"], correct: 0 },
  { question: "Which MGS1 boss is a psychic in a gas mask who reads memory cards?", choices: ["Psycho Mantis","Sniper Wolf","Vulcan Raven","Revolver Ocelot"], correct: 0 },
  { question: "Which MGS1 boss is an enormous shaman with a Gatling gun?", choices: ["Vulcan Raven","Psycho Mantis","Decoy Octopus","Liquid Snake"], correct: 0 },
  { question: "Who is Solid Snake's twin brother and main MGS1 antagonist?", choices: ["Liquid Snake","Solidus Snake","Gray Fox","Big Boss"], correct: 0 },
  { question: "What ninja cyborg helps Snake on Shadow Moses?", choices: ["Gray Fox (Cyborg Ninja)","Raiden","Olga","Vamp"], correct: 0 },
  { question: "Who voiced Solid Snake in the English MGS1 through MGS4?", choices: ["David Hayter","Kiefer Sutherland","Cam Clarke","Steven Blum"], correct: 0 },
  { question: "Who voiced Big Boss/Punished Snake in MGS V?", choices: ["Kiefer Sutherland","David Hayter","Akio Otsuka","Cam Clarke"], correct: 0 },
  { question: "Which Konami offshoot was released without Kojima in 2018?", choices: ["Metal Gear Survive","Metal Gear Rising: Revengeance","MGS V","MGS HD Collection"], correct: 0 },
  { question: "What 2013 spin-off lets you play Raiden as a sword-swinging cyborg?", choices: ["Metal Gear Rising: Revengeance","Metal Gear Survive","MGS Portable Ops","MGS Peace Walker"], correct: 0 },
  { question: "What humble item lets Snake hide from enemy soldiers in MGS1?", choices: ["A cardboard box","A barrel","A trash can","A locker"], correct: 0 },
  { question: "What is the name of the AI tank Otacon helped design in MGS1?", choices: ["Metal Gear REX","Metal Gear RAY","Shagohod","Sahelanthropus"], correct: 0 },
  { question: "Which terrorist faction takes hostages on Shadow Moses in MGS1?", choices: ["FOXHOUND (rogue)","Dead Cell","Cobra Unit","Beauty and the Beast Unit"], correct: 0 },
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
