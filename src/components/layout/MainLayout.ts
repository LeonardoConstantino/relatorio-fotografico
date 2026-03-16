import { store, STORE_EVENTS } from '../../store/AppStore';
import EventBus from '../../libs/EventBus';
import './EditorPanel';
import './PreviewPanel';
import '../features/ImageEditorModal';

export class MainLayout extends HTMLElement {
  connectedCallback() {
    this.className = 'layout-container';
    this.render();
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, () => this.updateLayout());
  }

  private updateLayout() {
    const preview = this.querySelector('preview-panel') as HTMLElement;
    const editor = this.querySelector('editor-panel') as HTMLElement;

    if (preview && editor) {
      if (store.state.ui.previewVisible) {
        preview.classList.remove('collapsed');
        editor.classList.remove('full-width');
      } else {
        preview.classList.add('collapsed');
        editor.classList.add('full-width');
      }
    }
  }

  private render() {
    this.innerHTML = `
      <editor-panel></editor-panel>
      <preview-panel></preview-panel>
      <image-editor-modal id="global-image-editor"></image-editor-modal>
    `;
    this.updateLayout();
  }

}

customElements.define('main-layout', MainLayout);
