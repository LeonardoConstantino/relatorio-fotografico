/**
 * @component ui-toast / ui-toast-manager
 * ─────────────────────────────────────────────────────────────────────────────
 * Descrição   : Sistema de notificações toast sem dependências externas.
 * Componentes : <ui-toast-manager> (container singleton) + <ui-toast> (item)
 *
 * API pública:
 *   ToastManager.show(options) → UiToast
 *   ToastManager.clear()
 *
 * CSS Custom Properties (no :host do ui-toast-manager ou globalmente):
 *   --toast-gap            Espaço entre toasts              (padrão: 10px)
 *   --toast-offset         Distância das bordas da tela     (padrão: 24px)
 *   --toast-width          Largura do toast                 (padrão: 340px)
 *   --toast-radius         Border-radius                    (padrão: 10px)
 *   --toast-font-family    Família tipográfica              (padrão: system-ui)
 *   --toast-font-size      Tamanho do texto                 (padrão: 0.9rem)
 *   --toast-padding        Padding interno                  (padrão: 14px 16px)
 *   --toast-shadow         Box-shadow                       (padrão: ver abaixo)
 *   --toast-z-index        Z-index do container             (padrão: 9999)
 *   --toast-duration-ms    Duração da animação enter/exit   (padrão: 280ms)
 *   --toast-max-height     Altura máxima do toast           (padrão: 160px)
 *
 * Por tipo (substituir {type} por success | error | warning | info):
 *   --toast-{type}-bg      Background
 *   --toast-{type}-color   Cor do texto
 *   --toast-{type}-border  Borda lateral (accent)
 *   --toast-progress-bg    Cor da barra de progresso
 *
 * Parts expostos (::part):
 *   toast-root | toast-icon | toast-body | toast-close | toast-bar
 *
 * Eventos emitidos pelo <ui-toast>:
 *   ui-toast:dismissed  — ToastDismissedEvent
 *
 * Atributos observados em <ui-toast>:
 *   type      ToastType   padrão: 'info'
 *   message   string      padrão: ''
 *   duration  number (ms) padrão: 4000
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ─── Tipos públicos ───────────────────────────────────────────────────────────

/** Variantes semânticas do toast. */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Parâmetros aceitos por `ToastManager.show()` e `UiToastManager.show()`.
 * `message` é obrigatório; os demais têm defaults.
 */
export interface ToastOptions {
  /** Variante visual e semântica. @default 'info' */
  type?: ToastType;
  /** Texto da notificação (escapado via textContent — sem risco de XSS). */
  message: string;
  /**
   * Duração em ms até o auto-dismiss.
   * `0` = permanente (usuário deve fechar manualmente).
   * @default 4000
   */
  duration?: number;
}

/** Payload do CustomEvent `'ui-toast:dismissed'`. */
export interface ToastDismissedDetail {
  type: ToastType;
  message: string;
}

/**
 * Evento tipado emitido quando um toast é dispensado (timeout ou clique).
 * Atravessa o shadow boundary: `bubbles: true, composed: true`.
 */
export type ToastDismissedEvent = CustomEvent<ToastDismissedDetail>;

/** Contrato da API singleton `ToastManager`. */
export interface IToastManager {
  show(options: ToastOptions): UiToast;
  clear(): void;
}

// ─── Extensão do HTMLElementTagNameMap ───────────────────────────────────────
// Permite tipagem correta em `querySelector` / `createElement` sem asserções.

declare global {
  interface HTMLElementTagNameMap {
    'ui-toast': UiToast;
    'ui-toast-manager': UiToastManager;
  }

  interface HTMLElementEventMap {
    'ui-toast:dismissed': ToastDismissedEvent;
  }
}

// ─── Constantes ───────────────────────────────────────────────────────────────

/** Fallback (ms) para duração da animação quando --toast-duration-ms não está definido. */
const ANIM_DURATION_FALLBACK = 280 as const;

/** Valores padrão dos atributos de `<ui-toast>`. */
const DEFAULTS = {
  type: 'info' as ToastType,
  duration: 4000,
  message: '',
} as const;

