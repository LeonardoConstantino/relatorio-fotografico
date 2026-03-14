import { store } from '../../store/AppStore';
import { BulletData } from '../../types/Section';

export class BulletSectionEditor extends HTMLElement {
  static get observedAttributes() {
    return ['section-id'];
  }

  connectedCallback() {
    this.render();
  }

  private getSectionData(): BulletData | null {
    const id = this.getAttribute('section-id');
    const section = store.state.sections.find((s) => s.id === id);
    return section && section.type === 'bullets'
      ? (section.data as BulletData)
      : null;
  }

  private updateItems(items: string[]) {
    const id = this.getAttribute('section-id')!;
    store.updateSectionData(id, { items });
  }

  render() {
    const data = this.getSectionData();
    if (!data) return;

    this.innerHTML = `
      <div class="space-y-4">
        <app-input label="Título da Lista" value="${data.title}" data-field="title"></app-input>
        
        <div class="space-y-2" id="items-container">
          ${data.items
            .map(
              (item, index) => `
            <div class="flex gap-2 group">
              <div class="w-6 h-8 flex items-center justify-center text-studio-muted font-mono text-[10px]">${index + 1}</div>
              <input 
                type="text" 
                class="input-technical flex-1 py-1.5! text-xs" 
                value="${item}" 
                data-index="${index}" 
                placeholder="Item ${index + 1}"
              />
              <button class="btn-del-item text-accent-danger opacity-0 group-hover:opacity-100 p-1 transition-opacity" data-index="${index}">×</button>
            </div>
          `,
            )
            .join('')}
        </div>

        <app-button variant="outline" id="add-item" class="py-1.5! text-[10px] uppercase font-mono">
          + Adicionar Item
        </app-button>
      </div>
    `;

    this.setupListeners();
  }

  private setupListeners() {
    const id = this.getAttribute('section-id')!;

    // Título da lista
    this.querySelector('app-input')?.addEventListener('app-input', (e: any) => {
      store.updateSectionData(id, { title: e.detail.value });
    });

    // Inputs de itens (Busca dados frescos do store a cada input)
    this.querySelectorAll('input[data-index]').forEach((input) => {
      input.addEventListener('input', (e: any) => {
        const index = parseInt(
          (e.target as HTMLElement).getAttribute('data-index')!,
        );
        const currentData = this.getSectionData();
        if (currentData) {
          const newItems = [...currentData.items];
          newItems[index] = (e.target as HTMLInputElement).value;
          this.updateItems(newItems);
        }
      });
    });

    // Botão remover item
    this.querySelectorAll('.btn-del-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.getAttribute('data-index')!);
        const currentData = this.getSectionData();
        if (currentData) {
          const newItems = currentData.items.filter((_, i) => i !== index);
          this.updateItems(newItems);
          this.render(); // Re-renderiza para atualizar índices e remover o elemento do DOM
        }
      });
    });

    // Botão adicionar item
    this.querySelector('#add-item')?.addEventListener('click', () => {
      const currentData = this.getSectionData();
      if (currentData) {
        this.updateItems([...currentData.items, '']);
        this.render(); // Re-renderiza para criar o novo input
      }
    });
  }
}

customElements.define('bullet-section-editor', BulletSectionEditor);
