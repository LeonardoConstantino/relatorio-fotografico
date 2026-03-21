/**
 * @element ui-icon
 * @description Web Component para renderização de ícones SVG encapsulados.
 *
 * @attr {string} name        - Nome do ícone do catálogo interno (ex: "close", "search")
 * @attr {string} size        - Tamanho: valores semânticos (xs|sm|md|lg|xl|2xl) ou px numérico (ex: "32")
 * @attr {string} color       - Cor do ícone. Padrão: "currentColor" (herda do pai)
 *
 * @slot default              - SVG customizado fornecido pelo usuário (substitui o catálogo interno)
 *
 * @cssvar --icon-size        - Tamanho do ícone (sobrescreve o atributo size)
 * @cssvar --icon-color       - Cor do ícone (sobrescreve o atributo color)
 * @cssvar --icon-stroke-width - Espessura do traço SVG. Padrão: inherit
 *
 * @part svg                  - O elemento <svg> interno (para estilo externo via ::part)
 *
 * @fires ui-icon:slotchange  - Emitido quando o conteúdo do slot muda (bubbles, composed)
 */

// ─────────────────────────────────────────────
// Declaração Global do Custom Element
// ─────────────────────────────────────────────
declare global {
  interface HTMLElementTagNameMap {
    'ui-icon': UIIcon;
  }
}

// ─────────────────────────────────────────────
// CATÁLOGO INTERNO — ícones mais comuns de UI
//
// Formato único: apenas o conteúdo interno do SVG (paths, groups, etc.).
// O wrapper <svg viewBox="0 0 24 24"> é gerado programaticamente em
// #renderIcon, garantindo consistência e eliminando a detecção frágil
// de formato via string (.startsWith('<svg')).
//
// Para ícones com viewBox diferente de "0 0 24 24", use o slot com um
// <svg> completo — essa é a escape hatch intencional da API.
// ─────────────────────────────────────────────
export const ICONS: Readonly<Record<string, string>> = {
  // Ações Genéricas
  close:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
  plus: '<path fill="currentColor" fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"/>',
  minus:
    '<path fill="currentColor" fill-rule="evenodd" d="M5.625 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>',
  search:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>',
  'chevron-right':
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>',
  'chevron-left':
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15.75 19.5-7.5-7.5 7.5-7.5"/>',
  'chevron-down':
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>',
  'chevron-up':
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>',
  refresh:
    '<path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.188-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/>',
  'arrow-uturn-down':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0 1 12 0v3"/>',

  // Navegação / Sistema
  settings:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>',
  home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>',
  menu: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>',
  'external-link':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>',

  // Arquivos / Editor
  copy: '<path fill="currentColor" d="M19 19H8q-.825 0-1.413-.588T6 17V3q0-.825.588-1.413T8 1h7l6 6v10q0 .825-.588 1.413T19 19ZM14 8V3H8v14h11V8h-5ZM4 23q-.825 0-1.413-.588T2 21V7h2v14h11v2H4ZM8 3v5-5 14V3Z"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  download:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>',
  upload:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>',
  edit: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>',
  pencil:
    '<path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>',
  arrow: '<path d="M13 5H19V11"/><path d="M19 5L5 19"/>',
  circle: '<circle cx="12" cy="12" r="10"/>',
  'rotate-ccw':
    '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  undo: '<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>',
  trash:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>',
  save: '<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 19V5a2 2 0 0 1 2-2h11.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 21 7.828V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M8.6 9h6.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6H8.6a.6.6 0 0 0-.6.6v4.8a.6.6 0 0 0 .6.6ZM6 13.6V21h12v-7.4a.6.6 0 0 0-.6-.6H6.6a.6.6 0 0 0-.6.6Z"/></g>',
  code: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/>',
  eye: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></g>',
  'eye-off':
    '<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>',
  shrink:
    '<path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/><path d="M9 19.8V15m0 0H4.2M9 15l-6 6"/><path d="M15 4.2V9m0 0h4.8M15 9l6-6"/><path d="M9 4.2V9m0 0H4.2M9 9 3 3"/>',
  clock:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
  calendar:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>',
  'map-pin':
    '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  'upload-cloud':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775a5.25 5.25 0 0 1 10.233-2.33a3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"/>',
  text: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>',
  'clipboard-pen':
    '<path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
  'pencil-ruler':
    '<path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"/><path d="m8 6 2-2"/><path d="m18 16 2-2"/><path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',

  // Feedback / Status
  'check-circle':
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
  'info-circle':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>',
  'x-circle':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>',
  'alert-triangle':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10.24 3.957-8.422 14.06A1.989 1.989 0 0 0 3.518 21h16.845a1.989 1.989 0 0 0 1.7-2.983L13.64 3.957a1.989 1.989 0 0 0-3.4 0zM12 9v4m0 4h.01"/>',
  'alert-circle':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0m9-4v4m0 4h.01"/>',
  help: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',

  // Miscelânea
  tag: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>',
  filter:
    '<path fill="currentColor" d="M11 20q-.425 0-.713-.288T10 19v-6L4.2 5.6q-.375-.5-.113-1.05T5 4h14q.65 0 .913.55T19.8 5.6L14 13v6q0 .425-.288.713T13 20h-2Zm1-7.7L16.95 6h-9.9L12 12.3Zm0 0Z"/>',
  lightning:
    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>',
  sparkles:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Zm-1.365 11.852L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>',
  user: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>',
  bell: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>',
  'command-line':
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"/>',
  image:
    '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0Z"/>',
  blocks:
    '<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>',
  package:
    '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
  list: '<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>',
  camera:
    '<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>',
  printer:
    '<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>',
};

