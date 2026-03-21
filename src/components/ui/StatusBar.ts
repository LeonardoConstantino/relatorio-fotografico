import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';

export class StatusBar extends HTMLElement {
  private isSaving = false;
  private lastSaved: string = '--:--:--';
  private storageUsage: string = '0.0';
  private warnings: Array<{ message: string; sectionId?: string; field?: string }> = [];

  connectedCallback() {
    this.render();
    this.setupListeners();
    this.updateLastSaved();
  }

  private setupListeners() {
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, () => this.render());
    EventBus.on(STORE_EVENTS.PERSISTENCE_SAVING, () => {
      this.isSaving = true;
      this.render();
    });
    EventBus.on(STORE_EVENTS.PERSISTENCE_SAVED, () => {
      this.isSaving = false;
      this.updateLastSaved();
      this.render();
    });
    EventBus.on(STORE_EVENTS.VALIDATION_UPDATED, (warnings: Array<{ message: string; sectionId?: string; field?: string }> = []) => {
      this.warnings = warnings;
      this.render();
    });
  }

  private updateLastSaved() {
    const now = new Date();
    this.lastSaved = now.toLocaleTimeString('pt-BR', { hour12: false });
    
    // Estimativa bruta de uso de disco baseada no tamanho do JSON
    const jsonSize = JSON.stringify(store.state).length;
    this.storageUsage = (jsonSize / (1024 * 1024)).toFixed(2);
  }

  render() {
    const state = store.state;
    const sectionCount = state.sections.length;
    const imageCount = state.sections.reduce((acc, s) => {
      if (s.type === 'images') return acc + (s.data as any).images.length;
      return acc;
    }, 0);

    // Estimativa de páginas baseada em quebras de página + 1
    const pageCount = state.sections.filter(s => s.type === 'pagebreak').length + 1;
    const traceId = state.meta.createdAt.toString(36).toUpperCase();

    const titleInfo = `Último salvamento: ${this.lastSaved}\nUso de Disco: ${this.storageUsage}MB / 50MB (Estimado)\nTrace ID: ${traceId}\nVersão do Schema: ${state.meta.schemaVersion}\n\nPENPENDÊNCIAS:\n${this.warnings.length > 0 ? this.warnings.map(w => '• ' + w.message).join('\n') : 'Nenhuma'}`;

    this.className = 'fixed bottom-0 left-0 w-105 bg-studio-base border-t border-studio-border h-8 flex items-center px-4 justify-between z-50 select-none';
    
    this.innerHTML = `
      <div class="flex items-center gap-4 font-mono text-[9px] text-studio-muted h-full">
        <div class="flex items-center gap-1.5 cursor-help" title="${titleInfo}">
          <span class="w-1.5 h-1.5 rounded-full ${this.isSaving ? 'bg-accent-cyan animate-pulse' : 'bg-green-500'}"></span>
          <span class="uppercase tracking-widest">${this.isSaving ? 'Syncing...' : 'Sync'}</span>
        </div>
        <div class="w-px h-3 bg-studio-border"></div>
        <div class="flex gap-3 h-full items-center">
          <span title="Total de Módulos">MODS: ${sectionCount}</span>
          <span title="Total de Fotos">FOTOS: ${imageCount}</span>
          <span title="Páginas Estimadas">PAGS: ${pageCount}</span>
          ${this.warnings.length > 0 ? `<span class="text-[#F59E0B] font-bold animate-pulse" title="${this.warnings.map(w => w.message).join('\n')}"><ui-icon name="alert-triangle" size="xs" class="shrink-0"></ui-icon> ${this.warnings.length}</span>` : ''}
          <span id="view-toggle-status" class="text-accent-primary font-bold cursor-pointer hover:scale-110 transition-transform px-1" title="Alternar Preview (Alt+P)">VIEW: ${state.ui.previewVisible
              ? '<ui-icon name="eye" size="xs"></ui-icon>'
              : '<ui-icon name="eye-off" size="xs"></ui-icon>'}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 font-mono text-[9px] text-studio-muted cursor-help" title="${titleInfo}">
        <span>ID: ${traceId}</span>
        <div class="w-px h-3 bg-studio-border"></div>
        <span>${this.storageUsage}MB</span>
      </div>
    `;

    this.querySelector('#view-toggle-status')?.addEventListener('click', (e) => {
      e.stopPropagation();
      store.togglePreview();
    });
  }
}

customElements.define('app-status-bar', StatusBar);
