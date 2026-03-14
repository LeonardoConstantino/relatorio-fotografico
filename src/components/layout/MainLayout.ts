import './EditorPanel';
import './PreviewPanel';
import '../features/ImageEditorModal';

export class MainLayout extends HTMLElement {
  connectedCallback() {
    this.className = 'layout-container';
    this.innerHTML = `
      <editor-panel></editor-panel>
      <preview-panel></preview-panel>
      <image-editor-modal id="global-image-editor"></image-editor-modal>
    `;
  }
}

customElements.define('main-layout', MainLayout);
