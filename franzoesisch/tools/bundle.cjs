const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const files=['modules/m1.js','modules/m2.js','modules/m3.js','modules/mix1.js','modules/m4.js','modules/m5.js','modules/m6.js','modules/m7.js','modules/mix2.js','modules/m8.js','modules/m9.js','modules/mix3.js','core.js','app.js'];
const codes=new Map(files.map(file=>[file,fs.readFileSync(path.join(root,file),'utf8')]));
const css=fs.readFileSync(path.join(root,'style.css'),'utf8');
const version=code=>crypto.createHash('sha256').update(code).digest('hex').slice(0,12);
let source=fs.readFileSync(path.join(root,'index.html'),'utf8');
source=source.replace(/<link rel="stylesheet" href="\.\/style\.css(?:\?v=[a-f0-9]+)?">/,'<link rel="stylesheet" href="./style.css?v='+version(css)+'">');
source=source.replace(/<script src="\.\/([^\"]+)"><\/script>/g,(_,src)=>{
 const file=src.split('?')[0],code=codes.get(file);
 if(code===undefined)throw Error('Unbekannte Programmdatei: '+file);
 new vm.Script(code,{filename:file});
 return '<script src="./'+file+'?v='+version(code)+'"></script>';
});
fs.writeFileSync(path.join(root,'index.html'),source);
let html=source.replace(/<link rel="stylesheet" href="\.\/style\.css\?v=[a-f0-9]+">/,()=>'<style>'+css+'</style>');
html=html.replace(/<script src="\.\/([^\"]+)"><\/script>/g,(_,src)=>{
 const file=src.split('?')[0];let code=codes.get(file);
 if(file==='app.js')code=code.replace(/<a href="\.\/offline\.html"[^>]*>[^<]*<\/a>/g,'<span class="fine">Offline-Datei · Module 1–9</span>');
 return '<script>'+code.replace(/<\/script/gi,'<\\/script')+'</script>';
});
html=html.replace('<a href="../index.html">← Alle Fächer</a>','<span>Offline · Module 1–9</span>');
fs.writeFileSync(path.join(root,'offline.html'),html);
console.log('Dateiversionen aktualisiert; Offline-Datei erstellt: '+Buffer.byteLength(html)+' Bytes.');
