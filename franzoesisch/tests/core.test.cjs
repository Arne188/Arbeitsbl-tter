const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const C=ctx.FrenchCore,D=ctx.FRENCH_COURSE,plain=x=>JSON.parse(JSON.stringify(x));
const all=D.lessons.flatMap(l=>[l.discover,...l.practice,l.transfer,...l.check]),ex=D.exam.questions,allExams=Object.values(D.exams).flatMap(e=>e.questions);
function answer(q){if(q.type==='choice')return q.answer;if(q.type==='short')return q.answers[0];if(q.type==='slots')return q.slots.map(s=>s.answer);if(q.type==='build')return q.solution.map(s=>q.tokens.indexOf(s));return q.sample;}
test('fourteen complete lessons, four checks and honest exercise counts',()=>{
 assert.equal(D.lessons.length,14);assert.equal(all.length,98);assert.equal(ex.length,10);assert.equal(D.modules.filter(m=>m.available).length,3);assert.equal(allExams.length,42);
 assert.equal(new Set([...all,...allExams].map(q=>q.id)).size,140);
 for(const l of D.lessons){assert.ok(l.explain.length>=4);assert.ok(l.explain.every(e=>e[0]&&e[1]));assert.equal(l.worked.steps.length,4);assert.equal(l.check.length,2);assert.ok(l.card.rule);}
});
test('every closed exercise accepts its authored solution and rejects an explicit wrong answer',()=>{
 for(const q of [...all,...allExams].filter(q=>q.type!=='open')){
  assert.equal(C.evaluate(q,answer(q)).correct,true,q.id);
  const wrong=q.type==='choice'?(q.answer+1)%q.options.length:q.type==='build'?[...answer(q)].reverse():q.type==='slots'?answer(q).map((v,i)=>i===0?(v+1)%q.slots[0].options.length:v):'Inhaltlich unpassend';
  assert.equal(C.evaluate(q,wrong).correct,false,q.id);
  if(q.type==='build')assert.deepEqual([...q.tokens].sort(),[...q.solution].sort());
 }
});
test('apostrophe variants and Unicode NFC work; accents remain significant',()=>{
 const q=ex.find(q=>q.id==='m1-e3');
 assert.equal(C.evaluate(q," Je m'appelle   Salome\u0301. ").correct,true);
 assert.equal(C.evaluate(q,"Je m'appelle Salome.").correct,false);
 assert.notEqual(C.normalise('ou'),C.normalise('où'));assert.notEqual(C.normalise('a'),C.normalise('à'));
});
test('common errors return a targeted hint without revealing every solution',()=>{
 const q=all.find(q=>q.id==='m1-l4-p3');
 assert.match(C.evaluate(q,'je suis').message,/Alter/);assert.match(C.evaluate(q,'je ai').message,/Apostroph/);
 const name=all.find(q=>q.id==='m1-l1-t');assert.match(C.evaluate(name,'Tu t’appelles Alex.').message,/ich/);
});
test('mastery status distinguishes first attempt, corrections, hints and read-only activity',()=>{
 const l=D.lessons[0],s=C.freshState();assert.equal(C.lessonStatus(l,s).kind,'new');s.read[l.id]=true;assert.equal(C.lessonStatus(l,s).kind,'read');
 for(const q of l.check)s.answers[q.id]=C.recordAttempt(q,{},answer(q));assert.equal(C.lessonStatus(l,s).kind,'secure');
 s.answers[l.check[0].id].hints=1;assert.equal(C.lessonStatus(l,s).kind,'assisted');
 const q=l.check[1];s.answers[q.id]=C.recordAttempt(q,{},(q.answer+1)%q.options.length);assert.equal(C.lessonStatus(l,s).kind,'review');
 s.answers[q.id]=C.recordAttempt(q,s.answers[q.id],answer(q));assert.equal(C.lessonStatus(l,s).kind,'assisted');assert.equal(s.answers[q.id].firstTry,false);
});
test('exam keeps open self-assessment separate and links errors to a lesson',()=>{
 const draft=Object.fromEntries(ex.map(q=>[q.id,answer(q)]));let grade=C.gradeExam(D.exam,draft);assert.equal(grade.points,9);assert.equal(grade.max,9);
 draft['m1-e1']=0;grade=C.gradeExam(D.exam,draft);assert.equal(grade.points,8);assert.deepEqual(plain(grade.review),['m1-l1']);
 assert.equal(C.evaluate(ex.find(q=>q.type==='open'),'different but possible text').correct,null);
});
test('save round-trip restores text, hints, sequence, unfinished exam and self-assessment',()=>{
 const s=C.freshState();s.answers['m1-l1-p3']={value:[2,1,0],attempts:1,hints:2,revealed:true,checked:true,correct:true,firstTry:false};s.answers['m1-l5-t']={value:'Mein eigener Dialog mit é und ç',compared:true,self:[0,2]};s.exam.draft['m1-e3']="Je m'appelle Salomé.";s.read['m1-l1']=true;s.route='#lesson/m1-l3/4';
 const restored=C.validateSave(JSON.parse(JSON.stringify(C.exportSave(s))));assert.deepEqual(plain(restored.answers['m1-l1-p3'].value),[2,1,0]);assert.equal(restored.answers['m1-l1-p3'].hints,2);assert.equal(restored.answers['m1-l5-t'].value,'Mein eigener Dialog mit é und ç');assert.equal(restored.exam.draft['m1-e3'],s.exam.draft['m1-e3']);assert.equal(restored.exam.submitted,false);assert.equal(restored.route,s.route);
});
test('module additions preserve stable IDs, including future module records',()=>{
 const s=C.freshState();s.answers['m1-l1-d']={value:1};s.answers['m2-l1-d']={value:0};s.read['m2-l1']=true;
 const restored=C.validateSave(C.exportSave(s));assert.equal(restored.answers['m1-l1-d'].value,1);assert.equal(restored.answers['m2-l1-d'].value,0);assert.equal(restored.read['m2-l1'],true);
});
test('foreign, future-schema and damaged saves are rejected without modifying current state',()=>{
 const s=C.freshState(),before=JSON.stringify(s);
 assert.throws(()=>C.validateSave({subject:'chemie',schema:1,state:s}),/nicht zum Französisch/);
 assert.throws(()=>C.validateSave({subject:C.SUBJECT,schema:99,state:s}),/Dateiversion/);
 assert.throws(()=>C.validateSave({subject:C.SUBJECT,schema:1,state:{}}),/Antwortdaten/);assert.equal(JSON.stringify(s),before);
 const malicious=C.exportSave(s);malicious.state.answers=JSON.parse('{"__proto__":{"polluted":true},"m1-l1-d":{"value":"safe"}}');const clean=C.validateSave(malicious);assert.equal(Object.hasOwn(clean.answers,'__proto__'),false);assert.equal({}.polluted,undefined);
});
test('unavailable or broken browser storage returns an explicit recoverable state',()=>{
 const broken=C.readStorage({getItem(){throw Error('denied');}});assert.ok(broken.error);assert.equal(broken.state.subject,C.SUBJECT);
 const corrupt=C.readStorage({getItem(){return '{broken';}});assert.ok(corrupt.error);
 assert.equal(C.readStorage({getItem(){return null;}}).error,null);
});
test('bundled offline page is self-contained and contains identical course code',()=>{
 const h=fs.readFileSync(path.join(root,'offline.html'),'utf8');assert.ok(!/<script[^>]+src=/.test(h));assert.ok(!/<link[^>]+stylesheet/.test(h));assert.ok(h.includes('Offline · Module 1–3'));
 for(const file of ['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','core.js'])assert.ok(h.includes(fs.readFileSync(path.join(root,file),'utf8')));
 for(const match of h.matchAll(/<script>([\s\S]*?)<\/script>/g))new vm.Script(match[1]);
});
test('real version-one save migrates M1 exam, confidence and open text without losing data',()=>{
 const legacy=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/m1-save-v1.json'),'utf8')),s=C.validateSave(legacy);
 assert.equal(s.exam,s.exams.m1);assert.equal(s.exams.m1.submitted,true);assert.deepEqual(plain(s.exams.m1.self),[0,2]);
 assert.equal(C.gradeExam(D.exams.m1,s.exams.m1.draft).points,9);assert.equal(C.lessonStatus(D.lessons[0],s).kind,'secure');
 assert.equal(s.answers['m1-l1-p3'].hints,1);assert.equal(s.answers['m1-l5-t'].value,legacy.state.answers['m1-l5-t'].value);assert.equal(s.route,'#exam');
 s.answers['m2-l1-d']={value:1};s.exams.m2=C.emptyExam();s.exams.m2.draft['m2-e1']=1;
 const again=C.validateSave(C.exportSave(s));assert.equal(C.gradeExam(D.exams.m1,again.exams.m1.draft).points,9);assert.equal(again.exams.m2.draft['m2-e1'],1);assert.equal(again.answers['m2-l1-d'].value,1);
});
test('four exam drafts and results remain isolated across save and reload',()=>{
 const s=C.freshState();
 for(const [key,e] of Object.entries(D.exams))s.exams[key]={draft:Object.fromEntries(e.questions.map(q=>[q.id,answer(q)])),submitted:key!=='m2',self:key==='m2'?[]:[0,1]};
 s.exam=s.exams.m1;const r=C.validateSave(C.exportSave(s));
 for(const [key,e] of Object.entries(D.exams)){assert.equal(C.gradeExam(e,r.exams[key].draft).points,e.questions.filter(q=>q.type!=='open').length);assert.equal(r.exams[key].submitted,key!=='m2');assert.ok(Object.keys(r.exams[key].draft).every(id=>id.startsWith(key+'-e')));}
 r.exams.m2=C.emptyExam();assert.equal(C.gradeExam(D.exams.m1,r.exams.m1.draft).points,9);assert.equal(r.exams.mix1.submitted,true);assert.deepEqual(plain(r.exams.m3.self),[0,1]);
});
test('slot answers preserve duplicate indices and incomplete selections without claiming completion',()=>{
 const q=all.find(q=>q.id==='m2-l1-p3'),s=C.freshState();assert.deepEqual(plain(answer(q)),[0,0]);assert.equal(C.isAnswered(q,[0,-1]),false);assert.equal(C.evaluate(q,[0,-1]).correct,false);assert.equal(C.evaluate(q,[0,0]).correct,true);
 s.answers[q.id]={value:[0,-1]};s.exams.m2={draft:{'m2-e3':[0,0]},submitted:false,self:[]};
 const r=C.validateSave(C.exportSave(s));assert.deepEqual(plain(r.answers[q.id].value),[0,-1]);assert.deepEqual(plain(r.exams.m2.draft['m2-e3']),[0,0]);
 const wrong=C.evaluate(q,[1,0]);assert.match(wrong.message,/Artikel/);
});
test('article workshop correctly distinguishes gender, elision and plural for all supplied cards',()=>{
 const expected={ami:['l’ami','les amis'],amie:['l’amie','les amies'],fille:['la fille','les filles'],garcon:['le garçon','les garçons'],hotel:['l’hôtel','les hôtels'],ecole:['l’école','les écoles'],tour:['la tour','les tours'],parc:['le parc','les parcs']};
 for(const card of D.articleCards){assert.equal(C.articleModel(card,false).phrase,expected[card.id][0]);assert.equal(C.articleModel(card,true).phrase,expected[card.id][1]);}
});
test('multi-module routes and all stable M1 IDs survive an update',()=>{
 const s=C.freshState();s.route='#exam/mix1';s.exams.mix1={draft:{'mix1-e1':0},submitted:false,self:[]};assert.equal(C.validateSave(C.exportSave(s)).route,'#exam/mix1');
 const ids=all.filter(q=>q.id.startsWith('m1-')).map(q=>q.id);for(let l=1;l<=5;l++)for(const suffix of ['d','p1','p2','p3','t','c1','c2'])assert.ok(ids.includes('m1-l'+l+'-'+suffix));
 assert.equal(C.isAnswered(ex.find(q=>q.type==='build'),[1,1,2]),false);assert.equal(C.isAnswered(ex.find(q=>q.type==='choice'),99),false);
 new vm.Script(fs.readFileSync(path.join(root,'app.js'),'utf8'));
});