// ─────────────────────────────────────────────
// Mapa semântico de tamanhos → px
// ─────────────────────────────────────────────
type SemanticSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const SIZE_MAP: Readonly<Record<SemanticSize, string>> = {
  xs: '12',
  sm: '16',
  md: '20',
  lg: '24',
  xl: '32',
  '2xl': '48',
};

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/**
 * Resolve tamanho semântico ou numérico para valor em px (string).
 * Aceita: 'xs'|'sm'|'md'|'lg'|'xl'|'2xl' → mapeados para px fixos,
 *         ou qualquer string numérica ('32') → usada diretamente como px.
 * Fallback explícito: ausência de valor → 'md' (20px).
 */
function resolveSize(raw: string | null): string {
  if (!raw) return SIZE_MAP.md; // padrão md (20px) quando nenhum size é fornecido
  return SIZE_MAP[raw as SemanticSize] ?? raw;
}

/**
 * Remove vetores XSS básicos antes de inserir conteúdo SVG via innerHTML:
 *   • <script> blocks
 *   • event handlers inline com aspas (ex: onclick="...", onload='...')
 *
 * Nota: Esta sanitização cobre o caso de uso deste componente (catálogo
 * interno confiável + SVGs de slot). Para SVGs de fontes arbitrárias
 * e não confiáveis, considere DOMPurify com perfil SVG.
 */
function sanitizeInnerSVG(raw: string): string {
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
}

// ─────────────────────────────────────────────
// CATÁLOGO PRÉ-SANITIZADO
// Aplicamos sanitizeInnerSVG uma única vez no carregamento do módulo.
// Custo de regex pago uma única vez, compartilhado por todas as instâncias.
// Entradas do catálogo são confiáveis; sanitização aqui é defesa em
// profundidade caso o objeto ICONS seja estendido externamente no futuro.
// Object.freeze impede mutação acidental em runtime.
// ─────────────────────────────────────────────
const SANITIZED_ICONS: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(
    Object.entries(ICONS).map(([name, content]) => [
      name,
      sanitizeInnerSVG(content),
    ]),
  ),
);

