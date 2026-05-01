import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface OneHitWondersQuizSettings { questions: "10" | "20" | "30"; }
export interface OneHitWondersQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type OneHitWondersQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "'Macarena' was performed by?", choices: ["Los del Río","Daddy Yankee","Ricky Martin","Enrique Iglesias"], correct: 0 },
  { question: "'Take On Me' (1985) is by which Norwegian band?", choices: ["a-ha","Aqua","Roxette","Ace of Base"], correct: 0 },
  { question: "'Tubthumping' is by which band?", choices: ["Chumbawamba","The Verve","Cornershop","Republica"], correct: 0 },
  { question: "'I'm Too Sexy' is by?", choices: ["Right Said Fred","MARRS","EMF","Snap!"], correct: 0 },
  { question: "'What Is Love' is by Trinidadian-German singer?", choices: ["Haddaway","Dr. Alban","Amber","Eiffel 65"], correct: 0 },
  { question: "'Mambo No. 5' was a 1999 hit for?", choices: ["Lou Bega","Ricky Martin","Marc Anthony","Mark Ronson"], correct: 0 },
  { question: "'Who Let the Dogs Out' is by?", choices: ["Baha Men","Outkast","Crazy Town","Smash Mouth"], correct: 0 },
  { question: "'Closing Time' is by?", choices: ["Semisonic","Third Eye Blind","Eve 6","Better Than Ezra"], correct: 0 },
  { question: "'How Bizarre' is by?", choices: ["OMC","Bran Van 3000","Toy-Box","BBMak"], correct: 0 },
  { question: "'Steal My Sunshine' is by?", choices: ["Len","Vitamin C","Eiffel 65","Tal Bachman"], correct: 0 },
  { question: "'Walking on Sunshine' is by?", choices: ["Katrina and the Waves","Bananarama","Belinda Carlisle","Cyndi Lauper"], correct: 0 },
  { question: "'Come On Eileen' is by?", choices: ["Dexys Midnight Runners","The Specials","Madness","ABC"], correct: 0 },
  { question: "'99 Luftballons' is by?", choices: ["Nena","Falco","Alphaville","Boney M"], correct: 0 },
  { question: "'I'm Gonna Be (500 Miles)' is by?", choices: ["The Proclaimers","Travis","Snow Patrol","James"], correct: 0 },
  { question: "'Barbie Girl' is by?", choices: ["Aqua","Eiffel 65","Cascada","ATC"], correct: 0 },
  { question: "'Achy Breaky Heart' is by?", choices: ["Billy Ray Cyrus","Garth Brooks","Alan Jackson","Travis Tritt"], correct: 0 },
  { question: "'Ice Ice Baby' is by?", choices: ["Vanilla Ice","MC Hammer","Tone Loc","Color Me Badd"], correct: 0 },
  { question: "'I Touch Myself' is by?", choices: ["Divinyls","Tracy Chapman","Sinead O'Connor","Cher"], correct: 0 },
  { question: "'Mickey' is by Toni?", choices: ["Basil","Braxton","Childs","Tennille"], correct: 0 },
  { question: "'Tainted Love' was a hit cover by?", choices: ["Soft Cell","Marilyn Manson","Gloria Jones","Pulp"], correct: 0 },
  { question: "\"Spirit in the Sky\" (1969) is by?", choices: ["Norman Greenbaum","Three Dog Night","Steppenwolf","CCR"], correct: 0 },
  { question: "\"Video Killed the Radio Star\" is by?", choices: ["The Buggles","Trevor Horn","Soft Cell","OMD"], correct: 0 },
  { question: "\"Save Tonight\" is by?", choices: ["Eagle-Eye Cherry","Tal Bachman","Jakob Dylan","Neneh Cherry"], correct: 0 },
  { question: "\"Cotton Eye Joe\" (1995) is by?", choices: ["Rednex","Vengaboys","Dr. Alban","Aqua"], correct: 0 },
  { question: "\"You Get What You Give\" is by?", choices: ["New Radicals","Sugar Ray","Marcy Playground","Cake"], correct: 0 },
  { question: "\"Pumped Up Kicks\" is by?", choices: ["Foster the People","MGMT","Phoenix","Vampire Weekend"], correct: 0 },
  { question: "\"Lump\" (1995) is by?", choices: ["Presidents of the USA","The Refreshments","Better Than Ezra","Spin Doctors"], correct: 0 },
  { question: "\"Breakfast at Tiffany's\" is by?", choices: ["Deep Blue Something","Marcy Playground","Better Than Ezra","Sister Hazel"], correct: 0 },
  { question: "\"All Star\" is by?", choices: ["Smash Mouth","Sugar Ray","Eve 6","Lit"], correct: 0 },
  { question: "\"Somebody That I Used to Know\" is by Gotye featuring?", choices: ["Kimbra","Lana Del Rey","Sia","Ellie Goulding"], correct: 0 }
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: OneHitWondersQuizSettings): OneHitWondersQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: OneHitWondersQuizState, action: OneHitWondersQuizAction): OneHitWondersQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: OneHitWondersQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
