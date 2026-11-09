const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),ctx=vm.createContext({});
for(const file of ['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','modules/m4.js','modules/m5.js','modules/m6.js','modules/m7.js','modules/mix2.js','core.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),ctx,{filename:file});
const C=ctx.FrenchCore,D=ctx.FRENCH_COURSE,plain=x=>JSON.parse(JSON.stringify(x));
const all=D.lessons.flatMap(l=>[l.discover,...l.practice,l.transfer,...l.check]),ex=D.exam.questions,allExams=Object.values(D.exams).flatMap(e=>e.questions);
function answer(q){if(q.type==='choice')return q.answer;if(q.type==='short')return q.answers[0];if(q.type==='slots')return q.slots.map(s=>s.answer);if(q.type==='build')return q.solution.map(s=>q.tokens.indexOf(s));return q.sample;}
test('thirty-three complete lessons, nine checks and honest exercise counts',()=>{
 assert.equal(D.lessons.length,33);assert.equal(all.length,231);assert.equal(ex.length,10);assert.equal(D.modules.filter(m=>m.available).length,7);assert.equal(allExams.length,98);
 assert.equal(new Set([...all,...allExams].map(q=>q.id)).size,329);
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
 const h=fs.readFileSync(path.join(root,'offline.html'),'utf8');assert.ok(!/<script[^>]+src=/.test(h));assert.ok(!/<link[^>]+stylesheet/.test(h));assert.ok(h.includes('Offline · Module 1–7'));
 for(const file of ['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','modules/m4.js','modules/m5.js','modules/m6.js','modules/m7.js','modules/mix2.js','core.js'])assert.ok(h.includes(fs.readFileSync(path.join(root,file),'utf8')));
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
test('nine exam drafts and results remain isolated across save and reload',()=>{
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
test('every hosted script and stylesheet has a matching content version to avoid mixed cached releases',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),crypto=require('node:crypto');
 const refs=[...html.matchAll(/(?:src|href)="\.\/([^"?]+)\?v=([a-f0-9]+)"/g)];assert.equal(refs.length,12);
 for(const [,file,hash] of refs){assert.equal(hash,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12),file);}
});
test('all pronouns and exceptional meanings retain the correct être form',()=>{
 assert.deepEqual(plain(D.etreForms),{je:'suis',tu:'es',il:'est',elle:'est',on:'est',nous:'sommes',vous:'êtes',ils:'sont',elles:'sont'});
 for(const [id,p,v] of [['on','on','est'],['wir','nous','sommes'],['hoeflich','vous','êtes'],['ihr','vous','êtes'],['gemischt','ils','sont'],['maedchenplural','elles','sont'],['museum','il','est'],['turm','elle','est']]){const m=C.etreChain(D.pronounCases.find(c=>c.id===id),D.etreForms);assert.equal(m.pronoun,p);assert.equal(m.verb,v);assert.ok(m.sentence.endsWith('à Paris.'));}
 assert.equal(D.pronounCases.find(c=>c.id==='hoeflich').count,1);
});
test('new diagnostics separate pronoun-role errors and verb errors',()=>{const q=all.find(q=>q.id==='m5-l3-p1');assert.match(C.evaluate(q,[0,2]).message,/Pronomen.*Sprecherin/);assert.match(C.evaluate(q,[1,0]).message,/Verb.*Ich/);assert.match(C.evaluate(all.find(q=>q.id==='m4-l5-p1'),'sommes').message,/nous/);});
test('answer perspectives and significant accents are enforced',()=>{assert.deepEqual(plain(answer(all.find(q=>q.id==='m5-l3-p1'))),[1,2]);assert.deepEqual(plain(answer(all.find(q=>q.id==='m5-l3-p2'))),[0,1]);assert.equal(C.evaluate(all.find(q=>q.id==='m5-l2-p2'),'ou').correct,false);assert.equal(C.evaluate(all.find(q=>q.id==='m5-l2-p2'),'où').correct,true);assert.equal(C.evaluate(all.find(q=>q.id==='m4-l3-t'),'etes').correct,false);assert.equal(C.evaluate(all.find(q=>q.id==='m4-l3-t'),'êtes').correct,true);assert.equal(C.gradeExam(D.exams.m4,{}).max,11);assert.equal(C.gradeExam(D.exams.m5,{}).max,9);});
test('stage-two save preserves all assessments when new drafts and incomplete slots are added',()=>{const s=C.freshState();for(const id of ['m1','m2','m3','mix1'])s.exams[id]={draft:Object.fromEntries(D.exams[id].questions.map(q=>[q.id,answer(q)])),submitted:true,self:[0,2]};s.answers['m3-l4-t']={value:'Eigener Text é',compared:true,self:[0,3]};const old=C.exportSave(s);old.contentVersion=2;const r=C.validateSave(old);r.exams.m4={draft:{'m4-e2':[1,-1]},submitted:false,self:[]};r.exams.m5={draft:{'m5-e10':'Mein Dialog'},submitted:false,self:[]};r.route='#exam/m5';const n=C.validateSave(C.exportSave(r));assert.equal(n.answers['m3-l4-t'].value,'Eigener Text é');assert.equal(n.exams.mix1.submitted,true);assert.deepEqual(plain(n.exams.m4.draft['m4-e2']),[1,-1]);n.exams.m4=C.emptyExam();assert.equal(n.exams.m5.draft['m5-e10'],'Mein Dialog');for(const id of ['m1','m2','m3','mix1'])assert.equal(C.gradeExam(D.exams[id],n.exams[id].draft).points,D.exams[id].questions.filter(q=>q.type!=='open').length);});
test('profile perspective changes forms while retaining all supplied facts',()=>{
 const expected={nora:['Je suis de Lyon.','J’habite à Berlin, en Allemagne.','Je suis en sixième.'],samir:['Je suis de Paris.','J’habite à Lyon, en France.','Je suis en cinquième.'],lina:['Je suis de Berlin.','J’habite à Paris, en France.','Je suis en sixième.'],noe:['Je suis d’Avignon.','J’habite à Berlin, en Allemagne.','Je suis en cinquième.']};
 for(const p of D.profiles){const own=C.profileModel(p,true),other=C.profileModel(p,false);assert.deepEqual(plain(Object.values(own)),expected[p.id]);assert.ok(other.origin.startsWith(p.pronoun==='elle'?'Elle est':'Il est'));assert.ok(other.origin.includes(p.origin));assert.ok(other.home.includes(p.home));assert.ok(other.home.includes(p.country));assert.ok(other.school.includes(p.school));assert.equal(other.home.includes('j’habite'),false);}
});
test('city grammar follows function, gender and count for all places',()=>{
 for(const p of D.places)for(const n of [1,2,3]){
  const x=C.cityModel(p,n),exact=C.cityModel(p,n,'exist',true),point=C.cityModel(p,n,'point'),locate=C.cityModel(p,n,'locate');
  assert.ok(x.sentence.startsWith('Il y a '));assert.equal(x.article,n>1?'des':p.gender==='masculin'?'un':'une');assert.ok(x.sentence.includes(n>1?p.plural:p.word));assert.ok(point.sentence.startsWith(n>1?'Ce sont ':'C’est '));assert.ok(locate.sentence.endsWith(n>1?' sont là.':' est là.'));
  if(n>1){assert.ok(exact.sentence.includes(n===2?'deux ':'trois '));assert.equal(exact.sentence.includes('des '),false);}else if(p.gender==='féminin')assert.ok(exact.sentence.includes('une '));
 }
 const h=D.places.find(p=>p.id==='hotel');assert.equal(C.cityModel(h,1).sentence,'Il y a un hôtel.');assert.equal(C.cityModel(h,1,'point').sentence,'C’est l’hôtel.');assert.equal(C.cityModel(h,1,'locate').sentence,'L’hôtel est là.');assert.throws(()=>C.cityModel(h,0),/Anzahl/);
});
test('new checks match their taught scope and keep open scoring separate',()=>{
 for(const key of ['m6','m7','mix2']){const e=D.exams[key],draft=Object.fromEntries(e.questions.map(q=>[q.id,answer(q)])),grade=C.gradeExam(e,draft);assert.equal(grade.points,key==='m6'?9:11);assert.equal(e.questions.filter(q=>q.type==='open').length,1);assert.ok(e.questions.every(q=>D.lessons.some(l=>l.id===q.lesson)));}
 assert.ok(D.exams.mix2.questions.every(q=>Number(q.lesson.match(/^m(\d+)/)[1])<=6));
 assert.equal(C.evaluate(all.find(q=>q.id==='m7-l1-p1'),'Ils y a').correct,false);assert.equal(C.evaluate(all.find(q=>q.id==='m7-l3-p3'),'des deux').correct,false);assert.match(C.evaluate(all.find(q=>q.id==='m6-l2-p1'),'je habite').message,/h muet/);
 assert.equal(all.filter(q=>q.type==='open').length,6);assert.equal(allExams.filter(q=>q.type==='open').length,8);
});
test('stage-three results and independent new drafts survive version-four export and reload',()=>{
 const s=C.freshState();for(const id of ['m1','m2','m3','m4','m5','mix1'])s.exams[id]={draft:Object.fromEntries(D.exams[id].questions.map(q=>[q.id,answer(q)])),submitted:true,self:[1,3]};s.answers['m5-l4-t']={value:'Mon texte : é, à, ç',compared:true,self:[0,2]};const old=C.exportSave(s);old.contentVersion=3;
 const n=C.validateSave(old);n.exams.m6={draft:{'m6-e5':[1,-1]},submitted:false,self:[]};n.exams.m7={draft:{'m7-e12':'Texte du quartier'},submitted:false,self:[]};n.exams.mix2={draft:{'mix2-e12':'Texte de Maya'},submitted:false,self:[1]};n.route='#exam/mix2';const next=C.validateSave(C.exportSave(n));assert.deepEqual(plain(next.exams.m6.draft['m6-e5']),[1,-1]);assert.equal(next.route,'#exam/mix2');assert.equal(next.answers['m5-l4-t'].value,'Mon texte : é, à, ç');next.exams.m6=C.emptyExam();assert.equal(next.exams.mix2.draft['mix2-e12'],'Texte de Maya');assert.equal(next.exams.m7.draft['m7-e12'],'Texte du quartier');for(const id of ['m1','m2','m3','m4','m5','mix1'])assert.equal(C.gradeExam(D.exams[id],next.exams[id].draft).points,D.exams[id].questions.filter(q=>q.type!=='open').length);
});