// ─────────────────────────────────────────────
// Template estático (reutilizado via cloneNode)
// ─────────────────────────────────────────────
const TEMPLATE = document.createElement('template');
TEMPLATE.innerHTML = `
  <style>
    :host {
      /* Layout */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      /* Tamanho padrão (md) — sobrescrito via atributo ou CSS var */
      width:  var(--icon-size, 20px);
      height: var(--icon-size, 20px);

      /* Cor — herda do contexto por padrão */
      color: var(--icon-color, currentColor);

      /* Evita que o ícone capture eventos de pointer acidentalmente */
      pointer-events: none;
      user-select: none;
    }

    :host([hidden]) {
      display: none;
    }

    /* SVG gerado internamente */
    svg[part="svg"] {
      width: 100%;
      height: 100%;
      display: block;
      color: inherit;
    }

    /* SVG vindo via slot — força mesmas dimensões e cor */
    ::slotted(svg) {
      width: 100% !important;
      height: 100% !important;
      display: block;
      color: inherit;
      stroke: currentColor;
      fill: currentColor;
    }
  </style>

  <!-- Slot: SVG customizado do usuário -->
  <slot></slot>

  <!-- Container do ícone interno (catálogo) -->
  <span id="icon-container" aria-hidden="true"></span>
`;

// ─────────────────────────────────────────────
// Set de nomes inválidos já avisados no console.
// Garante que cada nome apareça no warning apenas uma vez por sessão,
// evitando spam em re-renders dinâmicos (ex: loops, animações).
// ─────────────────────────────────────────────
const WARNED_NAMES = new Set<string>();

// ─────────────────────────────────────────────
// Web Component
// ─────────────────────────────────────────────
class UIIcon extends HTMLElement {
  // ── Campos privados ──────────────────────────
  #shadow: ShadowRoot;
  #container: HTMLSpanElement;
  #slot: HTMLSlotElement;
  #controller: AbortController | null = null;

  // ── API declarativa ──────────────────────────
  static observedAttributes = ['name', 'size', 'color'];

