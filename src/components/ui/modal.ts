/**
 * @element ui-modal
 * @description Modal Web Component — Shadow DOM, variantes, tamanhos, animações e acessibilidade.
 *
 * @attr {ModalVariant}  [variant="default"]  default | success | danger | warning | info
 * @attr {ModalSize}     [size="md"]          sm | md | lg | xl | fullscreen
 * @attr {ModalAnimation}[animation="scale"]  fade | scale | slide | flip
 * @attr {string}        [heading]            Texto do título (atalho para o slot header)
 * @attr {boolean}       [open]               Presença abre o modal
 *
 * @slot (default)  Conteúdo do corpo
 * @slot header     Substitui o título gerado pelo atributo heading
 * @slot footer     Rodapé (botões, ações)
 *
 * @fires ui-modal:open    { detail: UiModalEventDetail }  bubbles + composed
 * @fires ui-modal:close   { detail: UiModalEventDetail }  bubbles + composed
 * @fires ui-modal:cancel  { detail: UiModalEventDetail }  bubbles + composed  (Esc / backdrop)
 *
 * @csspart dialog    Wrapper posicionado (overlay)
 * @csspart panel     Container visual do modal
 * @csspart header    Cabeçalho
 * @csspart body      Corpo
 * @csspart footer    Rodapé
 * @csspart close-btn Botão ×
 *
 * @cssprop --modal-bg            Fundo do painel          (#ffffff)
 * @cssprop --modal-border        Cor da borda             (rgba(0,0,0,.1))
 * @cssprop --modal-shadow        Sombra do painel
 * @cssprop --modal-radius        Border-radius            (0.875rem)
 * @cssprop --modal-padding       Padding interno          (1.75rem)
 * @cssprop --modal-backdrop      Cor do overlay           (rgba(0,0,0,.5))
 * @cssprop --modal-accent        Cor de destaque (auto por variante)
 * @cssprop --modal-accent-fg     Texto sobre accent       (#fff)
 * @cssprop --modal-font          Família tipográfica
 * @cssprop --modal-duration      Duração da animação      (280ms)
 * @cssprop --modal-easing        Easing da animação       (cubic-bezier(.4,0,.2,1))
 * @cssprop --modal-z             Z-index base             (1000)
 *
 * @example
 * ```html
 * <ui-modal id="demo" heading="Confirmar" variant="danger" size="sm" animation="scale">
 *   <p>Deseja excluir este item?</p>
 *   <div slot="footer">
 *     <button onclick="document.getElementById('demo').close()">Cancelar</button>
 *     <button>Excluir</button>
 *   </div>
 * </ui-modal>
 * <button onclick="document.getElementById('demo').open()">Abrir</button>
 * ```
 */

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export type ModalVariant =
  | 'default'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
export type ModalAnimation = 'fade' | 'scale' | 'slide' | 'flip';
export type ModalEventName =
  | 'ui-modal:open'
  | 'ui-modal:close'
  | 'ui-modal:cancel';

/** Payload presente em `event.detail` de todos os eventos do componente. */
export interface UiModalEventDetail {
  modal: UiModal;
}

/** Eventos tipados emitidos pelo componente. */
export interface UiModalEventMap {
  'ui-modal:open': CustomEvent<UiModalEventDetail>;
  'ui-modal:close': CustomEvent<UiModalEventDetail>;
  'ui-modal:cancel': CustomEvent<UiModalEventDetail>;
}

// ─── Constantes (readonly tuples + mapped object) ─────────────────────────────

const VARIANTS = ['default', 'success', 'danger', 'warning', 'info'] as const;
const SIZES = ['sm', 'md', 'lg', 'xl', 'fullscreen'] as const;
const ANIMS = ['fade', 'scale', 'slide', 'flip'] as const;

interface VariantToken {
  readonly accent: string;
  readonly fg: string;
  readonly icon: string | null;
}

const VARIANT_MAP: Record<ModalVariant, VariantToken> = {
  default: { accent: '#6366f1', fg: '#fff', icon: null },
  success: { accent: '#16a34a', fg: '#fff', icon: '✓' },
  danger: { accent: '#dc2626', fg: '#fff', icon: '!' },
  warning: { accent: '#d97706', fg: '#fff', icon: '⚠' },
  info: { accent: '#0284c7', fg: '#fff', icon: 'i' },
} as const;

