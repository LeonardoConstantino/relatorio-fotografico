/**
 * @component ui-confirm
 * @description Web Component autônomo que substitui window.confirm() com uma
 *              Promise-based dialog acessível, animada e altamente customizável.
 *
 * @usage
 *   import { confirmDialog } from './ui-confirm.js';
 *   const ok = await confirmDialog.ask('Excluir item?', 'Esta ação não pode ser desfeita.', {
 *     variant: 'danger',
 *     confirmText: 'Excluir',
 *     cancelText: 'Cancelar',
 *     countdown: 3,
 *   });
 *
 * @attributes
 *   open           — (booleano) controla visibilidade
 *   variant        — 'danger' | 'warning' | 'info'  (padrão: 'danger')
 *   title          — texto do título
 *   message        — texto da mensagem
 *   confirm-text   — label do botão de confirmação (padrão: 'Confirmar')
 *   cancel-text    — label do botão de cancelamento (padrão: 'Cancelar')
 *   countdown      — segundos de contagem regressiva no botão ok (padrão: 3, 0 = desativado)
 *
 * @events
 *   ui-confirm:open    — { variant, title, message }
 *   ui-confirm:close   — { result: boolean }
 *   ui-confirm:result  — { result: boolean }
 *
 * @parts
 *   backdrop   — overlay escuro
 *   panel      — caixa do modal
 *   icon       — wrapper do ícone
 *   title      — elemento <p> do título
 *   message    — elemento <p> da mensagem
 *   btn-cancel — botão cancelar
 *   btn-ok     — botão confirmar
 *
 * @css-variables
 *   --uc-z-index              z-index do modal                     (padrão: 9999)
 *   --uc-backdrop-color       cor do backdrop                      (padrão: rgba(0,0,0,.55))
 *   --uc-backdrop-blur        blur do backdrop                     (padrão: 6px)
 *   --uc-panel-bg             fundo do painel                      (padrão: #1c1c22)
 *   --uc-panel-border         borda do painel                      (padrão: #2e2e38)
 *   --uc-panel-radius         border-radius do painel              (padrão: 16px)
 *   --uc-panel-shadow         sombra do painel                     (padrão: 0 24px 64px ...)
 *   --uc-panel-max-width      largura máxima do painel             (padrão: 420px)
 *   --uc-font-family          família tipográfica                  (padrão: system-ui)
 *   --uc-color-title          cor do título                        (padrão: #f0f0f5)
 *   --uc-color-message        cor da mensagem                      (padrão: #9090a8)
 *   --uc-btn-radius           border-radius dos botões             (padrão: 10px)
 *   --uc-btn-cancel-bg        fundo do botão cancelar              (padrão: transparent)
 *   --uc-btn-cancel-color     cor do texto cancelar                (padrão: #9090a8)
 *   --uc-btn-cancel-border    borda do botão cancelar              (padrão: #2e2e38)
 *   --uc-color-danger         cor da variante danger               (padrão: #ef4444)
 *   --uc-color-warning        cor da variante warning              (padrão: #f59e0b)
 *   --uc-color-info           cor da variante info                 (padrão: #3b82f6)
 *   --uc-transition-duration  duração das animações                (padrão: 280ms)
 */

type Variant = 'danger' | 'warning' | 'info';

interface AskOptions {
  variant?: Variant;
  confirmText?: string;
  cancelText?: string;
  countdown?: number;
}

interface EventDetail {
  variant?: string;
  title?: string;
  message?: string;
  result?: boolean;
}

interface ElementCache {
  overlay: HTMLElement;
  backdrop: HTMLElement;
  panel: HTMLElement;
  iconWrapper: HTMLElement;
  title: HTMLElement;
  message: HTMLElement;
  btnCancel: HTMLButtonElement;
  btnOk: HTMLButtonElement;
  btnOkLabel: HTMLElement;
  countdownBadge: HTMLElement;
}

