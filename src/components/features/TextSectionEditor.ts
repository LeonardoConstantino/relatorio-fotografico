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
    const markdownCheatSheet = `
# Markdown Suportado

Cabeçalhos: # H1, ## H2, ### H3

Ênfase: *itálico* ou _itálico_; **negrito** ou __negrito__

Listas: - item (não ordenada) ou 1. item (ordenada)

Links: [texto](url)

Imagens: ![alt](url)

Código:  \`código\` (inline) ou \`\`\` código \`\`\` (bloco)

Citações: > texto

Tabelas: | col1 | col2 |

Linha horizontal: ---`;

    this.innerHTML = `
      <div class="space-y-4">
        <app-input label="Título da Seção" value="${data.title}" data-field="title"></app-input>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="label-technical !mb-0">Conteúdo</label>
            <span class="text-[9px] font-mono text-studio-muted flex items-center gap-1 opacity-70 cursor-help" title="${markdownCheatSheet}">
              <span class="border border-studio-border rounded flex items-center justify-center text-[9px] font-bold">M↓</span>
              Markdown Ativo
            </span>
          </div>
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
