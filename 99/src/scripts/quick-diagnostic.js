/**
 * 🔍 QUICK DIAGNOSTIC SCRIPT
 * 
 * Script para diagnosticar rapidamente problemas comuns no projeto.
 * Execute com: node scripts/quick-diagnostic.js
 */

const fs = require('fs');
const path = require('path');

// Cores para terminal
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - Missing: ${filePath}`, 'red');
    return false;
  }
}

function checkFileContent(filePath, searchString, description) {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    log(`❌ ${description} - File missing: ${filePath}`, 'red');
    return false;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  const found = content.includes(searchString);
  
  if (found) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`⚠️ ${description} - Content not found`, 'yellow');
    return false;
  }
}

function runDiagnostic() {
  log('\n🔍 99COACH PROJECT DIAGNOSTIC', 'bold');
  log('=====================================\n', 'blue');

  let totalChecks = 0;
  let passedChecks = 0;

  // Arquivos essenciais
  log('📁 Essential Files:', 'blue');
  const essentialFiles = [
    ['App.tsx', 'Main App component'],
    ['routes/AppRouter.tsx', 'App Router'],
    ['lib/env.ts', 'Environment utilities'],
    ['utils/supabase/info.tsx', 'Supabase credentials'],
    ['lib/supabase/client.ts', 'Supabase client'],
    ['styles/globals.css', 'Global styles'],
    ['components/ErrorBoundary.tsx', 'Error Boundary'],
    ['components/HealthCheck.tsx', 'Health Check component'],
    ['pages/SystemHealthPage.tsx', 'System Health page']
  ];

  essentialFiles.forEach(([file, desc]) => {
    totalChecks++;
    if (checkFile(file, desc)) passedChecks++;
  });

  // Páginas de teste
  log('\n🧪 Test Pages:', 'blue');
  const testPages = [
    ['pages/SpecialtiesGinTestPageBasic.tsx', 'Basic Specialties Test'],
    ['pages/SpecialtiesGinTestPageSimple.tsx', 'Simple Specialties Test'],
    ['pages/JsonbFiltersTestPage.tsx', 'JSONB Filters Test'],
    ['pages/DevAccessPageNew.tsx', 'Dev Access Page']
  ];

  testPages.forEach(([file, desc]) => {
    totalChecks++;
    if (checkFile(file, desc)) passedChecks++;
  });

  // Serviços críticos
  log('\n⚙️ Critical Services:', 'blue');
  const services = [
    ['services/specialties-search-optimized.service.ts', 'Optimized Specialties Search'],
    ['services/search.service.ts', 'Search Service'],
    ['hooks/useSpecialtiesSearchOptimized.ts', 'Specialties Search Hook'],
    ['utils/error-prevention.ts', 'Error Prevention Utils']
  ];

  services.forEach(([file, desc]) => {
    totalChecks++;
    if (checkFile(file, desc)) passedChecks++;
  });

  // Verificações de conteúdo
  log('\n🔍 Content Checks:', 'blue');
  const contentChecks = [
    ['App.tsx', '<ErrorBoundary>', 'App wrapped with ErrorBoundary'],
    ['routes/AppRouter.tsx', 'SystemHealthPage', 'System Health route'],
    ['lib/env.ts', 'ensureProcessEnv', 'Process.env polyfill'],
    ['services/specialties-search-optimized.service.ts', 'searchWithFallback', 'Fallback strategy'],
    ['styles/globals.css', 'health-status-healthy', 'Health check styles']
  ];

  contentChecks.forEach(([file, content, desc]) => {
    totalChecks++;
    if (checkFileContent(file, content, desc)) passedChecks++;
  });

  // Resumo
  log('\n📊 DIAGNOSTIC SUMMARY', 'bold');
  log('=====================================', 'blue');
  log(`Total checks: ${totalChecks}`);
  log(`Passed: ${passedChecks}`, passedChecks === totalChecks ? 'green' : 'yellow');
  log(`Failed: ${totalChecks - passedChecks}`, totalChecks - passedChecks === 0 ? 'green' : 'red');

  const percentage = Math.round((passedChecks / totalChecks) * 100);
  log(`Success rate: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');

  if (percentage >= 90) {
    log('\n🎉 System appears to be healthy!', 'green');
    log('You can run the application with confidence.', 'green');
  } else if (percentage >= 70) {
    log('\n⚠️ System has some issues but should work.', 'yellow');
    log('Consider fixing the missing files for optimal performance.', 'yellow');
  } else {
    log('\n❌ System has significant issues.', 'red');
    log('Please fix the missing files before running the application.', 'red');
  }

  // Próximos passos
  log('\n🚀 NEXT STEPS', 'bold');
  log('=====================================', 'blue');
  log('1. Visit: http://localhost:3000/system/health');
  log('2. Or try: http://localhost:3000/test/specialties-gin-basic');
  log('3. Dev tools: http://localhost:3000/dev');
  
  return percentage >= 70;
}

// Executar diagnóstico
if (require.main === module) {
  const success = runDiagnostic();
  process.exit(success ? 0 : 1);
}

module.exports = { runDiagnostic };