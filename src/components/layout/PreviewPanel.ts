import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';
import { escapeHTML } from '../../utils/sanitize';

export class PreviewPanel extends HTMLElement {
  private overflowDetected = false;

  connectedCallback() {
    this.render();
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, () => this.render());
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
        <div class="flex flex-col items-center justify-center py-40 opacity-20 border-2 border-dashed border-paper-text/20 rounded-xl">
          <span class="text-6xl mb-4">✍️</span>
          <p class="font-bold uppercase tracking-widest text-center text-paper-text">Inicie o relatório adicionando<br>módulos no painel lateral</p>
        </div>
      `,
        1,
        1,
        true,
        '',
        ui.previewScale
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
          sectionBody = `<div class="text-sm text-paper-text leading-relaxed text-justify whitespace-pre-wrap wrap-break-word">${escapeHTML(data.content || '...')}</div>`;
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
          <h3 class="report-text-primary font-bold uppercase text-[10px] tracking-widest mb-4 border-b report-border-primary pb-1">${escapeHTML(data.title)}</h3>
          ${sectionBody}
        </div>
      `;
    });

    if (currentPageHtml) currentPages.push(currentPageHtml);

    const traceId = meta.createdAt.toString(36).toUpperCase();

    this.innerHTML = `
      <div class="preview-actions flex flex-col gap-4 mb-8 sticky top-0 z-20 bg-paper-desk/80 backdrop-blur-xs p-4 rounded-lg shadow-sm w-full max-w-[210mm]">
        <div class="flex justify-between gap-4 items-center w-full">
          <div class="flex items-center gap-2">
            <app-button variant="primary" id="btn-print-action" title="Selecione 'Salvar como PDF'
Configure:
  - Tamanho do papel: A4
  - Margens: Nenhuma (None)
  - Gráficos de fundo: Ativado ✅ (para preservar cores)">🖨️ PDF</app-button>
            <div class="flex items-center bg-white/50 rounded-md border border-paper-desk p-1 gap-1">
              <button id="zoom-out" class="p-1 hover:bg-white rounded transition-colors" title="Zoom Out">➖</button>
              <span class="text-[10px] font-mono font-bold w-12 text-center text-paper-text/60">${Math.round(ui.previewScale * 100)}%</span>
              <button id="zoom-in" class="p-1 hover:bg-white rounded transition-colors" title="Zoom In">➕</button>
              <button id="zoom-reset" class="text-[10px] px-1 text-paper-text/30 hover:text-paper-text hover:bg-white rounded transition-colors font-bold" title="Reset Zoom">1:1</button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-paper-text/40 text-[10px] font-mono">
            <span>A4 210x297mm</span>
            <span class="w-1 h-1 rounded-full bg-paper-text/20"></span>
            <span>ID: ${traceId}</span>
          </div>
        </div>
        <div id="overflow-alert" class="hidden animate-pulse bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-2 rounded text-[10px] font-bold uppercase tracking-widest text-center">
          ⚠️ Conteúdo excedeu o limite. Use "Quebra de Página".
        </div>
      </div>
      <div class="sheets-wrapper flex flex-col items-center">
        ${currentPages.map((html, i) => this.renderPage(config, html, i + 1, currentPages.length, i === 0, traceId, ui.previewScale)).join('')}
      </div>
    `;

    this.querySelector('#btn-print-action')?.addEventListener('click', () => window.print());
    this.querySelector('#zoom-in')?.addEventListener('click', () => store.setPreviewScale(ui.previewScale + 0.1));
    this.querySelector('#zoom-out')?.addEventListener('click', () => store.setPreviewScale(ui.previewScale - 0.1));
    this.querySelector('#zoom-reset')?.addEventListener('click', () => store.setPreviewScale(1.0));

    setTimeout(() => this.checkOverflow(), 150);
  }

  private renderPage(
    config: any,
    content: string,
    page: number,
    total: number,
    isFirstPage: boolean,
    traceId: string,
    scale: number = 1
  ): string {
    const reportRef = config.reportNumber
      ? `REF: ${escapeHTML(config.reportNumber)}`
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
             <p class="text-[7px] font-mono text-paper-text/20 uppercase">${reportRef} • ${traceId}</p>
           </div>
           <p class="text-[8px] font-mono text-paper-text/30 uppercase tracking-widest text-right whitespace-nowrap">Page ${page} / ${total}</p>
        </footer>
      </div>
    `;
  }
}

customElements.define('preview-panel', PreviewPanel);
