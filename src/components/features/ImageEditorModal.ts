import { store } from '../../store/AppStore';
import { ToastManager } from '../ui/toast';
import { escapeHTML } from '../../utils/sanitize';
import '../ui/modal';

type Tool = 'brush' | 'arrow' | 'circle';

/**
 * Modal de Edição Avançada de Evidências (v4 - Zoom e Posicionamento Corrigidos)
 */
export class ImageEditorModal extends HTMLElement {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;

  private currentTool: Tool = 'brush';
  private currentColor = '#E11D48';
  private currentThickness = 6;
  private currentZoom = 1.0;
  private baseWidth = 0;
  private baseHeight = 0;

  private imageSrc: string = '';
  private sectionId: string = '';
  private imageIndex: number = -1;

  private undoStack: ImageData[] = [];
  private readonly MAX_UNDO = 15;

  open(src: string, sectionId: string, index: number) {
    this.imageSrc = src;
    this.sectionId = sectionId;
    this.imageIndex = index;
    this.undoStack = [];

    this.render();
    const modal = this.querySelector('#modal-evidence-editor') as any;
    modal.open();

    this.initCanvas();
  }

  private initCanvas() {
    const img = new Image();
    img.src = this.imageSrc;
    img.onload = () => {
      this.canvas = this.querySelector('canvas');
      if (!this.canvas) return;

      this.baseWidth = img.width;
      this.baseHeight = img.height;
      this.canvas.width = this.baseWidth;
      this.canvas.height = this.baseHeight;

      this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
      this.ctx?.drawImage(img, 0, 0);

      // Cálculo de zoom inicial (Fit to Screen)
      const container = this.querySelector('#canvas-scroll-container');
      if (container) {
        const ratioW = (container.clientWidth - 64) / this.baseWidth;
        const ratioH = (container.clientHeight - 64) / this.baseHeight;
        this.currentZoom = Math.min(ratioW, ratioH, 1.0);
      }

      this.saveToUndo();
      this.setupDrawingEvents();
      this.applyDisplayZoom();
    };
  }

  private saveToUndo() {
    if (!this.ctx || !this.canvas) return;
    const data = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    this.undoStack.push(data);
    if (this.undoStack.length > this.MAX_UNDO) this.undoStack.shift();
  }

  private undo() {
    if (this.undoStack.length <= 1 || !this.ctx) return;
    this.undoStack.pop();
    const lastState = this.undoStack[this.undoStack.length - 1];
    this.ctx.putImageData(lastState, 0, 0);
    ToastManager.show({
      message: 'Ação desfeita',
      type: 'info',
      duration: 800,
    });
  }

  private setupDrawingEvents() {
    if (!this.canvas || !this.ctx) return;

    const getCoords = (e: any) => {
      const rect = this.canvas!.getBoundingClientRect();
      const scaleX = this.canvas!.width / rect.width;
      const scaleY = this.canvas!.height / rect.height;
      const clientX = e.clientX || e.touches?.[0].clientX;
      const clientY = e.clientY || e.touches?.[0].clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    };

    const start = (e: any) => {
      this.isDrawing = true;
      const { x, y } = getCoords(e);
      this.startX = x;
      this.startY = y;

      if (this.currentTool === 'brush') {
        this.ctx!.beginPath();
        this.ctx!.moveTo(x, y);
      }
    };

    const move = (e: any) => {
      if (!this.isDrawing) return;
      const { x, y } = getCoords(e);

      if (this.currentTool === 'brush') {
        this.drawBrush(x, y);
      } else {
        const lastState = this.undoStack[this.undoStack.length - 1];
        this.ctx!.putImageData(lastState, 0, 0);
        this.setupStyle();

        if (this.currentTool === 'circle')
          this.drawCircle(this.startX, this.startY, x, y);
        if (this.currentTool === 'arrow')
          this.drawArrow(this.startX, this.startY, x, y);
      }
    };

    const end = () => {
      if (!this.isDrawing) return;
      this.isDrawing = false;
      this.saveToUndo();
    };

    this.canvas.onmousedown = start;
    this.canvas.onmousemove = move;
    window.onmouseup = end;

    this.canvas.ontouchstart = (e) => {
      e.preventDefault();
      start(e);
    };
    this.canvas.ontouchmove = (e) => {
      e.preventDefault();
      move(e);
    };
    this.canvas.ontouchend = end;
  }

