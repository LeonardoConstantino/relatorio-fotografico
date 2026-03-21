/**
 * @element ui-tooltip-manager
 * @description Gerenciador global de tooltips (deve ser adicionado uma vez no documento)
 */

/**
 * @element ui-tooltip
 * @description Tooltip wrapper com slots (mantém funcionalidade original)
 *
 * @attr {string}  trigger      - Gatilhos: "hover", "focus", "click" ou combinados (padrão: "hover focus")
 * @attr {string}  placement    - Posição: "top" | "bottom" | "left" | "right" (padrão: "top")
 * @attr {string}  tooltip      - Texto simples (prioridade 1)
 * @attr {string}  tooltip-ref  - ID de template (prioridade 2)
 * @attr {string}  variant      - Variante: "info" | "success" | "warning" | "error"
 * @attr {number}  delay        - Delay em ms (padrão: 200)
 * @attr {number}  offset       - Distância em px (padrão: 8)
 *
 * @slot target  - Elemento que dispara o tooltip
 * @slot content - Conteúdo rico (prioridade 3)
 */

type Placement = 'top' | 'bottom' | 'left' | 'right';
type Trigger =
  | 'hover'
  | 'focus'
  | 'click'
  | 'manual'
  | 'keyboard'
  | 'click-outside';

interface Coordinates {
  top: number;
  left: number;
}

interface TooltipConfig {
  text?: string;
  templateRef?: string;
  contentSlot?: DocumentFragment;
  placement: Placement;
  variant?: string;
  delay: number;
  offset: number;
  triggers: Trigger[];
}

const PLACEMENTS: Placement[] = ['top', 'bottom', 'left', 'right'];

/* ══════════════════════════════════════════════════════════════
   TOOLTIP BALLOON (elemento renderizado no body)
   ══════════════════════════════════════════════════════════════ */

// Stylesheet compartilhado (criado uma vez, reutilizado por todas as instâncias)
const balloonStyles = new CSSStyleSheet();
balloonStyles.replaceSync(`
  :host {
    position: fixed;
    z-index: var(--tooltip-z-index, 9999);
    max-width: var(--tooltip-max-width, 280px);
    padding: var(--tooltip-padding, 6px 10px);
    border-radius: var(--tooltip-radius, 6px);
    font-size: var(--tooltip-font-size, 0.8125rem);
    font-family: inherit;
    line-height: 1.5;
    pointer-events: none;
    border: var(--tooltip-border, none);
    
    background: var(--tooltip-bg);
    color: var(--tooltip-color);
    box-shadow: var(--tooltip-shadow);
    
    opacity: 0;
    transform: scale(0.92) translateY(4px);
    transition:
      opacity 120ms ease,
      transform 120ms cubic-bezier(0.34, 1.56, 0.64, 1),
      visibility 0s linear 120ms;
    visibility: hidden;
    will-change: opacity, transform;
  }
  
  :host(.is-visible) {
    opacity: 1;
    transform: scale(1) translateY(0px);
    transition:
      opacity 160ms ease,
      transform 160ms cubic-bezier(0.34, 1.56, 0.64, 1);
    visibility: visible;
  }
  
  [part="arrow"] {
    position: absolute;
    width: 0; height: 0;
    border: var(--tooltip-arrow-size, 6px) solid transparent;
  }
  
  :host([data-placement="top"]) [part="arrow"] {
    bottom: calc(var(--tooltip-arrow-size, 6px) * -2);
    left: 50%; transform: translateX(-50%);
    border-top-color: var(--tooltip-bg);
  }
  :host([data-placement="bottom"]) [part="arrow"] {
    top: calc(var(--tooltip-arrow-size, 6px) * -2);
    left: 50%; transform: translateX(-50%);
    border-bottom-color: var(--tooltip-bg);
  }
  :host([data-placement="left"]) [part="arrow"] {
    right: calc(var(--tooltip-arrow-size, 6px) * -2);
    top: 50%; transform: translateY(-50%);
    border-left-color: var(--tooltip-bg);
  }
  :host([data-placement="right"]) [part="arrow"] {
    left: calc(var(--tooltip-arrow-size, 6px) * -2);
    top: 50%; transform: translateY(-50%);
    border-right-color: var(--tooltip-bg);
  }
  
  @media (prefers-color-scheme: light) {
    :host(:not([variant])) {
      --tooltip-bg: #1e293b;
      --tooltip-color: #f8fafc;
      --tooltip-shadow: 0 4px 20px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.12);
    }
  }
  @media (prefers-color-scheme: dark) {
    :host(:not([variant])) {
      --tooltip-bg: #f1f5f9;
      --tooltip-color: #0f172a;
      --tooltip-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3);
    }
  }
  
  :host([variant="info"])    { --tooltip-bg: #0ea5e9; --tooltip-color: #fff; --tooltip-shadow: 0 4px 16px #0ea5e940; }
  :host([variant="success"]) { --tooltip-bg: #22c55e; --tooltip-color: #fff; --tooltip-shadow: 0 4px 16px #22c55e40; }
  :host([variant="warning"]) { --tooltip-bg: #f59e0b; --tooltip-color: #fff; --tooltip-shadow: 0 4px 16px #f59e0b40; }
  :host([variant="error"])   { --tooltip-bg: #ef4444; --tooltip-color: #fff; --tooltip-shadow: 0 4px 16px #ef444440; }
  
  [part="content"] {
    display: block;
  }
`);