const SIZE_MAP: Record<ModalSize, string> = {
  sm: '28rem',
  md: '40rem',
  lg: '56rem',
  xl: '72rem',
  fullscreen: '100vw',
} as const;

// ─── Helpers de type guard ─────────────────────────────────────────────────────

function isVariant(v: string | null): v is ModalVariant {
  return VARIANTS.includes(v as ModalVariant);
}

function isSize(v: string | null): v is ModalSize {
  return SIZES.includes(v as ModalSize);
}

function isAnimation(v: string | null): v is ModalAnimation {
  return ANIMS.includes(v as ModalAnimation);
}

// ─── Template (CSS + HTML) ────────────────────────────────────────────────────

const STYLE: string = /* css */ `
  :host {
    display: contents;
    --_bg       : var(--modal-bg,       #ffffff);
    --_border   : var(--modal-border,   rgba(0,0,0,.1));
    --_shadow   : var(--modal-shadow,   0 20px 60px rgba(0,0,0,.22));
    --_radius   : var(--modal-radius,   0.875rem);
    --_pad      : var(--modal-padding,  1.75rem);
    --_overlay  : var(--modal-backdrop, rgba(0,0,0,.5));
    --_accent   : var(--modal-accent,   #6366f1);
    --_fg       : var(--modal-accent-fg,#ffffff);
    --_font     : var(--modal-font,     system-ui, sans-serif);
    --_dur      : var(--modal-duration, 280ms);
    --_ease     : var(--modal-easing,   cubic-bezier(.4,0,.2,1));
    --_z        : var(--modal-z,        1000);
  }

  /* ── Overlay ────────────────────────────────────────────────────────── */
  .overlay {
    position: fixed;
    inset: 0;
    z-index: var(--_z);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--_font);
    visibility: hidden;
    pointer-events: none;
  }

  .overlay.is-open {
    visibility: visible;
    pointer-events: auto;
  }

  .overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--_overlay);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
    opacity: 0;
    transition: opacity var(--_dur) var(--_ease);
  }

  .overlay.is-open::before    { opacity: 1; }
  .overlay.is-closing::before { opacity: 0; }

  /* ── Painel ─────────────────────────────────────────────────────────── */
  .panel {
    position: relative;
    z-index: 1;
    background: var(--_bg);
    border: 1px solid var(--_border);
    border-radius: var(--_radius);
    box-shadow: var(--_shadow);
    width: min(var(--_width, 40rem), calc(100vw - 2rem));
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: opacity var(--_dur) var(--_ease),
                transform var(--_dur) var(--_ease);
  }

  :host([size="fullscreen"]) .panel {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  /* ── Estados de animação ────────────────────────────────────────────── */
  .panel                      { opacity: 0; }
  .overlay.is-open .panel     { opacity: 1; transform: none; }
  .overlay.is-closing .panel  { opacity: 0; }

  :host([animation="fade"]) .panel,
  :host(:not([animation]))  .panel { transform: none; }

  :host([animation="scale"]) .panel                       { transform: scale(.88); }
  :host([animation="scale"]) .overlay.is-open .panel      { transform: scale(1); }
  :host([animation="scale"]) .overlay.is-closing .panel   { transform: scale(.88); }

  :host([animation="slide"]) .panel                       { transform: translateY(2rem); }
  :host([animation="slide"]) .overlay.is-open .panel      { transform: translateY(0); }
  :host([animation="slide"]) .overlay.is-closing .panel   { transform: translateY(2rem); }

  :host([animation="flip"]) .overlay                      { perspective: 900px; }
  :host([animation="flip"]) .panel                        { transform: rotateX(-16deg) translateY(-1rem); }
  :host([animation="flip"]) .overlay.is-open .panel       { transform: rotateX(0deg) translateY(0); }
  :host([animation="flip"]) .overlay.is-closing .panel    { transform: rotateX(-16deg) translateY(-1rem); }

  @media (prefers-reduced-motion: reduce) {
    .overlay::before, .panel { transition-duration: 1ms !important; }
    .panel { transform: none !important; }
  }

  /* ── Stripe (variante) ──────────────────────────────────────────────── */
  .stripe { height: 4px; flex-shrink: 0; background: var(--_accent); }

  /* ── Header ─────────────────────────────────────────────────────────── */
  .header {
    display: flex;
    align-items: flex-start;
    gap: .75rem;
    padding: var(--_pad) var(--_pad) 0;
    flex-shrink: 0;
  }

  .icon-badge {
    width: 2rem; height: 2rem;
    border-radius: 50%;
    background: var(--_accent);
    color: var(--_fg);
    display: grid;
    place-items: center;
    font-size: .85rem;
    font-weight: 700;
    flex-shrink: 0;
  }

  .icon-badge:empty { display: none; }

  .title-wrap { flex: 1; min-width: 0; }

  .title { font-size: 1.1rem; font-weight: 700; color: #111; line-height: 1.3; }

  .close-btn {
    all: unset;
    cursor: pointer;
    width: 2rem; height: 2rem;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #888;
    font-size: 1.1rem;
    flex-shrink: 0;
    transition: background .15s, color .15s;
    user-select: none;
    -webkit-user-select: none;
  }

  .close-btn:hover         { background: rgba(0,0,0,.07); color: #222; }
  .close-btn:focus-visible { outline: 2px solid var(--_accent); outline-offset: 2px; }

  /* ── Body ───────────────────────────────────────────────────────────── */
  .body {
    flex: 1;
    padding: var(--_pad);
    overflow-y: auto;
    font-size: .9375rem;
    line-height: 1.6;
    color: #374151;
    overscroll-behavior: contain;
  }

  /* ── Footer ─────────────────────────────────────────────────────────── */
  .footer {
    padding: 1rem var(--_pad) var(--_pad);
    border-top: 1px solid var(--_border);
    flex-shrink: 0;
  }

  .footer.hidden { display: none; }

  /* ── Bottom-sheet em mobile ─────────────────────────────────────────── */
  @media (max-width: 480px) {
    .overlay { align-items: flex-end; }
    .panel {
      width: 100vw !important;
      max-height: 92vh !important;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
    :host([animation="slide"]) .panel                      { transform: translateY(100%); }
    :host([animation="slide"]) .overlay.is-open .panel     { transform: translateY(0); }
    :host([animation="slide"]) .overlay.is-closing .panel  { transform: translateY(100%); }
  }
`;

