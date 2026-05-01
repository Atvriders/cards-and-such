import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface MongolEmpireQuizSettings { questions: "10" | "20" | "30"; }
export interface MongolEmpireQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type MongolEmpireQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "Who founded the Mongol Empire?", choices: ["Genghis Khan","Kublai Khan","Ogedei","Subutai"], correct: 0 },
  { question: "What was Genghis Khan's birth name?", choices: ["Temujin","Borjigin","Bortei","Tolui"], correct: 0 },
  { question: "In what year was Genghis Khan proclaimed Khan?", choices: ["1200","1206","1215","1227"], correct: 1 },
  { question: "What grandson of Genghis Khan founded the Yuan dynasty in China?", choices: ["Kublai Khan","Mongke Khan","Ogedei","Hulagu"], correct: 0 },
  { question: "What Asian dynasty did Mongols establish in China?", choices: ["Yuan","Song","Ming","Qing"], correct: 0 },
  { question: "What Mongol general burned Baghdad in 1258?", choices: ["Hulagu Khan","Subutai","Jebe","Batu"], correct: 0 },
  { question: "What 1241 event saw Mongol invasion of Hungary and Poland?", choices: ["European invasion","Crusades","Polish-Hungarian War","Eastern Wars"], correct: 0 },
  { question: "What Mongol general led the European campaign?", choices: ["Subutai","Batu","Both","Jebe"], correct: 2 },
  { question: "What khanate ruled Russia and parts of Eastern Europe?", choices: ["Golden Horde","Ilkhanate","Chagatai","Yuan"], correct: 0 },
  { question: "What khanate ruled Persia/Iran?", choices: ["Ilkhanate","Golden Horde","Chagatai","Yuan"], correct: 0 },
  { question: "What khanate ruled Central Asia?", choices: ["Chagatai","Golden Horde","Ilkhanate","Yuan"], correct: 0 },
  { question: "What 1260 battle stopped Mongol westward expansion?", choices: ["Ain Jalut","Mohi","Wahlstatt","Kalka"], correct: 0 },
  { question: "What Egyptian dynasty defeated Mongols at Ain Jalut?", choices: ["Mamluk","Ayyubid","Fatimid","Abbasid"], correct: 0 },
  { question: "What writing system did Mongols develop?", choices: ["Mongol script (vertical)","Phags-pa","Both","Arabic"], correct: 2 },
  { question: "What was the Mongol code of law?", choices: ["Yassa","Sharia","Kanun","Pax Mongolica"], correct: 0 },
  { question: "What term describes Mongol-era trade safety?", choices: ["Pax Mongolica","Silk Road peace","Both","Mongol Peace"], correct: 2 },
  { question: "What Italian traveler visited Kublai Khan's court?", choices: ["Marco Polo","Ibn Battuta","Friar Odoric","Cristoforo Colombo"], correct: 0 },
  { question: "What weapon was central to Mongol warfare?", choices: ["Composite recurve bow","Pike","Crossbow","Sword"], correct: 0 },
  { question: "What was a Mongol military unit of 10,000?", choices: ["Tumen","Mingghan","Jagun","Arban"], correct: 0 },
  { question: "What was Genghis Khan's capital?", choices: ["Karakorum","Beijing","Samarkand","Khanbaliq"], correct: 0 },
  { question: "What was Kublai Khan's capital?", choices: ["Khanbaliq (Beijing)","Karakorum","Xanadu","Both Khanbaliq main"], correct: 0 },
  { question: "What's the legendary summer capital of Kublai Khan?", choices: ["Xanadu (Shangdu)","Karakorum","Beijing","Samarkand"], correct: 0 },
  { question: "What Mongol tactic involved feigned retreat?", choices: ["Fake retreat to ambush","Wedge","Crescent","Pincer"], correct: 0 },
  { question: "What civilization did Mongols destroy in Central Asia in 1219-21?", choices: ["Khwarazm","Persia","Seljuk","Bukharan"], correct: 0 },
  { question: "What Russian leader famously paid tribute then later defeated Mongols?", choices: ["Dmitri Donskoi","Ivan III ended tribute","Both","Alexander Nevsky"], correct: 2 },
  { question: "What 1380 battle saw Russian victory over Mongols?", choices: ["Kulikovo","Borodino","Poltava","Kalka"], correct: 0 },
  { question: "What 1480 event ended the Mongol Yoke on Russia?", choices: ["Great Stand on Ugra","Kulikovo","Khazaria","Igor's Campaign"], correct: 0 },
  { question: "In what year did Genghis Khan die?", choices: ["1206","1227","1241","1259"], correct: 1 },
  { question: "What was the Silk Road?", choices: ["Trade route across Eurasia","River","Mongol palace road","City road"], correct: 0 },
  { question: "What was a yurt?", choices: ["Mongol tent dwelling","Mongol weapon","War flag","Drink"], correct: 0 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: MongolEmpireQuizSettings): MongolEmpireQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: MongolEmpireQuizState, action: MongolEmpireQuizAction): MongolEmpireQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: MongolEmpireQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