  // ── Constructor ──────────────────────────────
  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#shadow.appendChild(TEMPLATE.content.cloneNode(true));
    this.#container = this.#shadow.getElementById(
      'icon-container',
    ) as HTMLSpanElement;
    this.#slot = this.#shadow.querySelector('slot') as HTMLSlotElement;
  }

  // ── Lifecycle ────────────────────────────────
  connectedCallback(): void {
    this.#controller = new AbortController();
    const { signal } = this.#controller;

    // Escuta slotchange para alternar visibilidade entre slot e catálogo
    this.#slot.addEventListener('slotchange', () => this.#onSlotChange(), {
      signal,
    });

    // Render inicial
    this.#applySize(this.getAttribute('size'));
    this.#applyColor(this.getAttribute('color'));
    this.#renderIcon(this.getAttribute('name'));
    this.#onSlotChange(); // resolve estado inicial do slot
  }

  disconnectedCallback(): void {
    this.#controller?.abort();
  }

  /**
   * Reage a mudanças de atributos de forma granular —
   * nunca re-renderiza o shadow inteiro.
   */
  attributeChangedCallback(
    name: string,
    oldVal: string | null,
    newVal: string | null,
  ): void {
    if (oldVal === newVal) return;

    // Renders cirúrgicos: cada atributo toca apenas o que é necessário.
    // 'name'  → reconstrói apenas o SVG interno.
    // 'size'  → atualiza apenas a CSS var --icon-size no :host.
    // 'color' → atualiza apenas a CSS var --icon-color no :host.
    switch (name) {
      case 'name':
        this.#renderIcon(newVal);
        break;
      case 'size':
        this.#applySize(newVal);
        break;
      case 'color':
        this.#applyColor(newVal);
        break;
    }
  }

  // ── API pública (getters / setters) ──────────

  /** Nome do ícone do catálogo interno. */
  get name(): string | null {
    return this.getAttribute('name');
  }
  set name(v: string | null) {
    v ? this.setAttribute('name', v) : this.removeAttribute('name');
  }

  /**
   * Tamanho do ícone.
   * Aceita valores semânticos (xs | sm | md | lg | xl | 2xl) ou número em px.
   */
  get size(): string | null {
    return this.getAttribute('size');
  }
  set size(v: string | null) {
    v ? this.setAttribute('size', v) : this.removeAttribute('size');
  }

  /** Cor do ícone. Padrão: 'currentColor'. */
  get color(): string | null {
    return this.getAttribute('color');
  }
  set color(v: string | null) {
    v ? this.setAttribute('color', v) : this.removeAttribute('color');
  }

  /**
   * Retorna os nomes disponíveis no catálogo interno.
   * @returns {string[]}
   */
  static get catalog(): string[] {
    return Object.keys(ICONS);
  }

  // ── Métodos privados ─────────────────────────

  /**
   * Renderiza o ícone do catálogo no container interno.
   * Opera de forma cirúrgica: só recria o SVG se o nome mudou.
   * Usa SANITIZED_ICONS (pré-sanitizado no módulo) — sem regex em runtime.
   * @param {string|null} name
   */
  #renderIcon(name: string | null): void {
    // Limpa o container antes de cada render
    this.#container.innerHTML = '';

    if (!name) return;

    const content = SANITIZED_ICONS[name];

    if (!content) {
      // Emite warning apenas uma vez por nome inválido para evitar spam
      // no console em cenários de re-render dinâmico frequente.
      if (!WARNED_NAMES.has(name)) {
        console.warn(
          `[ui-icon] Ícone "${name}" não encontrado no catálogo. Use um <svg> via slot para ícones customizados.`,
        );
        WARNED_NAMES.add(name);
      }
      return;
    }

    // Catálogo usa formato único: apenas o conteúdo interno do SVG (paths, groups).
    // O wrapper é sempre gerado aqui, garantindo atributos consistentes
    // e eliminando a detecção frágil via .startsWith('<svg').
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // Expõe o SVG para estilização externa via ::part(svg)
    svg.setAttribute('part', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = content;
    this.#container.appendChild(svg);
  }

  /**
   * Aplica o tamanho ao :host via custom property,
   * preservando a CSS var como canal de override externo.
   * @param {string|null} raw
   */
  #applySize(raw: string | null): void {
    const px = resolveSize(raw);
    this.style.setProperty('--icon-size', `${px}px`);
  }

  /**
   * Aplica a cor ao :host via custom property.
   * @param {string|null} raw
   */
  #applyColor(raw: string | null): void {
    const color = raw || 'currentColor';
    this.style.setProperty('--icon-color', color);
  }

  /**
   * Gerencia a alternância entre slot (SVG externo) e catálogo interno.
   * Quando há conteúdo no slot, oculta o container interno e vice-versa.
   *
   * assignedElements() é chamado UMA ÚNICA VEZ e o resultado reutilizado,
   * evitando duas chamadas ao mesmo método na mesma execução.
   */
  #onSlotChange(): void {
    const elements = this.#slot.assignedElements({ flatten: true });
    const hasSlotContent = elements.length > 0;

    // Oculta o catálogo interno quando SVG customizado é fornecido via slot,
    // e o exibe novamente caso o slot seja esvaziado.
    this.#container.hidden = hasSlotContent;

    if (hasSlotContent) {
      elements.forEach((el) => {
        // Ícone é decorativo — ocultar de leitores de tela
        el.setAttribute('aria-hidden', 'true');

        // Avisa o desenvolvedor se o SVG externo não tiver viewBox,
        // pois sem ele o escalonamento via CSS (width/height: 100%) pode falhar.
        if (
          el.tagName?.toLowerCase() === 'svg' &&
          !el.hasAttribute('viewBox')
        ) {
          console.warn(
            '[ui-icon] SVG customizado sem atributo viewBox pode não escalar corretamente.',
          );
        }
      });
    }

    this.dispatchEvent(
      new CustomEvent('ui-icon:slotchange', {
        detail: { hasSlotContent },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

customElements.define('ui-icon', UIIcon);