const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
<style>
  :host {
    --uc-z-index: 9999;
    --uc-backdrop-color: rgba(0, 0, 0, .55);
    --uc-backdrop-blur: 6px;
    --uc-panel-bg: #1c1c22;
    --uc-panel-border: #2e2e38;
    --uc-panel-radius: 16px;
    --uc-panel-shadow: 0 24px 64px rgba(0,0,0,.6), 0 4px 16px rgba(0,0,0,.4);
    --uc-panel-max-width: 420px;
    --uc-font-family: system-ui, -apple-system, sans-serif;
    --uc-color-title: #f0f0f5;
    --uc-color-message: #9090a8;
    --uc-btn-radius: 10px;
    --uc-btn-cancel-bg: transparent;
    --uc-btn-cancel-color: #9090a8;
    --uc-btn-cancel-border: #2e2e38;
    --uc-color-danger: #ef4444;
    --uc-color-warning: #f59e0b;
    --uc-color-info: #3b82f6;
    --uc-transition-duration: 280ms;

    /* interno — calculado via JS */
    --_accent: var(--uc-color-danger);

    display: contents;
    font-family: var(--uc-font-family);
  }

  /* ── Camada de overlay ─────────────────────────────────── */
  #overlay {
    position: fixed;
    inset: 0;
    z-index: var(--uc-z-index);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    visibility: hidden;
    pointer-events: none;
  }

  :host([open]) #overlay {
    visibility: visible;
    pointer-events: auto;
  }

  /* ── Backdrop ──────────────────────────────────────────── */
  #backdrop {
    position: absolute;
    inset: 0;
    background: var(--uc-backdrop-color);
    backdrop-filter: blur(var(--uc-backdrop-blur));
    -webkit-backdrop-filter: blur(var(--uc-backdrop-blur));
    opacity: 0;
    transition: opacity var(--uc-transition-duration) ease;
  }

  :host([open]) #backdrop {
    opacity: 1;
  }

  /* ── Painel ────────────────────────────────────────────── */
  #panel {
    position: relative;
    background: var(--uc-panel-bg);
    border: 1px solid var(--uc-panel-border);
    border-radius: var(--uc-panel-radius);
    box-shadow: var(--uc-panel-shadow);
    max-width: var(--uc-panel-max-width);
    width: 100%;
    padding: 1.5rem;
    transform: scale(.93) translateY(8px);
    opacity: 0;
    transition:
      transform var(--uc-transition-duration) cubic-bezier(.16,1,.3,1),
      opacity   var(--uc-transition-duration) ease;
    will-change: transform, opacity;
  }

  :host([open]) #panel {
    transform: scale(1) translateY(0);
    opacity: 1;
  }

  /* ── Linha superior: ícone + textos ────────────────────── */
  #header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  #icon-wrapper {
    flex-shrink: 0;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--_accent) 12%, transparent);
    color: var(--_accent);
    transition: background var(--uc-transition-duration) ease,
                color     var(--uc-transition-duration) ease;
  }

  #icon-wrapper svg {
    width: 1.35rem;
    height: 1.35rem;
    stroke-width: 2.25;
  }

  #texts {
    flex: 1;
    padding-top: .15rem;
    min-width: 0;
  }

  #title {
    margin: 0 0 .35rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--uc-color-title);
    letter-spacing: -.015em;
    line-height: 1.3;
  }

  #message {
    margin: 0;
    font-size: .875rem;
    color: var(--uc-color-message);
    line-height: 1.6;
    word-break: break-word;
  }

  /* ── Divisor sutil ─────────────────────────────────────── */
  #divider {
    height: 1px;
    background: var(--uc-panel-border);
    margin: 1.25rem 0 1rem;
    opacity: .6;
  }

  /* ── Rodapé com botões ─────────────────────────────────── */
  #footer {
    display: flex;
    justify-content: flex-end;
    gap: .625rem;
  }

  /* ── Base dos botões ───────────────────────────────────── */
  button {
    font-family: inherit;
    font-size: .875rem;
    font-weight: 600;
    border-radius: var(--uc-btn-radius);
    padding: .5rem 1.125rem;
    cursor: pointer;
    transition:
      background  140ms ease,
      color       140ms ease,
      opacity     140ms ease,
      transform   100ms ease,
      box-shadow  140ms ease;
    outline: none;
    line-height: 1;
    white-space: nowrap;
  }

  button:focus-visible {
    outline: 2px solid var(--_accent);
    outline-offset: 3px;
  }

  button:active:not(:disabled) {
    transform: scale(.96);
  }

  /* ── Botão Cancelar ────────────────────────────────────── */
  #btn-cancel {
    background: var(--uc-btn-cancel-bg);
    color: var(--uc-btn-cancel-color);
    border: 1px solid var(--uc-btn-cancel-border);
  }

  #btn-cancel:hover:not(:disabled) {
    background: color-mix(in srgb, var(--uc-btn-cancel-border) 40%, transparent);
    color: var(--uc-color-title);
  }

  /* ── Botão Confirmar ───────────────────────────────────── */
  #btn-ok {
    background: var(--_accent);
    color: #fff;
    border: 1px solid transparent;
    box-shadow: 0 2px 12px color-mix(in srgb, var(--_accent) 35%, transparent);
    min-width: 7rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .375rem;
  }

  #btn-ok:hover:not(:disabled) {
    filter: brightness(1.12);
    box-shadow: 0 4px 18px color-mix(in srgb, var(--_accent) 45%, transparent);
  }

  #btn-ok:disabled {
    opacity: .55;
    cursor: not-allowed;
    filter: none;
    box-shadow: none;
  }

  /* ── Badge de contagem regressiva ──────────────────────── */
  #countdown-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: rgba(255,255,255,.25);
    font-size: .7rem;
    font-weight: 700;
    line-height: 1;
    flex-shrink: 0;
    transition: opacity 200ms ease;
  }

  #countdown-badge[hidden] {
    display: none;
  }