/** Ícones SVG por tipo. `aria-hidden="true"`: o anúncio é feito via role/live region. */
const ICONS: Record<ToastType, string> = {
  success: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M6 10.5l2.8 2.8L14 7.5" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  error: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round"/>
  </svg>`,
  warning: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5L18 17.5H2L10 2.5z" stroke="currentColor" stroke-width="1.6"
          stroke-linejoin="round"/>
    <path d="M10 8.5v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="14.5" r="0.9" fill="currentColor"/>
  </svg>`,
  info: `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M10 9v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="6.5" r="0.9" fill="currentColor"/>
  </svg>`,
};

/**
 * Mapeamento de tipo → role ARIA.
 * `"alert"`  → `aria-live="assertive"`: interrompe leitura (erros e avisos urgentes).
 * `"status"` → `aria-live="polite"`:    aguarda pausa     (sucesso e informação).
 */
const ARIA_ROLES: Record<ToastType, 'alert' | 'status'> = {
  success: 'status',
  error: 'alert',
  warning: 'alert',
  info: 'status',
};

// ─── Template estático ────────────────────────────────────────────────────────
// Criado UMA vez e clonado por instância — o browser parseia o CSS apenas uma vez.

const TOAST_TEMPLATE: HTMLTemplateElement = document.createElement('template');
TOAST_TEMPLATE.innerHTML = /* html */ `
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: var(--toast-width, 340px);
      max-width: calc(100vw - var(--toast-offset, 24px) * 2);

      /* Token interno: resolvido uma vez no :host */
      --_dur: var(--toast-duration-ms, ${ANIM_DURATION_FALLBACK}ms);

      /* Estado inicial: deslocado para direita e invisível */
      opacity: 0;
      transform: translateX(calc(var(--toast-width, 340px) + 48px));
      transition:
        opacity   var(--_dur) cubic-bezier(.4, 0, .2, 1),
        transform var(--_dur) cubic-bezier(.4, 0, .2, 1);
      will-change: transform, opacity;
    }

    /* WCAG 2.1 §2.3.3 — respeita preferência de movimento reduzido */
    @media (prefers-reduced-motion: reduce) {
      :host {
        transform: none !important;
        transition: opacity var(--_dur) linear;
      }
      [part="toast-bar"] { display: none !important; }
    }

    :host([data-visible]) {
      opacity: 1;
      transform: translateX(0);
    }

    /* ── Tokens padrão neutros por tipo ── */
    :host([type="success"]) {
      --_bg:     var(--toast-success-bg,     #f0fdf4);
      --_color:  var(--toast-success-color,  #166534);
      --_border: var(--toast-success-border, #22c55e);
    }
    :host([type="error"]) {
      --_bg:     var(--toast-error-bg,     #fef2f2);
      --_color:  var(--toast-error-color,  #991b1b);
      --_border: var(--toast-error-border, #ef4444);
    }
    :host([type="warning"]) {
      --_bg:     var(--toast-warning-bg,     #fffbeb);
      --_color:  var(--toast-warning-color,  #92400e);
      --_border: var(--toast-warning-border, #f59e0b);
    }
    :host([type="info"]) {
      --_bg:     var(--toast-info-bg,     #eff6ff);
      --_color:  var(--toast-info-color,  #1e40af);
      --_border: var(--toast-info-border, #3b82f6);
    }

    [part="toast-root"] {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: var(--toast-padding, 14px 16px);
      background: var(--_bg);
      color: var(--_color);
      border-radius: var(--toast-radius, 10px);
      border-left: 4px solid var(--_border);
      box-shadow: var(--toast-shadow,
        0 4px 6px -1px rgb(0 0 0 / .07),
        0 2px 4px -2px rgb(0 0 0 / .06)
      );
      font-family: var(--toast-font-family, system-ui, sans-serif);
      font-size: var(--toast-font-size, .9rem);
      line-height: 1.5;
      overflow: hidden;
      max-height: var(--toast-max-height, 160px);
    }

    [part="toast-icon"] {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
      margin-top: 1px;
      color: var(--_border);
    }

    [part="toast-body"] {
      flex: 1;
      word-break: break-word;
      overflow-y: auto;
    }

    [part="toast-close"] {
      flex-shrink: 0;
      appearance: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 2px;
      margin-top: -1px;
      color: var(--_color);
      opacity: .55;
      border-radius: 4px;
      line-height: 1;
      transition: opacity .15s;
    }

    [part="toast-close"]:hover,
    [part="toast-close"]:focus-visible {
      opacity: 1;
      outline: 2px solid var(--_border);
      outline-offset: 1px;
    }

    [part="toast-bar"] {
      position: absolute;
      bottom: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: var(--toast-progress-bg, var(--_border));
      opacity: .45;
      transform-origin: left;
      transform: scaleX(1);
    }
  </style>

  <div part="toast-root">
    <span part="toast-icon"></span>
    <span part="toast-body"></span>
    <button part="toast-close" aria-label="Fechar notificação" type="button">
      <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
        <path d="M2 2l10 10M12 2L2 12"
              stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>
    </button>
    <div part="toast-bar" aria-hidden="true"></div>
  </div>
`;

