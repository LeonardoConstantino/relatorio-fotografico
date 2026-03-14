import { store } from '../../store/AppStore';
import { TextData } from '../../types/Section';

export class TextSectionEditor extends HTMLElement {
  static get observedAttributes() {
    return ['section-id'];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    const id = this.getAttribute('section-id')!;
    const section = store.state.sections.find((s) => s.id === id);
    if (!section || section.type !== 'text') return;

    const data = section.data as TextData;

    this.innerHTML = `
      <div class="space-y-4">
        <app-input label="Título da Seção" value="${data.title}" data-field="title"></app-input>
        <div>
          <label class="label-technical">Conteúdo</label>
          <textarea 
            class="input-technical min-h-30 resize-y" 
            placeholder="Digite o laudo ou observações..."
          >${data.content}</textarea>
        </div>
      </div>
    `;

    this.querySelector('app-input')?.addEventListener('app-input', (e: any) => {
      store.updateSectionData(id, { title: e.detail.value });
    });

    this.querySelector('textarea')?.addEventListener('input', (e: any) => {
      store.updateSectionData(id, { content: e.target.value });
    });
  }
}

customElements.define('text-section-editor', TextSectionEditor);
