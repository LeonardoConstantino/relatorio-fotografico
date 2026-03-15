import { Report } from '../types/Report';
import { ReportConfig } from '../types/Config';
import { ReportSection, SectionType, SectionData } from '../types/Section';
import EventBus from '../libs/EventBus';
import { logger } from '../libs/Logger';

/**
 * Eventos emitidos pelo Store
 */
export const STORE_EVENTS = {
  REPORT_UPDATED: 'store:report_updated',
  SECTION_ADDED: 'store:section_added',
  SECTION_REMOVED: 'store:section_removed',
  SECTIONS_REORDERED: 'store:sections_reordered',
  LAYOUT_WARNING: 'store:layout_warning',
  PERSISTENCE_SAVING: 'store:persistence_saving',
  PERSISTENCE_SAVED: 'store:persistence_saved',
};

class AppStore {
  private _report: Report;

  constructor() {
    this._report = this.getInitialState();
  }

  private getInitialState(): Report {
    return {
      meta: {
        schemaVersion: '2.0',
        createdAt: Date.now(),
        lastModified: Date.now(),
      },
      config: {
        logo: '',
        title: 'Relatório de Recebimento',
        primaryColor: '#4f46e5',
        company: '',
        reportNumber: '',
        reportDate: new Date().toLocaleDateString('pt-BR'),
      },
      sections: [],
    };
  }

  /**
   * Retorna o estado atual (read-only por convenção)
   */
  get state(): Report {
    return { ...this._report };
  }

  /**
   * Carrega um estado completo (ex: vindo do IndexedDB)
   */
  loadState(report: Report): void {
    this._report = report;
    this.notify();
  }

  /**
   * Atualiza as configurações globais
   */
  updateConfig(config: Partial<ReportConfig>): void {
    this._report.config = { ...this._report.config, ...config };
    this.notify();
  }

  /**
   * Adiciona uma nova seção
   */
  addSection(type: SectionType): void {
    const id = crypto.randomUUID();
    const newSection: ReportSection = {
      id,
      type,
      data: this.getDefaultDataForType(type),
    };

    this._report.sections.push(newSection);
    logger?.debug('Store', `Seção adicionada: ${type} (${id})`);

    EventBus.emit(STORE_EVENTS.SECTION_ADDED, newSection);
    this.notify();
  }

  /**
   * Remove uma seção pelo ID
   */
  removeSection(id: string): void {
    const index = this._report.sections.findIndex((s) => s.id === id);
    if (index !== -1) {
      this._report.sections.splice(index, 1);
      EventBus.emit(STORE_EVENTS.SECTION_REMOVED, id);
      this.notify();
    }
  }

  /**
   * Atualiza os dados de uma seção específica
   */
  updateSectionData(id: string, data: Partial<SectionData>): void {
    const section = this._report.sections.find((s) => s.id === id);
    if (section) {
      section.data = { ...section.data, ...data } as any;
      this.notify();
    }
  }

  /**
   * Reordena as seções
   */
  reorderSections(fromIndex: number, toIndex: number): void {
    const result = Array.from(this._report.sections);
    const [removed] = result.splice(fromIndex, 1);
    result.splice(toIndex, 0, removed);

    this._report.sections = result;
    EventBus.emit(STORE_EVENTS.SECTIONS_REORDERED, result);
    this.notify();
  }

  /**
   * Reseta o relatório para o estado inicial
   */
  clearReport(): void {
    this._report = this.getInitialState();
    logger?.debug('Store', 'Relatório limpo para estado inicial');
    this.notify();
  }

  private notify(): void {
    this._report.meta.lastModified = Date.now();
    EventBus.emit(STORE_EVENTS.REPORT_UPDATED, this.state);
  }

  private getDefaultDataForType(type: SectionType): SectionData {
    switch (type) {
      case 'equipment':
        return {
          title: 'Identificação do Equipamento',
          description: '',
          model: '',
          patrimony: '',
          owner: '',
        };
      case 'text':
        return { title: 'Observações', content: '' };
      case 'bullets':
        return { title: 'Itens Verificados', items: [''] };
      case 'images':
        return { title: 'Registro Fotográfico', columns: 2, images: [] };
      case 'pagebreak':
        return { title: 'Quebra de Página' };
      default:
        throw new Error(`Tipo de seção desconhecido: ${type}`);
    }
  }
}

// Exporta singleton
export const store = new AppStore();
