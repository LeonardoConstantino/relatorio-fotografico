// src/libs/pwa-register.ts
import { registerSW } from 'virtual:pwa-register';

/**
 * Classe para gerenciar notificações visuais do PWA
 * Alinhada ao Design System Aura Technical (Tailwind v4)
 */
class PWANotificationManager {
  private readonly styles = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
    .pwa-notification { animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .pwa-notification.removing { animation: slideOut 0.3s ease-in forwards; }
  `;

  constructor() {
    this.injectStyles();
  }

  private injectStyles(): void {
    const style = document.createElement('style');
    style.textContent = this.styles;
    document.head.appendChild(style);
  }

  private getIconForType(type: string): string {
    const iconMap: any = {
      update: '🔄',
      offline: '📡',
      error: '❌',
      default: '📱',
    };
    return iconMap[type] || iconMap.default;
  }

  private createNotification(
    type: 'update' | 'offline' | 'error',
    title: string,
    message: string,
    actions?: Array<{ text: string; action: () => void; primary?: boolean }>,
  ): HTMLElement {
    const notification = document.createElement('div');

    // Classes Aura Technical: Dark, Glassmorphism, Neon Borders
    const baseClasses =
      'pwa-notification fixed top-6 right-6 max-w-sm p-5 rounded-lg shadow-2xl z-[200] font-sans text-sm border border-studio-border backdrop-blur-xl';

    const typeClasses: any = {
      update: 'bg-studio-base/90 border-accent-primary text-white',
      offline: 'bg-studio-base/90 border-accent-cyan text-white',
      error: 'bg-accent-danger/20 border-accent-danger text-white',
    };

    notification.className = `${baseClasses} ${typeClasses[type] || 'bg-studio-elevated text-white'}`;

    notification.innerHTML = `
      <div class="flex items-center gap-3 mb-2 font-bold uppercase tracking-wider text-[11px] font-mono text-studio-muted">
        <span>${this.getIconForType(type)}</span>
        <span>${title}</span>
      </div>
      <div class="mb-4 text-studio-muted leading-relaxed">${message}</div>
      ${
        actions
          ? `
        <div class="flex gap-2 justify-end">
          ${actions
            .map(
              (a, i) => `
            <button class="btn ${a.primary ? 'btn-primary' : 'btn-outline'} py-1! px-3! text-[10px]! pwa-btn-${i}">
              ${a.text}
            </button>
          `,
            )
            .join('')}
        </div>
      `
          : ''
      }
    `;

    if (actions) {
      actions.forEach((a, i) => {
        notification
          .querySelector(`.pwa-btn-${i}`)
          ?.addEventListener('click', () => {
            a.action();
            this.removeNotification(notification);
          });
      });
    }

    if (!actions) {
      setTimeout(() => this.removeNotification(notification), 8000);
    }

    document.body.appendChild(notification);
    return notification;
  }

  private removeNotification(el: HTMLElement) {
    el.classList.add('removing');
    setTimeout(() => el.remove(), 300);
  }

  showUpdate(onUpdate: () => void) {
    this.createNotification(
      'update',
      'Sistema Atualizado',
      'Uma nova versão do Aura Estúdio está disponível. Deseja atualizar?',
      [
        { text: 'Agora', action: onUpdate, primary: true },
        { text: 'Depois', action: () => {} },
      ],
    );
  }

  showOffline() {
    this.createNotification(
      'offline',
      'Modo Offline Ativo',
      'O app está pronto para ser usado sem internet.',
    );
  }
}

const manager = new PWANotificationManager();

const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    manager.showUpdate(() => updateSW(true));
  },
  onOfflineReady() {
    manager.showOffline();
  },
});

export default updateSW;
