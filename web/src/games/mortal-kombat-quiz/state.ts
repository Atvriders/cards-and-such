import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MortalKombatSettings { questions: "10" | "20" | "30"; }
export interface MortalKombatState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MortalKombatAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which studio originally developed Mortal Kombat?", choices: ["Midway (now NetherRealm)","Capcom","SNK","Sega"], correct: 0 },
  { question: "In what year did the original Mortal Kombat hit arcades?", choices: ["1992","1990","1994","1988"], correct: 0 },
  { question: "Who are the two co-creators of Mortal Kombat?", choices: ["Ed Boon and John Tobias","Yoshinori Ono and Akira Yasuda","Daisuke Ishiwatari and Toshimichi Mori","Tomonobu Itagaki and Yohei Shimbori"], correct: 0 },
  { question: "What is the franchise's signature gory finishing move called?", choices: ["Fatality","Brutality","X-Ray","Combo Breaker"], correct: 0 },
  { question: "Which yellow ninja shouts \"GET OVER HERE!\" while throwing a spear?", choices: ["Scorpion","Sub-Zero","Reptile","Ermac"], correct: 0 },
  { question: "Which blue ninja can freeze opponents solid?", choices: ["Sub-Zero","Scorpion","Smoke","Rain"], correct: 0 },
  { question: "Who is the Shaolin monk hero of the original tournament?", choices: ["Liu Kang","Kung Lao","Johnny Cage","Raiden"], correct: 0 },
  { question: "Who is the emperor of Outworld and major series antagonist?", choices: ["Shao Kahn","Shang Tsung","Shinnok","Kronika"], correct: 0 },
  { question: "Which sorcerer hosts the original Mortal Kombat tournament for Shao Kahn?", choices: ["Shang Tsung","Quan Chi","Shinnok","Kronika"], correct: 0 },
  { question: "Who is the thunder god and Earthrealm's protector?", choices: ["Raiden","Fujin","Liu Kang","Nightwolf"], correct: 0 },
  { question: "Which Hollywood-themed fighter throws shadow kicks and green fireballs?", choices: ["Johnny Cage","Kano","Jax","Stryker"], correct: 0 },
  { question: "Who is the cyber-enhanced Special Forces soldier with metal arms?", choices: ["Jax Briggs","Stryker","Kano","Kabal"], correct: 0 },
  { question: "Which four-armed half-dragon Outworld warrior wields swords?", choices: ["Goro","Kintaro","Sheeva","Motaro"], correct: 0 },
  { question: "Which 1995 live-action Mortal Kombat film was directed by Paul W.S. Anderson?", choices: ["Mortal Kombat (1995)","Mortal Kombat: Annihilation","Mortal Kombat (2021)","Mortal Kombat Legacy"], correct: 0 },
  { question: "Mortal Kombat 9 (2011) was a series reboot also known as what?", choices: ["Mortal Kombat (reboot)","Mortal Kombat X","Mortal Kombat 11","Mortal Kombat Trilogy"], correct: 0 },
  { question: "Mortal Kombat X (2015) introduced which adult daughter of Johnny Cage and Sonya Blade?", choices: ["Cassie Cage","Jacqui Briggs","Kung Jin","Takeda Takahashi"], correct: 0 },
  { question: "Which time-bending Elder God is the antagonist of Mortal Kombat 11?", choices: ["Kronika","Shinnok","Shao Kahn","Onaga"], correct: 0 },
  { question: "Which 2023 game rebooted the timeline as Mortal Kombat 1?", choices: ["Mortal Kombat 1 (2023)","Mortal Kombat X","Mortal Kombat 11","MK Armageddon"], correct: 0 },
  { question: "What ESRB rating did Mortal Kombat help create due to its violence?", choices: ["Mature (M) and the AO rating","E for Everyone","T for Teen","EC for Early Childhood"], correct: 0 },
  { question: "Who is the soul-stealing four-armed warrior princess from Outworld?", choices: ["Sheeva","Mileena","Kitana","Tanya"], correct: 0 },
  { question: "Which pair of twin-like princesses share fan-blade weapons in MK?", choices: ["Kitana and Mileena","Jade and Tanya","Sonya and Cassie","Sindel and Jade"], correct: 0 },
  { question: "Who is Kitana's mother, the screaming queen with white hair?", choices: ["Sindel","Jade","Sheeva","Tanya"], correct: 0 },
  { question: "What netherrealm sorcerer raises the dead and bargains with Scorpion?", choices: ["Quan Chi","Shang Tsung","Shinnok","Noob Saibot"], correct: 0 },
  { question: "Who is the original Sub-Zero, returned as a wraith called what?", choices: ["Noob Saibot","Smoke","Sektor","Cyrax"], correct: 0 },
  { question: "Which 2021 Mortal Kombat film introduced Cole Young as protagonist?", choices: ["Mortal Kombat (2021)","Mortal Kombat (1995)","Mortal Kombat: Annihilation","Mortal Kombat Legacy"], correct: 0 },
  { question: "What stage finisher feeds an opponent to a hidden creature or pit hazard?", choices: ["Stage Fatality","Animality","Babality","Friendship"], correct: 0 },
  { question: "What hidden, comic finisher turns the opponent into a baby?", choices: ["Babality","Friendship","Animality","Brutality"], correct: 0 },
  { question: "In MK lore, which realm does Earthrealm primarily defend against?", choices: ["Outworld","Edenia","Netherrealm","Chaosrealm"], correct: 0 },
  { question: "Which MK character is a green-skinned reptilian assassin in disguise as a ninja?", choices: ["Reptile","Ermac","Rain","Smoke"], correct: 0 },
  { question: "What composer wrote the iconic 'Techno Syndrome' Mortal Kombat theme?", choices: ["The Immortals (Olivier Adams & Maurice Engelen)","Dan Forden","Wu-Tang Clan","Trent Reznor"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MortalKombatSettings): MortalKombatState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MortalKombatState, action: MortalKombatAction): MortalKombatState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MortalKombatState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
