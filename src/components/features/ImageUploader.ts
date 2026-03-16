import { imageProcessor } from '../../utils/imageProcessor';
import { logger } from '../../libs/Logger';

/**
 * Componente Aura de Upload de Imagens
 * Emite evento 'images-added' com array de Base64
 */
export class ImageUploader extends HTMLElement {
  connectedCallback() {
    this.render();
    this.setupListeners();
  }

  private setupListeners() {
    const input = this.querySelector('input[type="file"]') as HTMLInputElement;
    const dropzone = this.querySelector('.dropzone');

    input?.addEventListener('change', async (e: any) => {
      const files = Array.from(e.target.files as FileList);
      await this.processFiles(files);
      input.value = ''; // Reset para permitir re-upload do mesmo arquivo
    });

    // Drag and Drop (opcional mas bom para UX)
    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('border-accent-primary', 'bg-accent-primary/5');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('border-accent-primary', 'bg-accent-primary/5');
    });

    dropzone?.addEventListener('drop', async (e: any) => {
      e.preventDefault();
      dropzone.classList.remove('border-accent-primary', 'bg-accent-primary/5');
      const files = Array.from(e.dataTransfer.files as FileList);
      await this.processFiles(files);
    });
  }

  private async processFiles(files: File[]) {
    const validFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validFiles.length === 0) return;

    logger.info(
      'Uploader',
      `Iniciando processamento de ${validFiles.length} arquivos...`,
    );

    const results: string[] = [];
    for (const file of validFiles) {
      try {
        const base64 = await imageProcessor.process(file);
        results.push(base64);
      } catch (err) {
        logger.error('Uploader', `Erro ao processar ${file.name}`, err);
      }
    }

    if (results.length > 0) {
      this.dispatchEvent(
        new CustomEvent('images-added', {
          detail: { images: results },
          bubbles: true,
        }),
      );
    }
  }

  render() {
    this.innerHTML = `
      <div class="dropzone border-2 border-dashed border-studio-border rounded-lg p-6 transition-all hover:border-studio-muted cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          class="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div class="text-3xl transition-transform group-hover:scale-110">📸</div>
        <div class="text-center">
          <p class="text-sm font-semibold text-white">Clique ou arraste as fotos</p>
          <p class="text-[10px] text-studio-muted uppercase font-mono mt-1">PNG, JPG ou Direto da Câmera</p>
        </div>
      </div>
    `;
  }
}

customElements.define('image-uploader', ImageUploader);
