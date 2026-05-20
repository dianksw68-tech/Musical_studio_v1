const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [find, replace] of replacements) {
    if (typeof find === 'string') {
      content = content.split(find).join(replace);
    } else {
      content = content.replace(find, replace);
    }
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ', filePath);
}

// replacements based on grep data
replaceInFile('src/components/InputForm.tsx', [
  ["bg-primary-500 text-slate-900 dark:text-white", "bg-primary-500 text-white"],
  ["bg-blue-600 text-slate-900 dark:text-white", "bg-blue-600 text-white"],
  ["disabled:cursor-not-allowed text-slate-900 dark:text-white font-bold py-4", "disabled:cursor-not-allowed text-white font-bold py-4"],
]);

replaceInFile('src/components/OutputSection.tsx', [
  // bg-[#0F0F0F] text-slate-900 dark:text-white -> should be white text because bg is dark always
  ["bg-[#0F0F0F] text-slate-900 dark:text-white", "bg-[#0F0F0F] text-white"],
  ["bg-black/80 text-slate-900 dark:text-white", "bg-black/80 text-white"],
  
  // input field with bg-slate-100 ? No wait line 507 text-slate-900 dark:text-white is correct for input field since it's bg-slate-100 in light mode and bg-black/60 in dark mode.
  // button line 512
  ["disabled:opacity-50 text-slate-900 dark:text-white rounded-lg", "disabled:opacity-50 text-white rounded-lg"],
  
  // button active states with bg-primary-500
  ["bg-primary-500 text-slate-900 dark:text-white", "bg-primary-500 text-white"],
  
  // image replacement span (line 719) it doesn't have background, wait the span itself has no background. Its parent button has bg-slate-900 ... wait. Let me see where it says Ganti Gambar
  // "text-[10px] font-mono uppercase tracking-widest text-slate-900 dark:text-white" -> better keep as is.
  
  // line 721
  ["bg-blue-500' : 'bg-primary-500'} text-slate-900 dark:text-white", "bg-blue-500' : 'bg-primary-500'} text-white"],
  
  // line 776
  ["disabled:cursor-not-allowed text-slate-900 dark:text-white font-bold py-4", "disabled:cursor-not-allowed text-white font-bold py-4"],
  
  // line 1013 history button text
  ["text-slate-100 hover:text-white", "text-primary-600 dark:text-primary-400 hover:text-white"],
  // wait actually there's a typo in text-slate-100... let's just use regex for it
  [/hover:bg-primary-500 text-slate-100 hover:text-white/g, "hover:bg-primary-500 text-primary-600 dark:text-primary-500 hover:text-white group-hover:text-white"],
]);

// Let's also check App.tsx
// App.tsx uses text-slate-900 dark:text-white in:
// line 244: <h2 ... text-slate-900 dark:text-white (correct)
// line 312: input text-slate-900 dark:text-white (correct)
// line 337: <h2 ... (correct)
// line 379: <h1 ... (correct)
// This file looks generally correct.
