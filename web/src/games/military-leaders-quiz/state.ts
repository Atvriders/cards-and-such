import { mulberry32 } from "../../platform/game-plugin/useSeededRng.js";

export interface QuizQuestion { question: string; choices: [string,string,string,string]; correct: 0|1|2|3; }
export interface MilLeadersState { questions: QuizQuestion[]; currentIndex: number; selected: number|null; submitted: boolean; timeLeft: number; score: number; correctCount: number; phase: "playing"|"result"|"done"; }
export type MilLeadersAction = { type:"select"; choice:number } | { type:"submit" } | { type:"next" } | { type:"tick" };
export interface MilLeadersSettings { questions: "10"|"20"|"30"; }

const ALL_Q: QuizQuestion[] = [
  { question:"Which general won the Battle of Waterloo against Napoleon?", choices:["Horatio Nelson","Arthur Wellesley (Wellington)","Gebhard von Blücher","John Churchill"], correct:1 },
  { question:"Napoleon Bonaparte was emperor of which country?", choices:["Spain","France","Prussia","Austria"], correct:1 },
  { question:"Which Carthaginian general crossed the Alps with elephants?", choices:["Scipio","Hannibal","Hamilcar","Hasdrubal"], correct:1 },
  { question:"Alexander the Great was king of which kingdom?", choices:["Athens","Persia","Macedon","Sparta"], correct:2 },
  { question:"Which Chinese military strategist wrote The Art of War?", choices:["Cao Cao","Sun Tzu","Zhuge Liang","Wu Qi"], correct:1 },
  { question:"Julius Caesar was assassinated in which year BC?", choices:["63 BC","44 BC","31 BC","55 BC"], correct:1 },
  { question:"Which Mongol ruler created the largest contiguous empire?", choices:["Kublai Khan","Timur","Genghis Khan","Ögedei Khan"], correct:2 },
  { question:"Which American general commanded Allied forces in Europe in WWII?", choices:["George Patton","Douglas MacArthur","Dwight D. Eisenhower","Omar Bradley"], correct:2 },
  { question:"Erwin Rommel was nicknamed?", choices:["The Iron Duke","The Desert Fox","The Red Baron","The Tiger"], correct:1 },
  { question:"Which Japanese admiral planned the attack on Pearl Harbor?", choices:["Tojo Hideki","Yamamoto Isoroku","Nagumo Chuichi","Kurita Takeo"], correct:1 },
  { question:"Which general led American forces in the Pacific in WWII?", choices:["Chester Nimitz","Douglas MacArthur","William Halsey","Raymond Spruance"], correct:1 },
  { question:"The Battle of Gettysburg was a turning point for which side?", choices:["Confederate","Union","British","Mexican"], correct:1 },
  { question:"Ulysses S. Grant was commanding general of which army?", choices:["Confederate Army","Union Army","British Army","French Army"], correct:1 },
  { question:"Stonewall Jackson served which side in the Civil War?", choices:["Union","Confederate","British","Mexican"], correct:1 },
  { question:"Which general led the Long March in China in 1934-35?", choices:["Chiang Kai-shek","Mao Zedong","Zhu De","Lin Biao"], correct:1 },
  { question:"Which commander defeated the Persian fleet at Salamis in 480 BC?", choices:["Leonidas","Themistocles","Pericles","Miltiades"], correct:1 },
  { question:"Georgy Zhukov was a marshal of which country?", choices:["Germany","USA","Soviet Union","Britain"], correct:2 },
  { question:"Which Ottoman sultan conquered Constantinople in 1453?", choices:["Suleiman the Magnificent","Mehmed II","Selim I","Bayezid II"], correct:1 },
  { question:"Which Norse explorer is credited with reaching North America around 1000 AD?", choices:["Erik the Red","Leif Erikson","Ragnar Lothbrok","Bjorn Ironside"], correct:1 },
  { question:"Which English admiral defeated the Spanish Armada in 1588?", choices:["Walter Raleigh","Francis Drake","John Hawkins","Richard Grenville"], correct:1 },
  { question:"Which Spartan king led 300 warriors at Thermopylae?", choices:["Agesilaus","Cleomenes","Leonidas","Lysander"], correct:2 },
  { question:"Which general burned Atlanta during the American Civil War?", choices:["Ulysses Grant","William Sherman","George McClellan","Philip Sheridan"], correct:1 },
  { question:"Khalid ibn al-Walid was an undefeated general serving which faith?", choices:["Byzantine Christianity","Islam","Zoroastrianism","Persian Empire"], correct:1 },
  { question:"Which Roman general defeated Hannibal at the Battle of Zama?", choices:["Julius Caesar","Scipio Africanus","Marcus Crassus","Pompey"], correct:1 },
  { question:"Which Vietnamese general defeated the French at Dien Bien Phu in 1954?", choices:["Ho Chi Minh","Vo Nguyen Giap","Ngo Dinh Diem","Le Duan"], correct:1 },
  { question:"Duke of Marlborough won famous victories during which war?", choices:["Seven Years War","War of Spanish Succession","Napoleonic Wars","Thirty Years War"], correct:1 },
  { question:"Which general commanded the D-Day landings at Normandy?", choices:["Patton","Bradley","Eisenhower","Montgomery"], correct:2 },
  { question:"Which Prussian general reformed the army and influenced modern military theory?", choices:["Bismarck","Clausewitz","Moltke the Elder","Frederick the Great"], correct:2 },
  { question:"Which admiral was killed at the Battle of Trafalgar in 1805?", choices:["Horatio Nelson","George Rodney","John Jervis","Edward Hawke"], correct:0 },
  { question:"Which Israeli general became a military hero in the Six-Day War?", choices:["Moshe Dayan","Ariel Sharon","Yitzhak Rabin","David Elazar"], correct:0 },
];

function shuffle<T>(arr:T[], rng:()=>number):T[] { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];} return a; }

export function initialState(seed:number, settings:MilLeadersSettings):MilLeadersState {
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

export function reducer(state:MilLeadersState, action:MilLeadersAction):MilLeadersState {
  if(state.phase==="done") return state;
  switch(action.type){
    case"select": if(state.submitted) return state; return {...state,selected:action.choice};
    case"submit":{
      if(state.submitted||state.selected===null) return state;
      const q=state.questions[state.currentIndex]!;
      const ok=state.selected===q.correct;
      const pts=ok?100+Math.floor(state.timeLeft*10):0;
      return {...state,submitted:true,score:state.score+pts,correctCount:state.correctCount+(ok?1:0),phase:"result"};
    }
    case"tick":{
      if(state.submitted) return state;
      const t=state.timeLeft-1;
      if(t<=0) return {...state,timeLeft:0,submitted:true,phase:"result"};
      return {...state,timeLeft:t};
    }
    case"next":{
      const next=state.currentIndex+1;
      if(next>=state.questions.length) return {...state,phase:"done"};
      return {...state,currentIndex:next,selected:null,submitted:false,timeLeft:15,phase:"playing"};
    }
    default: return state;
  }
}

export function isTerminal(state:MilLeadersState):{score:number}|null {
  return state.phase==="done"?{score:state.score}:null;
}
