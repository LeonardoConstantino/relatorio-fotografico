import { logger } from '../../libs/Logger';

export class SortableList extends HTMLElement {
  private dragSrcEl: HTMLElement | null = null;

  connectedCallback() {
    this.setupObserver();
  }

  private setupObserver() {
    const observer = new MutationObserver(() => this.applyDraggable());
    observer.observe(this, { childList: true });
    this.applyDraggable();
  }

  private applyDraggable() {
    Array.from(this.children).forEach((child: any, index) => {
      if (child.tagName.toLowerCase() === 'section-card') {
        // Se tem o botão excluir, ele é reordenável
        const isReorderable = !child.hasAttribute('hide-remove');

        if (isReorderable) {
          child.setAttribute('draggable', 'true');
          child.setAttribute('data-index', index.toString());

          // Previne arraste se não clicar no handle
          child.onmousedown = (e: MouseEvent) => {
            const handle = (e.target as HTMLElement).closest('.drag-handle');
            if (!handle) {
              child.setAttribute('draggable', 'false');
            } else {
              child.setAttribute('draggable', 'true');
            }
          };

          child.addEventListener('dragstart', this.handleDragStart.bind(this));
          child.addEventListener('dragover', this.handleDragOver.bind(this));
          child.addEventListener('dragleave', this.handleDragLeave.bind(this));
          child.addEventListener('drop', this.handleDrop.bind(this));
          child.addEventListener('dragend', this.handleDragEnd.bind(this));
        }
      }
    });
  }

  private handleDragStart(e: DragEvent) {
    this.dragSrcEl = e.target as HTMLElement;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        this.dragSrcEl.getAttribute('data-index') || '',
      );
    }
    this.dragSrcEl.classList.add(
      'opacity-20',
      'border-accent-primary',
      'border-2',
    );
  }

  private handleDragOver(e: DragEvent) {
    if (e.preventDefault) e.preventDefault();
    const targetCard = (e.target as HTMLElement).closest('section-card');
    if (targetCard && targetCard !== this.dragSrcEl) {
      targetCard.classList.add('border-t-4', 'border-accent-primary', 'pt-2');
    }
    return false;
  }

  private handleDragLeave(e: DragEvent) {
    const targetCard = (e.target as HTMLElement).closest('section-card');
    if (targetCard) {
      targetCard.classList.remove(
        'border-t-4',
        'border-accent-primary',
        'pt-2',
      );
    }
  }

  private handleDrop(e: DragEvent) {
    e.stopPropagation();
    const targetCard = (e.target as HTMLElement).closest('section-card');

    if (this.dragSrcEl && targetCard && this.dragSrcEl !== targetCard) {
      const fromIndex = parseInt(
        this.dragSrcEl.getAttribute('data-index') || '0',
      );
      const toIndex = parseInt(targetCard.getAttribute('data-index') || '0');

      logger.debug(
        'SortableList',
        `Reordenando seção de ${fromIndex} para ${toIndex}`,
      );

      this.dispatchEvent(
        new CustomEvent('items-reordered', {
          detail: { fromIndex, toIndex },
          bubbles: true,
        }),
      );
    }
    return false;
  }

  private handleDragEnd() {
    Array.from(this.children).forEach((child) => {
      child.classList.remove(
        'opacity-20',
        'border-accent-primary',
        'border-2',
        'border-t-4',
        'pt-2',
      );
    });
  }
}

customElements.define('sortable-list', SortableList);
