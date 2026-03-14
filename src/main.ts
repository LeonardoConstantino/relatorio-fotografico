import './styles/main.css';
import { persistenceService } from './services/PersistenceService';
import { logger } from './libs/Logger';

// Import Layout & UI Components
import './components/ui/AppButton';
import './components/ui/AppInput';
import './components/ui/SectionCard';
import './components/layout/MainLayout';

// PWA Registration
import './libs/pwa-register';

async function init() {
  logger.info('App', 'Iniciando Aura Technical v2.0...');
  await persistenceService.initialize();
  render();
}

function render() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `<main-layout></main-layout>`;
}

init();