const HTML: string = /* html */ `
  <div class="overlay" role="dialog" aria-modal="true"
       aria-labelledby="modal-title" aria-describedby="modal-body" part="dialog">

    <div class="panel" part="panel">
      <div class="stripe" aria-hidden="true"></div>

      <header class="header" part="header">
        <span class="icon-badge" aria-hidden="true"></span>
        <div class="title-wrap">
          <slot name="header">
            <span id="modal-title" class="title"></span>
          </slot>
        </div>
        <button class="close-btn" part="close-btn"
                aria-label="Fechar modal" type="button">✕</button>
      </header>

      <div id="modal-body" class="body" part="body">
        <slot></slot>
      </div>

      <footer class="footer hidden" part="footer">
        <slot name="footer"></slot>
      </footer>
    </div>

  </div>
`;

// ─── Seletor de elementos focáveis ────────────────────────────────────────────

const FOCUSABLE_SEL: string =
  'a[href],button:not([disabled]),input:not([disabled]),' +
  'select:not([disabled]),textarea:not([disabled]),' +
  '[tabindex]:not([tabindex="-1"]),details>summary';

// ─── Web Component ────────────────────────────────────────────────────────────

export class UiModal extends HTMLElement {
  // ── Campos privados ────────────────────────────────────────────────────────

  readonly #shadow: ShadowRoot;
  readonly #internals: ElementInternals;

  #ctl: AbortController | null = null;

  // Refs de DOM — preenchidas em #cacheRefs() durante o constructor
  #overlay!: HTMLDivElement;
  #panel!: HTMLDivElement;
  #closeBtn!: HTMLButtonElement;
  #titleEl!: HTMLSpanElement;
  #iconBadge!: HTMLSpanElement;
  #footer!: HTMLElement;
  #footerSlot!: HTMLSlotElement;

  // Estado interno
  #busy: boolean = false;
  #initDone: boolean = false;
  #prevFocus: Element | null = null;

  // ── Form association ───────────────────────────────────────────────────────

  static readonly formAssociated: boolean = true;

  // ── Atributos observados ───────────────────────────────────────────────────

