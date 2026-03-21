import { store } from '../../store/AppStore';
import { ImagesData } from '../../types/Section';
import { escapeHTML } from '../../utils/sanitize';
import './ImageUploader';

/**
 * Editor específico para a seção de Imagens (v3 com Título e Edição)
 */
export class ImageSectionEditor extends HTMLElement {
  static get observedAttributes() {
    return ['section-id'];
  }

  connectedCallback() {
    this.render();
  }

  private updateData(newData: Partial<ImagesData>) {
    const id = this.getAttribute('section-id')!;
    store.updateSectionData(id, newData);
  }

  render() {
    const id = this.getAttribute('section-id')!;
    const section = store.state.sections.find((s) => s.id === id);
    if (!section || section.type !== 'images') return;

    const data = section.data as ImagesData;

    this.innerHTML = `
      <div class="space-y-4">
        <!-- Título Personalizado da Seção -->
        <app-input label="Título da Galeria" value="${escapeHTML(data.title)}" id="gal-title"></app-input>

        <div class="flex items-center justify-between mb-4">
          <label class="label-technical mb-0! text-[10px]">Colunas no PDF</label>
          <select class="bg-studio-elevated border border-studio-border text-white text-[10px] rounded px-2 py-1 outline-none font-mono uppercase" id="col-select">
            <option value="1" ${data.columns === 1 ? 'selected' : ''}>1 Coluna</option>
            <option value="2" ${data.columns === 2 ? 'selected' : ''}>2 Colunas</option>
            <option value="3" ${data.columns === 3 ? 'selected' : ''}>3 Colunas</option>
          </select>
        </div>

        <image-uploader></image-uploader>

        <div class="grid grid-cols-2 gap-2 mt-4" id="images-preview">
          ${data.images
            .map(
              (img, index) => `
            <div class="relative group rounded border border-studio-border overflow-hidden bg-studio-base shadow-sm">
              <img src="${img.src}" class="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="btn-edit bg-accent-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform" data-index="${index}" title="Desenhar"><ui-icon name="pencil" size="sm"></ui-icon></button>
                <button class="btn-del bg-accent-danger text-white rounded-full w-8 h-8 flex items-center justify-center text-[14px] shadow-lg hover:scale-110 transition-transform" data-index="${index}" title="Excluir"><ui-icon name="trash" size="sm"></ui-icon></button>
              </div>

              <input 
                type="text" 
                class="w-full bg-studio-elevated/80 text-[10px] p-1.5 border-t border-studio-border text-white outline-none placeholder:text-studio-muted" 
                placeholder="Legenda..." 
                value="${img.caption || ''}" 
                data-index="${index}"
              />
            </div>
          `,
            )
            .join('')}
        </div>
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners() {
    const id = this.getAttribute('section-id')!;

    // Título
    this.querySelector('#gal-title')?.addEventListener(
      'app-input',
      (e: any) => {
        this.updateData({ title: e.detail.value });
      },
    );

    this.querySelector('image-uploader')?.addEventListener(
      'images-added',
      (e: any) => {
        const newImages = e.detail.images.map((src: string) => ({
          src,
          caption: '',
        }));
        const currentData = store.state.sections.find((s) => s.id === id)
          ?.data as ImagesData;
        this.updateData({ images: [...currentData.images, ...newImages] });
        this.render();
      },
    );

    this.querySelectorAll('.btn-del').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index')!);
        const currentData = store.state.sections.find((s) => s.id === id)
          ?.data as ImagesData;
        const newImages = currentData.images.filter((_, i) => i !== index);
        this.updateData({ images: newImages });
        this.render();
      });
    });

    this.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index')!);
        const currentData = store.state.sections.find((s) => s.id === id)
          ?.data as ImagesData;
        const modal = document.querySelector('#global-image-editor') as any;
        if (modal) modal.open(currentData.images[index].src, id, index);
      });
    });

    this.querySelectorAll('input[data-index]').forEach((input) => {
      input.addEventListener('input', (e: any) => {
        const index = parseInt(input.getAttribute('data-index')!);
        const currentData = store.state.sections.find((s) => s.id === id)
          ?.data as ImagesData;
        const newImages = [...currentData.images];
        newImages[index].caption = e.target.value;
        this.updateData({ images: newImages });
      });
    });

    this.querySelector('#col-select')?.addEventListener('change', (e: any) => {
      this.updateData({ columns: parseInt(e.target.value) as any });
    });
  }
}

customElements.define('image-section-editor', ImageSectionEditor);