class TooltipBalloon extends HTMLElement {
  #shadow: ShadowRoot;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });

    // Aplica stylesheet compartilhado (performático - reutiliza a mesma instância)
    this.#shadow.adoptedStyleSheets = [balloonStyles];

    // Adiciona estrutura HTML
    const container = document.createElement('div');
    container.innerHTML = `
      <span part="arrow"></span>
      <span part="content"></span>
    `;
    this.#shadow.appendChild(container);
  }

  setContent(content: string | DocumentFragment): void {
    const contentEl = this.#shadow.querySelector('[part="content"]')!;
    contentEl.innerHTML = '';

    if (typeof content === 'string') {
      contentEl.textContent = content;
    } else {
      contentEl.appendChild(content);
    }
  }

  show(): void {
    this.classList.add('is-visible');
  }

  hide(): void {
    this.classList.remove('is-visible');
    this.addEventListener(
      'transitionend',
      () => {
        if (!this.classList.contains('is-visible')) {
          this.remove();
        }
      },
      { once: true },
    );
  }

  position(targetRect: DOMRect, placement: Placement, offset: number): void {
    const tipRect = this.getBoundingClientRect();
    const arrowSize = 6;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const order = [placement, ...PLACEMENTS.filter((p) => p !== placement)];
    let chosen: Placement | null = null;
    let coords: Coordinates | null = null;

    // Tenta cada posição na ordem de preferência até encontrar uma que caiba na viewport
    for (const p of order) {
      const c = this.#calcCoords(targetRect, tipRect, p, offset, arrowSize);
      if (
        c.top >= 4 &&
        c.left >= 4 &&
        c.top + tipRect.height <= vh - 4 &&
        c.left + tipRect.width <= vw - 4
      ) {
        chosen = p;
        coords = c;
        break;
      }
    }

    // Fallback: usa posição preferida mesmo que não caiba perfeitamente
    if (!chosen) {
      chosen = placement;
      coords = this.#calcCoords(
        targetRect,
        tipRect,
        placement,
        offset,
        arrowSize,
      );
    }

    this.setAttribute('data-placement', chosen);
    this.style.top = `${coords?.top || 20}px`;
    this.style.left = `${coords?.left || 20}px`;
  }

  #calcCoords(
    targetRect: DOMRect,
    tipRect: DOMRect,
    placement: Placement,
    offset: number,
    arrowSize: number,
  ): Coordinates {
    const gap = offset + arrowSize; // Offset do usuário + espaço para a seta
    switch (placement) {
      case 'top':
        return {
          top: targetRect.top - tipRect.height - gap,
          left: targetRect.left + (targetRect.width - tipRect.width) / 2,
        };
      case 'bottom':
        return {
          top: targetRect.bottom + gap,
          left: targetRect.left + (targetRect.width - tipRect.width) / 2,
        };
      case 'left':
        return {
          top: targetRect.top + (targetRect.height - tipRect.height) / 2,
          left: targetRect.left - tipRect.width - gap,
        };
      case 'right':
        return {
          top: targetRect.top + (targetRect.height - tipRect.height) / 2,
          left: targetRect.right + gap,
        };
    }
  }
}

