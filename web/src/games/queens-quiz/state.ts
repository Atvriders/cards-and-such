import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface QueensState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type QueensAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface QueensSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Which queen ruled England for 45 years and defeated the Spanish Armada?", choices:["Mary I","Anne","Elizabeth I","Victoria"], correct:2 },
  { question:"Queen Victoria's reign is called the?", choices:["Elizabethan era","Jacobean era","Victorian era","Edwardian era"], correct:2 },
  { question:"Cleopatra VII was the last pharaoh of which dynasty?", choices:["Ptolemaic","Ramessid","Saite","Thutmosid"], correct:0 },
  { question:"Which queen of Scotland was executed by Elizabeth I?", choices:["Mary Queen of Scots","Anne of Cleves","Catherine Howard","Jane Grey"], correct:0 },
  { question:"Nefertiti was the queen consort of which Egyptian pharaoh?", choices:["Ramesses II","Akhenaten","Tutankhamun","Amenhotep III"], correct:1 },
  { question:"Queen Isabella I of Castile sponsored the voyage of which explorer?", choices:["Vasco da Gama","Ferdinand Magellan","Christopher Columbus","Amerigo Vespucci"], correct:2 },
  { question:"Which queen was the first female pharaoh who ruled Egypt as king?", choices:["Nefertiti","Cleopatra","Hatshepsut","Nefertari"], correct:2 },
  { question:"Queen Anne united England and Scotland to form?", choices:["United Kingdom","Great Britain","British Empire","Commonwealth"], correct:1 },
  { question:"Which Anglo-Saxon queen led a revolt against the Romans in Britain?", choices:["Guinevere","Boudica","Ethelfleda","Aethelflaed"], correct:1 },
  { question:"Empress Wu Zetian was the only woman to rule China as?", choices:["Regent","Empress Dowager","Empress regnant (sole ruler)","Consort"], correct:2 },
  { question:"Catherine the Great expanded Russia's territory greatly — she was born in which country?", choices:["Russia","Prussia (Germany)","Austria","France"], correct:1 },
  { question:"Marie Antoinette was queen consort of which country?", choices:["Austria","Prussia","Spain","France"], correct:3 },
  { question:"Which queen of England was married to Henry VIII first?", choices:["Anne Boleyn","Catherine of Aragon","Jane Seymour","Anne of Cleves"], correct:1 },
  { question:"Empress Josephine was married to?", choices:["Louis XVI","Napoleon Bonaparte","Tsar Alexander I","Duke of Wellington"], correct:1 },
  { question:"Which British queen has had the longest reign in history?", choices:["Victoria","Elizabeth II","Anne","Mary II"], correct:1 },
  { question:"Zenobia was queen of which ancient empire?", choices:["Sassanid Persia","Palmyrene Empire","Byzantine Empire","Nabataean Kingdom"], correct:1 },
  { question:"Which Spartan queen's abduction triggered the Trojan War in mythology?", choices:["Penelope","Hecuba","Helen","Andromache"], correct:2 },
  { question:"Queen Liliuokalani was the last ruler of which kingdom?", choices:["Samoa","Tonga","Hawaii","Tahiti"], correct:2 },
  { question:"Njinga Mbande was a powerful queen of which African kingdom?", choices:["Zulu","Ndongo (Angola)","Kingdom of Dahomey","Ashanti"], correct:1 },
  { question:"Which ancient queen of Carthage is legendary for founding the city?", choices:["Sophonisba","Dido","Berenice","Asbyte"], correct:1 },
  { question:"Isabella of France was nicknamed the She-Wolf of?", choices:["Aragon","Castile","France","England"], correct:3 },
  { question:"Eleanor of Aquitaine was queen consort of both France and which other country?", choices:["England","Spain","Germany","Sicily"], correct:0 },
  { question:"Queen Ranavalona I ruled which island nation in the 19th century?", choices:["Ceylon","Madagascar","Maldives","Mauritius"], correct:1 },
  { question:"Which queen famously bathed in donkey milk to preserve youth?", choices:["Cleopatra","Messalina","Poppaea Sabina","Livia"], correct:2 },
  { question:"Athaliah was a queen who ruled which ancient kingdom?", choices:["Babylon","Judah","Egypt","Assyria"], correct:1 },
  { question:"Which Ethiopian queen visited King Solomon according to tradition?", choices:["Nefertiti","Makeda (Queen of Sheba)","Candace","Yodit"], correct:1 },
  { question:"Queen Tamara of Georgia (Caucasus) ruled in which century?", choices:["9th","11th","12th-13th","15th"], correct:2 },
  { question:"Anne Boleyn was the mother of which English queen?", choices:["Mary I","Elizabeth I","Jane Grey","Mary Queen of Scots"], correct:1 },
  { question:"Jadwiga was the first female monarch of which country?", choices:["Hungary","Poland","Bohemia","Lithuania"], correct:1 },
  { question:"Which queen said 'Let them eat cake' (though historians dispute this)?", choices:["Catherine de Medici","Anne of Austria","Marie Antoinette","Maria Theresa"], correct:2 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:QueensSettings):QueensState {
  const rng=mulberry32(seed);
  const count=parseInt(settings.questions,10);
  let pool=shuffle([...ALL_Q],rng).slice(0,Math.min(count,ALL_Q.length));
  const questions=pool.map(q=>{
    const idx=q.choices.map((c,i)=>({c,i}));
    const sh=shuffle(idx,rng);
    const newCorrect=sh.findIndex(x=>x.i===q.correct) as 0|1|2|3;
    return {...q,choices:sh.map(x=>x.c) as [string,string,string,string],correct:newCorrect};
  });
  return {questions,currentIndex:0,selected:null,submitted:false,timeLeft:15,score:0,correctCount:0,phase:"playing"};
}

export function reducer(state:QueensState, action:QueensAction):QueensState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{ if(state.submitted||state.selected===null) return state; const q=state.questions[state.currentIndex]!; const ok=state.selected===q.correct; const pts=ok?100+Math.floor(state.timeLeft*10):0; return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"}; }
    case"tick":{ if(state.submitted) return state; const t=state.timeLeft-1; if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"}; return {...state,timeLeft:t}; }
    case"next":{ const next=state.currentIndex+1; if(next>=state.questions.length) return {...state,phase:"done"}; return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"}; }
    default: return state;
  }
}

export function isTerminal(state:QueensState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
