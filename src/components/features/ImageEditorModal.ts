import { store } from '../../store/AppStore';

/**
 * Modal de Edição de Imagem (Anotações)
 */
export class ImageEditorModal extends HTMLElement {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private imageSrc: string = '';
  private sectionId: string = '';
  private imageIndex: number = -1;

  open(src: string, sectionId: string, index: number) {
    this.imageSrc = src;
    this.sectionId = sectionId;
    this.imageIndex = index;
    this.render();
    this.initCanvas();
  }

  private initCanvas() {
    const img = new Image();
    img.src = this.imageSrc;
    img.onload = () => {
      this.canvas = this.querySelector('canvas');
      if (!this.canvas) return;

      // Ajusta tamanho do canvas mantendo proporção da imagem na tela
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.7;
      let displayWidth = img.width;
      let displayHeight = img.height;

      if (displayWidth > maxWidth) {
        const ratio = maxWidth / displayWidth;
        displayWidth = maxWidth;
        displayHeight = displayHeight * ratio;
      }
      if (displayHeight > maxHeight) {
        const ratio = maxHeight / displayHeight;
        displayHeight = maxHeight;
        displayWidth = displayWidth * ratio;
      }

      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.canvas.style.width = `${displayWidth}px`;
      this.canvas.style.height = `${displayHeight}px`;

      this.ctx = this.canvas.getContext('2d');
      this.ctx?.drawImage(img, 0, 0);

      this.setupDrawingEvents();
    };
  }

  private setupDrawingEvents() {
    if (!this.canvas || !this.ctx) return;

    const start = (e: any) => {
      this.isDrawing = true;
      this.draw(e);
    };
    const move = (e: any) => {
      if (this.isDrawing) this.draw(e);
    };
    const end = () => {
      this.isDrawing = false;
      this.ctx?.beginPath();
    };

    this.canvas.addEventListener('mousedown', start);
    this.canvas.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);

    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      start(e.touches[0]);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      move(e.touches[0]);
    });
    this.canvas.addEventListener('touchend', end);
  }

  private draw(e: any) {
    if (!this.ctx || !this.canvas) return;

    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    this.ctx.lineWidth = Math.max(this.canvas.width / 150, 5);
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = '#E11D48'; // Red

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  private save() {
    if (!this.canvas) return;
    const newBase64 = this.canvas.toDataURL('image/jpeg', 0.8);

    // Atualiza o store
    const section = store.state.sections.find((s) => s.id === this.sectionId);
    if (section && section.type === 'images') {
      const data = section.data as any;
      const newImages = [...data.images];
      newImages[this.imageIndex].src = newBase64;
      store.updateSectionData(this.sectionId, { images: newImages });
    }

    this.close();
  }

  close() {
    this.innerHTML = '';
  }

  render() {
    this.innerHTML = `
      <div class="fixed inset-0 z-100 bg-studio-base/95 backdrop-blur-sm flex flex-col items-center justify-center p-4">
        <div class="w-full max-w-5xl flex flex-col gap-4">
          <div class="flex justify-between items-center bg-studio-elevated p-4 rounded-t-lg border-b border-studio-border">
            <h3 class="title-studio mb-0! text-sm">✎ Editar Evidência</h3>
            <div class="flex gap-2">
              <button class="btn btn-outline py-1 px-4 text-xs" id="btn-cancel">Cancelar</button>
              <button class="btn btn-primary py-1 px-4 text-xs" id="btn-save">Salvar Alterações</button>
            </div>
          </div>
          
          <div class="bg-black/50 p-2 rounded-b-lg border border-studio-border overflow-auto flex items-center justify-center min-h-75">
            <canvas class="cursor-crosshair shadow-2xl bg-white"></canvas>
          </div>

          <p class="text-studio-muted text-[10px] font-mono text-center uppercase tracking-widest">
            Destaque falhas ou detalhes arrastando sobre a imagem
          </p>
        </div>
      </div>
    `;

    this.querySelector('#btn-cancel')?.addEventListener('click', () =>
      this.close(),
    );
    this.querySelector('#btn-save')?.addEventListener('click', () =>
      this.save(),
    );
  }
}

customElements.define('image-editor-modal', ImageEditorModal);
