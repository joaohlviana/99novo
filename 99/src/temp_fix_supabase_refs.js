const fs = require('fs');

// Ler o arquivo
const filePath = '/services/training-programs.service.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Substituir todas as ocorrências de this.supabase por supabase
content = content.replace(/this\.supabase/g, 'supabase');

// Escrever de volta
fs.writeFileSync(filePath, content);

console.log('Corrigido: this.supabase -> supabase');