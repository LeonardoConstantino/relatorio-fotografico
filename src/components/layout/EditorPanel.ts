import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';
import { logger } from '../../libs/Logger';
import { SectionType } from '../../types/Section';
import { escapeHTML } from '../../utils/sanitize';
import { confirmDialog } from '../ui/confirm';
import { ToastManager } from '../ui/toast';

// Import Editores
import '../features/ImageSectionEditor';
import '../features/EquipmentSectionEditor';
import '../features/TextSectionEditor';
import '../features/BulletSectionEditor';
import '../features/SortableList';
import '../ui/StatusBar';
import '../ui/modal';

export class EditorPanel extends HTMLElement {
  private isInitialized = false;
  private draftTemplate: any = null;

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
    EventBus.on(STORE_EVENTS.STATE_LOADED, () => this.renderSections());
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, (data: any) => {
      this.syncInputs(data);
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

      <div class="flex items-center justify-between mb-8">
        <h1 class="title-studio !mb-0">📋 Aura Estúdio</h1>
        <button id="toggle-preview" class="btn btn-outline !py-1 !px-2 text-xs" title="Alternar Preview (Alt+P)">
          ${store.state.ui.previewVisible ? '👁️' : '🙈'}
        </button>
        </div>

        <!-- Ações Rápidas -->
        <div class="grid grid-cols-6 gap-2 mb-6">
        <button id="quick-start" class="col-span-5 btn btn-primary !py-2 !text-[11px] uppercase tracking-wider" title="Inicia um novo relatório com a estrutura padrão">
          ⚡ Início Rápido
        </button>
        <button id="edit-template" class="btn btn-secondary !p-0 flex items-center justify-center text-sm" title="Configurar Template Padrão">
          ⚙️
        </button>
        </div>

        <section-card header-title="⚙️ Configurações Gerais"
 section-id="global-config" hide-remove>
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

      <div class="mt-10 pt-8 border-t border-studio-border">
        <label class="label-technical mb-4 block">💾 Gestão de Dados (JSON)</label>
        <div class="grid grid-cols-2 gap-3">
          <app-button variant="outline" id="export-json" class="!py-2 !text-[10px]">📤 Exportar Backup</app-button>
          <app-button variant="outline" id="import-json" class="!py-2 !text-[10px]">📥 Importar JSON</app-button>
          <input type="file" id="input-import-json" accept=".json" class="hidden" />
        </div>
      </div>

      <div class="mt-10 pb-12">
        <div class="flex items-center gap-2 mb-3 group cursor-pointer" onclick="this.querySelector('input').click()">
          <input type="checkbox" id="keep-config" class="w-4 h-4 rounded border-studio-border bg-studio-elevated accent-accent-primary cursor-pointer" checked />
          <label class="label-technical !mb-0 cursor-pointer group-hover:text-white transition-colors">Manter Logo e Dados da Empresa</label>
        </div>
        <app-button variant="danger" id="clear-report" class="w-full">🗑️ Novo Relatório (Limpar)</app-button>
      </div>

      <!-- Modal: Editor de Template -->
      <ui-modal id="modal-template" size="md" animation="scale">
        <div slot="header">
          <h1>Configurar Início Rápido</h1>
        </div>
        <div class="space-y-6">
          <p class="text-xs text-studio-muted leading-relaxed">
            Defina a "receita" padrão que será carregada ao clicar no botão de Início Rápido.
          </p>
          
          <div id="template-editor-list" class="space-y-2 border-y border-studio-border py-4">
            <!-- Gerado dinamicamente -->
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-secondary !py-1 !text-[10px]" data-add-tmpl="equipment">+ Equipamento</button>
            <button class="btn btn-secondary !py-1 !text-[10px]" data-add-tmpl="images">+ Galeria</button>
            <button class="btn btn-secondary !py-1 !text-[10px]" data-add-tmpl="text">+ Texto</button>
            <button class="btn btn-secondary !py-1 !text-[10px]" data-add-tmpl="bullets">+ Lista</button>
            <button class="btn btn-secondary !py-1 !text-[10px]" data-add-tmpl="pagebreak">+ Quebra</button>
          </div>
        </div>

        <div slot="footer" class="flex justify-end gap-3">
          <button class="btn btn-outline" onclick="document.getElementById('modal-template').close()">Cancelar</button>
          <button class="btn btn-primary" id="save-template-btn">Salvar Template</button>
        </div>
      </ui-modal>

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
        '--report-primary-color',
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

    const toggleBtn = this.querySelector('#toggle-preview');
    if (toggleBtn) {
      toggleBtn.textContent = data.ui.previewVisible ? '👁️' : '🙈';
    }
  }

