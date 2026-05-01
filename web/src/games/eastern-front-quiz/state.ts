import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface EasternFrontQuizSettings { questions: "10" | "20" | "30"; }
export interface EasternFrontQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type EasternFrontQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was Germany's June 1941 invasion of USSR called?", choices: ["Operation Barbarossa","Operation Sea Lion","Operation Citadel","Operation Typhoon"], correct: 0 },
  { question: "In what year did Operation Barbarossa begin?", choices: ["1939","1940","1941","1942"], correct: 2 },
  { question: "What 1942-43 battle was the war's bloodiest?", choices: ["Kursk","Stalingrad","Moscow","Leningrad"], correct: 1 },
  { question: "Who commanded German forces at Stalingrad?", choices: ["Paulus","Manstein","Rommel","Guderian"], correct: 0 },
  { question: "What Soviet general led at Stalingrad?", choices: ["Zhukov","Chuikov","Vasilevsky","Rokossovsky"], correct: 1 },
  { question: "What 1943 tank battle is the largest in history?", choices: ["Kursk","Prokhorovka","Stalingrad","Moscow"], correct: 0 },
  { question: "What German operation was the 1943 Kursk attack?", choices: ["Citadel","Blau","Fall Gelb","Marita"], correct: 0 },
  { question: "What Soviet city endured 872-day siege?", choices: ["Moscow","Leningrad","Stalingrad","Kyiv"], correct: 1 },
  { question: "What soviet general was 'savior of Moscow' in 1941?", choices: ["Zhukov","Stalin","Vasilevsky","Konev"], correct: 0 },
  { question: "What was the iconic Soviet T-34's main asset?", choices: ["Sloped armor","Speed","Numbers","All three"], correct: 3 },
  { question: "What name for Soviet rocket artillery?", choices: ["Katyusha","Stalin Organ","Both","Nebelwerfer"], correct: 2 },
  { question: "What was the 1944 Soviet summer offensive that crushed Army Group Center?", choices: ["Bagration","Uranus","Saturn","Mars"], correct: 0 },
  { question: "What tactic did Stalin use against Germany's deep advances?", choices: ["Scorched earth","Blitz","Trench","Maginot"], correct: 0 },
  { question: "What city did Soviets capture last in 1945?", choices: ["Berlin","Vienna","Prague","Warsaw"], correct: 0 },
  { question: "What Soviet marshal led capture of Berlin?", choices: ["Zhukov","Konev","Rokossovsky","All commanded fronts"], correct: 3 },
  { question: "What was Hitler's ultimate target city in his 1941 plan?", choices: ["Moscow","Leningrad","Stalingrad","Astrakhan"], correct: 0 },
  { question: "What German tank was the heaviest used in numbers?", choices: ["Tiger I","Panther","Tiger II","Panzer IV"], correct: 3 },
  { question: "What Soviet leader signed nonaggression with Germany 1939?", choices: ["Lenin","Stalin","Trotsky","Molotov-Ribbentrop"], correct: 3 },
  { question: "What 1939 pact divided Eastern Europe?", choices: ["Molotov-Ribbentrop Pact","Munich Pact","Anti-Comintern","Tripartite"], correct: 0 },
  { question: "What was the term for German racial-extermination policy in the East?", choices: ["Generalplan Ost","Lebensraum","Final Solution","All related"], correct: 3 },
  { question: "What 1944 Polish uprising failed?", choices: ["Warsaw Uprising","Krakow Uprising","Wroclaw Uprising","Lodz Uprising"], correct: 0 },
  { question: "What partisan groups fought in occupied USSR?", choices: ["Soviet Partisans","Hashomer","Polish Home Army","All resisted"], correct: 3 },
  { question: "What was the line of farthest German advance in 1942?", choices: ["Volga","Caucasus","Both","Don"], correct: 2 },
  { question: "What Soviet Marshal commanded throughout the war?", choices: ["Zhukov","Vasilevsky","Konev","All three did"], correct: 3 },
  { question: "How many Soviet citizens died approximately?", choices: ["10 million","20-27 million","5 million","40 million"], correct: 1 },
  { question: "What German general advised retreat from Stalingrad pocket?", choices: ["Manstein","Paulus","Hoth","Halder"], correct: 0 },
  { question: "What tank offensive in summer 1942 reached the Volga?", choices: ["Case Blue","Operation Typhoon","Operation Citadel","Operation Mars"], correct: 0 },
  { question: "What 1941-42 winter forced German halt at Moscow?", choices: ["Lack of winter gear","Soviet counterattack","Both","Heavy losses already"], correct: 2 },
  { question: "What German group besieged Leningrad?", choices: ["Army Group North","Army Group Center","Army Group South","Army Group A"], correct: 0 },
  { question: "What 1945 meeting on Elbe River occurred?", choices: ["U.S. and Soviet linkup","Yalta","Potsdam","Tehran"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: EasternFrontQuizSettings): EasternFrontQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: EasternFrontQuizState, action: EasternFrontQuizAction): EasternFrontQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: EasternFrontQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
