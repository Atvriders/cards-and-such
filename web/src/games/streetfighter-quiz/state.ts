import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface StreetfighterSettings { questions: "10" | "20" | "30"; }
export interface StreetfighterState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type StreetfighterAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Which company develops Street Fighter?", choices: ["Capcom","SNK","Midway","Konami"], correct: 0 },
  { question: "In what year did the original Street Fighter arcade game release?", choices: ["1987","1985","1990","1992"], correct: 0 },
  { question: "In what year was Street Fighter II first released in arcades?", choices: ["1991","1989","1993","1995"], correct: 0 },
  { question: "Who is the karate gi-wearing iconic main hero of Street Fighter?", choices: ["Ryu","Ken Masters","Akuma","M. Bison"], correct: 0 },
  { question: "Who is Ryu's blond-haired American best friend and rival?", choices: ["Ken Masters","Guile","Akuma","Charlie"], correct: 0 },
  { question: "What is Ryu's signature projectile fireball called?", choices: ["Hadouken","Shoryuken","Tatsumaki Senpukyaku","Shinku Hadouken"], correct: 0 },
  { question: "What rising-uppercut move is performed with a \"Z\" motion?", choices: ["Shoryuken","Hadouken","Tatsumaki","Sonic Boom"], correct: 0 },
  { question: "What spinning kick is performed with a quarter-circle-back-plus-kick?", choices: ["Tatsumaki Senpukyaku","Shoryuken","Hadouken","Sonic Boom"], correct: 0 },
  { question: "Which Chinese Interpol officer fights with the rapid \"Hyakuretsukyaku\" kicks?", choices: ["Chun-Li","Cammy","Juri","Karin"], correct: 0 },
  { question: "Which crew-cut U.S. Air Force major throws Sonic Booms?", choices: ["Guile","Charlie Nash","Abel","Cody"], correct: 0 },
  { question: "What is Guile's signature horizontal projectile?", choices: ["Sonic Boom","Hadouken","Yoga Fire","Psycho Crusher"], correct: 0 },
  { question: "Which yoga-master fighter from India stretches his limbs?", choices: ["Dhalsim","Gen","Necalli","Adon"], correct: 0 },
  { question: "Which green-skinned Brazilian beast attacks with Electric Thunder?", choices: ["Blanka","E. Honda","Birdie","Hugo"], correct: 0 },
  { question: "Which sumo wrestler hails from Japan and uses the Hundred Hand Slap?", choices: ["E. Honda","Hakan","Birdie","Abigail"], correct: 0 },
  { question: "Who is the Russian wrestler famous for his Spinning Piledriver?", choices: ["Zangief","Birdie","Alex","Hugo"], correct: 0 },
  { question: "What red-clad Spanish matador-clawed fighter often jumps off the cage wall?", choices: ["Vega","Balrog","Birdie","F.A.N.G"], correct: 0 },
  { question: "What boxer character is known internationally as Balrog and uses what kind of moves?", choices: ["Boxing punches like Dash Straight","Sonic Booms","Hadoukens","Psycho Crushers"], correct: 0 },
  { question: "Who is the purple-clad dictator and main villain of Street Fighter II?", choices: ["M. Bison (Vega in Japan)","Sagat","Akuma","Gill"], correct: 0 },
  { question: "What signature move launches Bison forward in a crackling charge?", choices: ["Psycho Crusher","Hadouken","Sonic Boom","Tiger Knee"], correct: 0 },
  { question: "Who is the eyepatched Muay Thai king of Street Fighter II?", choices: ["Sagat","Adon","Birdie","M. Bison"], correct: 0 },
  { question: "What dark, satsui-no-hadou-fueled rival to Ryu shouts \"Messatsu\"?", choices: ["Akuma (Gouki)","Evil Ryu","Oni","Bison"], correct: 0 },
  { question: "Which 2008 sequel revived the franchise with HD 2D fighting?", choices: ["Street Fighter IV","Street Fighter III","Street Fighter V","Street Fighter 6"], correct: 0 },
  { question: "Which 2016 PS4/PC entry continued the modern series with the V-Trigger system?", choices: ["Street Fighter V","Street Fighter IV","Street Fighter 6","Marvel vs. Capcom 4"], correct: 0 },
  { question: "Which 2023 entry added the Drive system and World Tour mode?", choices: ["Street Fighter 6","Street Fighter V","Street Fighter IV","Tekken 8"], correct: 0 },
  { question: "Which 1994 live-action Street Fighter film starred Jean-Claude Van Damme as Guile?", choices: ["Street Fighter (1994)","The Legend of Chun-Li","Street Fighter II: The Animated Movie","Street Fighter Assassin's Fist"], correct: 0 },
  { question: "Which Capcom crossover series pairs SF cast with Marvel heroes?", choices: ["Marvel vs. Capcom","SNK vs. Capcom","Tatsunoko vs. Capcom","Capcom Fighting Evolution"], correct: 0 },
  { question: "Which producer led Street Fighter IV and V development at Capcom?", choices: ["Yoshinori Ono","Takayuki Nakayama","Hideaki Itsuno","Akira Yasuda"], correct: 0 },
  { question: "Which character debuted in Street Fighter Alpha as Guile's ally and is named what?", choices: ["Charlie Nash","Cody","Guy","Rolento"], correct: 0 },
  { question: "Which Street Fighter game introduced parries with characters like Yun and Q?", choices: ["Street Fighter III: Third Strike","Street Fighter II Turbo","Street Fighter Alpha 3","Street Fighter EX"], correct: 0 },
  { question: "Which female fighter from England wields a delta-formation knife/shield 'Killer Bee' move?", choices: ["Cammy","Chun-Li","Karin","Juri"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: StreetfighterSettings): StreetfighterState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: StreetfighterState, action: StreetfighterAction): StreetfighterState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: StreetfighterState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
