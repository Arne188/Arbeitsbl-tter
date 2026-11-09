(function (root) {
 'use strict';
 const SUBJECT='franzoesisch-klasse6', KEY='bonjour-franzoesisch-klasse6-v1', SCHEMA=1;
 const normalise=value=>String(value??'').normalize('NFC').replace(/[‘’ʼ`]/g,"'").replace(/\s+/g,' ').trim().toLocaleLowerCase('fr');
 const emptyExam=()=>({draft:{},submitted:false,self:[]});
 function freshState(){const m1=emptyExam();return {schema:SCHEMA,subject:SUBJECT,contentVersion:2,route:'#home',read:{},answers:{},exam:m1,exams:{m1}};}
 const valuePresent=value=>Array.isArray(value)?value.length>0:typeof value==='number'||(typeof value==='string'&&value.trim().length>0);
 function isAnswered(q,value){
  if(q.type==='slots')return Array.isArray(value)&&value.length===q.slots.length&&value.every((v,i)=>Number.isInteger(v)&&v>=0&&v<q.slots[i].options.length);
  if(q.type==='build')return Array.isArray(value)&&value.length===q.tokens.length&&new Set(value).size===value.length&&value.every(v=>Number.isInteger(v)&&v>=0&&v<q.tokens.length);
  if(q.type==='choice')return Number.isInteger(value)&&value>=0&&value<q.options.length;
  return typeof value==='string'&&value.trim().length>0;
 }
 function evaluate(q,value){
  if(q.type==='open') return {correct:null,message:'Offene Aufgabe: Vergleiche deinen Text anhand der Kriterien.'};
  if(!isAnswered(q,value)) return {correct:false,message:'Ergänze zuerst alle Teile deiner Antwort.'};
  let correct=false;
  if(q.type==='choice')correct=Number.isInteger(value)&&value===q.answer;
  if(q.type==='build')correct=Array.isArray(value)&&value.length===q.solution.length&&value.every((v,i)=>q.tokens[v]===q.solution[i]);
  if(q.type==='short')correct=q.answers.some(a=>normalise(a)===normalise(value));
  if(q.type==='slots')correct=q.slots.every((s,i)=>value[i]===s.answer);
  if(correct)return {correct:true,message:q.why};
  let message='Prüfe deine Antwort noch einmal. '+(q.type==='build'?'Achte auf Reihenfolge und Gesprächsrolle.':q.type==='short'?'Die erwartete Fassung passt noch nicht. Achte auch auf Apostrophe und Akzente.':'Welche Information und welche Gesprächsrolle passen?');
  if(q.type==='choice'&&q.errors?.[value])message=q.errors[value];
  if(q.type==='short')for(const m of q.mistakes||[]){if(normalise(value).includes(normalise(m.includes))){message=m.message;break;}}
  if(q.type==='slots'){const wrong=q.slots.find((s,i)=>value[i]!==s.answer);message='Prüfe den Teil „'+wrong.label+'“. Nutze Anzahl, Genus und Wortanfang aus der Hilfe.';}
  return {correct:false,message};
 }
 function recordAttempt(q,previous={},value){
  const result=evaluate(q,value),attempts=(previous.attempts||0)+1;
  return {...previous,value,attempts,checked:true,correct:result.correct,firstTry:attempts===1&&result.correct===true,hadError:previous.hadError||result.correct===false};
 }
 function lessonStatus(lesson,state){
  const records=lesson.check.map(q=>state.answers[q.id]);
  if(records.every(r=>r?.correct===true&&r.checked&&!r.hints&&!r.revealed&&r.firstTry))return {label:'Ohne Hilfe geprüft',kind:'secure'};
  if(records.every(r=>r?.correct===true&&r.checked))return {label:'Geprüft · nach Hilfe oder Korrektur',kind:'assisted'};
  if(records.some(r=>r?.hadError||r?.revealed))return {label:'Wiederholen empfohlen',kind:'review'};
  if(state.read[lesson.id])return {label:'Erklärung gelesen',kind:'read'};
  if([lesson.discover,...lesson.practice,lesson.transfer,...lesson.check].some(q=>state.answers[q.id]))return {label:'Begonnen',kind:'started'};
  return {label:'Noch offen',kind:'new'};
 }
 function gradeExam(exam,draft){
  const closed=exam.questions.filter(q=>q.type!=='open');
  const results=closed.map(q=>({id:q.id,lesson:q.lesson,...evaluate(q,draft[q.id])}));
  return {points:results.filter(r=>r.correct).length,max:closed.length,results,review:[...new Set(results.filter(r=>!r.correct).map(r=>r.lesson))]};
 }
 function cleanValue(value){
  if(typeof value==='string')return value.slice(0,12000);
  if(Number.isInteger(value)&&value>=0&&value<100)return value;
  if(Array.isArray(value)&&value.length<100&&value.every(v=>Number.isInteger(v)&&v>=-1&&v<100))return [...value];
  return '';
 }
 function validateSave(raw){
  if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Das ist keine gültige Lernstandsdatei.');
  if(raw.subject!==SUBJECT)throw Error('Diese Datei gehört nicht zum Französischkurs. Bitte wähle die Französisch-Sicherung.');
  if(raw.schema!==SCHEMA)throw Error('Diese Dateiversion wird noch nicht unterstützt. Dein bisheriger Stand wurde nicht verändert.');
  const state=freshState(),src=raw.state||raw;
  if(!src||typeof src!=='object'||!src.answers||typeof src.answers!=='object'||Array.isArray(src.answers))throw Error('In dieser Datei fehlen die Antwortdaten.');
  if(Object.keys(src.answers).length>2000)throw Error('Die Datei enthält zu viele Einträge.');
  const idPattern=/^(?:m\d+-(?:l\d+-(?:d|p\d+|t|c\d+)|e\d+)|mix\d+-e\d+)$/;
  for(const [id,r] of Object.entries(src.answers)){
   if(!idPattern.test(id)||!r||typeof r!=='object')continue;
   state.answers[id]={value:cleanValue(r.value),attempts:Math.min(999,Math.max(0,Math.floor(Number(r.attempts)||0))),hints:Math.min(2,Math.max(0,Math.floor(Number(r.hints)||0))),revealed:r.revealed===true,checked:r.checked===true,correct:r.correct===true?true:r.correct===false?false:null,firstTry:r.firstTry===true,hadError:r.hadError===true,compared:r.compared===true,self:Array.isArray(r.self)?r.self.filter(n=>Number.isInteger(n)&&n>=0&&n<20):[]};
  }
  for(const [id,read] of Object.entries(src.read||{}))if(/^m\d+-l\d+$/.test(id)&&read===true)state.read[id]=true;
  if(typeof src.route==='string'&&/^#(?:home|cards|about|exams|exam(?:\/(?:m\d+|mix\d+))?|module\/m\d+|lesson\/m\d+-l\d+\/[0-7])$/.test(src.route))state.route=src.route;
  const savedExams={...(src.exams&&typeof src.exams==='object'&&!Array.isArray(src.exams)?src.exams:{})};
  if(!savedExams.m1&&src.exam)savedExams.m1=src.exam;
  for(const [id,exam] of Object.entries(savedExams)){
   if(!/^(?:m\d+|mix\d+)$/.test(id)||!exam||typeof exam!=='object')continue;
   const clean=emptyExam();
   for(const [qid,value] of Object.entries(exam.draft||{}))if(qid.startsWith(id+'-e')&&/^(?:m\d+|mix\d+)-e\d+$/.test(qid))clean.draft[qid]=cleanValue(value);
   clean.submitted=exam.submitted===true;
   clean.self=Array.isArray(exam.self)?[...new Set(exam.self.filter(n=>Number.isInteger(n)&&n>=0&&n<20))]:[];
   state.exams[id]=clean;
  }
  state.exam=state.exams.m1;
  state.contentVersion=Number.isInteger(raw.contentVersion)?raw.contentVersion:1;
  return state;
 }
 function exportSave(state){return {schema:SCHEMA,subject:SUBJECT,contentVersion:2,savedAt:new Date().toISOString(),state};}
 function articleModel(card,plural){const article=plural?'les':card.elision?'l’':card.gender==='masculin'?'le':'la',noun=plural?card.plural:card.word;return {article,noun,phrase:article+(article==='l’'?'':' ')+noun};}
 function readStorage(storage){
  try{const raw=storage.getItem(KEY);return {state:raw?validateSave(JSON.parse(raw)):freshState(),error:null};}
  catch(e){return {state:freshState(),error:'Der gespeicherte Stand konnte nicht gelesen werden. Er wurde nicht überschrieben. Du kannst eine Sicherung laden oder einen neuen Stand ausdrücklich speichern.'};}
 }
 root.FrenchCore={SUBJECT,KEY,SCHEMA,normalise,emptyExam,freshState,valuePresent,isAnswered,evaluate,recordAttempt,lessonStatus,gradeExam,validateSave,exportSave,articleModel,readStorage};
})(globalThis);