customElements.define('tooltip-balloon', TooltipBalloon);

/* ══════════════════════════════════════════════════════════════
   TOOLTIP MANAGER (serviço global)
   ══════════════════════════════════════════════════════════════ */
class UiTooltipManager extends HTMLElement {
  #observer: MutationObserver | null = null;
  #activeTooltips = new WeakMap<HTMLElement, TooltipInstance>();

  connectedCallback(): void {
    this.#scanExisting();
    this.#observeNew();
    this.#setupGlobalListeners();
  }

  disconnectedCallback(): void {
    this.#observer?.disconnect();
  }

  #scanExisting(): void {
    document.querySelectorAll('[data-tooltip]').forEach((el) => {
      this.#attachTooltip(el as HTMLElement);
    });
  }

  #observeNew(): void {
    // Agrupa mutações em lotes via requestAnimationFrame para evitar
    // processamento repetitivo quando muitos elementos são adicionados de uma vez
    let pending: Set<HTMLElement> = new Set();
    let rafId: number | null = null;

    this.#observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-tooltip')) {
              pending.add(node);
            }
            node.querySelectorAll('[data-tooltip]').forEach((el) => {
              pending.add(el as HTMLElement);
            });
          }
        });
      });

      // Debounce: processa tudo em um único frame
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        pending.forEach((el) => this.#attachTooltip(el));
        pending.clear();
        rafId = null;
      });
    });

    this.#observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  #attachTooltip(target: HTMLElement): void {
    if (this.#activeTooltips.has(target)) return;

    const config: TooltipConfig = {
      text: target.getAttribute('data-tooltip') || undefined,
      templateRef: target.getAttribute('data-tooltip-ref') || undefined,
      placement:
        (target.getAttribute('data-tooltip-placement') as Placement) || 'top',
      variant: target.getAttribute('data-tooltip-variant') || undefined,
      delay: Number(target.getAttribute('data-tooltip-delay') || 200),
      offset: Number(target.getAttribute('data-tooltip-offset') || 8),
      triggers: (
        target.getAttribute('data-tooltip-trigger') || 'hover focus'
      ).split(/\s+/) as Trigger[],
    };

    const instance = new TooltipInstance(target, config);
    this.#activeTooltips.set(target, instance);
  }

  #setupGlobalListeners(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document
          .querySelectorAll('tooltip-balloon')
          .forEach((b) => (b as TooltipBalloon).hide());
      }
    });
  }
}

customElements.define('ui-tooltip-manager', UiTooltipManager);

/* ══════════════════════════════════════════════════════════════
   TOOLTIP INSTANCE (lógica por elemento)
   ══════════════════════════════════════════════════════════════ */
class TooltipInstance {
  #target: HTMLElement;
  #config: TooltipConfig;
  #balloon: TooltipBalloon | null = null;
  #controller = new AbortController();
  #openTimer: ReturnType<typeof setTimeout> | null = null;
  #closeTimer: ReturnType<typeof setTimeout> | null = null;
  #isOpen = false;

  constructor(target: HTMLElement, config: TooltipConfig) {
    this.#target = target;
    this.#config = config;
    this.#bind(); // Vincula listeners (auto-cleanup via AbortController)
  }

  #bind(): void {
    const { signal } = this.#controller;
    const { triggers } = this.#config;