  private setupStyle() {
    const scaleFactor = this.canvas!.width / 800;
    this.ctx!.strokeStyle = this.currentColor;
    this.ctx!.lineWidth = this.currentThickness * scaleFactor;
    this.ctx!.lineCap = 'round';
    this.ctx!.lineJoin = 'round';
  }

  private drawBrush(x: number, y: number) {
    this.setupStyle();
    this.ctx!.lineTo(x, y);
    this.ctx!.stroke();
  }

  private drawCircle(x1: number, y1: number, x2: number, y2: number) {
    const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    this.ctx!.beginPath();
    this.ctx!.arc(x1, y1, radius, 0, 2 * Math.PI);
    this.ctx!.stroke();
  }

  private drawArrow(x1: number, y1: number, x2: number, y2: number) {
    const headLength = this.ctx!.lineWidth * 4;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    this.ctx!.beginPath();
    this.ctx!.moveTo(x1, y1);
    this.ctx!.lineTo(x2, y2);
    this.ctx!.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6),
    );
    this.ctx!.moveTo(x2, y2);
    this.ctx!.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6),
    );
    this.ctx!.stroke();
  }

  private rotate() {
    if (!this.canvas || !this.ctx) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.height;
    tempCanvas.height = this.canvas.width;
    const tCtx = tempCanvas.getContext('2d')!;
    tCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(
      this.canvas,
      -this.canvas.width / 2,
      -this.canvas.height / 2,
    );

    this.canvas.width = tempCanvas.width;
    this.canvas.height = tempCanvas.height;
    this.baseWidth = this.canvas.width;
    this.baseHeight = this.canvas.height;

    this.ctx.drawImage(tempCanvas, 0, 0);
    this.saveToUndo();
    this.applyDisplayZoom();
  }

  private applyDisplayZoom() {
    if (!this.canvas) return;
    this.canvas.style.width = `${this.baseWidth * this.currentZoom}px`;
    this.canvas.style.height = `${this.baseHeight * this.currentZoom}px`;
    this.querySelector('#zoom-val')!.textContent =
      `${Math.round(this.currentZoom * 100)}%`;
  }

  private async save() {
    if (!this.canvas || !this.ctx) return;

    const meta = store.state.meta;
    const config = store.state.config;
    const traceId = meta.createdAt.toString(36).toUpperCase();
    const reportRef = config.reportNumber
      ? `REF: ${escapeHTML(config.reportNumber)} • ${traceId}`
      : `TRC: ${traceId}`;

    const burnMeta = (
      this.querySelector('#check-watermark') as HTMLInputElement
    )?.checked;
    const locInput = this.querySelector('#meta-location') as any;
    const dateInput = this.querySelector('#meta-date') as any;

    // Obtém valores dos atributos sincronizados pelos listeners de evento
    const loc = locInput?.getAttribute('value') || '';
    const date = dateInput?.getAttribute('value') || '';

    if (burnMeta) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.4)';
      const fontSize = Math.max(this.canvas.width / 40, 14);
      const h = fontSize * 2.2;
      this.ctx.fillRect(0, this.canvas.height - h, this.canvas.width, h);
      this.ctx.fillStyle = 'rgba(255,255,255,0.4)';
      this.ctx.font = `bold ${fontSize}px monospace`;

      const text = `${reportRef} | DATA: ${date} | LOCAL: ${loc.toUpperCase() || 'NÃO INFORMADO'}`;
      this.ctx.fillText(text, fontSize, this.canvas.height - fontSize * 0.7);
    }

    const newBase64 = this.canvas.toDataURL('image/jpeg', 0.8);

    const section = store.state.sections.find((s) => s.id === this.sectionId);
    if (section && section.type === 'images') {
      const data = section.data as any;
      const newImages = [...data.images];
      newImages[this.imageIndex] = {
        ...newImages[this.imageIndex],
        src: newBase64,
        location: loc,
        date: date,
      };
      store.updateSectionData(this.sectionId, { images: newImages });
      ToastManager.show({ message: 'Evidência atualizada!', type: 'success' });
    }

    (this.querySelector('#modal-evidence-editor') as any).close();
  }

  render() {
    const section = store.state.sections.find((s) => s.id === this.sectionId);
    const imgData = (section?.data as any)?.images[this.imageIndex] || {};

    this.innerHTML = `
      <ui-modal id="modal-evidence-editor" size="lg" animation="scale">
      <!-- Header Técnico (Mono) -->
      <h2 slot="header" class="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tight font-mono">
        <span class="text-accent-primary">■</span> Estúdio de Evidências
      </h2>

      <div class="flex flex-col gap-4">
        <!-- Toolbar Superior (Bandeja principal afundada) -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-studio-base p-2 rounded-lg border border-studio-border shadow-inner">
          
          <!-- Bandeja de Ferramentas de Desenho -->
          <div class="flex items-center gap-1 bg-studio-elevated p-1 rounded-md border border-studio-border" id="tools-group">
            <!-- Substitua a lógica de classe pela atribuição de .active ou data-active="true" via JS -->
            <button class="btn-tool ${this.currentTool === 'brush' ? 'active' : ''}" data-tool="brush" title="Pincel">🖌️</button>
            <button class="btn-tool ${this.currentTool === 'arrow' ? 'active' : ''}" data-tool="arrow" title="Seta">↗</button>
            <button class="btn-tool ${this.currentTool === 'circle' ? 'active' : ''}" data-tool="circle" title="Círculo">⭕</button>
            
            <div class="w-px h-5 bg-studio-border mx-1"></div> <!-- Divisor -->
            
            <button class="btn-tool" id="action-rotate" title="Girar 90°">🔄</button>
            <button class="btn-tool" id="action-undo" title="Desfazer">↩️</button>
          </div>

          <!-- Bandeja de Controles Secundários -->
          <div class="flex items-center gap-3">
            
            <!-- Espessura (Select embutido de forma técnica) -->
            <div class="flex items-center bg-studio-elevated border border-studio-border rounded-md overflow-hidden">
              <span class="px-2 text-[10px] text-studio-muted font-mono uppercase">Lápis</span>
              <select id="select-thickness" class="bg-studio-elevated text-white text-[11px] font-mono pl-1 pr-2 py-1.5 outline-none cursor-pointer border-l border-studio-border">
                <option value="3">FINO</option>
                <option value="6" selected>MÉDIO</option>
                <option value="12">GROSSO</option>
                <option value="24">EXTRA</option>
              </select>
            </div>

            <!-- Cores (Ring-offset para não encostar na cor) -->
            <div class="flex items-center gap-1.5 bg-studio-elevated p-1.5 rounded-md border border-studio-border" id="colors-group">
              <button class="w-5 h-5 rounded-full bg-[#E11D48] ${this.currentColor === '#E11D48' ? 'ring-2 ring-white ring-offset-2 ring-offset-studio-elevated' : ''}" data-color="#E11D48"></button>
              <button class="w-5 h-5 rounded-full bg-[#F59E0B] ${this.currentColor === '#F59E0B' ? 'ring-2 ring-white ring-offset-2 ring-offset-studio-elevated' : ''}" data-color="#F59E0B"></button>
              <button class="w-5 h-5 rounded-full bg-[#06B6D4] ${this.currentColor === '#06B6D4' ? 'ring-2 ring-white ring-offset-2 ring-offset-studio-elevated' : ''}" data-color="#06B6D4"></button>
            </div>

            <!-- Zoom -->
            <div class="flex items-center gap-1 bg-studio-elevated p-1 rounded-md border border-studio-border">
              <button id="zoom-out-editor" class="btn-tool w-6! h-6!">➖</button>
              <span id="zoom-val" class="text-[10px] font-mono w-10 text-center text-white">100%</span>
              <button id="zoom-in-editor" class="btn-tool w-6! h-6!">➕</button>
            </div>
          </div>
        </div>

        <!-- Canvas Container (Com Dot Grid de Engenharia) -->
        <div id="canvas-scroll-container" class="canvas-workspace rounded-lg border border-studio-border overflow-auto h-[50vh] relative flex items-center justify-center">
          <!-- A div wrapper ao redor do canvas ajuda se precisar aplicar zoom com transform no JS -->
          <div class="inline-block p-4">
            <!-- O Canvas ganha ring preto para separar bem do grid -->
            <canvas class="cursor-crosshair shadow-2xl bg-white block ring-1 ring-black"></canvas>
          </div>
        </div>

        <!-- Metadados e Marca d'água -->
        <div class="bg-studio-elevated p-4 rounded-lg border border-studio-border space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <app-input label="📍 Localização" id="meta-location" value="${escapeHTML(imgData.location || '')}" placeholder="Ex: Setor A"></app-input>
            <app-input label="📅 Data" id="meta-date" type="date" value="${imgData.date || new Date().toISOString().split('T')[0]}"></app-input>
          </div>
          <div class="flex items-center gap-3 bg-studio-base p-3 rounded border border-studio-border">
            <!-- Tailwind v4 inline accent color se necessário: style="accent-color: var(--color-accent-primary)" -->
            <input type="checkbox" id="check-watermark" style="accent-color: var(--color-accent-primary);" class="w-4 h-4 rounded cursor-pointer" />
            <label for="check-watermark" class="label-technical mb-0! cursor-pointer hover:text-white transition-colors">
              Gravar metadados permanentemente na imagem (Marca d'água)
            </label>
          </div>
        </div>
      </div>

      <div slot="footer" class="flex justify-end gap-3">
        <button class="btn btn-outline" id="btn-close-modal">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-final">Salvar Evidência</button>
      </div>
    </ui-modal>
    `;

    this.setupUIEvents();
  }

  private setupUIEvents() {
    this.querySelector('#tools-group')?.addEventListener('click', (e: any) => {
      const tool = e.target.closest('[data-tool]')?.dataset.tool;
      if (tool) {
        this.currentTool = tool;
        this.querySelectorAll('[data-tool]').forEach((b) =>
          b.classList.remove('ring-2', 'ring-accent-primary'),
        );
        e.target
          .closest('[data-tool]')
          .classList.add('ring-2', 'ring-accent-primary');
      }
    });

    this.querySelector('#colors-group')?.addEventListener('click', (e: any) => {
      const color = e.target.dataset.color;
      if (color) {
        this.currentColor = color;
        this.querySelectorAll('[data-color]').forEach((b) =>
          b.classList.remove('ring-2', 'ring-white'),
        );
        e.target.classList.add('ring-2', 'ring-white');
      }
    });

    this.querySelector('#select-thickness')?.addEventListener(
      'change',
      (e: any) => {
        this.currentThickness = parseInt(e.target.value);
      },
    );

    this.querySelector('#action-rotate')?.addEventListener('click', () =>
      this.rotate(),
    );
    this.querySelector('#action-undo')?.addEventListener('click', () =>
      this.undo(),
    );

    this.querySelector('#zoom-in-editor')?.addEventListener('click', () => {
      this.currentZoom += 0.2;
      this.applyDisplayZoom();
    });
    this.querySelector('#zoom-out-editor')?.addEventListener('click', () => {
      this.currentZoom = Math.max(0.1, this.currentZoom - 0.2);
      this.applyDisplayZoom();
    });

    this.querySelector('#btn-save-final')?.addEventListener('click', () =>
      this.save(),
    );
    this.querySelector('#btn-close-modal')?.addEventListener('click', () =>
      (this.querySelector('#modal-evidence-editor') as any).close(),
    );

    // Listeners para sincronizar valores dos AppInputs
    this.addEventListener('app-input', (e: any) => {
      const target = e.target as HTMLElement;
      target.setAttribute('value', e.detail.value);
    });
  }
}

customElements.define('image-editor-modal', ImageEditorModal);
