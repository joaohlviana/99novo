#!/usr/bin/env node

/**
 * Script para corrigir importações com versões específicas
 * Remove as versões dos imports @radix-ui e lucide-react
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const componentsDir = path.join(__dirname, 'components/ui');

// Regex patterns para encontrar imports com versões
const patterns = [
  /@radix-ui\/([^@\s"']+)@[\d.]+/g,
  /lucide-react@[\d.]+/g,
  /class-variance-authority@[\d.]+/g,
  /@radix-ui\/react-slot@[\d.]+/g
];

// Função para corrigir um arquivo
function fixFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let fixedContent = content;
    let hasChanges = false;

    // Aplicar cada pattern
    patterns.forEach(pattern => {
      const newContent = fixedContent.replace(pattern, (match) => {
        hasChanges = true;
        if (match.includes('@radix-ui/')) {
          return match.split('@').slice(0, -1).join('@');
        }
        if (match.includes('lucide-react@')) {
          return 'lucide-react';
        }
        if (match.includes('class-variance-authority@')) {
          return 'class-variance-authority';
        }
        return match;
      });
      fixedContent = newContent;
    });

    if (hasChanges) {
      fs.writeFileSync(filePath, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(__dirname, filePath)}`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
  }
}

// Processar todos os arquivos .tsx no diretório components/ui
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const filePath = path.join(dir, file);
      fixFile(filePath);
    }
  });
}

console.log('🔧 Fixing imports with versions...');
processDirectory(componentsDir);
console.log('✅ All imports fixed!');