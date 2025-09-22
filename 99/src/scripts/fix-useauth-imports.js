#!/usr/bin/env node

/**
 * 🔧 SCRIPT: CORRIGIR IMPORTS USEAUTH
 * 
 * Este script corrige todos os imports incorretos do useAuth
 * De: import { useAuth } from '../hooks/useAuth'
 * Para: import { useAuth } from '../contexts/AuthContext'
 */

const fs = require('fs');
const path = require('path');

// Padrões de import incorretos para corrigir
const INCORRECT_PATTERNS = [
  /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/hooks\/useAuth['"];?/g,
  /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/hooks\/useAuth['"];?/g,
  /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\/hooks\/useAuth['"];?/g,
  /import\s*{\s*useAuth\s*}\s*from\s*['"]hooks\/useAuth['"];?/g,
  /import\s*{\s*useAuth\s*}\s*from\s*['"]\.\.\/\.\.\/\.\.\/hooks\/useAuth['"];?/g,
];

// Função para determinar o caminho correto baseado na localização do arquivo
function getCorrectImportPath(filePath) {
  const relativePath = path.relative(process.cwd(), filePath);
  const depth = relativePath.split(path.sep).length - 1;
  
  if (depth === 1) {
    // Arquivo na raiz (como App.tsx)
    return './contexts/AuthContext';
  } else if (depth === 2) {
    // Arquivo em subpasta (como components/*, pages/*)
    return '../contexts/AuthContext';
  } else if (depth === 3) {
    // Arquivo em subpasta profunda (como components/trainer/*, components/ui/*)
    return '../../contexts/AuthContext';
  } else if (depth === 4) {
    // Arquivo muito profundo
    return '../../../contexts/AuthContext';
  }
  
  // Fallback: calcular dinamicamente
  const dotsNeeded = '../'.repeat(depth);
  return `${dotsNeeded}contexts/AuthContext`;
}

// Função para processar um arquivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let newContent = content;
    
    // Verificar se tem algum import incorreto
    const hasIncorrectImport = INCORRECT_PATTERNS.some(pattern => pattern.test(content));
    
    if (hasIncorrectImport) {
      console.log(`🔧 Corrigindo: ${filePath}`);
      
      // Obter o caminho correto para este arquivo
      const correctPath = getCorrectImportPath(filePath);
      const correctImport = `import { useAuth } from '${correctPath}';`;
      
      // Aplicar todas as correções
      INCORRECT_PATTERNS.forEach(pattern => {
        if (pattern.test(newContent)) {
          newContent = newContent.replace(pattern, correctImport);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Corrigido: ${filePath} -> ${correctPath}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para percorrer diretórios recursivamente
function walkDirectory(dir, extensions = ['.tsx', '.ts']) {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular certas pastas
        if (!['node_modules', '.git', 'dist', 'build'].includes(item)) {
          files.push(...walkDirectory(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        // Incluir apenas arquivos com extensões relevantes
        if (extensions.some(ext => fullPath.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Não foi possível ler diretório ${dir}:`, error.message);
  }
  
  return files;
}

// Função principal
function main() {
  console.log('🚀 Iniciando correção de imports useAuth...\n');
  
  const projectRoot = process.cwd();
  const files = walkDirectory(projectRoot);
  
  let totalFixed = 0;
  
  // Processar todos os arquivos
  files.forEach(file => {
    if (processFile(file)) {
      totalFixed++;
    }
  });
  
  console.log(`\n🎉 Concluído! ${totalFixed} arquivo(s) corrigido(s).`);
  
  if (totalFixed === 0) {
    console.log('✅ Nenhum import incorreto encontrado.');
  } else {
    console.log('\n📋 Resumo das correções:');
    console.log('- Imports incorretos removidos');
    console.log('- Imports corretos adicionados baseados na localização');
    console.log('- Todos os caminhos relativos ajustados');
  }
}

// Executar script
if (require.main === module) {
  main();
}

module.exports = { processFile, walkDirectory, getCorrectImportPath };