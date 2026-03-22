import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';
import { logger } from '../../libs/Logger';
import { MarkdownParser } from '../../libs/markdown';
import { escapeHTML } from '../../utils/sanitize';
import { helpData } from '../../assets/data/helpData';

export class PreviewPanel extends HTMLElement {
  private overflowDetected = false;
  private parser: MarkdownParser;

  constructor() {
    super();
    this.parser = new MarkdownParser(logger);
  }

  connectedCallback() {
    this.render();
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, () => this.render());
    EventBus.on(STORE_EVENTS.VALIDATION_UPDATED, (warnings: any[]) =>
      this.updateValidationAlert(warnings),
    );
  }

  private checkOverflow() {
    const pages = this.querySelectorAll('.sheet-a4');
    let hasOverflow = false;

    pages.forEach((page) => {
      const content = page.querySelector('.preview-content');
      const overflowAlert = page.querySelector('#overflow-alert');
      if (content) {
        if (content.scrollHeight > content.clientHeight + 5) {
          page.classList.add(
            'ring-4',
            'ring-accent-danger/30',
            'border-accent-danger',
          );
          hasOverflow = true;
          overflowAlert?.classList.remove('hidden');

          logger.info('PreviewPanel', 'Over flow detectado');
        } else {
          page.classList.remove(
            'ring-4',
            'ring-accent-danger/30',
            'border-accent-danger',
          );
          overflowAlert?.classList.add('hidden');
        }
      }
    });

    if (hasOverflow !== this.overflowDetected) {
      this.overflowDetected = hasOverflow;
      EventBus.emit(STORE_EVENTS.LAYOUT_WARNING, { hasOverflow });
    }
  }

  /**
   * Atualiza a barra de alertas de validação
   */
  private updateValidationAlert(
    warnings: Array<{ message: string; sectionId?: string; field?: string }>,
  ) {
    const alert = this.querySelector('#validation-alert');
    if (!alert) return;

    if (warnings.length === 0) {
      alert.classList.add('hidden');
      return;
    }

    logger.debug('PreviewPanel', 'Array de alertas: ', warnings);

    const count = warnings.length;
    const plural = count > 1 ? 's' : '';

    alert.classList.remove('hidden');
    alert.innerHTML = `
    <div class="flex items-center justify-between gap-4">
      <span class="flex items-center gap-2">
        <span class="text-amber-500"><ui-icon name="alert-triangle" size="sm"></ui-icon></span>
        <span>${count} pendência${plural} detectada${plural}</span>
      </span>
      <button 
        id="btn-show-validation-details" 
        class="underline hover:text-amber-700 transition-colors"
      >
        Ver detalhes
      </button>
    </div>
  `;

    // Listener para abrir modal
    this.querySelector('#btn-show-validation-details')?.addEventListener(
      'click',
      () => {
        this.showValidationModal(warnings);
      },
    );
  }

  /**
   * Exibe modal com detalhes das validações
   */
  private showValidationModal(
    warnings: Array<{ message: string; sectionId?: string; field?: string }>,
  ) {
    const modal = document.createElement('ui-modal');
    modal.id = 'modal-validation-details';
    modal.setAttribute('size', 'md');
    modal.setAttribute('animation', 'scale');

    modal.innerHTML = `
    <div slot="header">
      <h1 slot="header" class="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tight font-mono">
        <span class="text-accent-primary"><ui-icon name="clipboard-pen" size="md"></ui-icon></span> Pendências de Conformidade
      </h1>
    </div>
    <div class="space-y-4">
      <p class="text-xs text-studio-muted leading-relaxed">
        Os itens abaixo não impedem a geração do PDF, mas podem comprometer a qualidade profissional do relatório.
      </p>
      <ul class="space-y-2 border-t border-studio-border pt-4 max-h-[60vh] overflow-y-auto">
        ${warnings
          .map(
            (w) => `
          <li class="flex items-start gap-3 text-sm text-studio-muted">
            <span class="text-amber-500 mt-0.5">▸</span>
            <span class="flex-1">${escapeHTML(w.message)}</span>
          </li>
        `,
          )
          .join('')}
      </ul>
    </div>
    <div slot="footer" class="flex justify-end">
      <button class="btn btn-primary" onclick="this.closest('ui-modal').close()">
        Entendido
      </button>
    </div>
  `;

    document.body.appendChild(modal);
    (modal as any).open();

    // Remove do DOM ao fechar
    modal.addEventListener('close', () => {
      modal.remove();
    });
  }

  render() {
    const { config, sections, meta, ui } = store.state;
    this.className = 'panel-preview';

    // Aplica a cor primária EXCLUSIVAMENTE para o relatório
    if (config.primaryColor) {
      document.documentElement.style.setProperty(
        '--report-primary-color',
        config.primaryColor,
      );
    }

    if (sections.length === 0) {
      this.innerHTML = this.renderPage(
        config,
        `
        <div class="flex flex-col items-center justify-center py-10 opacity-20 border-2 border-dashed border-paper-text/20 rounded-xl">
          <span class="text-6xl mb-4"><ui-icon name="pencil-ruler" size="256"></ui-icon></span>
          <p class="font-bold uppercase tracking-widest text-center text-paper-text">Inicie o relatório adicionando<br>módulos no painel lateral</p>
        </div>
      `,
        1,
        1,
        true,
        '',
        ui.previewScale,
      );
      return;
    }

    let currentPages: string[] = [];
    let currentPageHtml = '';

    sections.forEach((section) => {
      const data = section.data as any;

      if (section.type === 'pagebreak') {
        currentPages.push(currentPageHtml);
        currentPageHtml = '';
        return;
      }

      let sectionBody = '';
      switch (section.type) {
        case 'equipment':
          sectionBody = `
            <div class="grid grid-cols-2 gap-y-4 gap-x-8 bg-slate-50 p-6 rounded border border-slate-200 equipment-box">
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Descrição</label><p class="text-sm font-semibold leading-tight">${escapeHTML(data.description || '-')}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Modelo</label><p class="text-sm font-semibold leading-tight">${escapeHTML(data.model || '-')}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Patrimônio</label><p class="text-sm font-semibold leading-tight">${escapeHTML(data.patrimony || '-')}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Responsável</label><p class="text-sm font-semibold leading-tight">${escapeHTML(data.owner || '-')}</p></div>
            </div>
          `;
          break;
        case 'text':
          sectionBody = `<div class="text-sm text-paper-text leading-relaxed text-justify whitespace-pre-wrap wrap-break-word">${this.parser.parse(data.content || '...')}</div>`;
          break;
        case 'bullets':
          sectionBody = `
            <ul class="list-disc list-inside space-y-2 text-sm text-paper-text">
              ${
                data.items
                  .filter((i: string) => i.trim())
                  .map(
                    (item: string) =>
                      `<li class="wrap-break-word">${escapeHTML(item)}</li>`,
                  )
                  .join('') ||
                '<li class="italic text-paper-text/40">Lista vazia</li>'
              }
            </ul>
          `;
          break;
        case 'images':
          sectionBody = `
            <div class="grid gap-4" style="grid-template-columns: repeat(${data.columns}, 1fr)">
              ${data.images
                .map(
                  (img: any) => `
                <div class="flex flex-col gap-2 break-inside-avoid overflow-hidden">
                  <div class="w-full bg-slate-50 rounded-sm border border-paper-desk flex items-center justify-center overflow-hidden" style="height: ${data.columns === 1 ? '110mm' : data.columns === 2 ? '65mm' : '45mm'}">
                    <img src="${img.src}" class="w-full h-full object-contain" />
                  </div>
                  ${
                    img.caption
                      ? `
                    <p class="text-[9px] text-center italic text-paper-text/60 leading-tight break-all whitespace-normal px-1">
                      ${escapeHTML(img.caption)}
                    </p>`
                      : ''
                  }
                </div>
              `,
                )
                .join('')}
            </div>
          `;
          break;
      }

      currentPageHtml += `
        <div class="preview-section">
          ${data.title ? `<h3 class="report-text-primary font-bold uppercase text-[10px] tracking-widest mb-4 border-b report-border-primary pb-1">${escapeHTML(data.title)}</h3>` : ''}
          ${sectionBody}
        </div>
      `;
    });

    if (currentPageHtml) currentPages.push(currentPageHtml);

    const traceId = meta.createdAt.toString(36).toUpperCase();

    this.innerHTML = `
      <div class="preview-actions flex flex-col gap-4 mb-8 sticky top-0 z-20 bg-paper-desk/80 backdrop-blur-xs p-4 rounded-lg shadow-sm w-full max-w-[210mm]">
        <div class="flex justify-between gap-4 items-center w-full">
          <div class="flex justify-between items-center gap-2">
            <app-button variant="primary" id="btn-print-action" title="Selecione 'Salvar como PDF'
Configure:
  - Tamanho do papel: A4
  - Margens: Nenhuma (None)
  - Gráficos de fundo: Ativado ✅ (para preservar cores)"><ui-icon name="printer" size="sm"></ui-icon> PDF</app-button>
            <div class="flex items-center bg-white/50 rounded-md border border-paper-desk p-1 gap-1">
              <button id="zoom-out" class="p-1 w-8 h-8 hover:bg-white text-paper-text/30 hover:text-paper-text rounded transition-colors" title="Zoom Out"><ui-icon name="minus" size="sm"></ui-icon></button>
              
              <span class="text-[10px] font-mono font-bold w-12 text-center text-paper-text/60">${Math.round(ui.previewScale * 100)}%</span>
              <button id="zoom-in" class="p-1 w-8 h-8 hover:bg-white text-paper-text/30 hover:text-paper-text hover:scale-110 rounded transition-colors" title="Zoom In"><ui-icon name="plus" size="sm"></ui-icon></button>
              
              <button id="zoom-reset" class="text-[10px] px-1 w-8 h-8 text-paper-text/30 hover:text-paper-text hover:scale-110 hover:bg-white rounded transition-colors font-bold" title="Reset Zoom"><ui-icon name="shrink" size="sm"></ui-icon></button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-paper-text/40 text-[10px] font-mono">
            <span>A4 210x297mm</span>
            <span class="w-1 h-1 rounded-full bg-paper-text/20"></span>
            <span>ID: ${traceId}</span>
          </div>
        </div>
        <div id="overflow-alert" class="hidden animate-pulse bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-2 rounded text-[10px] font-bold uppercase tracking-widest text-center">
          <ui-icon name="alert-triangle" size="md" class="shrink-0"></ui-icon> Conteúdo excedeu o limite. Use "Quebra de Página".
        </div>
        <div id="validation-alert" class="hidden bg-amber-500/10 text-amber-600 animate-pulse border border-amber-500/20 p-2 rounded text-[10px] font-bold uppercase tracking-widest">
          <!-- Conteúdo gerado dinamicamente -->
        </div>
      </div>
      <!-- O HUD Trigger (Nosso FAB Técnico) -->
      <button class="fab-hud" onclick="document.getElementById('modal-system-help').open()">
        <!-- Container fixo do ícone (Garante centro perfeito) -->
        <div class="hud-icon-wrapper">
          <ui-icon name="book-open" size="sm"></ui-icon>
        </div>
        
        <!-- Container do Texto e Tecla -->
        <div class="hud-content">
          <span class="hud-text">Manual do Sistema</span>
          <kbd class="hud-key">F1</kbd>
        </div>
      </button>
      <div class="sheets-wrapper flex flex-col items-center">
        ${currentPages.map((html, i) => this.renderPage(config, html, i + 1, currentPages.length, i === 0, traceId, ui.previewScale)).join('')}
      </div>
      ${this.renderHelpModal()}
    `;

    this.querySelector('#btn-print-action')?.addEventListener('click', () =>
      window.print(),
    );
    this.querySelector('#zoom-in')?.addEventListener('click', () =>
      store.setPreviewScale(ui.previewScale + 0.1),
    );
    this.querySelector('#zoom-out')?.addEventListener('click', () =>
      store.setPreviewScale(ui.previewScale - 0.1),
    );
    this.querySelector('#zoom-reset')?.addEventListener('click', () =>
      store.setPreviewScale(1.0),
    );

    setTimeout(() => this.checkOverflow(), 150);
  }

  private renderPage(
    config: any,
    content: string,
    page: number,
    total: number,
    isFirstPage: boolean,
    traceId: string,
    scale: number = 1,
  ): string {
    const reportRef = config.reportNumber
      ? `REF: ${escapeHTML(config.reportNumber)} • ${traceId}`
      : `TRC: ${traceId}`;

    return `
      <div class="sheet-a4 transition-all duration-300 origin-top" style="transform: scale(${scale}); margin-bottom: calc(-297mm * ${1 - scale} + 10mm)">
        ${
          isFirstPage
            ? `
          <header class="flex justify-between items-start border-b-4 report-border-primary pb-6 mb-8">
            <div class="flex gap-6 items-start">
              ${config.logo ? `<img src="${config.logo}" class="h-16 w-auto max-w-[40mm] object-contain" />` : ''}
              <div>
                <h1 class="text-2xl font-bold text-paper-text uppercase tracking-tight leading-tight">${escapeHTML(config.title)}</h1>
                <p class="text-md font-medium text-paper-text/80">${escapeHTML(config.company || 'Empresa não informada')}</p>
              </div>
            </div>
            <div class="text-right font-mono text-[10px] text-paper-text/60 space-y-1">
              <p class="font-bold text-paper-text">Nº: ${escapeHTML(config.reportNumber || '---')}</p>
              <p>DATA: ${escapeHTML(config.reportDate)}</p>
            </div>
          </header>
        `
            : `
          <header class="flex justify-between items-center border-b border-paper-desk/50 pb-2 mb-6 opacity-40">
            <span class="text-[9px] font-bold uppercase tracking-widest">${escapeHTML(config.title)}</span>
            <span class="text-[9px] font-mono">${reportRef}</span>
          </header>
        `
        }

        <div class="preview-content overflow-hidden" style="max-height: ${isFirstPage ? '210mm' : '250mm'};">
          ${content}
        </div>

        <footer class="mt-20 flex justify-between items-end border-t border-paper-desk pt-4 absolute bottom-[20mm] left-[20mm] right-[20mm]">
           <div class="flex flex-col">
             <p class="text-[8px] font-mono text-paper-text/30 italic uppercase tracking-wider">Aura Tech Evidence Log | Authenticity Verified</p>
             <p class="text-[7px] font-mono text-paper-text/20 uppercase">${reportRef}</p>
           </div>
           <p class="text-[8px] font-mono text-paper-text/30 uppercase tracking-widest text-right whitespace-nowrap">Page ${page} / ${total}</p>
        </footer>
      </div>
    `;
  }

  private renderHelpModal() {
    // Constrói os blocos de Tutorial (Estilo Manual Técnico)
    const tutorialHTML = helpData.tutorialSection
      .map(
        (item) => `
    <div class="mb-8 group">
      <h4 class="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider mb-3">
        <ui-icon name="command-line" size="sm" class="text-accent-primary"></ui-icon>
        ${item.id}. ${item.title}
      </h4>
      <div class="pl-6 border-l-2 border-studio-border group-hover:border-accent-primary transition-colors duration-300">
        <p class="text-studio-muted text-sm leading-relaxed whitespace-pre-line">${item.content}</p>
      </div>
    </div>
  `,
      )
      .join('');

    // Constrói o FAQ (Estilo Log de Diagnóstico)
    const faqHTML = helpData.faqItens
      .map(
        (faq) => `
    <div class="bg-studio-base p-4 rounded-lg border border-studio-border mb-4 hover:border-studio-muted transition-colors">
      <div class="flex items-start gap-3 mb-2">
        <ui-icon name="alert-circle" size="sm" class="text-accent-danger shrink-0 mt-0.5"></ui-icon>
        <span class="text-white text-sm font-medium leading-snug">${faq.q}</span>
      </div>
      <div class="flex items-start gap-3 pl-8">
        <ui-icon name="corner-down-right" size="sm" class="text-accent-cyan shrink-0"></ui-icon>
        <span class="text-studio-muted text-sm leading-relaxed">${faq.a}</span>
      </div>
    </div>
  `,
      )
      .join('');

    // Constrói as Pro Tips (Grid de Cartões de Telemetria)
    const tipsHTML = helpData.proTips
      .map(
        (tip) => `
    <div class="bg-studio-elevated p-4 rounded-lg border border-studio-border hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
      <div class="w-8 h-8 rounded-full bg-studio-base border border-studio-border flex items-center justify-center text-accent-cyan shadow-inner">
        <ui-icon name="${tip.icon || 'sparkles'}" size="sm"></ui-icon>
      </div>
      <p class="text-studio-muted text-xs leading-relaxed">${tip.tip}</p>
    </div>
  `,
      )
      .join('');

    // Injeta o Modal no DOM (ou retorna a string se estiver usando innerHTML)
    return `
    <ui-modal id="modal-system-help" size="xl" animation="scale">
      <div slot="header" class="flex items-center gap-3 text-accent-cyan font-mono uppercase tracking-widest text-sm">
        <ui-icon name="book-open" size="md"></ui-icon>
        Documentação do Sistema
      </div>

      <!-- Layout Split: Sidebar (Índice) + Conteúdo -->
      <div class="flex flex-col md:flex-row gap-8 h-[65vh]">
        
        <!-- Sidebar Navegação -->
        <div class="w-full md:w-64 shrink-0 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-studio-border pb-4 md:pb-0 md:pr-6">
          <div class="label-technical mb-2">Índice Operacional</div>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-studio-elevated border border-studio-border text-white text-sm text-left transition-colors hover:border-accent-primary" href="#help-tutorial">
            <ui-icon name="cpu" size="sm"></ui-icon> Operação Base
          </a>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-transparent border border-transparent text-studio-muted text-sm text-left transition-colors hover:bg-studio-elevated hover:text-white" href="#help-faq">
            <ui-icon name="stethoscope" size="sm"></ui-icon> Diagnóstico (FAQ)
          </a>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-transparent border border-transparent text-studio-muted text-sm text-left transition-colors hover:bg-studio-elevated hover:text-white" href="#help-tips">
            <ui-icon name="sparkles" size="sm"></ui-icon> Telemetria (Dicas)
          </a>
        </div>

        <!-- Área de Leitura (Scrollable) -->
        <div class="flex-1 overflow-y-auto pr-4 scroll-smooth" id="help-scroll-area">
          
          <!-- Seção 1: Tutorial -->
          <section id="help-tutorial" class="mb-16">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">01.</span> OPERAÇÃO BASE
            </h3>
            ${tutorialHTML}
          </section>

          <!-- Seção 2: FAQ -->
          <section id="help-faq" class="mb-16">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">02.</span> DIAGNÓSTICO (FAQ)
            </h3>
            ${faqHTML}
          </section>

          <!-- Seção 3: Pro Tips -->
          <section id="help-tips" class="mb-8">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">03.</span> TELEMETRIA AVANÇADA
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${tipsHTML}
            </div>
          </section>

        </div>
      </div>

      <!-- Footer do Modal -->
      <div slot="footer" class="flex justify-between items-center w-full">
        <div class="text-studio-muted text-xs font-mono">
          Aura Technical OS v4.0.0
        </div>
        <button class="btn btn-primary" onclick="document.getElementById('modal-system-help').close()">
          <ui-icon name="check-circle" size="sm"></ui-icon> Compreendido
        </button>
      </div>
    </ui-modal>
  `;
  }
}

customElements.define('preview-panel', PreviewPanel);