// ─── Utilitário interno ───────────────────────────────────────────────────────

/**
 * Type guard: verifica em tempo de execução se um valor é um `ToastType` válido.
 * Protege contra atributos HTML arbitrários (e.g. `type="foobar"`).
 */
function isToastType(value: string | null): value is ToastType {
  return (
    value === 'success' ||
    value === 'error' ||
    value === 'warning' ||
    value === 'info'
  );
}

// ─── <ui-toast> ──────────────────────────────────────────────────────────────

export class UiToast extends HTMLElement {
  // Campos privados com tipos explícitos
  readonly #shadow: ShadowRoot;
  #controller: AbortController | null = null;
  #timerId: ReturnType<typeof setTimeout> | null = null;
  #progressAnim: Animation | null = null;

  // Referências cacheadas dos nós internos — querySelector chamado apenas 1× no constructor
  readonly #root: HTMLElement;
  readonly #iconEl: HTMLElement;
  readonly #bodyEl: HTMLElement;
  readonly #barEl: HTMLElement;

  static readonly observedAttributes: readonly string[] = [
    'type',
    'message',
    'duration',
  ];

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });

    // Clona o template estático: CSS não é re-parseado a cada instância
    this.#shadow.appendChild(TOAST_TEMPLATE.content.cloneNode(true));

    // Cache das referências — asserções non-null (!) seguras: o template garante existência
    this.#root = this.#shadow.querySelector<HTMLElement>(
      '[part="toast-root"]',
    )!;
    this.#iconEl = this.#shadow.querySelector<HTMLElement>(
      '[part="toast-icon"]',
    )!;
    this.#bodyEl = this.#shadow.querySelector<HTMLElement>(
      '[part="toast-body"]',
    )!;
    this.#barEl =
      this.#shadow.querySelector<HTMLElement>('[part="toast-bar"]')!;
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  connectedCallback(): void {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    // Sincroniza DOM com os atributos presentes no momento da conexão
    this.#syncType(this.getAttribute('type'));
    this.#syncMessage(this.getAttribute('message') ?? DEFAULTS.message);
    this.#startProgress();
    this.#scheduleAutoDismiss();

    // Listener do botão de fechar; removido automaticamente via AbortController
    this.#shadow
      .querySelector<HTMLButtonElement>('[part="toast-close"]')!
      .addEventListener(
        'click',
        () => {
          this.dismiss();
        },
        { signal },
      );

    // Anima entrada no próximo frame: garante que o browser pintou opacity:0 primeiro
    requestAnimationFrame(() => {
      this.setAttribute('data-visible', '');
    });
  }

  disconnectedCallback(): void {
    this.#controller?.abort();
    if (this.#timerId !== null) {
      clearTimeout(this.#timerId);
    }
    this.#progressAnim?.cancel();
  }

  /**
   * Atualização granular por atributo.
   * Nunca reconstrói o shadow inteiro — preserva estado de animações em curso.
   */
  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (oldVal === newVal || !this.isConnected) return;

    if (name === 'type') {
      this.#syncType(newVal);
    } else if (name === 'message') {
      this.#syncMessage(newVal ?? DEFAULTS.message);
    } else if (name === 'duration') {
      // Cancela animação e timer anteriores antes de recriar
      this.#progressAnim?.cancel();
      this.#progressAnim = null;
      this.#startProgress();
      this.#scheduleAutoDismiss();
    }
  }

  // ── API pública ────────────────────────────────────────────────────────────

  /**
   * Dispensa o toast com animação de saída.
   * Emite `'ui-toast:dismissed'` após a transição completar.
   */
  dismiss(): void {
    this.removeAttribute('data-visible');

    // Lê duração via CSS var computada; || captura tanto NaN quanto string vazia
    const animDur: number =
      parseFloat(
        getComputedStyle(this).getPropertyValue('--toast-duration-ms').trim(),
      ) || ANIM_DURATION_FALLBACK;

    setTimeout((): void => {
      const event: ToastDismissedEvent = new CustomEvent('ui-toast:dismissed', {
        bubbles: true,
        composed: true,
        detail: { type: this.#resolvedType, message: this.#resolvedMessage },
      });
      this.dispatchEvent(event);
      this.remove();
    }, animDur);
  }

  // ── Getters de atributos (com normalização e validação de tipo) ────────────

  /** Tipo atual, validado com o type guard `isToastType`. */
  get #resolvedType(): ToastType {
    const raw = this.getAttribute('type');
    return isToastType(raw) ? raw : DEFAULTS.type;
  }

  /** Mensagem atual. */
  get #resolvedMessage(): string {
    return this.getAttribute('message') ?? DEFAULTS.message;
  }

  /**
   * Duração atual em ms.
   * Garante inteiro não-negativo finito com fallback para DEFAULTS.duration.
   */
  get #resolvedDuration(): number {
    const raw = parseInt(this.getAttribute('duration') ?? '', 10);
    return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULTS.duration;
  }

  // ── Sincronização granular ─────────────────────────────────────────────────

  /**
   * Atualiza ícone SVG e atributos ARIA sem tocar em nenhum outro nó.
   * Aceita `null` (atributo removido) e faz fallback para o tipo padrão.
   */
  #syncType(rawType: string | null): void {
    const type: ToastType = isToastType(rawType) ? rawType : DEFAULTS.type;
    const role = ARIA_ROLES[type];

    // innerHTML seguro: conteúdo é controlado (constante ICONS), não input do usuário
    this.#iconEl.innerHTML = ICONS[type];

    this.#root.setAttribute('role', role);
    this.#root.setAttribute(
      'aria-live',
      role === 'alert' ? 'assertive' : 'polite',
    );
  }

  /**
   * Atualiza o texto da mensagem.
   * `textContent` escapa HTML nativamente — sem elemento temporário, sem XSS.
   */
  #syncMessage(message: string): void {
    this.#bodyEl.textContent = message;
  }

  // ── Progress bar ───────────────────────────────────────────────────────────

  /**
   * Inicia a animação da barra de progresso.
   * `duration = 0` → oculta a barra (toast permanente, sem indicador de tempo).
   */
  #startProgress(): void {
    const duration = this.#resolvedDuration;

    if (duration <= 0) {
      this.#barEl.style.display = 'none';
      return;
    }

    this.#barEl.style.display = '';

    this.#progressAnim = this.#barEl.animate(
      [
        { transform: 'scaleX(1)' },
        { transform: 'scaleX(0)' },
      ] satisfies Keyframe[],
      {
        duration,
        fill: 'forwards',
        easing: 'linear',
      } satisfies KeyframeAnimationOptions,
    );
  }

  // ── Auto-dismiss ───────────────────────────────────────────────────────────

  /**
   * Agenda o dismiss automático após `#resolvedDuration` ms.
   * `duration = 0` → sem agendamento; toast permanece até o usuário fechar.
   */
  #scheduleAutoDismiss(): void {
    // Garante que não existem timers duplicados
    if (this.#timerId !== null) {
      clearTimeout(this.#timerId);
      this.#timerId = null;
    }

    const duration = this.#resolvedDuration;

    if (duration > 0) {
      this.#timerId = setTimeout((): void => {
        this.dismiss();
      }, duration);
    }
  }
}

