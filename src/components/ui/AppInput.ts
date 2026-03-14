/**
 * Componente de Input Aura Technical (v3)
 * Corrigido avisos de acessibilidade (ID e Label)
 */
export class AppInput extends HTMLElement {
  private static idCounter = 0;
  private inputId: string;

  constructor() {
    super();
    AppInput.idCounter++;
    this.inputId = `app-input-${AppInput.idCounter}`;
  }

  static get observedAttributes() {
    return ['label', 'value', 'placeholder', 'type'];
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
    const input = this.querySelector('input');
    if (input) {
      if (name === 'value') input.value = newValue;
      if (name === 'placeholder') input.placeholder = newValue;
      if (name === 'type') input.type = newValue;
    } else {
      this.render();
    }
  }

  render() {
    const label = this.getAttribute('label') || '';
    const value = this.getAttribute('value') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const type = this.getAttribute('type') || 'text';

    this.innerHTML = `
      <div class="mb-4 w-full">
        ${label ? `<label for="${this.inputId}" class="label-technical">${label}</label>` : ''}
        <input 
          id="${this.inputId}"
          name="${this.inputId}"
          type="${type}" 
          class="input-technical" 
          placeholder="${placeholder}" 
          value="${value}"
        />
      </div>
    `;

    this.querySelector('input')?.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.dispatchEvent(
        new CustomEvent('app-input', {
          detail: { value: target.value },
          bubbles: true,
        }),
      );
    });
  }
}

customElements.define('app-input', AppInput);
