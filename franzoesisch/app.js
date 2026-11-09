/* Statische Lernwerkstatt. Alle Antworten bleiben lokal, ohne Anmeldung. */
(() => {
 'use strict';
 const C=globalThis.FrenchCore,D=globalThis.FRENCH_COURSE,$=s=>document.querySelector(s);
 const initial=C.readStorage({getItem:key=>localStorage.getItem(key)});
 let state=initial.state,storageBlocked=!!initial.error,pendingImport=null;
 const steps=['Ankommen','Entdecken','Verstehen','Mitdenken','Üben','Anwenden','Mini-Check','Merkkarte'];
 const allPractice=D.lessons.flatMap(l=>[l.discover,...l.practice,l.transfer,...l.check]);
 const questions=new Map([...allPractice,...Object.values(D.exams).flatMap(e=>e.questions)].map(q=>[q.id,q]));
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const lessonById=id=>D.lessons.find(l=>l.id===id);
 const moduleId=l=>l.id.split('-')[0],moduleById=id=>D.modules.find(m=>m.id===id),moduleLessons=id=>D.lessons.filter(l=>moduleId(l)===id);
 const availableModules=()=>D.modules.filter(m=>m.available);
 const currentExamKey=()=>route().examKey||'m1';
 const examDefinition=()=>D.exams[currentExamKey()];
 const examState=()=>state.exams[currentExamKey()]||(state.exams[currentExamKey()]=C.emptyExam());
 const joinWords=words=>words.join(' ').replace(/([’'])\s+/g,'$1');
 function speakStatus(message){$('#announcer').textContent=message;}
 function storageMessage(message,recover=false){$('#save-message').innerHTML=esc(message)+(recover?' <button id="storage-recover">Neuen Stand speichern</button>':'');}
 function persist(){
  if(storageBlocked)return;
  try{localStorage.setItem(C.KEY,JSON.stringify(C.exportSave(state)));$('#save-message').textContent='';}
  catch(e){storageMessage('Automatisches Speichern ist in diesem Browser gerade nicht möglich. Sichere deinen Stand über „Sichern & Laden“ als Datei.');}
 }
 if(initial.error)storageMessage(initial.error,true);
 // Recompute practice correctness instead of trusting imported result flags.
 function reconcile(){
  for(const [key,saved] of Object.entries(state.exams)){
   const def=D.exams[key];if(def){const max=def.questions.find(q=>q.type==='open')?.criteria.length||0;saved.self=saved.self.filter(i=>i<max);}
  }
  for(const [id,r] of Object.entries(state.answers)){
   const q=questions.get(id);
   if(q&&r.checked&&q.type!=='open')r.correct=C.evaluate(q,r.value).correct;
  }
 }
 reconcile();
 function route(){
  const match=location.hash.match(/^#lesson\/(m\d+-l\d+)\/([0-7])$/);
  if(match&&lessonById(match[1]))return {view:'lesson',lesson:lessonById(match[1]),step:Number(match[2])};
  const module=location.hash.match(/^#module\/(m\d+)$/);
  if(module&&moduleById(module[1])?.available)return {view:'module',module:moduleById(module[1])};
  const exam=location.hash.match(/^#exam\/(m\d+|mix\d+)$/);
  if(exam&&D.exams[exam[1]])return {view:'exam',examKey:exam[1]};
  if(location.hash==='#exam')return {view:'exam',examKey:'m1'};
  return {view:['#cards','#about','#exams'].includes(location.hash)?location.hash.slice(1):'home'};
 }
 function nav(){
  const r=route(),selected=r.module?.id||(r.lesson?moduleId(r.lesson):null);
  $('#navigation').innerHTML=`<a href="#home" ${r.view==='home'?'class="active" aria-current="page"':''}>⌂ <span>Dein Überblick</span></a><div class="nav-break">DEINE MODULE</div>`+
   availableModules().map(m=>`<a class="module-nav ${selected===m.id?'active':''}" href="#module/${m.id}" ${r.view==='module'&&selected===m.id?'aria-current="page"':''}><span class="nav-number">${esc(m.id.toUpperCase())}</span><span>${esc(m.title)}</span></a>${selected===m.id?moduleLessons(m.id).map(l=>`<a class="lesson-nav sub-nav ${r.lesson?.id===l.id?'active':''}" href="#lesson/${l.id}/0" ${r.lesson?.id===l.id?'aria-current="page"':''}><span class="nav-number">${l.icon}</span><span>${esc(l.title)}</span></a>`).join(''):''}`).join('')+
   `<a href="#exams" ${['exam','exams'].includes(r.view)?'class="active" aria-current="page"':''}>✓ <span>Prüfungen & Check</span></a><a href="#cards" ${r.view==='cards'?'class="active" aria-current="page"':''}>▤ <span>Merkkarten</span></a><div class="nav-break">DEMNÄCHST IM LERNWEG</div>`+
   D.modules.filter(m=>!m.available).map(m=>`<div class="nav-planned"><span class="nav-number">${esc(m.id.slice(1))}</span><div>${esc(m.title)}<small>Geplant · noch nicht enthalten</small></div></div>`).join('');
 }
 function illustration(){return `<div class="hero-art"><svg viewBox="0 0 400 295" role="img" aria-label="Nora und Samir sprechen miteinander. Je bedeutet jeweils ich; tu meint das Gegenüber."><path d="M27 238Q10 137 79 81T269 55q108 15 104 127t-179 87" fill="#e9eef7"/><circle cx="344" cy="45" r="18" fill="#edc466"/><path d="M65 245h281" stroke="#ccd6e4" stroke-width="3" stroke-linecap="round"/><path d="M82 244v-66q15-24 57 0v66" fill="#d58a68"/><path d="M81 183q-11-61 28-61t31 60" fill="#483b44"/><ellipse cx="110" cy="153" rx="23" ry="30" fill="#f1c8aa"/><path d="M86 144q-1-31 27-30 31 2 24 37-11-7-14-19-16 15-37 12" fill="#483b44"/><circle cx="103" cy="151" r="2" fill="#483b44"/><circle cx="122" cy="151" r="2" fill="#483b44"/><path d="M107 164q7 6 13 0" fill="none" stroke="#ad725e" stroke-width="2" stroke-linecap="round"/><path d="M245 245v-67q14-21 54 0l7 67" fill="#6289b5"/><ellipse cx="271" cy="150" rx="23" ry="30" fill="#bd8a65"/><path d="M248 145q-10-38 25-34 25-2 23 34-10-8-13-18-17 13-35 18" fill="#3b343b"/><circle cx="263" cy="151" r="2" fill="#3b343b"/><circle cx="282" cy="151" r="2" fill="#3b343b"/><path d="M267 164q6 5 12 0" fill="none" stroke="#754b40" stroke-width="2" stroke-linecap="round"/><rect x="25" y="28" width="167" height="61" rx="15" fill="white"/><path d="m96 88 12 16 4-17" fill="white"/><text x="49" y="54" fill="#315b9d" font-family="system-ui" font-size="14" font-weight="700">Je m’appelle Nora.</text><text x="49" y="75" fill="#66778c" font-family="system-ui" font-size="12">Et toi ?</text><rect x="213" y="48" width="175" height="52" rx="15" fill="#fff1e4"/><path d="m260 98 9 17 5-17" fill="#fff1e4"/><text x="230" y="78" fill="#8f5639" font-family="system-ui" font-size="13" font-weight="700">Je m’appelle Samir.</text><text x="96" y="270" fill="#566b85" font-family="system-ui" font-size="12">NORA</text><text x="253" y="270" fill="#566b85" font-family="system-ui" font-size="12">SAMIR</text></svg><p class="art-label">Ein Gespräch. Zwei Blickwinkel.</p></div>`;}
 function statusBadge(l){const s=C.lessonStatus(l,state);return `<span class="status ${s.kind}">${esc(s.label)}</span>`;}
 function resumeHref(){return /^#lesson\//.test(state.route)&&lessonById(state.route.split('/')[1])?state.route:`#lesson/${(D.lessons.find(l=>!['secure','assisted'].includes(C.lessonStatus(l,state).kind))||D.lessons[0]).id}/0`;}
 function home(){
  const checked=D.lessons.filter(l=>['secure','assisted'].includes(C.lessonStatus(l,state).kind)).length;
  return `<section class="hero"><div><p class="eyebrow">FRANZÖSISCH VERSTEHEN · KLASSE 6</p><h1>Ein bisschen Mut.<br><em>Ein großes Bonjour.</em></h1><p class="lead">Hier lernst du, wie Französisch funktioniert. Mit Erklärungen, die dich mitnehmen, und Übungen, bei denen du den nächsten Schritt selbst findest.</p><div class="hero-cta"><a class="button-link" href="${resumeHref()}">${Object.keys(state.answers).length?'Weiterlernen':'Mit Lektion 1 starten'} <span aria-hidden="true">→</span></a><a class="text-link" href="#cards">Deine Merkkarten ↗</a></div></div>${illustration()}</section>
  <div class="stats-strip"><span><b>${D.lessons.length}</b> ausführliche Lektionen</span><span><b>${allPractice.length}</b> Lernaufgaben</span><span><b>7 + 2</b> Modulprüfungen & gemischte Checks</span><span><b>${checked}/${D.lessons.length}</b> Mini-Checks abgeschlossen</span></div>
  <div class="section-head"><div><p class="eyebrow">DEIN LERNWEG · M1 BIS M7</p><h2>Vom ersten Gespräch zur passenden Antwort.</h2></div></div>
  <div class="module-grid">${availableModules().map(m=>{const ls=moduleLessons(m.id),done=ls.filter(l=>['secure','assisted'].includes(C.lessonStatus(l,state).kind)).length;return `<a class="module-card ${m.id}" href="#module/${m.id}"><span class="module-badge">${esc(m.id.toUpperCase())}${['m6','m7'].includes(m.id)?' · NEU':''}</span><h3>${esc(m.title)}</h3><p>${esc(m.subtitle)}</p><div class="tile-meta">${ls.length} Lektionen · eigene Modulprüfung</div><span class="status">${done}/${ls.length} Mini-Checks abgeschlossen</span><span class="module-open">Modul öffnen →</span></a>`;}).join('')}</div>
  <section class="exam-banner"><div><h3>Verbinde, was du schon kannst.</h3><p>Zwei gemischte Checks nach M3 und M6 verbinden Bekanntes mit neuen Situationen. Oder wähle eine der sieben Modulprüfungen.</p></div><a href="#exams" class="button-link">Prüfungen & Check öffnen →</a></section>
  <aside class="notice blue"><b>Neu: Steckbriefe und dein Stadtplan.</b> M1–M7 sind vollständig nutzbar. M8–M9, Gesamtabfrage und zwei Probeklausuren folgen in den nächsten Etappen.</aside>
  <div class="home-foot"><a href="#about">Was gehört zum Kurs? Quellen & Hinweise</a><a href="./offline.html" download="Franzoesisch_Bonjour_M1-M7.html">M1–M7 als Offline-Datei ↓</a></div><p class="fine" style="margin-top:18px">Keine Vokabeltests. Nötige Wortbedeutungen stehen bei den Aufgaben. Deine Antworten bleiben in diesem Browser; eine Sicherungsdatei nimmt sie auf ein anderes Gerät mit.</p>`;
 }
 function modulePage(m){
  const lessons=moduleLessons(m.id),number=m.id.slice(1);
  return `<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">MODUL ${number} · ${lessons.length} LEKTIONEN</p><h1>${esc(m.title)}</h1><p class="lead">${esc(m.subtitle)}</p><div class="hero-cta"><a class="button-link" href="#lesson/${lessons[0].id}/0">Mit Lektion 1 beginnen →</a><a class="text-link" href="#exam/${m.id}">Zur Modulprüfung ↗</a></div><div class="lesson-grid" style="margin-top:25px">${lessons.map(l=>`<a class="lesson-tile" href="#lesson/${l.id}/0"><div class="tile-number">${l.icon}</div><div class="tile-content"><h3>${esc(l.title)}</h3><p>${esc(l.subtitle)}</p><div class="tile-meta">${esc(l.minutes)} Min. · Erklärung + Anwendung</div>${statusBadge(l)}</div></a>`).join('')}</div>${moduleWorkshop(m.id)}<section class="exam-banner"><div><h3>Dein Check zu ${esc(m.id.toUpperCase())}</h3><p>Neue Aufgaben zu genau diesem Modul. Der Entwurf und die Auswertung bleiben getrennt von den anderen Prüfungen erhalten.</p></div><a class="button-link" href="#exam/${m.id}">Modulprüfung öffnen →</a></section>`;
 }
 function examsPage(){return `<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">PRÜFUNGEN & GEMISCHTE CHECKS</p><h1>Was kannst du verbinden?</h1><p class="lead">Wähle einen Check. Jeder Durchgang hat seinen eigenen Entwurf und seine eigene Auswertung. Lösungen erscheinen nach dem Abgeben.</p><div class="exam-grid">${Object.entries(D.exams).map(([key,e])=>{const saved=state.exams[key];return `<a class="exam-choice ${key.startsWith('mix')?'mixed':''}" href="#exam/${key}"><span class="pill">${esc(e.label||'Modulprüfung M1')}</span><h2>${esc(e.title)}</h2><p>${e.questions.length} Aufgaben · ${esc(e.minutes)} Min. als Orientierung</p><span class="status">${saved?.submitted?'Abgegeben · Auswertung öffnen':saved&&Object.keys(saved.draft).length?'Entwurf fortsetzen':'Noch offen'}</span><span class="module-open">${saved?.submitted?'Auswertung':'Check'} öffnen →</span></a>`;}).join('')}</div><aside class="notice blue">Der erste gemischte Check verbindet M1–M3, der zweite M1–M6. M7 hat eine eigene Modulprüfung. Gesamtabfrage und zwei Probeklausuren zum ganzen Kurs kommen erst nach den übrigen Fachmodulen hinzu.</aside>`;}
 let labCard='amie',labPlural=false;
 function workshopHTML(present=false){
  const card=D.articleCards.find(c=>c.id===labCard)||D.articleCards[0],model=C.articleModel(card,labPlural);
  const drawing=card.person?'<circle cx="20" cy="13" r="8"/><path d="M7 49V32q13-13 26 0v17"/>':'<path d="M5 49V20L20 6l15 14v29z"/><path d="M14 49V34h12v15M13 24h4m6 0h4" fill="none" stroke="white" stroke-width="3"/>';
  const step=labPlural?'Mehrzahl: Der bestimmte Artikel ist les. Er wird nicht verkürzt.':card.elision?'Einzahl: '+(card.gender==='masculin'?'le':'la')+' wird vor '+card.reason+' zu l’.':'Einzahl ohne Elision: '+(card.gender==='masculin'?'masculin → le.':'féminin → la.');
  return `<section class="workshop" data-workshop="${present}" aria-labelledby="lab-title"><p class="eyebrow">VERÄNDERN & VERSTEHEN · KEIN TEST</p><h2 id="lab-title">${present?'Eine Person oder mehrere?':'Deine Artikelwerkstatt'}</h2><p>Verändere die Karte und die Anzahl. Beobachte, welche Teile sich ändern und warum. Die Lösungen sind hier absichtlich sichtbar; die Übungsaufgaben prüfst du danach selbst.</p><div class="lab-controls"><label for="lab-card">Wortkarte<select id="lab-card" data-lab="card">${D.articleCards.map(c=>`<option value="${c.id}" ${c.id===card.id?'selected':''}>${esc(c.word)} · ${esc(c.de)}</option>`).join('')}</select></label><fieldset><legend>Anzahl</legend><label><input type="radio" name="lab-number" data-lab="number" value="one" ${!labPlural?'checked':''}>Einzahl</label><label><input type="radio" name="lab-number" data-lab="number" value="many" ${labPlural?'checked':''}>Mehrzahl</label></fieldset></div><p class="lab-help"><b>Wortangaben:</b> ${esc(card.gender)} · ${esc(card.reason)} · Plural: <span lang="fr">${esc(card.plural)}</span></p><div class="lab-diagram"><div class="lab-figures" aria-label="${labPlural?'Drei als Beispiel für mehrere':'Ein einzelnes Element'}">${Array.from({length:labPlural?3:1},()=>`<svg aria-hidden="true" viewBox="0 0 40 55">${drawing}</svg>`).join('')}</div><div><span class="tiny-label">${labPlural?'MEHRERE · PLURAL':'EINZELN · SINGULAR'}</span><p class="lab-result" lang="fr">${present?`<mark>${labPlural?'Ce sont':'C’est'}</mark> `:''}<b>${esc(model.article)}</b>${model.article==='l’'?'':' '}${esc(model.noun)}${present?'.':''}</p></div></div><ol class="lab-reason"><li><b>Anzahl:</b> ${labPlural?'Mehrzahl.':'Einzahl.'}</li><li><b>Genus:</b> ${esc(card.gender)} bleibt erhalten.</li><li><b>Artikel:</b> ${esc(step)}</li><li><b>Nomen:</b> ${esc(labPlural?card.word+' → '+card.plural+' (regelmäßiges Plural-s).':card.word+' bleibt im Singular.')}</li>${present?`<li><b>Benennung:</b> ${labPlural?'Im geübten Schreibmuster steht vor dieser Pluralgruppe ce sont.':'Eine einzelne Person oder Sache wird hier mit c’est benannt.'}</li>`:''}</ol></section>`;
 }
 function dialogue(scene){return `<p class="stage-intro">${esc(scene.intro)}</p><div class="dialogue">${scene.lines.map(([speaker,fr,de])=>`<div class="speech"><div class="speaker">${esc(speaker)}</div><p lang="fr">${esc(fr)}</p><p class="translation">${esc(de)}</p></div>`).join('')}</div><p class="caption">${esc(scene.caption)}</p>`;}
 function solution(q){return q.type==='choice'?q.options[q.answer]:q.type==='build'?q.solution.join(' '):q.type==='slots'?joinWords(q.slots.map(s=>s.options[s.answer])):q.type==='short'?q.answers[0]:q.sample;}
 function answerText(q,value){
  if(!C.valuePresent(value))return '(keine Antwort)';
  if(q.type==='choice')return q.options[value]||'(ungültige Auswahl)';
  if(q.type==='build')return Array.isArray(value)?value.map(i=>q.tokens[i]||'').join(' '):'';
  if(q.type==='slots')return Array.isArray(value)?joinWords(q.slots.map((s,i)=>s.options[value[i]]||'___')):'(keine Antwort)';
  return String(value);
 }
 function accentbar(id){return `<div class="accentbar" role="group" aria-label="Französische Zeichen einfügen">${['’','é','è','ê','à','â','ç','Ç','ù','î','ô','ë','ï'].map(c=>`<button type="button" data-action="accent" data-id="${id}" data-char="${c}" aria-label="${c==='’'?'Apostroph':esc(c)} einfügen">${c}</button>`).join('')}</div>`;}
 function inputHTML(q,value,exam=false,locked=false){
  const prefix=exam?'exam':'learn',id=`${prefix}-${q.id}`;
  if(q.type==='choice')return `<div class="choices" role="radiogroup" aria-labelledby="title-${id}">${q.options.map((o,i)=>`<label class="choice"><input type="radio" name="${id}" value="${i}" data-id="${q.id}" data-exam="${exam}" ${value===i?'checked':''} ${locked?'disabled':''}><span>${esc(o)}</span></label>`).join('')}</div>`;
  if(q.type==='slots')return `<div class="slot-row">${q.slots.map((s,i)=>`<label for="${id}-slot-${i}">${esc(s.label)}<select id="${id}-slot-${i}" data-id="${q.id}" data-slot="${i}" data-exam="${exam}" ${locked?'disabled':''}><option value="-1">Bitte wählen …</option>${s.options.map((o,j)=>`<option value="${j}" ${Array.isArray(value)&&value[i]===j?'selected':''}>${esc(o)}</option>`).join('')}</select></label>`).join('')}</div>`;
  if(q.type==='build'){
   const selected=Array.isArray(value)?value:[];
   return `<div class="build-target" aria-label="Dein Satz. Bausteine anklicken, um sie zu entfernen.">${selected.length?selected.map(i=>`<button data-action="remove-token" data-id="${q.id}" data-exam="${exam}" data-index="${i}" ${locked?'disabled':''} aria-label="${esc(q.tokens[i])} aus Satz entfernen">${esc(q.tokens[i])} <span aria-hidden="true">×</span></button>`).join(''):'<span class="placeholder">Wähle unten die Bausteine in der richtigen Reihenfolge.</span>'}</div><div class="token-bank" aria-label="Bausteine">${q.tokens.map((t,i)=>`<button data-action="add-token" data-id="${q.id}" data-exam="${exam}" data-index="${i}" ${selected.includes(i)||locked?'disabled':''}>${esc(t)}</button>`).join('')}</div><button class="build-clear" data-action="clear-build" data-id="${q.id}" data-exam="${exam}" ${locked?'disabled':''}>Satz leeren</button>`;
  }
  return `<label class="answer-label" for="${id}">${q.type==='open'?'Dein Text (wird hier gespeichert)':'Deine Antwort'}</label>${q.type==='open'?`<textarea id="${id}" lang="fr" data-id="${q.id}" data-exam="${exam}" maxlength="12000" ${locked?'readonly':''}>${esc(value||'')}</textarea>`:`<input class="short-input" id="${id}" lang="fr" data-id="${q.id}" data-exam="${exam}" value="${esc(value||'')}" autocomplete="off" autocapitalize="sentences" spellcheck="false" maxlength="400" ${locked?'readonly':''}>`}${locked?'':accentbar(id)}`;
 }
 function criteriaHTML(q,checked,exam=false){return `<div class="criteria"><div class="self-label">SELBSTEINSCHÄTZUNG · KEINE AUTOMATISCHE SPRACHKORREKTUR</div>${q.criteria.map((c,i)=>`<label><input type="checkbox" data-action="criterion" data-id="${q.id}" data-exam="${exam}" value="${i}" ${(checked||[]).includes(i)?'checked':''}><span>${esc(c)}</span></label>`).join('')}</div>`;}
 function questionHTML(q,index,exam=false){
  const record=state.answers[q.id]||{},value=exam?examState().draft[q.id]:record.value;
  let feedback='';
  if(!exam){
   if(record.checked&&q.type!=='open'){
    const result=C.evaluate(q,record.value);
    feedback=`<div class="feedback ${result.correct?'correct':''}" tabindex="-1" role="status"><b>${result.correct?'Richtig.':'Noch nicht passend.'}</b> ${esc(result.message)}${result.correct&&(record.hints||record.revealed||record.attempts>1)?'<p class="fine">Gelöst nach Hilfe oder Korrektur. Für eine frische Prüfung nutze später den Mini-Check oder die Modulprüfung.</p>':''}</div>`;
   }
   if(record.hints)feedback+=(q.hints?.length?q.hints:['Lies die Aufgabenangabe und die Wortangaben noch einmal. Welche Anzahl oder Gesprächsrolle wird genannt?','Vergleiche das passende Muster in der Erklärung und kontrolliere alle Teile deiner Antwort.']).slice(0,record.hints).map((h,i)=>`<p class="hint" tabindex="-1"><b>Tipp ${i+1}:</b> ${esc(h)}</p>`).join('');
   if(record.revealed)feedback+=`<div class="solution" tabindex="-1"><b>Lösung zum Vergleichen</b><p>${esc(solution(q))}</p><p>${esc(q.why)}</p><p class="fine">Angesehene Lösungen gelten nicht als ohne Hilfe geprüft.</p></div>`;
   if(record.compared&&q.type==='open')feedback+=`<div class="solution" tabindex="-1"><b>Eine mögliche Fassung</b><pre lang="fr">${esc(q.sample)}</pre><p>${esc(q.why)}</p>${criteriaHTML(q,record.self)}</div>`;
  }
  return `<section class="question" data-question="${q.id}" data-index="${index}" data-exam="${exam}" aria-labelledby="title-${exam?'exam':'learn'}-${q.id}"><p class="question-title">${q.type==='open'?'EIGENER TEXT':q.type==='build'?'SATZWERKSTATT':q.type==='short'?'SELBST SCHREIBEN':q.type==='slots'?'GRAMMATIKWERKSTATT':'ENTSCHEIDEN'} · AUFGABE ${index+1}</p><h3 id="title-${exam?'exam':'learn'}-${q.id}">${esc(q.prompt)}</h3>${q.support?`<p class="support"><b>Wörter & Bausteine:</b> ${esc(q.support)}</p>`:''}${inputHTML(q,value,exam)}${exam?'':`<div class="question-actions">${q.type==='open'?`<button class="primary" data-action="compare" data-id="${q.id}">Beispiel & Checkliste öffnen</button>`:`<button class="primary" data-action="check" data-id="${q.id}">Antwort prüfen</button><button data-action="hint" data-id="${q.id}" ${(record.hints||0)>=2?'disabled':''}>${record.hints?'Nächster Tipp':'Tipp bekommen'}</button><button data-action="reveal" data-id="${q.id}">Lösung ansehen</button>`}</div>`}${feedback}</section>`;
 }
 function soundHTML(l){return `<aside class="sound-box"><h3>◖ Dein kleines Lautfenster</h3><p>${esc(l.sound.note)}</p><p lang="fr"><b>${esc(l.sound.text)}</b></p><button data-action="speak" data-lesson="${l.id}">Mit französischer Systemstimme anhören</button><p class="voice-result" role="status"></p></aside>`;}

 let pronounCard='ich',chainStep=0,questionCard='name';
 function moduleWorkshop(mid){return mid==='m2'?workshopHTML(false):mid==='m3'?workshopHTML(true):mid==='m4'?pronounWorkshop():mid==='m5'?questionWorkshop():mid==='m6'?profileWorkshop():mid==='m7'?cityWorkshop():'';}
 function etreTable(){return '<details class="form-reference"><summary>Alle Präsensformen von être nachschlagen</summary><div class="forms-grid">'+Object.entries(D.etreForms).map(([p,v])=>'<div><span lang="fr">'+esc(p)+'</span><b lang="fr">'+esc(v)+'</b></div>').join('')+'</div><p class="fine">Être = sein. On bleibt grammatisch Singular; vous kann ihr oder höfliches Sie bedeuten. Êtes braucht den Akzent.</p></details>';}
 function pronounWorkshop(){
  const c=D.pronounCases.find(c=>c.id===pronounCard)||D.pronounCases[0],m=C.etreChain(c,D.etreForms);
  const people=Array.from({length:c.count},()=>'<svg viewBox="0 0 44 60" aria-hidden="true"><circle cx="22" cy="13" r="10"/><path d="M5 58V36q17-19 34 0v22z"/></svg>').join('');
  return '<section class="workshop pronoun-workshop" data-chain aria-labelledby="chain-title"><p class="eyebrow">SUBJEKT → PRONOMEN → VERB · KEIN TEST</p><h2 id="chain-title">Wer ist gemeint?</h2><p>Wähle eine Situation. Überlege selbst und decke dann die Schritte auf. Die Figuren zeigen die genannte Anzahl; die Gesprächsrolle entscheidet mit.</p><label class="lab-select" for="pronoun-card">Gesprächssituation<select id="pronoun-card" data-pronoun-card>'+D.pronounCases.map(x=>'<option value="'+x.id+'" '+(x.id===c.id?'selected':'')+'>'+esc(x.label)+'</option>').join('')+'</select></label><div class="role-context"><div class="role-people" aria-hidden="true">'+people+'</div><p><b>Situation:</b> '+esc(c.context)+'</p></div><p class="fine">Alle Sätze enden hier mit à Paris = in Paris. Die Abbildung ist eine symbolische Hilfe, keine zusätzliche Rollenangabe.</p><ol class="chain-grid"><li><span class="tiny-label">1 · PRONOMEN</span><strong lang="fr">'+(chainStep>=1?esc(m.pronoun):'?')+'</strong><p>'+(chainStep>=1?'Aus der angegebenen Gesprächsrolle gewählt.':'Wer spricht, wer wird angesprochen, über wen wird gesprochen?')+'</p></li><li><span class="tiny-label">2 · VERBFORM</span><strong lang="fr">'+(chainStep>=2?esc(m.verb):'?')+'</strong><p>'+(chainStep>=2?'Das feste être-Paar zum Pronomen.':'Welche Form gehört genau zu diesem Pronomen?')+'</p></li><li><span class="tiny-label">3 · GANZER SATZ</span><strong lang="fr">'+(chainStep>=3?esc(m.sentence):'?')+'</strong><p>'+(chainStep>=3?'Prüfe Bezug und Schriftbild noch einmal.':'Verbinde das Paar mit der Ortsangabe.')+'</p></li></ol><button class="primary" data-action="chain-next">'+(chainStep<3?'Nächsten Schritt aufdecken':'Noch einmal selbst überlegen')+'</button>'+etreTable()+'</section>';
 }
 function questionWorkshop(){
  const c=D.questionCases.find(c=>c.id===questionCard)||D.questionCases[0];
  return '<section class="workshop question-workshop" data-question-lab aria-labelledby="question-lab-title"><p class="eyebrow">FRAGEN & ANTWORTEN · KEIN TEST</p><h2 id="question-lab-title">Welche Antwort passt zur Rolle?</h2><p>Wähle ein Gesprächsziel. Lies zuerst Frage und Situation. Formuliere selbst eine Antwort, bevor du das Beispiel öffnest.</p><label class="lab-select" for="question-card">Gesprächsziel<select id="question-card" data-question-card>'+D.questionCases.map(x=>'<option value="'+x.id+'" '+(x.id===c.id?'selected':'')+'>'+esc(x.label)+'</option>').join('')+'</select></label><p class="lab-help">'+esc(c.context)+'</p><div class="question-bubble"><span class="tiny-label">FRAGE</span><p lang="fr">'+esc(c.question)+'</p></div><details class="answer-bubble"><summary>Antwort und Denkweg aufdecken</summary><p class="lab-result" lang="fr">'+esc(c.answer)+'</p><p>'+esc(c.reason)+'</p></details><p class="fine">Bedeutungshilfe: à Paris = in Paris; ensemble = zusammen; là = dort; douze ans = zwölf Jahre; oui = ja; merci = danke. Dies sind vorgegebene Vergleichsbeispiele, keine Bewertung deiner Aussprache.</p></section>';
 }


 let profileCard='nora',profileSelf=true,cityCard='parc',cityMode='exist',cityExact=false;
 const cityCounts=Object.fromEntries(D.places.map(p=>[p.id,p.count]));
 function profileWorkshop(){
  const c=D.profiles.find(p=>p.id===profileCard)||D.profiles[0],m=C.profileModel(c,profileSelf);
  return '<section class="workshop profile-workshop" data-profile-lab aria-labelledby="profile-title"><p class="eyebrow">STECKBRIEF → VORSTELLUNG · KEIN TEST</p><h2 id="profile-title">Die Fakten bleiben. Die Perspektive wechselt.</h2><p>Wähle eine erfundene Personenkarte und die Erzählrolle. Prüfe, welche Satzteile gleich bleiben und welche Formen sich ändern.</p><div class="profile-controls"><label class="lab-select" for="profile-card">Personenkarte<select id="profile-card" data-profile="card">'+D.profiles.map(p=>'<option value="'+p.id+'" '+(p.id===c.id?'selected':'')+'>'+esc(p.name)+' · '+esc(p.role)+'</option>').join('')+'</select></label><fieldset><legend>Erzählrolle</legend><label><input type="radio" name="profile-view" data-profile="view" value="self" '+(profileSelf?'checked':'')+'>Ich spiele die Person</label><label><input type="radio" name="profile-view" data-profile="view" value="other" '+(!profileSelf?'checked':'')+'>Ich spreche über sie</label></fieldset></div><div class="profile-facts"><div class="profile-avatar" aria-hidden="true"><svg viewBox="0 0 70 90"><circle cx="35" cy="23" r="18"/><path d="M7 88V63q28-30 56 0v25z"/></svg></div><div><h3>'+esc(c.name)+'</h3><dl><dt>Rolle</dt><dd>'+esc(c.role)+'</dd><dt>Herkunft</dt><dd>'+esc(c.origin)+'</dd><dt>Wohnort</dt><dd>'+esc(c.home)+' · '+esc(c.countryDe)+'</dd><dt>Klasse</dt><dd>'+esc(c.school)+' = '+esc(c.schoolDe)+'</dd></dl></div></div><div class="profile-sentences"><article><span class="tiny-label">HERKUNFT · WOHER?</span><p lang="fr">'+esc(m.origin)+'</p><small>'+(profileSelf?'Je suis = ich bin / komme hier aus.':'Über die angegebene Person: '+esc(c.pronoun)+' est.')+'</small></article><article><span class="tiny-label">WOHNORT · WO WOHNEN?</span><p lang="fr">'+esc(m.home)+'</p><small>'+(profileSelf?'J’habite = ich wohne; Apostroph vor h muet.':'Il/elle habite = er/sie wohnt; hier kein Apostroph am Pronomen.')+'</small></article><article><span class="tiny-label">KLASSE · WELCHE STUFE?</span><p lang="fr">'+esc(m.school)+'</p><small>En sixième ≈ Klasse 6; en cinquième ≈ Klasse 7.</small></article></div><p class="fine">De/d’ nennt hier Herkunft, à die bereitgestellte Wohnstadt. En France/en Allemagne sind die mitgelieferten Länderbausteine. Die Karten sind erfunden und keine persönlichen Daten.</p></section>';
 }
 function cityIcon(p){const paths={tree:'<path d="M32 51V30" stroke="#477862" stroke-width="5"/><circle cx="32" cy="21" r="17" fill="#8abc97"/><circle cx="20" cy="30" r="10" fill="#a7ce9e"/>',museum:'<path d="m6 19 26-15 26 15zM8 51h48" fill="#b0b9d8" stroke="#7b8cb4" stroke-width="3"/><path d="M15 22v26m17-26v26m17-26v26" stroke="#8697c1" stroke-width="7"/>',train:'<rect x="9" y="8" width="46" height="37" rx="9" fill="#a5c1d4"/><path d="M14 23h36M22 45l-6 10m26-10 6 10" stroke="#546f87" stroke-width="3"/><circle cx="21" cy="36" r="3" fill="#546f87"/><circle cx="43" cy="36" r="3" fill="#546f87"/>',bread:'<ellipse cx="32" cy="29" rx="27" ry="17" transform="rotate(-20 32 29)" fill="#e8bc7f"/><path d="m20 20 7 13m6-18 7 13m5-13 4 9" stroke="#ad8053" stroke-width="3"/>',cup:'<path d="M10 17h34v19q-17 18-34 0z" fill="#d5a69b"/><path d="M45 20q22 2 3 17M8 49h43" fill="none" stroke="#ae7d73" stroke-width="4"/>',hotel:'<rect x="11" y="5" width="42" height="49" rx="5" fill="#c1afd2"/><path d="M22 16v16m20-16v16M23 24h18M28 54V42h9v12" stroke="#78628d" stroke-width="4" fill="none"/>'};return '<svg viewBox="0 0 64 60" aria-hidden="true">'+paths[p.icon]+'</svg>';}
 function cityWorkshop(){
  const c=D.places.find(p=>p.id===cityCard)||D.places[0],n=cityCounts[c.id],m=C.cityModel(c,n,cityMode,cityExact);
  const reason=cityMode==='exist'?'Existenzangabe: il y a bleibt gleich. '+(cityExact?'Die genaue Zahl steht in diesen Aufzählungen ohne zusätzlichen Artikel.':n===1?'Der unbestimmte Artikel folgt dem französischen Genus.':'Die unbestimmte Mehrzahl lautet des + Pluralnomen.'):cityMode==='point'?'Benennung der gezeigten bestimmten Orte: c’est für einen, ce sont für mehrere im geübten Schreibmuster.':'Die bekannte Gruppe ist das Subjekt. Einzahl: est là. Mehrzahl: sont là.';
  return '<section class="workshop city-workshop" data-city-lab aria-labelledby="city-title"><p class="eyebrow">DEIN ERFUNDENES VIERTEL · KEIN TEST</p><h2 id="city-title">Ein Plan. Drei Satzaufgaben.</h2><p>Wähle ein beschriftetes Planfeld, verändere die Anzahl und schalte die Satzaufgabe um. Die Abbildung und der Satz zeigen dieselben vorgegebenen Angaben.</p><div class="city-layout"><div class="city-map" role="group" aria-label="Planfelder des erfundenen Viertels">'+D.places.map(p=>'<button type="button" data-city-place="'+p.id+'" aria-pressed="'+(p.id===c.id)+'"><span class="map-zone">FELD '+p.zone+'</span>'+cityIcon(p)+'<strong>'+cityCounts[p.id]+' '+esc(cityCounts[p.id]===1?p.de:p.dePlural)+'</strong><span lang="fr">'+esc(cityCounts[p.id]===1?p.word:p.plural)+'</span></button>').join('')+'</div><div class="city-panel"><p class="tiny-label">GEWÄHLT: FELD '+c.zone+'</p><p><b>Wortkarte:</b> <span lang="fr">'+esc(c.word)+'</span> = '+esc(c.de)+' · '+esc(c.gender)+'<br>Plural: <span lang="fr">'+esc(c.plural)+'</span></p><label class="lab-select" for="city-count">Anzahl an diesem Planfeld<select id="city-count" data-city="count">'+[1,2,3].map(v=>'<option value="'+v+'" '+(v===n?'selected':'')+'>'+v+' · '+['','eins','zwei','drei'][v]+'</option>').join('')+'</select></label><fieldset class="city-modes"><legend>Was soll der Satz tun?</legend>'+[['exist','Was gibt es? · neu einführen'],['point','Was ist das? · benennen'],['locate','Wo ist es? · verorten']].map(([id,t])=>'<label><input type="radio" name="city-mode" data-city="mode" value="'+id+'" '+(cityMode===id?'checked':'')+'>'+t+'</label>').join('')+'</fieldset><label class="exact-control"><input type="checkbox" data-city="exact" '+(cityExact?'checked':'')+' '+(cityMode!=='exist'?'disabled':'')+'>Bei der Existenzangabe die genaue Zahl nennen</label></div></div><div class="city-output" aria-live="polite"><span class="tiny-label">DEIN SATZ · FELD '+c.zone+'</span><p lang="fr">'+esc(m.sentence)+'</p><p>'+esc(reason)+'</p></div><p class="fine">Wort-/Zahlenhilfe: un/une = ein/eine; des = unbestimmte Mehrzahl; deux = zwei; trois = drei; il y a = es gibt; c’est/ce sont = das ist/das sind; là = dort. Ein Laborwechsel verändert nur dieses Beispiel. Bei Übungs- und Prüfungsaufgaben gelten deren eigene Angaben.</p></section>';
 }

 function cardHTML(l){return `<article class="merkkarte"><h3>${moduleId(l).toUpperCase()} · ${l.icon} · ${esc(l.title)}</h3><p><b>${esc(l.card.rule)}</b></p><p class="example" lang="fr">${esc(l.card.example)}</p><p><b>Stolperfalle:</b> ${esc(l.card.trap)}</p></article>`;}
 function stageHTML(l,step){
  if(step===0)return `<h2>Eine Situation zum Reinkommen.</h2>${dialogue(l.scene)}<div class="takeaway"><b>Darauf arbeitest du hin:</b><ul class="goal-list">${l.goals.map(g=>`<li>${esc(g)}</li>`).join('')}</ul>Du kannst die Schritte frei wechseln. Empfohlen: erst verstehen, dann üben, dann ohne Tipps prüfen.</div>`;
  if(step===1)return `<h2>Schau einmal genauer hin.</h2><p class="stage-intro">Probiere eine erste Entscheidung. Fehler sind hier eine Hilfe: Deine Antwort zeigt dir, worauf du gleich achten kannst.</p>${questionHTML(l.discover,0)}`;
  if(step===2)return `<h2>Jetzt wird das Muster klar.</h2>${l.explain.map(([title,body])=>`<section class="rule-block"><h3>${esc(title)}</h3>${body}</section>`).join('')}<button data-action="read" data-lesson="${l.id}" class="${state.read[l.id]?'':'primary'}">${state.read[l.id]?'✓ Erklärung als gelesen markiert':'Ich habe die Erklärung gelesen'}</button>${soundHTML(l)}`;
  if(step===3){return `<h2>Ein Beispiel, Schritt für Schritt.</h2><p class="worked-task">${esc(l.worked.task)}</p><ol class="worked-list">${l.worked.steps.map(([h,p],i)=>`<li ${i>0?'hidden':''}><h3>${esc(h)}</h3><p>${esc(p)}</p></li>`).join('')}</ol><div class="question-actions"><button class="primary" data-action="worked">Nächsten Denkschritt zeigen</button></div><aside class="notice">${esc(l.worked.trap)}</aside>${l.workshop?moduleWorkshop(moduleId(l)):''}`;}
  if(step===4)return `<h2>Mit Hilfe selbst ausprobieren.</h2><p class="stage-intro">Drei Aufgaben mit kleinen Hinweisen. Du entscheidest, ob du einen Tipp brauchst. Erst danach lohnt sich der Blick auf die ganze Lösung.</p>${l.practice.map((q,i)=>questionHTML(q,i)).join('')}`;
  if(step===5)return `<h2>Jetzt eine neue Situation.</h2><p class="stage-intro">Übertrage das Muster. Es geht um Grammatik und passende Gesprächsrollen; nötige Wörter stehen direkt bei der Aufgabe.</p>${questionHTML(l.transfer,0)}`;
  if(step===6)return `<h2>Was klappt schon ohne Hilfe?</h2><p class="stage-intro">Zwei frische Aufgaben prüfen diese Lektion. Tipps bleiben erreichbar. Wenn du sie verwendest oder erst nach einer Korrektur richtig antwortest, steht das im Lernstand. Ein erneuter Klick macht daraus keinen neuen Erstversuch.</p>${l.check.map((q,i)=>questionHTML(q,i)).join('')}<div class="takeaway">Aktueller Stand: ${statusBadge(l)}<p class="fine">Das beschreibt diese zwei Aufgaben, nicht dein gesamtes Können.</p></div>`;
  return `<h2>Das nimmst du mit.</h2>${cardHTML(l)}<button class="print-button" data-action="print">Merkkarte drucken</button><div class="takeaway">Dein Stand: ${statusBadge(l)}<p>Du kannst jederzeit zurückgehen und eine Erklärung erneut lesen.</p></div>`;
 }
 function lessonPage(l,step){
  const mid=moduleId(l),ls=moduleLessons(mid),index=ls.indexOf(l),next=ls[index+1];
  return `<a class="back" href="#module/${mid}">← Zum Modul ${mid.slice(1)}</a><div class="lesson-top"><div><p class="eyebrow">MODUL ${mid.slice(1)} · LEKTION ${index+1} VON ${ls.length}</p><h1>${esc(l.title)}</h1><p class="lead">${esc(l.subtitle)}</p></div><span class="lesson-counter">${esc(l.minutes)} MIN. · DEIN TEMPO</span></div><nav class="steps" aria-label="Schritte der Lektion">${steps.map((s,i)=>`<a href="#lesson/${l.id}/${i}" ${i===step?'aria-current="step"':''}><span>${i+1}</span>${s}</a>`).join('')}</nav><section class="stage">${stageHTML(l,step)}</section><div class="stage-footer">${step?`<a href="#lesson/${l.id}/${step-1}">← ${steps[step-1]}</a>`:`<a href="#module/${mid}">Zum Modul ${mid.slice(1)}</a>`}${step<7?`<a class="next" href="#lesson/${l.id}/${step+1}">Weiter: ${steps[step+1]} →</a>`:next?`<a class="next" href="#lesson/${next.id}/0">Nächste Lektion →</a>`:`<a class="next" href="#exam/${mid}">Zur Modulprüfung ${mid.toUpperCase()} →</a>`}</div>`;
 }
 function examPage(){
  if(examState().submitted)return examResult();
  const filled=examDefinition().questions.filter(q=>C.isAnswered(q,examState().draft[q.id])).length;
  return `<a class="back" href="#exams">← Zu allen Prüfungen</a><p class="eyebrow">${esc(examDefinition().label||'Modulprüfung M1')} · NEUE AUFGABEN</p><h1>${esc(examDefinition().title)}</h1><div class="exam-head"><span class="pill">${esc(examDefinition().minutes)} MIN. ALS ORIENTIERUNG</span><p>${esc(examDefinition().intro)}</p><p><b>Dieser Entwurf wird automatisch gespeichert.</b> Du kannst die Prüfung unterbrechen. Antworten werden erst nach dem Abgeben ausgewertet. Wortbedeutungen bleiben sichtbar.</p><p class="fine" id="exam-filled">${filled} von ${examDefinition().questions.length} Aufgaben vollständig beantwortet.</p></div>${examDefinition().scene?`<section class="stage" style="margin-bottom:24px"><h2>Deine Szene zum Nachschauen</h2>${dialogue(examDefinition().scene)}</section>`:''}<section class="stage">${examDefinition().questions.map((q,i)=>questionHTML(q,i,true)).join('')}<div id="exam-warning" role="status"></div><button class="primary" data-action="submit-exam">Prüfung abgeben & auswerten</button></section>`;
 }
 function examResult(){
  const score=C.gradeExam(examDefinition(),examState().draft),open=examDefinition().questions.find(q=>q.type==='open');
  return `<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">${esc(examDefinition().label||'Modulprüfung M1')} · DEINE AUSWERTUNG</p><h1>Schau, was schon klappt.</h1><div class="result-grid"><section class="score-card"><b>${score.points} / ${score.max}</b><p>automatisch bewertete Aufgaben richtig<br>Jede geschlossene Aufgabe zählt einmal.</p></section>${open?`<section class="score-card self"><b id="self-count">${examState().self.length} / ${open.criteria.length}</b><p>Kriterien für den eigenen Text angehakt<br>Deine Selbsteinschätzung, separat gezählt.</p></section>`:''}</div><div class="takeaway"><b>${score.review.length?'Hier kannst du gezielt nachschauen:':'Alle geschlossenen Aufgaben richtig gelöst.'}</b>${score.review.length?`<div class="review-links">${score.review.map(id=>`<a href="#lesson/${id}/2">${esc(lessonById(id).title)} ↗</a>`).join('')}</div>`:'<p>Alle geschlossenen Aufgaben richtig. '+(open?'Prüfe jetzt deinen eigenen Text. ':'')+'Die Aufgabenwerte sind keine Schulnote.</p>'}</div><section class="stage" style="margin-top:24px">${examDefinition().questions.map((q,i)=>{
    const answer=examState().draft[q.id],result=q.type==='open'?null:C.evaluate(q,answer);
    return `<article class="exam-result-question"><p class="question-title">AUFGABE ${i+1} · ${q.type==='open'?'EIGENER TEXT':result.correct?'RICHTIG':'NOCH EINMAL ANSCHAUEN'}</p><h3>${esc(q.prompt)}</h3><p class="given"><b>Deine Antwort:</b>\n${esc(answerText(q,answer))}</p>${q.type==='open'?`<div class="solution" tabindex="-1"><b>Eine mögliche Fassung</b><pre lang="fr">${esc(q.sample)}</pre><p>${esc(q.why)}</p>${criteriaHTML(q,examState().self,true)}</div>`:`<div class="feedback ${result.correct?'correct':''}"><b>Erwartete Lösung:</b> <span>${esc(solution(q))}</span><p>${esc(q.why)}</p></div>`}</article>`;
   }).join('')}</section><div class="restart-box"><p>Wenn du die Prüfung wiederholen möchtest, sichere bei Bedarf erst deinen Lernstand. Ein neuer Durchgang ersetzt nur diese Modulprüfung; deine Lektionen bleiben erhalten. Die Aufgaben sind dieselben, deshalb ist ein besseres Wiederholungsergebnis kein unabhängiger neuer Test.</p><button data-action="restart-show">Neuen Durchgang vorbereiten</button><div id="restart-confirm" hidden><p>Deine bisherige Prüfungsauswertung wird ersetzt.</p><button data-action="restart-exam" class="primary">Ja, Prüfung neu beginnen</button></div></div>`;
 }
 function about(){return `<article class="about"><a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">DEINE FRANZÖSISCHWERKSTATT</p><h1>Ein Lernweg, der erklärt.</h1><p class="lead">Für den Anfangsunterricht in Klasse 6 am Gymnasium in Niedersachsen. Die Themen orientieren sich an den bereitgestellten Buchseiten 8–37.</p><h2>Was jetzt schon fertig ist</h2><p>M1 bis M7 umfassen 33 Lektionen und 231 Lernaufgaben einschließlich 33 Mini-Checks. Dazu kommen sieben Modulprüfungen und zwei gemischte Checks (nach M3 und M6). Insgesamt enthalten die Prüfungen 98 Aufgaben, davon 90 automatisch geprüfte und acht freie Texte mit getrennter Selbstbewertung. Freie Texte werden mit Kriterien selbst eingeschätzt; automatisch bewertete Aufgaben haben fest hinterlegte Lösungen. Bei kurzen Texteingaben werden nur ausdrücklich berücksichtigte Fassungen automatisch erkannt; das ist kein allgemeiner Sprachkorrektor.</p><h2>Was noch folgt</h2><p>M2 erklärt bereits bestimmte Artikel, Genus, Einzahl/Mehrzahl und Elision. M3 erklärt c’est/ce sont und begrenzte Freundschaftsbausteine. M4 erklärt Personalpronomen und alle Präsensformen von être, M5 die Fragefunktion und den Rollenwechsel in Antworten. M6 erklärt Herkunft, Wohnort und Klasse; M7 il y a, un/une/des und die unterschiedlichen Satzfunktionen am Stadtplan. Vorlieben sowie die vertiefte Aussprache- und Schreibwerkstatt folgen in M8–M9. Die Gesamtabfrage und zwei Probeklausuren sind geplant und noch nicht enthalten. Auch ein vollständiger Jahreskurs oder A1-Abschluss wird mit diesem Anfangsmodul nicht behauptet.</p><h2>Was „keine Vokabeln“ hier bedeutet</h2><p>Es gibt keine Vokabeltests. Wörter, die du für die Grammatikaufgabe brauchst, werden mit Bedeutung bereitgestellt. Für Altersangaben kannst du die Zahlen nachschauen. Freie Aufgaben kannst du mit erfundenen Rollen bearbeiten.</p><h2>Wie dein Fortschritt gezählt wird</h2><p>„Erklärung gelesen“ setzt du selbst. „Ohne Hilfe geprüft“ bedeutet: Beide Aufgaben des Mini-Checks waren beim ersten Prüfen richtig, ohne Tipp und ohne angesehene Lösung. Nach Hilfe oder Korrektur wird das ausdrücklich gekennzeichnet. Ein Fehler kann eine Wiederholung empfehlen. Dies sind transparente Bearbeitungsstände, keine sichere Messung deines gesamten Könnens. Aufgaben lassen sich jederzeit öffnen.</p><h2>Deine Daten und deine Sicherung</h2><p>Die Seite benötigt keine Anmeldung. Antworten und Entwürfe werden im Browser dieses Geräts gespeichert, soweit dein Browser das zulässt. Sie werden von dieser Lernseite nicht an einen Server gesendet. „Sichern & Laden“ exportiert oder importiert eine JSON-Datei für diesen Französischkurs. Es gibt keine automatische Synchronisation. Ein Import ersetzt den Französisch-Lernstand erst nach deiner Auswahl und dem Bestätigen in der Vorschau.</p><h2>Die Lautfenster</h2><p>Optional liest eine verfügbare französische Systemstimme neue Beispielsätze vor. Die Verfügbarkeit und Aussprache hängen vom Gerät ab. Je nach Systemeinstellung kann der Vorlesedienst online arbeiten. Der Kurs funktioniert vollständig ohne diese Hilfe. Es handelt sich nicht um die Originalhörtexte des Buches und nicht um eine fertige Hörverstehensprüfung.</p><h2>Grundlage und fachlicher Abgleich</h2><p>Eigenständig formulierte Erklärungen, Dialoge und Zeichnungen. Buchfotos, Comics und Liedtexte werden nicht auf dieser Webseite veröffentlicht. Das Kerncurriculum von 2025 gilt seit August 2025 für Französisch Sekundarbereich I, Jahrgänge 6–10. A1 ist dort das Ziel am Ende von Jahrgang 7. Die Themenabgrenzung dieses Kurses beschreibt nur den fotografierten Anfangsstoff.</p><ol><li>30 bereitgestellte Fotos, Buchseiten 8–37: C’est parti, Unité 1 und Module 1.</li><li><a href="https://cuvo.nibis.de/index.php?p=download&upload=756" target="_blank" rel="noopener">Niedersächsisches Kultusministerium: Kerncurriculum Französisch 2025</a>, besonders S. 8–12 und 26–31.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-le-verbe-etre-et-le-verbe-sappeler-au-present-0" target="_blank" rel="noopener">TV5MONDE: être und s’appeler im Präsens</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-comment-utiliser-les-pronoms-personnels-sujets" target="_blank" rel="noopener">TV5MONDE: Personalpronomen</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-le-presentatif-les-articles-definis-et-indefinis-0" target="_blank" rel="noopener">TV5MONDE: Benennungsmuster, bestimmte und unbestimmte Artikel</a>.</li><li><a href="https://vitrinelinguistique.oqlf.gouv.qc.ca/24157/la-grammaire/les-determinants/determinants-possessifs/mon-ton-et-son-devant-des-mots-feminins" target="_blank" rel="noopener">OQLF: mon vor femininen Nomen mit Vokalanfang</a>.</li><li><a href="https://vitrinelinguistique.oqlf.gouv.qc.ca/23078/la-prononciation/prononciation-de-certaines-lettres/mots-commencant-par-un-h-muet" target="_blank" rel="noopener">OQLF: h muet, Elision und Liaison</a>.</li><li><a href="https://vitrinelinguistique.oqlf.gouv.qc.ca/21737/lorthographe/elision-et-apostrophe/elision-obligatoire" target="_blank" rel="noopener">Office québécois de la langue française: Elision und Apostroph</a>.</li><li><a href="https://www.dictionnaire-academie.fr/article/A9O0421" target="_blank" rel="noopener">Académie française: on und die dritte Person Singular</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/prononciation-faut-il-monter-ou-descendre-la-voix-quand-pose-une-question" target="_blank" rel="noopener">TV5MONDE: Fragemelodie und ihre Unterschiede</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-poser-une-question-0" target="_blank" rel="noopener">TV5MONDE: Fragen stellen</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-les-prepositions-au-en-aux-nom-de-ville-ou-de-pays" target="_blank" rel="noopener">TV5MONDE: Ortspräpositionen (hier begrenzte Auswahl)</a>.</li><li><a href="https://www.dictionnaire-academie.fr/article/A9E2986" target="_blank" rel="noopener">Académie française: être, auch Herkunft mit de</a>.</li><li><a href="https://apprendre.tv5monde.com/fr/aides/grammaire-le-verbe-avoir-au-present-et-il-y" target="_blank" rel="noopener">TV5MONDE: il y a als Existenzangabe</a>.</li><li><a href="https://eduscol.education.gouv.fr/4845/gliederung-der-schulzeit" target="_blank" rel="noopener">Französisches Bildungsministerium: Klassenstufen im Vergleich</a>.</li></ol><p class="fine" style="margin-top:25px">Ausbaustand: Schritt 4 · Module 1–7 · 9. November 2026. Als Nächstes: M8 Vorlieben und Ablehnung sowie M9 Sprechen und Schreiben.</p></article>`;}
 function render(focus=true){
  const r=route();nav();
  if(r.view==='lesson'||r.view==='exam'){state.route=location.hash;persist();}
  $('#main').innerHTML=r.view==='lesson'?lessonPage(r.lesson,r.step):r.view==='module'?modulePage(r.module):r.view==='exams'?examsPage():r.view==='exam'?examPage():r.view==='cards'?`<a class="back" href="#home">← Zum Überblick</a><p class="eyebrow">DEINE SAMMLUNG · MODULE 1–7</p><h1>Das Wichtigste bleibt.</h1><p class="lead">33 Merkkarten zum Nachschlagen. Du kannst sie zusammen drucken.</p><button class="print-button" data-action="print" style="margin-bottom:24px">Alle Merkkarten drucken</button><div class="all-cards">${D.lessons.map(cardHTML).join('')}</div>`:r.view==='about'?about():home();
  document.title=(r.lesson?r.lesson.title:r.view==='exam'?(examDefinition().label||'Modulprüfung M1'):r.view==='module'?moduleById(r.module.id).title:'Bonjour! · Französisch verstehen')+' · Klasse 6';
  if(focus){$('#main').focus({preventScroll:true});window.scrollTo({top:0});}
  const active=$('.steps [aria-current=step]');if(active)active.scrollIntoView({block:'nearest',inline:'center'});
 }
 function patchQuestion(id,exam=false){
  const q=questions.get(id),el=document.querySelector(`[data-question="${id}"][data-exam="${exam}"]`);
  if(el){const box=document.createElement('div');box.innerHTML=questionHTML(q,Number(el.dataset.index)||0,exam);el.replaceWith(box.firstElementChild);}
 }
 function updateAnswer(q,value,exam){
  if(exam){if(!examState().submitted)examState().draft[q.id]=value;}
  else{
   const r=state.answers[q.id]||{};
   state.answers[q.id]={...r,value,checked:false,correct:null,compared:q.type==='open'&&r.compared===true,self:[]};
   const box=document.querySelector('[data-question="'+q.id+'"]');
   box?.querySelectorAll('.feedback,.empty-warning').forEach(el=>el.remove());
   box?.querySelectorAll('.criteria input').forEach(el=>el.checked=false);
   const current=route();
   if(current.view==='lesson'&&current.step===6){const badge=document.querySelector('.stage .takeaway .status');if(badge)badge.outerHTML=statusBadge(current.lesson);}
  }
  persist();
  if(exam&&$('#exam-filled'))$('#exam-filled').textContent=`${examDefinition().questions.filter(q=>C.isAnswered(q,examState().draft[q.id])).length} von ${examDefinition().questions.length} Aufgaben beantwortet.`;
 }
 $('#main').addEventListener('input',e=>{
  const el=e.target;if(!el.matches('input[type=radio],input.short-input,textarea'))return;
  const q=questions.get(el.dataset.id);if(!q)return;
  updateAnswer(q,el.type==='radio'?Number(el.value):el.value,el.dataset.exam==='true');
 });
 $('#main').addEventListener('change',e=>{
  const el=e.target;
  if(el.dataset.profile){
   if(el.dataset.profile==='card')profileCard=el.value;else profileSelf=el.value==='self';el.closest('[data-profile-lab]').outerHTML=profileWorkshop();document.querySelector(el.dataset.profile==='card'?'#profile-card':'[data-profile="view"]:checked').focus({preventScroll:true});speakStatus('Personenkarte und Erzählrolle aktualisiert. Die Fakten bleiben erhalten.');return;
  }
  if(el.dataset.city){
   const type=el.dataset.city;if(type==='count')cityCounts[cityCard]=Number(el.value);if(type==='mode')cityMode=el.value;if(type==='exact')cityExact=el.checked;el.closest('[data-city-lab]').outerHTML=cityWorkshop();document.querySelector(type==='count'?'#city-count':type==='mode'?'[data-city="mode"]:checked':'[data-city="exact"]').focus({preventScroll:true});speakStatus('Plananzahl und Satzaufgabe aktualisiert.');return;
  }
  if(el.hasAttribute('data-pronoun-card')){
   pronounCard=el.value;chainStep=0;el.closest('[data-chain]').outerHTML=pronounWorkshop();$('#pronoun-card').focus({preventScroll:true});speakStatus('Neue Gesprächssituation. Die Schritte sind wieder verdeckt.');return;
  }
  if(el.hasAttribute('data-question-card')){
   questionCard=el.value;el.closest('[data-question-lab]').outerHTML=questionWorkshop();$('#question-card').focus({preventScroll:true});speakStatus('Neue Frage und Situation. Die Beispielantwort ist noch verdeckt.');return;
  }
  if(el.dataset.lab){
   const box=el.closest('[data-workshop]'),present=box.dataset.workshop==='true';
   if(el.dataset.lab==='card')labCard=el.value;else labPlural=el.value==='many';
   const focusSelector=el.dataset.lab==='card'?'[data-lab="card"]':'[data-lab="number"]:checked';
   box.outerHTML=workshopHTML(present);
   document.querySelector(focusSelector)?.focus({preventScroll:true});
   speakStatus('Die Werkstatt zeigt die neue Anzahl und die passende Form.');
   return;
  }
  if(el.matches('select[data-slot]')){
   const q=questions.get(el.dataset.id),exam=el.dataset.exam==='true',old=exam?examState().draft[q.id]:state.answers[q.id]?.value;
   const value=Array.isArray(old)?[...old]:q.slots.map(()=>-1);
   value[Number(el.dataset.slot)]=Number(el.value);updateAnswer(q,value,exam);return;
  }
  if(el.dataset.action!=='criterion')return;
  const exam=el.dataset.exam==='true',arr=exam?examState().self:(state.answers[el.dataset.id].self||[]),index=Number(el.value);
  const selected=new Set(arr);if(el.checked)selected.add(index);else selected.delete(index);
  if(exam){examState().self=[...selected];if($('#self-count'))$('#self-count').textContent=`${selected.size} / ${examDefinition().questions.find(q=>q.type==='open').criteria.length}`;}
  else state.answers[el.dataset.id].self=[...selected];persist();
 });
 $('#main').addEventListener('click',e=>{
  const place=e.target.closest('button[data-city-place]');if(place){cityCard=place.dataset.cityPlace;place.closest('[data-city-lab]').outerHTML=cityWorkshop();document.querySelector('[data-city-place="'+cityCard+'"]').focus({preventScroll:true});speakStatus('Planfeld gewählt. Der Satz beschreibt jetzt die neue Auswahl.');return;}
  const b=e.target.closest('button[data-action]');if(!b)return;
  const action=b.dataset.action,q=questions.get(b.dataset.id),exam=b.dataset.exam==='true';
  if(action==='chain-next'){
   chainStep=chainStep<3?chainStep+1:0;b.closest('[data-chain]').outerHTML=pronounWorkshop();document.querySelector('[data-action="chain-next"]').focus({preventScroll:true});speakStatus(chainStep?'Denkschritt '+chainStep+' aufgedeckt.':'Die Denkschritte sind wieder verdeckt.');return;
  }
  if(action==='accent'){
   const field=document.getElementById(b.dataset.id);if(!field||field.readOnly)return;
   const start=field.selectionStart??field.value.length,end=field.selectionEnd??start;
   field.setRangeText(b.dataset.char,start,end,'end');field.focus();field.dispatchEvent(new Event('input',{bubbles:true}));return;
  }
  if(action==='add-token'||action==='remove-token'||action==='clear-build'){
   if(exam&&examState().submitted)return;
   let value=exam?examState().draft[q.id]:state.answers[q.id]?.value;value=Array.isArray(value)?[...value]:[];
   const index=Number(b.dataset.index);
   if(action==='add-token'&&!value.includes(index))value.push(index);
   if(action==='remove-token')value=value.filter(i=>i!==index);
   if(action==='clear-build')value=[];
   updateAnswer(q,value,exam);patchQuestion(q.id,exam);
   const scope=document.querySelector(`[data-question="${q.id}"]`);(scope.querySelector('.token-bank button:not(:disabled)')||scope.querySelector('.build-target button')||scope.querySelector('button')).focus({preventScroll:true});
   speakStatus('Dein Satz: '+answerText(q,value));return;
  }
  if(['check','hint','reveal','compare'].includes(action)){
   const r=state.answers[q.id]||{};
   if((action==='check'||action==='compare')&&!C.isAnswered(q,r.value)){speakStatus('Gib zuerst eine Antwort ein.');b.insertAdjacentHTML('afterend','<span class="fine empty-warning" role="status">Bitte zuerst antworten.</span>');return;}
   if(action==='check'){
    // Repeated checking of an unchanged response is not another attempt.
    state.answers[q.id]=r.checked?r:C.recordAttempt(q,r,r.value);
   }
   if(action==='hint')state.answers[q.id]={...r,hints:Math.min(2,(r.hints||0)+1)};
   if(action==='reveal')state.answers[q.id]={...r,revealed:true};
   if(action==='compare')state.answers[q.id]={...r,compared:true,self:r.self||[]};
   persist();patchQuestion(q.id);
   const feedback=document.querySelector(`[data-question="${q.id}"] .feedback`);
   if(action==='check'&&feedback)feedback.focus({preventScroll:true});
   else {
    const resultNode=document.querySelector('[data-question="'+q.id+'"] '+(action==='hint'?'.hint:last-child':'.solution'));
    if(resultNode)resultNode.focus({preventScroll:true});
    speakStatus(action==='hint'?'Ein weiterer Hinweis ist sichtbar.':action==='reveal'?'Die Lösung ist sichtbar.':'Beispiel und Selbstbewertung sind sichtbar.');
   }
   const current=route();
   if(current.view==='lesson'&&current.step===6){
    const badge=document.querySelector('.stage .takeaway .status');
    if(badge)badge.outerHTML=statusBadge(current.lesson);
   }
   nav();return;
  }
  if(action==='read'){state.read[b.dataset.lesson]=true;persist();b.textContent='✓ Erklärung als gelesen markiert';b.classList.remove('primary');speakStatus('Erklärung als gelesen markiert.');return;}
  if(action==='worked'){
   const next=$('.worked-list li[hidden]');if(next)next.hidden=false;
   if(!$('.worked-list li[hidden]')){b.disabled=true;b.textContent='Alle Denkschritte sichtbar';}
   speakStatus(next?.textContent||'Alle Denkschritte sichtbar.');return;
  }
  if(action==='print'){window.print();return;}
  if(action==='speak'){speakLesson(lessonById(b.dataset.lesson));return;}
  if(action==='submit-exam'){
   const missing=examDefinition().questions.filter(x=>!C.isAnswered(x,examState().draft[x.id]));
   if(missing.length){$('#exam-warning').innerHTML=`<p class="notice">Noch ${missing.length} Aufgabe(n) offen oder nicht vollständig. Bitte ergänze sie vor dem Abgeben.</p>`;const target=$(`[data-question="${missing[0].id}"]`);target.scrollIntoView({block:'start'});target.querySelector('input,textarea,select,button')?.focus({preventScroll:true});return;}
   examState().submitted=true;persist();render();return;
  }
  if(action==='restart-show'){$('#restart-confirm').hidden=false;return;}
  if(action==='restart-exam'){state.exams[currentExamKey()]=C.emptyExam();state.exam=state.exams.m1;persist();render();}
 });
 function speakLesson(l){
  const result=$('.voice-result');
  if(!('speechSynthesis'in window)){result.textContent='Auf diesem Gerät ist keine Vorlesefunktion verfügbar. Lies das Beispiel oder sprich es selbst; alle Aufgaben funktionieren ohne Ton.';return;}
  const voice=speechSynthesis.getVoices().find(v=>/^fr(?:-|_)/i.test(v.lang)||v.lang==='fr');
  if(!voice){result.textContent='Keine französische Systemstimme gefunden. Du kannst eine französische Stimme in den Geräteeinstellungen ergänzen. Der Kurs funktioniert auch ohne Ton.';return;}
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(l.sound.text);u.lang=voice.lang;u.voice=voice;u.rate=.83;
  u.onerror=()=>{result.textContent='Das Vorlesen hat nicht funktioniert. Die Textfassung steht weiterhin oben.';};
  u.onend=()=>{result.textContent='Vorlesen beendet. Du kannst das Beispiel erneut anhören oder selbst sprechen.';};
  result.textContent='Französische Systemstimme: '+voice.name+(voice.localService?' · auf diesem Gerät':' · kann einen Online-Vorlesedienst verwenden');speechSynthesis.speak(u);
 }
 $('#save-open').addEventListener('click',()=>{
  $('#save-status').textContent=`${Object.keys(state.answers).length} begonnene Lernaufgaben · ${Object.values(state.exams).filter(e=>e.submitted).length} Prüfung(en) abgegeben.`;
  $('#save-dialog').showModal();
 });
 $('#save-close').addEventListener('click',()=>$('#save-dialog').close());
 $('#export').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(C.exportSave(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='Bonjour_Französisch_Lernstand.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  $('#import-result').textContent='Die Sicherungsdatei wurde zum Download bereitgestellt. Bewahre sie an einem Ort auf, den du wiederfindest.';
 });
 $('#import').addEventListener('change',async e=>{
  pendingImport=null;$('#import-preview').hidden=true;$('#import-result').textContent='';
  const file=e.target.files?.[0];if(!file)return;
  try{
   if(file.size>1024*1024)throw Error('Diese Datei ist zu groß für eine Lernstandssicherung.');
   pendingImport=C.validateSave(JSON.parse(await file.text()));
   $('#import-preview').innerHTML=`<b>Vorschau:</b> ${Object.keys(pendingImport.answers).length} Lernaufgaben gespeichert. ${Object.values(pendingImport.exams).filter(e=>e.submitted).length} Prüfung(en) abgegeben.<p>Mit dem Laden wird dein aktueller Französisch-Lernstand ersetzt.</p><button id="import-confirm" class="primary">Diesen Lernstand laden</button><button id="import-cancel">Abbrechen</button>`;$('#import-preview').hidden=false;
  }catch(error){$('#import-result').textContent=error instanceof SyntaxError?'Die Datei enthält keine gültigen JSON-Daten. Dein Stand wurde nicht verändert.':error.message;}
  e.target.value='';
 });
 $('#save-dialog').addEventListener('click',e=>{
  if(e.target.id==='import-cancel'){pendingImport=null;$('#import-preview').hidden=true;}
  if(e.target.id==='import-confirm'&&pendingImport){state=pendingImport;pendingImport=null;storageBlocked=false;reconcile();persist();$('#import-preview').hidden=true;$('#import-result').textContent='Der Französisch-Lernstand wurde geladen.';render(false);}
 });
 $('#save-message').addEventListener('click',e=>{if(e.target.id==='storage-recover'){storageBlocked=false;persist();}});
 $('.skip').addEventListener('click',e=>{e.preventDefault();$('#main').focus();$('#main').scrollIntoView({block:'start'});});
 window.addEventListener('hashchange',()=>{if('speechSynthesis'in window)speechSynthesis.cancel();render();});
 render(false);
})();