customElements.define('ui-toast', UiToast);

// ─── <ui-toast-manager> ──────────────────────────────────────────────────────

export class UiToastManager extends HTMLElement {
  readonly #shadow: ShadowRoot;

  /**
   * Número máximo de toasts visíveis simultaneamente.
   * Ao atingir o limite, o toast mais antigo (FIFO) é dispensado automaticamente.
   * Configurável: `UiToastManager.MAX_TOASTS = 10`
   */
  static MAX_TOASTS: number = 5;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.innerHTML = /* html */ `
      <style>
        :host {
          position: fixed;
          bottom: var(--toast-offset, 24px);
          right:  var(--toast-offset, 24px);
          z-index: var(--toast-z-index, 9999);
          display: flex;
          flex-direction: column-reverse; /* Novo toast aparece na base da pilha */
          gap: var(--toast-gap, 10px);
          pointer-events: none;           /* Container não bloqueia cliques na página */
        }
        ::slotted(ui-toast) {
          pointer-events: auto;           /* Toasts individuais são clicáveis */
        }
      </style>
      <slot></slot>
    `;
  }

  /**
   * Cria e exibe um toast.
   * Aplica o limite `MAX_TOASTS` descartando o mais antigo se necessário (FIFO).
   *
   * @param options - Parâmetros do toast; `message` é obrigatório.
   * @returns Referência ao elemento `<ui-toast>` criado.
   */
  show({
    type = DEFAULTS.type,
    message = DEFAULTS.message,
    duration = DEFAULTS.duration,
  }: ToastOptions): UiToast {
    // Aplica limite de pilha: descarta o mais antigo antes de adicionar o novo
    const current = this.querySelectorAll<UiToast>('ui-toast');
    if (current.length >= UiToastManager.MAX_TOASTS) {
      current[0].dismiss();
    }

    const toast = document.createElement('ui-toast');
    toast.setAttribute('type', type);
    toast.setAttribute('message', message);
    toast.setAttribute('duration', String(duration));
    this.appendChild(toast);
    return toast;
  }

  /** Dispensa todos os toasts visíveis com animação de saída. */
  clear(): void {
    this.querySelectorAll<UiToast>('ui-toast').forEach((t) => {
      t.dismiss();
    });
  }
}