</style>

<div id="overlay" role="dialog" aria-modal="true" aria-labelledby="uc-title" aria-describedby="uc-message">
  <div id="backdrop" part="backdrop"></div>

  <div id="panel" part="panel">
    <div id="header">
      <div id="icon-wrapper" part="icon" aria-hidden="true"></div>
      <div id="texts">
        <p id="title" part="title"></p>
        <p id="message" part="message"></p>
      </div>
    </div>

    <div id="divider" role="separator"></div>

    <div id="footer">
      <button id="btn-cancel" part="btn-cancel" type="button"></button>
      <button id="btn-ok"     part="btn-ok"     type="button">
        <span id="btn-ok-label"></span>
        <span id="countdown-badge" hidden aria-hidden="true"></span>
      </button>
    </div>
  </div>
</div>
`;

/* ── Ícones SVG inline (zero dependências) ──────────────────────────── */
const ICONS: Record<Variant, string> = {
  danger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>`,
};

/* ── Mapa de variantes → CSS custom property ────────────────────────── */
const VARIANT_ACCENT: Record<Variant, string> = {
  danger: 'var(--uc-color-danger)',
  warning: 'var(--uc-color-warning)',
  info: 'var(--uc-color-info)',
};

/* ═══════════════════════════════════════════════════════════════════════
   Web Component
   ═══════════════════════════════════════════════════════════════════════ */
class UiConfirm extends HTMLElement {
  /* ── Campos privados ─────────────────────────────────────────────── */
  #shadow: ShadowRoot;
  #controller: AbortController | null = null;
  #resolvePromise: ((value: boolean) => void) | null = null;
  #countdownTimer: number | null = null;
  #countdownValue = 0;
  #previousFocus: Element | null = null;

  /* ── Referências aos nós do shadow ───────────────────────────────── */
  #el: ElementCache = {} as ElementCache;

  /* ── API declarativa ─────────────────────────────────────────────── */
  static observedAttributes = [
    'open',
    'variant',
    'title',
    'message',
    'confirm-text',
    'cancel-text',
    'countdown',
  ];

