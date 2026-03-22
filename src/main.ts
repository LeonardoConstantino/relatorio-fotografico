import './styles/markdown.css';
import './styles/main.css';
import { persistenceService } from './services/PersistenceService';
import { logger } from './libs/Logger';
import { ToastManager } from './components/ui/toast';

// Import Layout & UI Components
import './components/ui/icon';
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
  ToastManager.show({
    message: 'Bem-vindo ao Aura Technical v2.0!',
    type: 'info',
    duration: 5000,
  });

  setTimeout(checkFirstRun, 5000)
}

function render() {
  const app = document.querySelector<HTMLDivElement>('#app')!;
  app.innerHTML = `<main-layout></main-layout>`;
}

/**
   * Verifica se é a primeira vez que o usuário abre o app
   */
  const checkFirstRun = () => {
    const helpModal = document.getElementById('modal-system-help') as any
    // Dica Pro: Use versionamento na chave.
    // Se no futuro você mudar muito o tutorial, mude para 'pm_intro_seen_v2'
    // e o modal aparecerá novamente para todos.
    const STORAGE_KEY = 'aura_studio_intro_seen_v1';

    const hasSeen = localStorage.getItem(STORAGE_KEY);

    if (!hasSeen && helpModal) {
      helpModal?.open()
      localStorage.setItem(STORAGE_KEY, 'true');
    }
  }

init();
