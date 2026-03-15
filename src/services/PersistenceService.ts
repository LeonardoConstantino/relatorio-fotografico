import { store, STORE_EVENTS } from '../store/AppStore';
import { IndexedDBStorage } from '../libs/IndexedDBStorage';
import { Report } from '../types/Report';
import EventBus from '../libs/EventBus';
import { logger } from '../libs/Logger';

/**
 * Serviço responsável por persistir o estado do AppStore no IndexedDB
 */
export class PersistenceService {
  private static STORAGE_KEY = 'aura_current_report';
  private storage: IndexedDBStorage<Report>;
  private isSaving = false;

  constructor() {
    this.storage = new IndexedDBStorage<Report>(
      PersistenceService.STORAGE_KEY,
      store.state,
    );
  }

  /**
   * Inicializa o serviço, carregando dados salvos se existirem
   */
  async initialize(): Promise<void> {
    logger.info('Persistence', 'Inicializando serviço de persistência...');

    try {
      await this.storage.initialize();
      const savedReport = this.storage.getValue();

      if (savedReport && savedReport.sections.length > 0) {
        logger.debug(
          'Persistence',
          'Relatório anterior encontrado, carregando no Store...',
        );
        store.loadState(savedReport);
      } else {
        logger.debug(
          'Persistence',
          'Nenhum relatório prévio relevante encontrado.',
        );
      }

      this.setupListeners();
    } catch (error) {
      logger.error('Persistence', 'Falha ao inicializar persistência', error);
    }
  }

  /**
   * Configura os ouvintes de eventos para salvar automaticamente
   */
  private setupListeners(): void {
    // Escuta mudanças globais no relatório
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, (newReport: Report) => {
      this.handleAutoSave(newReport);
    });

    logger.debug('Persistence', 'Auto-save ativado.');
  }

  /**
   * Executa o salvamento com uma pequena proteção de concorrência (debounce simples)
   */
  private async handleAutoSave(report: Report): Promise<void> {
    if (this.isSaving) return;

    this.isSaving = true;
    EventBus.emit(STORE_EVENTS.PERSISTENCE_SAVING);
    try {
      await this.storage.setValue(report);
      EventBus.emit(STORE_EVENTS.PERSISTENCE_SAVED);
    } catch (error) {
      logger.error('Persistence', 'Erro ao salvar automaticamente', error);
    } finally {
      // Pequeno delay para evitar excesso de escritas em mudanças rápidas
      setTimeout(() => {
        this.isSaving = false;
      }, 500);
    }
  }

  /**
   * Método para limpar os dados salvos (útil para "Novo Relatório")
   */
  async clearPersistence(): Promise<void> {
    await this.storage.setValue(store.state);
    logger.info('Persistence', 'Dados de persistência resetados.');
  }
}

// Exporta instância única
export const persistenceService = new PersistenceService();