customElements.define('ui-toast-manager', UiToastManager);

// ─── Singleton helper ─────────────────────────────────────────────────────────

/**
 * Garante exatamente um `<ui-toast-manager>` no documento.
 * Se o elemento foi removido do DOM, cria e anexa um novo automaticamente.
 */
function getOrCreateManager(): UiToastManager {
  // Lazy singleton: instancia apenas na primeira chamada (ou após remoção do DOM)
  const existing = document.querySelector<UiToastManager>('ui-toast-manager');
  if (existing !== null) return existing;

  const mgr = document.createElement('ui-toast-manager');
  document.body.appendChild(mgr);
  return mgr;
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Ponto de entrada principal do sistema de toasts.
 * Gerencia o singleton de forma transparente.
 *
 * @example
 * ```ts
 * import { ToastManager } from './ui-toast.js';
 *
 * ToastManager.show({ type: 'success', message: 'Salvo com sucesso!' });
 * ToastManager.show({ type: 'error',   message: 'Falha na requisição.', duration: 0 });
 * ToastManager.show({ type: 'warning', message: 'Sessão expirando.',    duration: 6000 });
 * ToastManager.show({ type: 'info',    message: 'Nova versão disponível.' });
 * ToastManager.clear();
 * ```
 */
export const ToastManager: IToastManager = {
  /**
   * Exibe um toast via singleton manager.
   * @param options - Ver `ToastOptions`; `message` é obrigatório.
   * @returns Referência ao `UiToast` criado.
   */
  show(options: ToastOptions): UiToast {
    return getOrCreateManager().show(options);
  },

  /** Remove todos os toasts visíveis com animação de saída. */
  clear(): void {
    getOrCreateManager().clear();
  },
} as const;