  private setupActions() {
    this.querySelector('#toggle-preview')?.addEventListener('click', () =>
      store.togglePreview(),
    );

    this.querySelector('#quick-start')?.addEventListener('click', async () => {
      const confirmed = await confirmDialog.ask(
        'Iniciar com Template?', 
        'Isso irá apagar as seções atuais e criar a estrutura padrão de inspeção. Os dados da empresa serão mantidos.',
        { confirmText: 'Sim, Iniciar', cancelText: 'Manter Atual', countdown: 1, variant: 'warning' }
      );
      if (confirmed) {
        store.applyTemplate(store.getQuickTemplate());
      }
    });

    // Editor de Templates
    const modalTmpl = this.querySelector('#modal-template') as any;
    const listTmpl = this.querySelector('#template-editor-list') as HTMLElement;

    this.querySelector('#edit-template')?.addEventListener('click', () => {
      // Cria um rascunho profundo para edição isolada
      this.draftTemplate = JSON.parse(JSON.stringify(store.getQuickTemplate()));
      this.renderTemplateList(listTmpl);
      modalTmpl.open();
    });

    // Delegar cliques para botões de adicionar e remover no rascunho do template
    this.addEventListener('click', (e: any) => {
      const addType = e.target.getAttribute('data-add-tmpl');
      if (addType && this.draftTemplate) {
        this.draftTemplate.sections.push({ 
          type: addType, 
          defaultTitle: this.getSectionLabel(addType as any) 
        });
        this.renderTemplateList(listTmpl);
      }

      const removeBtn = e.target.closest('.btn-remove-tmpl');
      if (removeBtn && this.draftTemplate) {
        const index = parseInt(removeBtn.dataset.index);
        this.draftTemplate.sections.splice(index, 1);
        this.renderTemplateList(listTmpl);
      }
    });

    this.querySelector('#save-template-btn')?.addEventListener('click', () => {
      if (this.draftTemplate) {
        store.setCustomTemplate(this.draftTemplate);
        modalTmpl.close();
        ToastManager.show({ message: 'Template configurado com sucesso!', type: 'success' });
      }
    });

    // Exportar JSON
    this.querySelector('#export-json')?.addEventListener('click', () => {
      const state = store.state;
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      const fileName = `aura_report_${state.config.reportNumber || 'backup'}_${date}.json`;
      
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);

      ToastManager.show({ message: 'Backup exportado com sucesso!', type: 'success' });
      logger.info('EditorPanel', 'Relatório exportado como JSON:', fileName);
    });

    // Importar JSON
    const fileInput = this.querySelector('#input-import-json') as HTMLInputElement;
    this.querySelector('#import-json')?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const imported = JSON.parse(text);

        // Validação básica de estrutura
        if (!imported.meta || !imported.config || !Array.isArray(imported.sections)) {
          throw new Error('Formato de arquivo Aura inválido.');
        }

        const confirmed = await confirmDialog.ask(
          'Importar Dados?',
          'Isso irá substituir completamente o relatório atual pelos dados do arquivo. Deseja continuar?',
          { variant: 'warning', confirmText: 'Sim, Importar', cancelText: 'Cancelar', countdown: 1 }
        );

        if (confirmed) {
          store.loadState(imported);
          fileInput.value = '';

          ToastManager.show({ message: 'Relatório importado com sucesso!', type: 'success' });
          logger.info('EditorPanel', 'Relatório importado com sucesso:', file.name);
        }
      } catch (err) {
        ToastManager.show({ message: 'Erro na importação: ' + (err as Error).message, type: 'error' });
        logger.error('EditorPanel', 'Falha ao importar JSON:', err);
      }
    });


    window.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        store.togglePreview();
      }
    });

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

    this.querySelector('#keep-config')?.addEventListener('click', (e) => e.stopPropagation());

    this.querySelector('#clear-report')?.addEventListener('click', async () => {
      const keep = (this.querySelector('#keep-config') as HTMLInputElement)?.checked;
      const title = 'Novo Relatório';
      const msg = keep 
        ? 'Deseja limpar todas as seções? (A logo e os dados da empresa serão mantidos).' 
        : 'Deseja limpar TODO o relatório e configurações? Esta ação é irreversível.';

      const confirmed = await confirmDialog.ask(title, msg, {
        variant: 'danger',
        confirmText: 'Sim, Limpar',
        cancelText: 'Cancelar',
        countdown: 3
      });

      if (confirmed) {
        store.clearReport(keep);
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

  private renderTemplateList(container: HTMLElement) {
    if (!this.draftTemplate) return;

    if (this.draftTemplate.sections.length === 0) {
      container.innerHTML = `<p class="text-center py-4 text-studio-muted italic text-[10px]">Nenhum módulo definido. Adicione abaixo.</p>`;
      return;
    }

    container.innerHTML = this.draftTemplate.sections.map((s: any, i: number) => `
      <div class="flex items-center justify-between bg-studio-elevated p-2 rounded border border-studio-border group">
        <span class="text-[11px] font-mono text-white">${this.getSectionLabel(s.type)}</span>
        <button type="button" class="btn-remove-tmpl p-1 opacity-0 group-hover:opacity-100 text-accent-danger hover:scale-110 transition-all" data-index="${i}">✕</button>
      </div>
    `).join('');
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
