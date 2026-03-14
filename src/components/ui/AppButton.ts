/**
 * Componente de Botão Aura Technical (v2)
 */
export class AppButton extends HTMLElement {
  private _initialContent: string = '';

  static get observedAttributes() {
    return ['variant', 'disabled'];
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
    // Se ainda não foi conectado, não renderiza para evitar perder o innerHTML
    if (!this._initialContent && this.innerHTML) {
      this._initialContent = this.innerHTML;
    }

    const variant = this.getAttribute('variant') || 'primary';
    const isDisabled = this.hasAttribute('disabled');

    // Limpamos e reconstruímos de forma limpa
    this.innerHTML = '';
    const btn = document.createElement('button');
    btn.className = `btn btn-${variant} w-full`;
    if (isDisabled) btn.setAttribute('disabled', '');
    btn.innerHTML = this._initialContent;

    this.appendChild(btn);
  }
}

customElements.define('app-button', AppButton);
