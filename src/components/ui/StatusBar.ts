import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';

export class StatusBar extends HTMLElement {
  private isSaving = false;
  private lastSaved: string = '--:--:--';
  private storageUsage: string = '0.0';

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

    const titleInfo = `Último salvamento: ${this.lastSaved}\nUso de Disco: ${this.storageUsage}MB / 50MB (Estimado)\nTrace ID: ${traceId}\nVersão do Schema: ${state.meta.schemaVersion}`;

    this.className = 'fixed bottom-0 left-0 w-105 bg-studio-base border-t border-studio-border h-8 flex items-center px-4 justify-between z-50 select-none cursor-help';
    this.setAttribute('title', titleInfo);

    this.innerHTML = `
      <div class="flex items-center gap-4 font-mono text-[9px] text-studio-muted">
        <div class="flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full ${this.isSaving ? 'bg-accent-cyan animate-pulse' : 'bg-green-500'}"></span>
          <span class="uppercase tracking-widest">${this.isSaving ? 'Salvando...' : 'Sincronizado'}</span>
        </div>
        <div class="w-px h-3 bg-studio-border"></div>
        <div class="flex gap-3">
          <span>MODS: ${sectionCount}</span>
          <span>FOTOS: ${imageCount}</span>
          <span>PAGS: ${pageCount}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 font-mono text-[9px] text-studio-muted">
        <span>ID: ${traceId}</span>
        <div class="w-px h-3 bg-studio-border"></div>
        <span>${this.storageUsage}MB</span>
      </div>
    `;
  }
}

customElements.define('app-status-bar', StatusBar);
