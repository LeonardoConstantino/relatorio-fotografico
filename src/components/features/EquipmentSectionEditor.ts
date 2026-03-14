import { store } from '../../store/AppStore';
import { EquipmentData } from '../../types/Section';

export class EquipmentSectionEditor extends HTMLElement {
  static get observedAttributes() {
    return ['section-id'];
  }

  connectedCallback() {
    this.render();
  }

  private update(field: keyof EquipmentData, value: string) {
    const id = this.getAttribute('section-id')!;
    store.updateSectionData(id, { [field]: value });
  }

  render() {
    const id = this.getAttribute('section-id')!;
    const section = store.state.sections.find((s) => s.id === id);
    if (!section || section.type !== 'equipment') return;

    const data = section.data as EquipmentData;

    this.innerHTML = `
      <div class="grid grid-cols-1 gap-2">
        <app-input label="Descrição" value="${data.description}" data-field="description"></app-input>
        <div class="grid grid-cols-2 gap-2">
          <app-input label="Modelo" value="${data.model}" data-field="model"></app-input>
          <app-input label="Patrimônio" value="${data.patrimony}" data-field="patrimony"></app-input>
        </div>
        <app-input label="Proprietário / Responsável" value="${data.owner}" data-field="owner"></app-input>
      </div>
    `;

    this.querySelectorAll('app-input').forEach((input) => {
      input.addEventListener('app-input', (e: any) => {
        const field = input.getAttribute('data-field') as keyof EquipmentData;
        this.update(field, e.detail.value);
      });
    });
  }
}

customElements.define('equipment-section-editor', EquipmentSectionEditor);
