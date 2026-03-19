import { Report } from '../types/Report';
import { ReportConfig } from '../types/Config';
import { ReportSection, SectionType, SectionData, ReportTemplate } from '../types/Section';
import EventBus from '../libs/EventBus';
import { logger } from '../libs/Logger';

/**
 * Eventos emitidos pelo Store
 */
export const STORE_EVENTS = {
  REPORT_UPDATED: 'store:report_updated',
  STATE_LOADED: 'store:state_loaded',
  SECTION_ADDED: 'store:section_added',
  SECTION_REMOVED: 'store:section_removed',
  SECTIONS_REORDERED: 'store:sections_reordered',
  LAYOUT_WARNING: 'store:layout_warning',
  VALIDATION_UPDATED: 'store:validation_updated',
  PERSISTENCE_SAVING: 'store:persistence_saving',
  PERSISTENCE_SAVED: 'store:persistence_saved',
};

class AppStore {
  private _report: Report;
  private _customTemplate: ReportTemplate | null = null;

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
      ui: {
        previewVisible: true,
        previewScale: 1,
      },
    };
  }

  /**
   * Alterna a visibilidade do painel de preview
   */
  togglePreview(): void {
    this._report.ui.previewVisible = !this._report.ui.previewVisible;
    this.notify();
  }

  /**
   * Define o zoom do preview
   */
  setPreviewScale(scale: number): void {
    this._report.ui.previewScale = Math.max(0.2, Math.min(2.0, scale));
    this.notify();
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
    EventBus.emit(STORE_EVENTS.STATE_LOADED, report);
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
   * @param keepConfig Se true, mantém as configurações globais (logo, cor, empresa)
   */
  clearReport(keepConfig: boolean = false): void {
    const currentConfig = { ...this._report.config };
    this._report = this.getInitialState();
    
    if (keepConfig) {
      this._report.config = currentConfig;
    }
    
    logger?.debug('Store', `Relatório limpo. KeepConfig: ${keepConfig}`);
    EventBus.emit(STORE_EVENTS.STATE_LOADED, this.state);
    this.notify();
  }

  /**
   * Aplica um template de seções ao relatório atual
   */
  applyTemplate(template: ReportTemplate): void {
    const currentConfig = { ...this._report.config };
    this._report = this.getInitialState();
    this._report.config = currentConfig;

    template.sections.forEach((item) => {
      const id = crypto.randomUUID();
      const section: ReportSection = {
        id,
        type: item.type,
        data: this.getDefaultDataForType(item.type),
      };

      if (item.defaultTitle) {
        (section.data as any).title = item.defaultTitle;
      }

      this._report.sections.push(section);
    });

    logger?.info('Store', `Template "${template.name}" aplicado.`);
    EventBus.emit(STORE_EVENTS.STATE_LOADED, this.state);
    this.notify();
  }

  /**
   * Define e persiste um template customizado
   */
  setCustomTemplate(template: ReportTemplate): void {
    this._customTemplate = template;
    logger?.info('Store', 'Template customizado atualizado.');
    this.notify();
  }

  /**
   * Retorna o template customizado (se existir)
   */
  getCustomTemplate(): ReportTemplate | null {
    return this._customTemplate;
  }

  /**
   * Retorna o template atual (customizado ou padrão)
   */
  getQuickTemplate(): ReportTemplate {
    return this._customTemplate || this.getDefaultTemplate();
  }

  /**
   * Retorna o template padrão
   */
  getDefaultTemplate(): ReportTemplate {
    return {
      id: 'default-quick-start',
      name: 'Inspeção Padrão',
      sections: [
        { type: 'equipment', defaultTitle: '📦 Identificação do Equipamento' },
        { type: 'images', defaultTitle: '📷 Registro de Entrada' },
        { type: 'images', defaultTitle: '📷 Registro de Saída' },
        { type: 'images', defaultTitle: '📷 Detalhes Críticos' },
        { type: 'text', defaultTitle: '📝 Observações Finais' },
      ],
    };
  }

  /**
 * Executa uma validação informativa do relatório
 * Retorna array de objetos com warnings e localização dos campos
 */
getValidationWarnings(): Array<{ message: string; sectionId?: string; field?: string }> {
  const warnings: Array<{ message: string; sectionId?: string; field?: string }> = [];
  const { config, sections } = this._report;

  // Validação de Identidade
  if (!config.company?.trim()) {
    warnings.push({ 
      message: 'Identidade: Nome da Empresa ausente.',
      field: 'config.company' 
    });
  }
  
  if (!config.reportNumber?.trim()) {
    warnings.push({ 
      message: 'Identidade: Número do Relatório ausente.',
      field: 'config.reportNumber' 
    });
  }

  if (!config.logo?.trim()) {
    warnings.push({ 
      message: 'Identidade: Logo não adicionada.',
      field: 'config.logo' 
    });
  }

  // Validação de Seções
  sections.forEach((s) => {
    const data = s.data as any;
    const label = this.getSectionLabel(s.type);

    if (s.type === 'equipment') {
      if (!data.patrimony?.trim()) {
        warnings.push({
          message: `${label}: Patrimônio não informado.`,
          sectionId: s.id,
          field: 'patrimony',
        });
      }
      if (!data.description?.trim()) {
        warnings.push({
          message: `${label}: Descrição do equipamento vazia.`,
          sectionId: s.id,
          field: 'description',
        });
      }
    }

    if (s.type === 'text' && !data.content?.trim()) {
      warnings.push({
        message: `${label}: Conteúdo de texto vazio.`,
        sectionId: s.id,
        field: 'content',
      });
    }

    if (s.type === 'bullets') {
      const hasValidItems = data.items?.some((item: string) => item?.trim());
      if (!hasValidItems) {
        warnings.push({
          message: `${label}: Nenhum item preenchido.`,
          sectionId: s.id,
          field: 'items',
        });
      }
    }

    if (s.type === 'images' && (!data.images || data.images.length === 0)) {
      warnings.push({
        message: `${label}: Nenhuma foto adicionada.`,
        sectionId: s.id,
        field: 'images',
      });
    }
  });

  return warnings;
}

  /**
 * Retorna um rótulo amigável para o tipo de seção
 */
private getSectionLabel(type: SectionType): string {
  const labels: Record<SectionType, string> = {
    equipment: '📦 Equipamento',
    text: '📝 Texto',
    bullets: '📋 Lista',
    images: '📷 Galeria',
    pagebreak: '⏸️ Quebra de Página',
  };
  return labels[type] || '❓ Desconhecido';
}

  private notify(): void {
    this._report.meta.lastModified = Date.now();
    EventBus.emit(STORE_EVENTS.REPORT_UPDATED, this.state);
    EventBus.emit(STORE_EVENTS.VALIDATION_UPDATED, this.getValidationWarnings());
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