  /* ── Constructor: apenas setup imutável ──────────────────────────── */
  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#cacheElements();
  }

  /* ── Lifecycle ───────────────────────────────────────────────────── */
  connectedCallback(): void {
    this.#attachListeners();

    // garante aria-labelledby/describedby apontando para os IDs reais
    this.#el.overlay.setAttribute('aria-labelledby', 'uc-title');
    this.#el.overlay.setAttribute('aria-describedby', 'uc-message');
    this.#el.title.id = 'uc-title';
    this.#el.message.id = 'uc-message';

    // aplica defaults de atributos não definidos
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'danger');
    if (!this.hasAttribute('confirm-text'))
      this.setAttribute('confirm-text', 'Confirmar');
    if (!this.hasAttribute('cancel-text'))
      this.setAttribute('cancel-text', 'Cancelar');
    if (!this.hasAttribute('countdown')) this.setAttribute('countdown', '3');
  }

  disconnectedCallback(): void {
    this.#cleanup();
  }

  /**
   * Reage apenas a atributos declarados em observedAttributes.
   * Cada mudança atualiza somente o nó afetado — sem re-render total.
   */
  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (oldVal === newVal) return;

    switch (name) {
      case 'open':
        newVal !== null ? this.#onOpen() : this.#onClose();
        break;
      case 'variant':
        this.#applyVariant((newVal ?? 'danger') as Variant);
        break;
      case 'title':
        this.#el.title.textContent = newVal ?? '';
        break;
      case 'message':
        this.#el.message.textContent = newVal ?? '';
        break;
      case 'confirm-text':
        this.#el.btnOkLabel.textContent = newVal ?? 'Confirmar';
        break;
      case 'cancel-text':
        this.#el.btnCancel.textContent = newVal ?? 'Cancelar';
        break;
      // 'countdown' é lido em #onOpen — não precisa de ação imediata
    }
  }

  /* ── API Pública ─────────────────────────────────────────────────── */

  /**
   * Abre o diálogo de confirmação e retorna uma Promise<boolean>.
   *
   * @param {string} title        - Título do modal
   * @param {string} message      - Mensagem descritiva
   * @param {Object} [options]
   * @param {'danger'|'warning'|'info'} [options.variant='danger']
   * @param {string}  [options.confirmText='Confirmar']
   * @param {string}  [options.cancelText='Cancelar']
   * @param {number}  [options.countdown=3]  0 = sem contagem
   * @returns {Promise<boolean>}
   */
  ask(
    title = '',
    message = '',
    {
      variant = 'danger',
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      countdown = 3,
    }: AskOptions = {},
  ): Promise<boolean> {
    // Encerra qualquer diálogo aberto anteriormente sem resolver
    if (this.#resolvePromise) this.#settle(false, { silent: true });

    return new Promise((resolve) => {
      this.#resolvePromise = resolve;

      // Define atributos — attributeChangedCallback cuida das atualizações granulares
      this.setAttribute('variant', variant);
      this.setAttribute('title', title);
      this.setAttribute('message', message);
      this.setAttribute('confirm-text', confirmText);
      this.setAttribute('cancel-text', cancelText);
      this.setAttribute('countdown', String(countdown));

      this.setAttribute('open', ''); // dispara #onOpen via attributeChangedCallback
    });
  }

  /** Fecha o modal programaticamente como cancelamento */
  dismiss(): void {
    this.#settle(false);
  }

  /* ── Métodos privados — lógica de abertura/fechamento ────────────── */

  #onOpen(): void {
    this.#dispatch('ui-confirm:open', {
      variant: this.getAttribute('variant') ?? undefined,
      title: this.getAttribute('title') ?? undefined,
      message: this.getAttribute('message') ?? undefined,
    });

    this.#startCountdown();

    // Foca no botão cancelar (padrão seguro: evita confirmação acidental)
    requestAnimationFrame(() => this.#el.btnCancel.focus());
  }

  #onClose(): void {
    this.#stopCountdown();
    this.#releaseFocus();
  }

  /**
   * Resolve a Promise, remove o atributo `open` e emite eventos.
   * @param {boolean} result
   * @param {{ silent?: boolean }} [opts]
   */
  #settle(
    result: boolean,
    { silent = false }: { silent?: boolean } = {},
  ): void {
    this.#stopCountdown();

    if (!silent) {
      this.#dispatch('ui-confirm:result', { result });
    }

    this.removeAttribute('open'); // dispara #onClose via attributeChangedCallback

    // Aguarda a transição de saída antes de resolver a Promise
    const duration = this.#transitionDuration;
    setTimeout(() => {
      if (this.#resolvePromise) {
        this.#resolvePromise(result);
        this.#resolvePromise = null;
      }
      if (!silent) {
        this.#dispatch('ui-confirm:close', { result });
      }
    }, duration);
  }

  /* ── Contagem regressiva ─────────────────────────────────────────── */

  #startCountdown(): void {
    const seconds = parseInt(this.getAttribute('countdown') ?? '3', 10);
    this.#countdownValue =
      Number.isFinite(seconds) && seconds > 0 ? seconds : 0;

    const btn = this.#el.btnOk;
    const badge = this.#el.countdownBadge;

    // Sem contagem: libera o botão imediatamente
    if (this.#countdownValue === 0) {
      btn.disabled = false;
      badge.hidden = true;
      return;
    }

    btn.disabled = true;
    badge.hidden = false;
    badge.textContent = String(this.#countdownValue);

    this.#countdownTimer = window.setInterval(() => {
      this.#countdownValue -= 1;

      if (this.#countdownValue <= 0) {
        this.#stopCountdown();
        btn.disabled = false;
        badge.hidden = true;
        btn.focus(); // transfere foco para o botão ok quando liberado
      } else {
        badge.textContent = String(this.#countdownValue);
      }
    }, 1000);
  }

  #stopCountdown(): void {
    if (this.#countdownTimer !== null) {
      clearInterval(this.#countdownTimer);
      this.#countdownTimer = null;
    }
    // Garante estado limpo dos controles
    this.#el.btnOk.disabled = false;
    this.#el.countdownBadge.hidden = true;
  }

  /* ── Variante visual ─────────────────────────────────────────────── */

  #applyVariant(variant: Variant): void {
    const accent = VARIANT_ACCENT[variant] ?? VARIANT_ACCENT.danger;
    this.style.setProperty('--_accent', accent);
    this.#el.iconWrapper.innerHTML = ICONS[variant] ?? ICONS.danger;
  }

  /* ── Listeners ───────────────────────────────────────────────────── */

  #attachListeners(): void {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    // Botão OK
    this.#el.btnOk.addEventListener(
      'click',
      () => {
        if (!this.#el.btnOk.disabled) this.#settle(true);
      },
      { signal },
    );

    // Botão Cancelar
    this.#el.btnCancel.addEventListener('click', () => this.#settle(false), {
      signal,
    });

    // Clique no backdrop
    this.#el.backdrop.addEventListener('click', () => this.#settle(false), {
      signal,
    });

    // Tecla Escape — captura na fase de captura para ter prioridade
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape' && this.hasAttribute('open')) {
          e.stopPropagation();
          this.#settle(false);
        }
      },
      { signal, capture: true },
    );

    // Focus trap — mantém Tab/Shift+Tab dentro do painel
    this.#el.overlay.addEventListener(
      'keydown',
      (e) => {
        if (e.key !== 'Tab' || !this.hasAttribute('open')) return;
        this.#trapFocus(e);
      },
      { signal },
    );
  }

  /* ── Focus trap (ARIA APG Dialog pattern) ────────────────────────── */

  #trapFocus(e: KeyboardEvent): void {
    const focusable = Array.from(
      this.#el.panel.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => el.offsetParent !== null); // visíveis

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = this.#shadow.activeElement;

    if (e.shiftKey) {
      if (active === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  #releaseFocus(): void {
    // Devolve foco ao elemento que estava ativo antes de abrir o modal
    if (
      this.#previousFocus &&
      'focus' in this.#previousFocus &&
      typeof this.#previousFocus.focus === 'function'
    ) {
      this.#previousFocus.focus();
    }
  }

  /* ── Cache de referências do shadow ──────────────────────────────── */

  #cacheElements(): void {
    const $ = (id: string) => this.#shadow.getElementById(id)!;
    this.#el = {
      overlay: this.#shadow.querySelector('#overlay')!,
      backdrop: $('backdrop'),
      panel: $('panel'),
      iconWrapper: $('icon-wrapper'),
      title: $('title'),
      message: $('message'),
      btnCancel: $('btn-cancel') as HTMLButtonElement,
      btnOk: $('btn-ok') as HTMLButtonElement,
      btnOkLabel: $('btn-ok-label'),
      countdownBadge: $('countdown-badge'),
    };
  }

  /* ── Helpers ─────────────────────────────────────────────────────── */

  #dispatch(type: string, detail: EventDetail): void {
    this.dispatchEvent(
      new CustomEvent(type, {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  get #transitionDuration(): number {
    const raw = getComputedStyle(this)
      .getPropertyValue('--uc-transition-duration')
      .trim();
    const ms = raw.endsWith('ms') ? parseFloat(raw) : parseFloat(raw) * 1000;
    return Number.isFinite(ms) ? ms : 280;
  }

  #cleanup(): void {
    this.#controller?.abort();
    this.#stopCountdown();
    if (this.#resolvePromise) {
      this.#resolvePromise(false);
      this.#resolvePromise = null;
    }
  }
}

customElements.define('ui-confirm', UiConfirm);

/* ═══════════════════════════════════════════════════════════════════════
   Singleton — instancia e injeta <ui-confirm> no <body> automaticamente
   ═══════════════════════════════════════════════════════════════════════ */
export const confirmDialog = (() => {
  let instance = document.querySelector('ui-confirm') as UiConfirm;
  if (!instance) {
    instance = document.createElement('ui-confirm') as UiConfirm;
    document.body.appendChild(instance);
  }
  return instance;
})();
