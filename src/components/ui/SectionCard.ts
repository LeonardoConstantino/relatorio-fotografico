/**
 * Componente de Card de Módulo Aura Technical (v2)
 */
export class SectionCard extends HTMLElement {
  private _initialContent: string = '';

  static get observedAttributes() {
    return ['header-title', 'section-id', 'hide-remove'];
  }

  connectedCallback() {
    if (!this._initialContent) {
      this._initialContent = this.innerHTML;
    }
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    if (!this._initialContent && this.innerHTML) {
      this._initialContent = this.innerHTML;
    }

    const title = this.getAttribute('header-title') || 'Seção';
    const icon = this.getAttribute('header-icon') || 'settings';
    const sectionId = this.getAttribute('section-id') || '';
    const hideRemove = this.hasAttribute('hide-remove');

    this.innerHTML = `
      <div class="card-module animate-slide-down group/card" data-id="${sectionId}">
        <div class="flex justify-between items-center mb-4 border-b border-studio-border pb-2">
          <div class="flex items-center gap-2">
            ${
              !hideRemove
                ? `
              <div class="drag-handle cursor-grab active:cursor-grabbing text-studio-muted hover:text-white p-1 select-none">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm0 4h2v2H7v-2zm4-8h2v2h-2V7zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2z"/>
                </svg>
              </div>
            `
                : ''
            }
            <h4 class="font-sans font-semibold text-white flex items-center gap-2">
              <ui-icon name="${icon}" size="md"></ui-icon>
              ${title}
            </h4>
          </div>
          ${
            !hideRemove
              ? `
            <button class="btn-remove btn btn-danger py-1 px-2 text-[10px] uppercase font-mono tracking-tighter">
              Excluir
            </button>
          `
              : ''
          }
        </div>
        <div class="section-body">
          ${this._initialContent}
        </div>
      </div>
    `;

    this.querySelector('.btn-remove')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.dispatchEvent(
        new CustomEvent('remove-section', {
          detail: { id: sectionId },
          bubbles: true,
        }),
      );
    });
  }
}

customElements.define('section-card', SectionCard);