    if (triggers.includes('hover')) {
      this.#target.addEventListener('mouseenter', () => this.#scheduleOpen(), {
        signal,
      });
      this.#target.addEventListener('mouseleave', () => this.#scheduleClose(), {
        signal,
      });
    }

    if (triggers.includes('focus')) {
      this.#target.addEventListener('focusin', () => this.#scheduleOpen(), {
        signal,
      });
      this.#target.addEventListener('focusout', () => this.#scheduleClose(), {
        signal,
      });
    }

    if (triggers.includes('click')) {
      this.#target.addEventListener(
        'click',
        (e) => {
          e.stopPropagation();
          this.#isOpen ? this.close() : this.open();
        },
        { signal },
      );

      // Click-outside com verificação inteligente (capture phase para melhor detecção)
      document.addEventListener(
        'click',
        (e) => {
          if (
            this.#isOpen &&
            !this.#target.contains(e.target as Node) &&
            !this.#balloon?.contains(e.target as Node)
          ) {
            this.close();
          }
        },
        { signal, capture: true },
      );
    }
  }

  #scheduleOpen(): void {
    // Cancela timer de fechamento pendente
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }

    // Evita múltiplos timers de abertura simultâneos
    if (this.#openTimer) return;

    this.#openTimer = setTimeout(() => {
      this.#open();
      this.#openTimer = null;
    }, this.#config.delay);
  }

  #scheduleClose(): void {
    // Cancela timer de abertura pendente
    if (this.#openTimer) {
      clearTimeout(this.#openTimer);
      this.#openTimer = null;
    }

    // Evita múltiplos timers de fechamento simultâneos
    if (this.#closeTimer) return;

    this.#closeTimer = setTimeout(() => {
      this.#close();
      this.#closeTimer = null;
    }, 100);
  }

  #open(): void {
    if (this.#isOpen) return;
    this.#isOpen = true;

    this.#balloon = document.createElement('tooltip-balloon') as TooltipBalloon;

    if (this.#config.variant) {
      this.#balloon.setAttribute('variant', this.#config.variant);
    }

    // Define conteúdo (prioridade: text > templateRef > contentSlot)
    const content = this.#resolveContent();
    if (content) {
      this.#balloon.setContent(content);
    }

    document.body.appendChild(this.#balloon);

    // Posiciona após render (aguarda próximo frame para garantir dimensões corretas)
    requestAnimationFrame(() => {
      const rect = this.#target.getBoundingClientRect();
      this.#balloon!.position(
        rect,
        this.#config.placement,
        this.#config.offset,
      );
      this.#balloon!.show();
    });
  }

  #close(): void {
    if (!this.#isOpen || !this.#balloon) return;
    this.#isOpen = false;
    this.#balloon.hide();
    this.#balloon = null;
  }

  #resolveContent(): string | DocumentFragment | null {
    if (this.#config.text) {
      return this.#config.text;
    }

    if (this.#config.templateRef) {
      const tpl = document.getElementById(this.#config.templateRef);
      if (tpl instanceof HTMLTemplateElement) {
        return tpl.content.cloneNode(true) as DocumentFragment;
      }
    }

    if (this.#config.contentSlot) {
      return this.#config.contentSlot.cloneNode(true) as DocumentFragment;
    }

    return null;
  }

  /* ── API Pública ── */

  /** Abre o tooltip imediatamente (cancela delays pendentes) */
  open(): void {
    if (this.#openTimer) {
      clearTimeout(this.#openTimer);
      this.#openTimer = null;
    }
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
    this.#open();
  }

  /** Fecha o tooltip imediatamente (cancela delays pendentes) */
  close(): void {
    if (this.#openTimer) {
      clearTimeout(this.#openTimer);
      this.#openTimer = null;
    }
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
    this.#close();
  }

  /** Atualiza configuração sem recriar a instância completa */
  updateConfig(newConfig: Partial<TooltipConfig>): void {
    Object.assign(this.#config, newConfig);

    // Se está aberto, atualiza conteúdo dinamicamente
    if (this.#isOpen && this.#balloon) {
      const content = this.#resolveContent();
      if (content) {
        this.#balloon.setContent(content);
      }

      if (newConfig.variant !== undefined) {
        if (newConfig.variant) {
          this.#balloon.setAttribute('variant', newConfig.variant);
        } else {
          this.#balloon.removeAttribute('variant');
        }
      }
    }
  }

  /** Limpa timers e listeners */
  destroy(): void {
    if (this.#openTimer) {
      clearTimeout(this.#openTimer);
      this.#openTimer = null;
    }
    if (this.#closeTimer) {
      clearTimeout(this.#closeTimer);
      this.#closeTimer = null;
    }
    this.#controller.abort();
    this.#close();
  }
}

/* ══════════════════════════════════════════════════════════════
   TOOLTIP WRAPPER (mantém API original com slots)
   ══════════════════════════════════════════════════════════════ */
const TEMPLATE_WRAPPER = document.createElement('template');
TEMPLATE_WRAPPER.innerHTML = `
<style>
  :host { display: contents; }
</style>
<slot name="target"></slot>
<slot name="content" style="display: none;"></slot>
`;

class UiTooltip extends HTMLElement {
  #shadow: ShadowRoot;
  #targetSlot: HTMLSlotElement;
  #contentSlot: HTMLSlotElement;
  #instance: TooltipInstance | null = null;

  static observedAttributes = [
    'trigger',
    'placement',
    'tooltip',
    'tooltip-ref',
    'variant',
    'delay',
    'offset',
  ];

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(TEMPLATE_WRAPPER.content.cloneNode(true));
    this.#targetSlot = this.#shadow.querySelector('slot[name="target"]')!;
    this.#contentSlot = this.#shadow.querySelector('slot[name="content"]')!;
  }

  connectedCallback(): void {
    this.#targetSlot.addEventListener('slotchange', () => this.#init());
    this.#init();
  }

  disconnectedCallback(): void {
    this.#instance?.destroy();
  }

  attributeChangedCallback(
    name: string,
    oldValue: string | null,
    newValue: string | null,
  ): void {
    if (oldValue === newValue || !this.#instance) return;

    // Otimização: apenas reconfigura ao invés de destruir/recriar para mudanças leves
    if (['tooltip', 'tooltip-ref', 'variant'].includes(name)) {
      this.#instance.updateConfig(this.#buildConfig());
    } else {
      // Recria apenas para mudanças estruturais (triggers, placement, etc)
      this.#init();
    }
  }

  #init(): void {
    const targets = this.#targetSlot.assignedElements({ flatten: true });
    if (!targets.length) return;

    this.#instance?.destroy();

    const target = targets[0] as HTMLElement;
    const config = this.#buildConfig();

    this.#instance = new TooltipInstance(target, config);
  }

  #buildConfig(): TooltipConfig {
    const contentNodes = this.#contentSlot.assignedNodes({ flatten: true });
    const contentSlot =
      contentNodes.length > 0 ? this.#extractContent(contentNodes) : undefined;

    return {
      text: this.getAttribute('tooltip') || undefined,
      templateRef: this.getAttribute('tooltip-ref') || undefined,
      contentSlot,
      placement: (this.getAttribute('placement') as Placement) || 'top',
      variant: this.getAttribute('variant') || undefined,
      delay: Number(this.getAttribute('delay') || 200),
      offset: Number(this.getAttribute('offset') || 8),
      triggers: (this.getAttribute('trigger') || 'hover focus').split(
        /\s+/,
      ) as Trigger[],
    };
  }

  #extractContent(nodes: Node[]): DocumentFragment {
    const frag = document.createDocumentFragment();
    nodes.forEach((n) => frag.appendChild(n.cloneNode(true)));
    return frag;
  }

  /* ── API Pública ── */

  open(): void {
    this.#instance?.open();
  }

  close(): void {
    this.#instance?.close();
  }

  get isOpen(): boolean {
    return (this.#instance as any)?.['#isOpen'] ?? false;
  }
}

customElements.define('ui-tooltip', UiTooltip);
