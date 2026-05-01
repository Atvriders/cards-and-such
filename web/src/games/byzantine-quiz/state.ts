import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";
export interface QuizQuestion { question: string; choices: [string, string, string, string]; correct: 0 | 1 | 2 | 3; }
export interface ByzantineQuizSettings { questions: "10" | "20" | "30"; }
export interface ByzantineQuizState { questions: QuizQuestion[]; currentIndex: number; selected: number | null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing" | "result" | "done"; }
export type ByzantineQuizAction = { type: "select"; choice: number } | { type: "submit" } | { type: "next" } | { type: "tick" };
const ALL_QUESTIONS: QuizQuestion[] = [
  { question: "What was the Byzantine Empire's capital?", choices: ["Constantinople","Rome","Antioch","Thessalonica"], correct: 0 },
  { question: "Who founded Constantinople in 330 AD?", choices: ["Constantine the Great","Diocletian","Theodosius","Justinian"], correct: 0 },
  { question: "In what year did Constantinople fall to the Ottomans?", choices: ["1204","1453","1492","1522"], correct: 1 },
  { question: "Who was the most famous Byzantine emperor (527-565)?", choices: ["Justinian I","Constantine","Heraclius","Basil II"], correct: 0 },
  { question: "What was Justinian's legal compilation called?", choices: ["Corpus Juris Civilis","Digest","Novellae","Codex"], correct: 0 },
  { question: "What famous church did Justinian build?", choices: ["Hagia Sophia","St. Peter's","St. Mark's","Notre Dame"], correct: 0 },
  { question: "Who was Justinian's empress and political partner?", choices: ["Theodora","Irene","Helena","Pulcheria"], correct: 0 },
  { question: "What major Byzantine general expanded the empire under Justinian?", choices: ["Belisarius","Narses","Both","Theodoric"], correct: 2 },
  { question: "What schism in 1054 separated the Byzantine church from Rome?", choices: ["Great Schism","East-West Schism","Both terms","Filioque schism"], correct: 2 },
  { question: "What language did the Byzantines mostly speak?", choices: ["Greek","Latin","Aramaic","Persian"], correct: 0 },
  { question: "What religious image controversy hit Byzantium 8th-9th c.?", choices: ["Iconoclasm","Arianism","Monophysitism","Pelagianism"], correct: 0 },
  { question: "What was the Byzantine secret weapon at sea?", choices: ["Greek fire","Catapult","Trireme","Cannon"], correct: 0 },
  { question: "What tribe sacked Rome but was defeated by Belisarius in Italy?", choices: ["Ostrogoths","Visigoths","Vandals","All defeated by Byzantines"], correct: 3 },
  { question: "What Russian state was Christianized from Byzantium in 988?", choices: ["Kievan Rus","Novgorod","Moscow","All later"], correct: 0 },
  { question: "What ruler oversaw conversion of Kievan Rus to Christianity?", choices: ["Vladimir the Great","Yaroslav","Olga","Igor"], correct: 0 },
  { question: "Who saw to the conversion of the Slavs and brought them Cyrillic alphabet?", choices: ["Cyril and Methodius","Constantine","Basil","John Chrysostom"], correct: 0 },
  { question: "What 1071 battle was a Byzantine disaster against Seljuk Turks?", choices: ["Manzikert","Yarmouk","Kosovo","Pliska"], correct: 0 },
  { question: "What 1204 event devastated Byzantium?", choices: ["Fourth Crusade","First Crusade","Mongol Invasion","Plague"], correct: 0 },
  { question: "What dynasty ruled at empire's height?", choices: ["Macedonian","Komnenian","Palaiologos","Justinian"], correct: 0 },
  { question: "What emperor was nicknamed 'Bulgar-slayer'?", choices: ["Basil II","Constantine V","Leo III","Justinian II"], correct: 0 },
  { question: "What Byzantine emperor was last to rule before fall of Constantinople?", choices: ["Constantine XI","John VIII","Manuel II","Andronikos III"], correct: 0 },
  { question: "What was the Byzantine currency, often gold?", choices: ["Solidus / nomisma","Denarius","Drachma","Ducat"], correct: 0 },
  { question: "What was a Byzantine theme?", choices: ["Military and administrative province","Hymn type","Religious order","Tax form"], correct: 0 },
  { question: "What art style is associated with Byzantium?", choices: ["Mosaic","Fresco","Both","Sculpture"], correct: 2 },
  { question: "What sea did Byzantium control most heavily?", choices: ["Mediterranean and Aegean","Black","Both","Caspian"], correct: 2 },
  { question: "What Byzantine title meant 'first among emperors'?", choices: ["Basileus","Augustus","Imperator","Despotes"], correct: 0 },
  { question: "What was the bureaucratic class called?", choices: ["Logothetes / civil servants","Senators","Tribunes","Strategos"], correct: 0 },
  { question: "What was iconography in Byzantine art?", choices: ["Religious icon painting","Map making","Statuary","Calligraphy"], correct: 0 },
  { question: "What Renaissance was sparked by Greek scholars fleeing 1453?", choices: ["Italian Renaissance had Byzantine influence","Northern","Carolingian","Macedonian"], correct: 0 },
  { question: "What's the Byzantine successor state 1204-1261?", choices: ["Empire of Nicaea","Trebizond","Both with Epirus","Both Nicaea and Trebizond"], correct: 2 },
];
function shuffle<T>(arr: T[], rng: () => number): T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a; }
export function initialState(seed: number, settings: ByzantineQuizSettings): ByzantineQuizState {
  const rng=mulberry32(seed); const count=parseInt(settings.questions,10);
  const pool=shuffle([...ALL_QUESTIONS],rng).slice(0,Math.min(count,ALL_QUESTIONS.length));
  const questions=pool.map(q=>{const idx=q.choices.map((c,i)=>({c,i}));const s=shuffle(idx,rng);const nc=s.findIndex(x=>x.i===q.correct) as 0|1|2|3;return{...q,choices:s.map(x=>x.c) as [string,string,string,string],correct:nc};});
  return{questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}
export function reducer(state: ByzantineQuizState, action: ByzantineQuizAction): ByzantineQuizState {
  if(state.phase==="done")return state;
  switch(action.type){
    case"select":return state.submitted?state:{...state,selected:action.choice};
    case"submit":{if(state.submitted||state.selected===null)return state;const q=state.questions[state.currentIndex]!;const ok=state.selected===q.correct;const pts=ok?100+Math.floor(state.timeLeft*10):0;return{...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};}
    case"tick":{if(state.submitted)return state;const t=state.timeLeft-1;return t<=0?{...state,timeLeft:0,submitted:true,phase:"result"}:{...state,timeLeft:t};}
    case"next":{const ni=state.currentIndex+1;return ni>=state.questions.length?{...state,phase:"done"}:{...state,currentIndex:ni,selected:null,submitted:false,timeLeft:15,phase:"playing"};}
    default:return state;
  }
}
export function isTerminal(state: ByzantineQuizState): { score: number } | null { return state.phase==="done"?{score:state.score}:null; }
