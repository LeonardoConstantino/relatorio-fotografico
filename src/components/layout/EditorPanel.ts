import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';
import { SectionType } from '../../types/Section';
import { escapeHTML } from '../../utils/sanitize';

// Import Editores
import '../features/ImageSectionEditor';
import '../features/EquipmentSectionEditor';
import '../features/TextSectionEditor';
import '../features/BulletSectionEditor';
import '../features/SortableList';
import '../ui/StatusBar';

export class EditorPanel extends HTMLElement {
  private isInitialized = false;

  connectedCallback() {
    if (!this.isInitialized) {
      this.renderSkeleton();
      this.isInitialized = true;
    }
    this.renderSections();
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    EventBus.on(STORE_EVENTS.SECTION_ADDED, () => this.renderSections());
    EventBus.on(STORE_EVENTS.SECTION_REMOVED, () => this.renderSections());
    EventBus.on(STORE_EVENTS.SECTIONS_REORDERED, () => this.renderSections());
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, (data: any) => {
      this.syncInputs(data);
      // Se não há seções e o container tem algo, re-renderiza (caso de reset)
      if (data.sections?.length === 0) {
        this.renderSections();
      }
    });

    EventBus.on(STORE_EVENTS.LAYOUT_WARNING, (data: any) => {
      const banner = this.querySelector('#layout-alert');
      if (banner) {
        if (data.hasOverflow) {
          banner.classList.remove('hidden');
          banner.classList.add('flex');
        } else {
          banner.classList.add('hidden');
          banner.classList.remove('flex');
        }
      }
    });
  }

  private renderSkeleton() {
    const { config } = store.state;
    this.className = 'panel-editor';

    this.innerHTML = `
      <div id="layout-alert" class="hidden mb-6 bg-accent-danger text-white p-3 rounded-md text-[11px] font-bold uppercase tracking-wider animate-pulse items-center gap-3 shadow-lg">
        <span>⚠️</span>
        <span>Atenção: O conteúdo ultrapassou o limite da página A4. Insira uma quebra de página ou reduza os textos.</span>
      </div>

      <h1 class="title-studio">📋 Aura Estúdio</h1>

      <section-card header-title="⚙️ Configurações Gerais" section-id="global-config" hide-remove>
        <div class="space-y-4">
          <!-- Upload de Logo -->
          <div>
            <label class="label-technical">Logo da Empresa</label>
            <div class="flex items-center gap-4">
              <div id="logo-preview" class="w-12 h-12 rounded border border-studio-border bg-studio-elevated flex items-center justify-center overflow-hidden">
                ${config.logo ? `<img src="${config.logo}" class="w-full h-full object-contain" />` : '<span class="text-xs">LOGO</span>'}
              </div>
              <input type="file" id="input-logo" accept="image/*" class="hidden" />
              <app-button variant="outline" class="py-1! text-[10px]" onclick="document.getElementById('input-logo').click()">Trocar</app-button>
            </div>
          </div>

          <!-- Cor Primária -->
          <div>
            <label class="label-technical">Cor do Relatório</label>
            <div class="flex gap-3 items-center">
              <input type="color" id="input-color" value="${config.primaryColor || '#4f46e5'}" class="w-10 h-10 rounded bg-transparent border-none cursor-pointer" />
              <span class="font-mono text-xs text-studio-muted uppercase">${config.primaryColor}</span>
            </div>
          </div>

          <app-input label="Título do Relatório" value="${escapeHTML(config.title)}" data-prop="title" id="input-title"></app-input>
          <app-input label="Empresa / Cliente" value="${escapeHTML(config.company || '')}" data-prop="company" id="input-company"></app-input>
          
          <div class="grid grid-cols-2 gap-2">
            <app-input label="Nº Relatório" value="${escapeHTML(config.reportNumber || '')}" data-prop="reportNumber"></app-input>
            <app-input label="Data" value="${escapeHTML(config.reportDate || '')}" data-prop="reportDate"></app-input>
          </div>
        </div>
      </section-card>

      <sortable-list id="sections-container" class="mt-8 block space-y-4"></sortable-list>

      <div class="mt-12 pt-8 border-t border-studio-border">
        <label class="label-technical mb-4 block text-center">Inserir Novo Módulo</label>
        <div class="grid grid-cols-2 gap-3">
          <app-button variant="secondary" id="add-equipment">📦 Equipamento</app-button>
          <app-button variant="secondary" id="add-text">📝 Texto Livre</app-button>
          <app-button variant="secondary" id="add-bullets">• Lista Itens</app-button>
          <app-button variant="secondary" id="add-images">📷 Galeria</app-button>
          <app-button variant="outline" id="add-pagebreak" class="col-span-2">⤵️ Quebra de Página</app-button>
        </div>
      </div>

      <div class="mt-10 pb-12">
        <app-button variant="danger" id="clear-report" class="w-full">🗑️ Novo Relatório</app-button>
      </div>
      <app-status-bar></app-status-bar>
      `;


    this.setupActions();
  }

  private renderSections() {
    const container = this.querySelector('#sections-container');
    if (!container) return;
    const { sections } = store.state;

    container.innerHTML = sections
      .map(
        (section) => `
      <section-card header-title="${escapeHTML(this.getSectionLabel(section.type))}" section-id="${section.id}">
        ${this.renderSectionEditor(section.id, section.type)}
      </section-card>
    `,
      )
      .join('');
  }

  private renderSectionEditor(id: string, type: SectionType): string {
    switch (type) {
      case 'images':
        return `<image-section-editor section-id="${id}"></image-section-editor>`;
      case 'equipment':
        return `<equipment-section-editor section-id="${id}"></equipment-section-editor>`;
      case 'text':
        return `<text-section-editor section-id="${id}"></text-section-editor>`;
      case 'bullets':
        return `<bullet-section-editor section-id="${id}"></bullet-section-editor>`;
      case 'pagebreak':
        return `<div class="py-4 border border-dashed border-studio-border text-center text-[10px] text-studio-muted font-mono uppercase tracking-widest">Página encerra aqui</div>`;
      default:
        return `<p class="text-studio-muted text-[10px]">Editor não encontrado</p>`;
    }
  }

  private syncInputs(data: any) {
    if (!data.config) return;
    // Atualiza CSS Variable da cor em tempo real
    if (data.config.primaryColor) {
      document.documentElement.style.setProperty(
        '--color-accent-primary',
        data.config.primaryColor,
      );
    }

    // Reset do preview da logo
    const logoPreview = this.querySelector('#logo-preview');
    if (logoPreview) {
      logoPreview.innerHTML = data.config.logo
        ? `<img src="${data.config.logo}" class="w-full h-full object-contain" />`
        : '<span class="text-xs">LOGO</span>';
    }

    const inputs = this.querySelectorAll<any>('app-input[data-prop]');
    inputs.forEach((input) => {
      const prop = input.getAttribute('data-prop');
      if (prop && data.config[prop] !== undefined) {
        if (document.activeElement !== input.querySelector('input')) {
          input.setAttribute('value', escapeHTML(data.config[prop]));
        }
      }
    });
  }

  private setupActions() {
    this.querySelector('#add-equipment')?.addEventListener('click', () =>
      store.addSection('equipment'),
    );
    this.querySelector('#add-text')?.addEventListener('click', () =>
      store.addSection('text'),
    );
    this.querySelector('#add-bullets')?.addEventListener('click', () =>
      store.addSection('bullets'),
    );
    this.querySelector('#add-images')?.addEventListener('click', () =>
      store.addSection('images'),
    );
    this.querySelector('#add-pagebreak')?.addEventListener('click', () =>
      store.addSection('pagebreak'),
    );

    // Cor Primária
    this.querySelector('#input-color')?.addEventListener('input', (e: any) => {
      const color = e.target.value;
      store.updateConfig({ primaryColor: color });
      this.querySelector('#input-color + span')!.textContent = color;
    });

    // Logo Upload
    this.querySelector('#input-logo')?.addEventListener('change', (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          const base64 = re.target?.result as string;
          store.updateConfig({ logo: base64 });
          this.querySelector('#logo-preview')!.innerHTML =
            `<img src="${base64}" class="w-full h-full object-contain" />`;
        };
        reader.readAsDataURL(file);
      }
    });

    this.querySelector('#clear-report')?.addEventListener('click', () => {
      if (confirm('Limpar dados?')) {
        store.clearReport();
      }
    });

    this.addEventListener('app-input', (e: any) => {
      const prop = (e.target as HTMLElement).getAttribute('data-prop');
      if (prop) store.updateConfig({ [prop]: e.detail.value });
    });

    this.addEventListener('remove-section', (e: any) =>
      store.removeSection(e.detail.id),
    );
    this.addEventListener('items-reordered', (e: any) =>
      store.reorderSections(e.detail.fromIndex, e.detail.toIndex),
    );
  }

  private getSectionLabel(type: SectionType): string {
    const labels: Record<SectionType, string> = {
      equipment: '📦 Equipamento',
      text: '📝 Texto Livre',
      bullets: '• Lista de Itens',
      images: '📷 Registro Fotográfico',
      pagebreak: '⤵️ Quebra de Página',
    };
    return labels[type];
  }
}

customElements.define('editor-panel', EditorPanel);