  static readonly observedAttributes: ReadonlyArray<string> = [
    'variant',
    'size',
    'animation',
    'heading',
    'open',
  ];

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#internals = this.attachInternals();

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLE);
    this.#shadow.adoptedStyleSheets = [sheet];
    this.#shadow.innerHTML = HTML;

    this.#cacheRefs();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  connectedCallback(): void {
    if (this.#initDone) return;
    this.#initDone = true;

    this.#ctl = new AbortController();
    const sig = this.#ctl.signal;

    this.#closeBtn.addEventListener('click', () => this.close(), {
      signal: sig,
    });

    this.#overlay.addEventListener(
      'click',
      (e: MouseEvent) => {
        if (e.target === this.#overlay) this.#cancel();
      },
      { signal: sig },
    );

    this.#footerSlot.addEventListener(
      'slotchange',
      () => {
        const hasContent =
          this.#footerSlot.assignedNodes({ flatten: true }).length > 0;
        this.#footer.classList.toggle('hidden', !hasContent);
      },
      { signal: sig },
    );

    this.#overlay.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.#cancel();
          return;
        }
        if (e.key === 'Tab') this.#trapFocus(e);
      },
      { signal: sig },
    );

    this.#syncAttrs();
  }

  disconnectedCallback(): void {
    this.#initDone = false;
    this.#ctl?.abort();
  }

  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (oldVal === newVal) return;

    switch (name) {
      case 'variant':
        this.#applyVariant(newVal);
        break;
      case 'size':
        this.#applySize(newVal);
        break;
      case 'animation':
        break; // CSS usa attr-selector diretamente
      case 'heading':
        this.#titleEl.textContent = newVal ?? '';
        break;
      case 'open': {
        const shouldOpen = newVal !== null;
        if (shouldOpen && !this.#isVisible && !this.#busy) this.#doOpen();
        if (!shouldOpen && this.#isVisible && !this.#busy) this.#doClose();
        break;
      }
    }
  }

  // ── API pública ────────────────────────────────────────────────────────────

  /** Abre o modal programaticamente. */
  open(): void {
    if (this.#isVisible || this.#busy) return;
    this.setAttribute('open', '');
  }

  /** Fecha o modal programaticamente. */
  close(): void {
    if (!this.#isVisible || this.#busy) return;
    this.removeAttribute('open');
  }

  /** Alterna o estado do modal. */
  toggle(): void {
    this.#isVisible ? this.close() : this.open();
  }

  /** `true` quando o modal está visível (ou abrindo). */
  get isOpen(): boolean {
    return this.#isVisible;
  }

  // ── Getters / setters refletidos ───────────────────────────────────────────

  get variant(): ModalVariant {
    const v = this.getAttribute('variant');
    return isVariant(v) ? v : 'default';
  }
  set variant(v: ModalVariant) {
    this.setAttribute('variant', isVariant(v) ? v : 'default');
  }

  get size(): ModalSize {
    const v = this.getAttribute('size');
    return isSize(v) ? v : 'md';
  }
  set size(v: ModalSize) {
    this.setAttribute('size', isSize(v) ? v : 'md');
  }

  get animation(): ModalAnimation {
    const v = this.getAttribute('animation');
    return isAnimation(v) ? v : 'scale';
  }
  set animation(v: ModalAnimation) {
    this.setAttribute('animation', isAnimation(v) ? v : 'scale');
  }

  get heading(): string {
    return this.getAttribute('heading') ?? '';
  }
  set heading(v: string) {
    this.setAttribute('heading', v);
  }

  // ── addEventListener / removeEventListener com tipagem de eventos ──────────

  addEventListener<K extends keyof UiModalEventMap>(
    type: K,
    listener: (this: UiModal, ev: UiModalEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<K extends keyof UiModalEventMap>(
    type: K,
    listener: (this: UiModal, ev: UiModalEventMap[K]) => void,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ): void {
    super.removeEventListener(type, listener, options);
  }

  // ── Métodos privados ───────────────────────────────────────────────────────

  get #isVisible(): boolean {
    return this.#overlay.classList.contains('is-open');
  }

  #cacheRefs(): void {
    const q = <T extends Element>(sel: string): T =>
      this.#shadow.querySelector<T>(sel)!;

    this.#overlay = q<HTMLDivElement>('.overlay');
    this.#panel = q<HTMLDivElement>('.panel');
    this.#closeBtn = q<HTMLButtonElement>('.close-btn');
    this.#titleEl = q<HTMLSpanElement>('#modal-title');
    this.#iconBadge = q<HTMLSpanElement>('.icon-badge');
    this.#footer = q<HTMLElement>('.footer');
    this.#footerSlot = q<HTMLSlotElement>('slot[name="footer"]');
  }

  #syncAttrs(): void {
    if (this.hasAttribute('variant'))
      this.#applyVariant(this.getAttribute('variant'));
    if (this.hasAttribute('size')) this.#applySize(this.getAttribute('size'));
    if (this.hasAttribute('heading'))
      this.#titleEl.textContent = this.getAttribute('heading');
    if (this.hasAttribute('open')) this.#doOpen();
  }

  #applyVariant(raw: string | null): void {
    const key: ModalVariant = isVariant(raw) ? raw : 'default';
    const tok = VARIANT_MAP[key];
    const host = this.#shadow.host as HTMLElement;
    host.style.setProperty('--_accent', tok.accent);
    host.style.setProperty('--_fg', tok.fg);
    this.#iconBadge.textContent = tok.icon ?? '';
  }

  #applySize(raw: string | null): void {
    const key: ModalSize = isSize(raw) ? raw : 'md';
    this.#panel.style.setProperty('--_width', SIZE_MAP[key]);
  }

  #doOpen(): void {
    this.#busy = true;
    this.#prevFocus = document.activeElement;

    this.#overlay.classList.add('is-open');
    this.#overlay.removeAttribute('aria-hidden');
    this.#internals.states?.add('open');

    requestAnimationFrame(() => {
      const first = this.#firstFocusable();
      (first ?? this.#closeBtn).focus();
      this.#busy = false;
    });

    this.#emit('ui-modal:open');
  }

  #doClose(isCancel: boolean = false): void {
    this.#busy = true;
    this.#overlay.classList.replace('is-open', 'is-closing');

    const dur = this.#parseDuration(
      getComputedStyle(this.#shadow.host).getPropertyValue('--modal-duration'),
    );

    setTimeout(() => {
      this.#overlay.classList.remove('is-closing');
      this.#overlay.setAttribute('aria-hidden', 'true');
      this.#internals.states?.delete('open');
      this.#busy = false;

      (this.#prevFocus as HTMLElement | null)?.focus?.();
      this.#prevFocus = null;

      if (isCancel) this.#emit('ui-modal:cancel');
      this.#emit('ui-modal:close');
    }, dur);
  }

  #cancel(): void {
    if (!this.#isVisible || this.#busy) return;
    this.#busy = true;
    this.removeAttribute('open');
    this.#doClose(true);
  }

  /**
   * Converte um valor CSS de duração ("280ms" | "0.28s" | "280") para ms.
   */
  #parseDuration(raw: string): number {
    const m = raw.trim().match(/^(\d+(?:\.\d+)?)(ms|s)?$/);
    if (!m || m[1] === undefined) return 280;
    const num = parseFloat(m[1]);
    const unit = m[2] ?? 'ms';
    return unit === 's' ? num * 1000 : num;
  }

  #emit(name: ModalEventName): void {
    const detail: UiModalEventDetail = { modal: this };
    this.dispatchEvent(
      new CustomEvent<UiModalEventDetail>(name, {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  #trapFocus(e: KeyboardEvent): void {
    const focusable = this.#focusableEls();

    if (!focusable.length) {
      e.preventDefault();
      this.#closeBtn.focus();
      return;
    }

    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    const active = (this.#shadow.activeElement ??
      document.activeElement) as HTMLElement | null;

    // Foco fora do modal → retorna ao início
    if (!active || !focusable.includes(active)) {
      e.preventDefault();
      first.focus();
      return;
    }

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }

  #focusableEls(): HTMLElement[] {
    return [
      ...Array.from(this.#shadow.querySelectorAll<HTMLElement>(FOCUSABLE_SEL)),
      ...Array.from(this.querySelectorAll<HTMLElement>(FOCUSABLE_SEL)),
    ];
  }

  #firstFocusable(): HTMLElement | null {
    return this.#focusableEls().find((el) => el !== this.#closeBtn) ?? null;
  }
}

// ─── Registro ─────────────────────────────────────────────────────────────────

customElements.define('ui-modal', UiModal);

// ─── Declaração global (lib: ["dom"]) ─────────────────────────────────────────
// Permite usar <ui-modal> no JSX/TSX e em querySelector sem type casts.

declare global {
  interface HTMLElementTagNameMap {
    'ui-modal': UiModal;
  }

  interface HTMLElementEventMap extends UiModalEventMap {}
}
