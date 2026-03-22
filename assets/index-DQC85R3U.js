(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{events=new Map;on(e,t){return this.events.has(e)||this.events.set(e,new Set),this.events.get(e).add(t),()=>this.off(e,t)}off(e,t){this.events.has(e)&&this.events.get(e).delete(t)}emit(e,t){this.events.has(e)&&this.events.get(e).forEach(n=>{try{n(t)}catch(t){console.error(`[EventBus] Error in listener for "${e}":`,t)}})}},t=function(e){return e[e.DEBUG=0]=`DEBUG`,e[e.INFO=1]=`INFO`,e[e.WARN=2]=`WARN`,e[e.ERROR=3]=`ERROR`,e[e.NONE=4]=`NONE`,e}({}),n=new class{level;prefix;constructor(e={}){this.level=e.level??t.INFO,this.prefix=e.prefix||`[Aura]`}shouldLog(e){return e>=this.level}format(e,t){let n=new Intl.DateTimeFormat(`pt-br`,{hour:`2-digit`,minute:`2-digit`,day:`2-digit`,month:`2-digit`,hour12:!1}).format(new Date);return`${this.prefix} [${e}] ${t} (${n})`}debug(e,n,...r){this.shouldLog(t.DEBUG)&&console.debug(`%c🐛 ${this.format(e,n)}`,`color: #888`,...r)}info(e,n,...r){this.shouldLog(t.INFO)&&console.info(`%cℹ️ ${this.format(e,n)}`,`color: #2196F3`,...r)}warn(e,n,...r){this.shouldLog(t.WARN)&&console.warn(`%c⚠️ ${this.format(e,n)}`,`color: #FF9800`,...r)}error(e,n,...r){this.shouldLog(t.ERROR)&&console.error(`%c❌ ${this.format(e,n)}`,`color: #F44336`,...r)}}({level:t.DEBUG}),r={REPORT_UPDATED:`store:report_updated`,STATE_LOADED:`store:state_loaded`,SECTION_ADDED:`store:section_added`,SECTION_REMOVED:`store:section_removed`,SECTIONS_REORDERED:`store:sections_reordered`,LAYOUT_WARNING:`store:layout_warning`,VALIDATION_UPDATED:`store:validation_updated`,PERSISTENCE_SAVING:`store:persistence_saving`,PERSISTENCE_SAVED:`store:persistence_saved`},i=new class{_report;_customTemplate=null;constructor(){this._report=this.getInitialState()}getInitialState(){return{meta:{schemaVersion:`2.0`,createdAt:Date.now(),lastModified:Date.now()},config:{logo:``,title:`Relatório de Recebimento`,primaryColor:`#4f46e5`,company:``,reportNumber:``,reportDate:new Date().toLocaleDateString(`pt-BR`)},sections:[],ui:{previewVisible:!0,previewScale:1}}}togglePreview(){this._report.ui.previewVisible=!this._report.ui.previewVisible,this.notify()}setPreviewScale(e){this._report.ui.previewScale=Math.max(.2,Math.min(2,e)),this.notify()}get state(){return{...this._report}}loadState(t){this._report=t,e.emit(r.STATE_LOADED,t),this.notify()}updateConfig(e){this._report.config={...this._report.config,...e},this.notify()}addSection(t){let i=crypto.randomUUID(),a={id:i,type:t,data:this.getDefaultDataForType(t)};this._report.sections.push(a),n?.debug(`Store`,`Seção adicionada: ${t} (${i})`),e.emit(r.SECTION_ADDED,a),this.notify()}removeSection(t){let n=this._report.sections.findIndex(e=>e.id===t);n!==-1&&(this._report.sections.splice(n,1),e.emit(r.SECTION_REMOVED,t),this.notify())}updateSectionData(e,t){let n=this._report.sections.find(t=>t.id===e);n&&(n.data={...n.data,...t},this.notify())}reorderSections(t,n){let i=Array.from(this._report.sections),[a]=i.splice(t,1);i.splice(n,0,a),this._report.sections=i,e.emit(r.SECTIONS_REORDERED,i),this.notify()}clearReport(t=!1){let i={...this._report.config};this._report=this.getInitialState(),t&&(this._report.config=i),n?.debug(`Store`,`Relatório limpo. KeepConfig: ${t}`),e.emit(r.STATE_LOADED,this.state),this.notify()}applyTemplate(t){let i={...this._report.config};this._report=this.getInitialState(),this._report.config=i,t.sections.forEach(e=>{let t={id:crypto.randomUUID(),type:e.type,data:this.getDefaultDataForType(e.type)};e.defaultTitle&&(t.data.title=e.defaultTitle),this._report.sections.push(t)}),n?.info(`Store`,`Template "${t.name}" aplicado.`),e.emit(r.STATE_LOADED,this.state),this.notify()}setCustomTemplate(e){this._customTemplate=e,n?.info(`Store`,`Template customizado atualizado.`),this.notify()}getCustomTemplate(){return this._customTemplate}getQuickTemplate(){return this._customTemplate||this.getDefaultTemplate()}getDefaultTemplate(){return{id:`default-quick-start`,name:`Inspeção Padrão`,sections:[{type:`equipment`,defaultTitle:`Identificação do Equipamento`},{type:`images`,defaultTitle:`Registro de Entrada`},{type:`images`,defaultTitle:`Registro de Saída`},{type:`images`,defaultTitle:`Detalhes Críticos`},{type:`text`,defaultTitle:`Observações Finais`}]}}getValidationWarnings(){let e=[],{config:t,sections:n}=this._report;return t.company?.trim()||e.push({message:`Identidade: Nome da Empresa ausente.`,field:`config.company`}),t.reportNumber?.trim()||e.push({message:`Identidade: Número do Relatório ausente.`,field:`config.reportNumber`}),t.logo?.trim()||e.push({message:`Identidade: Logo não adicionada.`,field:`config.logo`}),n.forEach(t=>{let n=t.data,r=this.getSectionLabel(t.type);t.type===`equipment`&&(n.patrimony?.trim()||e.push({message:`${r}: Patrimônio não informado.`,sectionId:t.id,field:`patrimony`}),n.description?.trim()||e.push({message:`${r}: Descrição do equipamento vazia.`,sectionId:t.id,field:`description`})),t.type===`text`&&!n.content?.trim()&&e.push({message:`${r}: Conteúdo de texto vazio.`,sectionId:t.id,field:`content`}),t.type===`bullets`&&(n.items?.some(e=>e?.trim())||e.push({message:`${r}: Nenhum item preenchido.`,sectionId:t.id,field:`items`})),t.type===`images`&&(!n.images||n.images.length===0)&&e.push({message:`${r}: Nenhuma foto adicionada.`,sectionId:t.id,field:`images`})}),e}getSectionLabel(e){return{equipment:`Equipamento`,text:`Texto`,bullets:`Lista`,images:`Galeria`,pagebreak:` Quebra de Página`}[e]||`Desconhecido`}notify(){this._report.meta.lastModified=Date.now(),e.emit(r.REPORT_UPDATED,this.state),e.emit(r.VALIDATION_UPDATED,this.getValidationWarnings())}getDefaultDataForType(e){switch(e){case`equipment`:return{title:`Identificação do Equipamento`,description:``,model:``,patrimony:``,owner:``};case`text`:return{title:`Observações`,content:``};case`bullets`:return{title:`Itens Verificados`,items:[``]};case`images`:return{title:`Registro Fotográfico`,columns:2,images:[]};case`pagebreak`:return{title:`Quebra de Página`};default:throw Error(`Tipo de seção desconhecido: ${e}`)}}},a=class e{static DB_NAME=`AuraStorage`;static DB_VERSION=1;static STORE_NAME=`keyValueStore`;_initialized=!1;_value;constructor(e,t){this.key=e,this.initialValue=t,this._value=t}async initialize(){if(!this._initialized)try{let e=await this._readFromDB(this.key);e===null?await this._writeToDB(this.key,this.initialValue):this._value=e,this._initialized=!0}catch(e){throw n.error(`Storage`,`Falha ao inicializar: ${e}`),e}}getValue(){return this._value}async setValue(e){let t=typeof e==`function`?e(this._value):e;this._value=t,await this._writeToDB(this.key,t)}async setOther(e,t){await this._writeToDB(e,t)}async getOther(e){return await this._readFromDB(e)}async _openDB(){return new Promise((t,n)=>{let r=indexedDB.open(e.DB_NAME,e.DB_VERSION);r.onupgradeneeded=t=>{let n=t.target.result;n.objectStoreNames.contains(e.STORE_NAME)||n.createObjectStore(e.STORE_NAME)},r.onsuccess=()=>t(r.result),r.onerror=()=>n(r.error)})}async _readFromDB(t){let n=await this._openDB();return new Promise((r,i)=>{let a=n.transaction([e.STORE_NAME],`readonly`).objectStore(e.STORE_NAME).get(t);a.onsuccess=()=>r(a.result??null),a.onerror=()=>i(a.error)})}async _writeToDB(t,n){let r=await this._openDB();return new Promise((i,a)=>{let o=r.transaction([e.STORE_NAME],`readwrite`).objectStore(e.STORE_NAME).put(n,t);o.onsuccess=()=>i(),o.onerror=()=>a(o.error)})}},o=new class t{static STORAGE_KEY=`aura_current_report`;storage;isSaving=!1;constructor(){this.storage=new a(t.STORAGE_KEY,i.state)}async initialize(){n.info(`Persistence`,`Inicializando serviço de persistência...`);try{await this.storage.initialize();let e=this.storage.getValue();e&&e.sections.length>0&&(n.debug(`Persistence`,`Relatório anterior encontrado, carregando no Store...`),i.loadState(e));let t=await this.storage.getOther(`aura_custom_template`);t&&i.setCustomTemplate(t),this.setupListeners()}catch(e){n.error(`Persistence`,`Falha ao inicializar persistência`,e)}}setupListeners(){e.on(r.REPORT_UPDATED,e=>{this.handleAutoSave(e)}),n.debug(`Persistence`,`Auto-save ativado.`)}async handleAutoSave(t){if(!this.isSaving){this.isSaving=!0,e.emit(r.PERSISTENCE_SAVING);try{await this.storage.setValue(t);let n=i._customTemplate;n&&await this.storage.setOther(`aura_custom_template`,n),e.emit(r.PERSISTENCE_SAVED)}catch(e){n.error(`Persistence`,`Erro ao salvar automaticamente`,e)}finally{setTimeout(()=>{this.isSaving=!1},500)}}}async clearPersistence(){await this.storage.setValue(i.state),n.info(`Persistence`,`Dados de persistência resetados.`)}},s=280,c={type:`info`,duration:4e3,message:``},l={success:`<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M6 10.5l2.8 2.8L14 7.5" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,error:`<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.8"
          stroke-linecap="round"/>
  </svg>`,warning:`<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <path d="M10 2.5L18 17.5H2L10 2.5z" stroke="currentColor" stroke-width="1.6"
          stroke-linejoin="round"/>
    <path d="M10 8.5v3.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="14.5" r="0.9" fill="currentColor"/>
  </svg>`,info:`<svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.6"/>
    <path d="M10 9v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    <circle cx="10" cy="6.5" r="0.9" fill="currentColor"/>
  </svg>`},u={success:`status`,error:`alert`,warning:`alert`,info:`status`},d=document.createElement(`template`);d.innerHTML=`
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :host {
      display: block;
      width: var(--toast-width, 340px);
      max-width: calc(100vw - var(--toast-offset, 24px) * 2);

      /* Token interno: resolvido uma vez no :host */
      --_dur: var(--toast-duration-ms, ${s}ms);

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
`;function f(e){return e===`success`||e===`error`||e===`warning`||e===`info`}var p=class extends HTMLElement{#e;#t=null;#n=null;#r=null;#i;#a;#o;#s;static observedAttributes=[`type`,`message`,`duration`];constructor(){super(),this.#e=this.attachShadow({mode:`open`}),this.#e.appendChild(d.content.cloneNode(!0)),this.#i=this.#e.querySelector(`[part="toast-root"]`),this.#a=this.#e.querySelector(`[part="toast-icon"]`),this.#o=this.#e.querySelector(`[part="toast-body"]`),this.#s=this.#e.querySelector(`[part="toast-bar"]`)}connectedCallback(){this.#t=new AbortController;let{signal:e}=this.#t;this.#d(this.getAttribute(`type`)),this.#f(this.getAttribute(`message`)??c.message),this.#p(),this.#m(),this.#e.querySelector(`[part="toast-close"]`).addEventListener(`click`,()=>{this.dismiss()},{signal:e}),requestAnimationFrame(()=>{this.setAttribute(`data-visible`,``)})}disconnectedCallback(){this.#t?.abort(),this.#n!==null&&clearTimeout(this.#n),this.#r?.cancel()}attributeChangedCallback(e,t,n){t===n||!this.isConnected||(e===`type`?this.#d(n):e===`message`?this.#f(n??c.message):e===`duration`&&(this.#r?.cancel(),this.#r=null,this.#p(),this.#m()))}dismiss(){this.removeAttribute(`data-visible`);let e=parseFloat(getComputedStyle(this).getPropertyValue(`--toast-duration-ms`).trim())||s;setTimeout(()=>{let e=new CustomEvent(`ui-toast:dismissed`,{bubbles:!0,composed:!0,detail:{type:this.#c,message:this.#l}});this.dispatchEvent(e),this.remove()},e)}get#c(){let e=this.getAttribute(`type`);return f(e)?e:c.type}get#l(){return this.getAttribute(`message`)??c.message}get#u(){let e=parseInt(this.getAttribute(`duration`)??``,10);return Number.isFinite(e)&&e>=0?e:c.duration}#d(e){let t=f(e)?e:c.type,n=u[t];this.#a.innerHTML=l[t],this.#i.setAttribute(`role`,n),this.#i.setAttribute(`aria-live`,n===`alert`?`assertive`:`polite`)}#f(e){this.#o.textContent=e}#p(){let e=this.#u;if(e<=0){this.#s.style.display=`none`;return}this.#s.style.display=``,this.#r=this.#s.animate([{transform:`scaleX(1)`},{transform:`scaleX(0)`}],{duration:e,fill:`forwards`,easing:`linear`})}#m(){this.#n!==null&&(clearTimeout(this.#n),this.#n=null);let e=this.#u;e>0&&(this.#n=setTimeout(()=>{this.dismiss()},e))}};customElements.define(`ui-toast`,p);var ee=class e extends HTMLElement{#e;static MAX_TOASTS=5;constructor(){super(),this.#e=this.attachShadow({mode:`open`}),this.#e.innerHTML=`
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
    `}show({type:t=c.type,message:n=c.message,duration:r=c.duration}){let i=this.querySelectorAll(`ui-toast`);i.length>=e.MAX_TOASTS&&i[0].dismiss();let a=document.createElement(`ui-toast`);return a.setAttribute(`type`,t),a.setAttribute(`message`,n),a.setAttribute(`duration`,String(r)),this.appendChild(a),a}clear(){this.querySelectorAll(`ui-toast`).forEach(e=>{e.dismiss()})}};customElements.define(`ui-toast-manager`,ee);function m(){let e=document.querySelector(`ui-toast-manager`);if(e!==null)return e;let t=document.createElement(`ui-toast-manager`);return document.body.appendChild(t),t}var h={show(e){return m().show(e)},clear(){m().clear()}},g={close:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>`,plus:`<path fill="currentColor" fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"/>`,minus:`<path fill="currentColor" fill-rule="evenodd" d="M5.625 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd"/>`,search:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>`,"chevron-right":`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m8.25 4.5 7.5 7.5-7.5 7.5"/>`,"chevron-left":`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15.75 19.5-7.5-7.5 7.5-7.5"/>`,"chevron-down":`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19.5 8.25-7.5 7.5-7.5-7.5"/>`,"chevron-up":`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m4.5 15.75 7.5-7.5 7.5 7.5"/>`,refresh:`<path fill="currentColor" d="M12 20q-3.35 0-5.675-2.325T4 12q0-3.35 2.325-5.675T12 4q1.725 0 3.3.712T18 6.75V4h2v7h-7V9h4.2q-.8-1.4-2.188-2.2T12 6Q9.5 6 7.75 7.75T6 12q0 2.5 1.75 4.25T12 18q1.925 0 3.475-1.1T17.65 14h2.1q-.7 2.65-2.85 4.325T12 20Z"/>`,"arrow-uturn-down":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m15 15l-6 6m0 0l-6-6m6 6V9a6 6 0 0 1 12 0v3"/>`,grip:`<circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/>`,"book-open":`<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`,settings:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>`,home:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>`,menu:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>`,"external-link":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"/>`,copy:`<path fill="currentColor" d="M19 19H8q-.825 0-1.413-.588T6 17V3q0-.825.588-1.413T8 1h7l6 6v10q0 .825-.588 1.413T19 19ZM14 8V3H8v14h11V8h-5ZM4 23q-.825 0-1.413-.588T2 21V7h2v14h11v2H4ZM8 3v5-5 14V3Z"/>`,database:`<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>`,download:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>`,upload:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>`,edit:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/>`,pencil:`<path d="M13 21h8"/><path d="m15 5 4 4"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/>`,arrow:`<path d="M13 5H19V11"/><path d="M19 5L5 19"/>`,circle:`<circle cx="12" cy="12" r="10"/>`,"rotate-ccw":`<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>`,undo:`<path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>`,trash:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>`,save:`<g fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 19V5a2 2 0 0 1 2-2h11.172a2 2 0 0 1 1.414.586l2.828 2.828A2 2 0 0 1 21 7.828V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M8.6 9h6.8a.6.6 0 0 0 .6-.6V3.6a.6.6 0 0 0-.6-.6H8.6a.6.6 0 0 0-.6.6v4.8a.6.6 0 0 0 .6.6ZM6 13.6V21h12v-7.4a.6.6 0 0 0-.6-.6H6.6a.6.6 0 0 0-.6.6Z"/></g>`,code:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/>`,eye:`<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"/><path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></g>`,"eye-off":`<path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/>`,shrink:`<path d="m15 15 6 6m-6-6v4.8m0-4.8h4.8"/><path d="M9 19.8V15m0 0H4.2M9 15l-6 6"/><path d="M15 4.2V9m0 0h4.8M15 9l6-6"/><path d="M9 4.2V9m0 0H4.2M9 9 3 3"/>`,clock:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>`,calendar:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"/>`,"map-pin":`<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>`,"upload-cloud":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775a5.25 5.25 0 0 1 10.233-2.33a3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z"/>`,"download-cloud":`<path d="M12 13v8l-4-4"/><path d="m12 21 4-4"/><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284"/>`,text:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"/>`,"clipboard-pen":`<path d="M16 4h2a2 2 0 0 1 2 2v2"/><path d="M21.34 15.664a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/><path d="M8 22H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>`,"pencil-ruler":`<path d="M13 7 8.7 2.7a2.41 2.41 0 0 0-3.4 0L2.7 5.3a2.41 2.41 0 0 0 0 3.4L7 13"/><path d="m8 6 2-2"/><path d="m18 16 2-2"/><path d="m17 11 4.3 4.3c.94.94.94 2.46 0 3.4l-2.6 2.6c-.94.94-2.46.94-3.4 0L11 17"/><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>`,"corner-down-right":`<path d="m15 10 5 5-5 5"/><path d="M4 4v7a4 4 0 0 0 4 4h12"/>`,eraser:`<path d="M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21"/><path d="m5.082 11.09 8.828 8.828"/>`,"check-circle":`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>`,"info-circle":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"/>`,"x-circle":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>`,"alert-triangle":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m10.24 3.957-8.422 14.06A1.989 1.989 0 0 0 3.518 21h16.845a1.989 1.989 0 0 0 1.7-2.983L13.64 3.957a1.989 1.989 0 0 0-3.4 0zM12 9v4m0 4h.01"/>`,"alert-circle":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0m9-4v4m0 4h.01"/>`,help:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>`,tag:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>`,filter:`<path fill="currentColor" d="M11 20q-.425 0-.713-.288T10 19v-6L4.2 5.6q-.375-.5-.113-1.05T5 4h14q.65 0 .913.55T19.8 5.6L14 13v6q0 .425-.288.713T13 20h-2Zm1-7.7L16.95 6h-9.9L12 12.3Zm0 0Z"/>`,lightning:`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>`,sparkles:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Zm8.446-7.189L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Zm-1.365 11.852L16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>`,user:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"/>`,bell:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"/>`,"command-line":`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"/>`,image:`<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0a.375.375 0 0 1 .75 0Z"/>`,blocks:`<path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2"/><rect x="14" y="2" width="8" height="8" rx="1"/>`,package:`<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>`,list:`<path d="M3 5h.01"/><path d="M3 12h.01"/><path d="M3 19h.01"/><path d="M8 5h13"/><path d="M8 12h13"/><path d="M8 19h13"/>`,camera:`<path d="M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z"/><circle cx="12" cy="13" r="3"/>`,printer:`<path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"/><rect x="6" y="14" width="12" height="8" rx="1"/>`,cpu:`<path d="M12 20v2"/><path d="M12 2v2"/><path d="M17 20v2"/><path d="M17 2v2"/><path d="M2 12h2"/><path d="M2 17h2"/><path d="M2 7h2"/><path d="M20 12h2"/><path d="M20 17h2"/><path d="M20 7h2"/><path d="M7 20v2"/><path d="M7 2v2"/><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8" rx="1"/>`,stethoscope:`<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>`,"layout-template":`<rect width="18" height="7" x="3" y="3" rx="1"/><rect width="9" height="7" x="3" y="14" rx="1"/><rect width="5" height="7" x="16" y="14" rx="1"/>`,fingerprint:`<path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"/><path d="M14 13.12c0 2.38 0 6.38-1 8.88"/><path d="M17.29 21.02c.12-.6.43-2.3.5-3.02"/><path d="M2 12a10 10 0 0 1 18-6"/><path d="M2 16h.01"/><path d="M21.8 16c.2-2 .131-5.354 0-6"/><path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"/><path d="M8.65 22c.21-.66.45-1.32.57-2"/><path d="M9 6.8a6 6 0 0 1 9 5.2v2"/>`,keyboard:`<path d="M10 8h.01"/><path d="M12 12h.01"/><path d="M14 8h.01"/><path d="M16 12h.01"/><path d="M18 8h.01"/><path d="M6 8h.01"/><path d="M7 16h10"/><path d="M8 12h.01"/><rect width="20" height="16" x="2" y="4" rx="2"/>`,grid:`<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>`,"file-json":`<path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5"/><path d="M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1"/><path d="M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1"/>`},_={xs:`12`,sm:`16`,md:`20`,lg:`24`,xl:`32`,"2xl":`48`};function v(e){return e?_[e]??e:_.md}function y(e){return e.replace(/<script[\s\S]*?<\/script>/gi,``).replace(/\son\w+\s*=\s*["'][^"']*["']/gi,``)}var te=Object.freeze(Object.fromEntries(Object.entries(g).map(([e,t])=>[e,y(t)]))),b=document.createElement(`template`);b.innerHTML=`
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
`;var x=new Set,ne=class extends HTMLElement{#e;#t;#n;#r=null;static observedAttributes=[`name`,`size`,`color`];constructor(){super(),this.#e=this.attachShadow({mode:`open`}),this.#e.appendChild(b.content.cloneNode(!0)),this.#t=this.#e.getElementById(`icon-container`),this.#n=this.#e.querySelector(`slot`)}connectedCallback(){this.#r=new AbortController;let{signal:e}=this.#r;this.#n.addEventListener(`slotchange`,()=>this.#s(),{signal:e}),this.#a(this.getAttribute(`size`)),this.#o(this.getAttribute(`color`)),this.#i(this.getAttribute(`name`)),this.#s()}disconnectedCallback(){this.#r?.abort()}attributeChangedCallback(e,t,n){if(t!==n)switch(e){case`name`:this.#i(n);break;case`size`:this.#a(n);break;case`color`:this.#o(n);break}}get name(){return this.getAttribute(`name`)}set name(e){e?this.setAttribute(`name`,e):this.removeAttribute(`name`)}get size(){return this.getAttribute(`size`)}set size(e){e?this.setAttribute(`size`,e):this.removeAttribute(`size`)}get color(){return this.getAttribute(`color`)}set color(e){e?this.setAttribute(`color`,e):this.removeAttribute(`color`)}static get catalog(){return Object.keys(g)}#i(e){if(this.#t.innerHTML=``,!e)return;let t=te[e];if(!t){x.has(e)||(console.warn(`[ui-icon] Ícone "${e}" não encontrado no catálogo. Use um <svg> via slot para ícones customizados.`),x.add(e));return}let n=document.createElementNS(`http://www.w3.org/2000/svg`,`svg`);n.setAttribute(`part`,`svg`),n.setAttribute(`viewBox`,`0 0 24 24`),n.setAttribute(`xmlns`,`http://www.w3.org/2000/svg`),n.setAttribute(`fill`,`none`),n.setAttribute(`stroke`,`currentColor`),n.setAttribute(`aria-hidden`,`true`),n.innerHTML=t,this.#t.appendChild(n)}#a(e){let t=v(e);this.style.setProperty(`--icon-size`,`${t}px`)}#o(e){let t=e||`currentColor`;this.style.setProperty(`--icon-color`,t)}#s(){let e=this.#n.assignedElements({flatten:!0}),t=e.length>0;this.#t.hidden=t,t&&e.forEach(e=>{e.setAttribute(`aria-hidden`,`true`),e.tagName?.toLowerCase()===`svg`&&!e.hasAttribute(`viewBox`)&&console.warn(`[ui-icon] SVG customizado sem atributo viewBox pode não escalar corretamente.`)}),this.dispatchEvent(new CustomEvent(`ui-icon:slotchange`,{detail:{hasSlotContent:t},bubbles:!0,composed:!0}))}};customElements.define(`ui-icon`,ne);var re=class extends HTMLElement{_initialContent=``;static get observedAttributes(){return[`variant`,`disabled`]}connectedCallback(){this._initialContent||=this.innerHTML,this.render()}attributeChangedCallback(){this.render()}render(){!this._initialContent&&this.innerHTML&&(this._initialContent=this.innerHTML);let e=this.getAttribute(`variant`)||`primary`,t=this.hasAttribute(`disabled`);this.innerHTML=``;let n=document.createElement(`button`);n.className=`btn btn-${e} w-full`,t&&n.setAttribute(`disabled`,``),n.innerHTML=this._initialContent,this.appendChild(n)}};customElements.define(`app-button`,re);var S=class e extends HTMLElement{static idCounter=0;inputId;constructor(){super(),e.idCounter++,this.inputId=`app-input-${e.idCounter}`}static get observedAttributes(){return[`label`,`value`,`placeholder`,`type`]}connectedCallback(){this.render()}attributeChangedCallback(e,t,n){let r=this.querySelector(`input`);r?(e===`value`&&(r.value=n),e===`placeholder`&&(r.placeholder=n),e===`type`&&(r.type=n)):this.render()}render(){let e=this.getAttribute(`label`)||``,t=this.getAttribute(`label-icon`)||``,n=this.getAttribute(`value`)||``,r=this.getAttribute(`placeholder`)||``,i=this.getAttribute(`type`)||`text`;this.innerHTML=`
      <div class="mb-4 w-full">
        <div class="flex gap-1">
          ${t?`<ui-icon name="${t}" size="sm"></ui-icon>`:``}
          ${e?`<label for="${this.inputId}" class="label-technical">${e}</label>`:``}
        </div>
        <input 
          id="${this.inputId}"
          name="${this.inputId}"
          type="${i}" 
          class="input-technical" 
          placeholder="${r}" 
          value="${n}"
        />
      </div>
    `,this.querySelector(`input`)?.addEventListener(`input`,e=>{let t=e.target;this.dispatchEvent(new CustomEvent(`app-input`,{detail:{value:t.value},bubbles:!0}))})}};customElements.define(`app-input`,S);var C=class extends HTMLElement{_initialContent=``;static get observedAttributes(){return[`header-title`,`section-id`,`hide-remove`]}connectedCallback(){this._initialContent||=this.innerHTML,this.render()}attributeChangedCallback(){this.render()}render(){!this._initialContent&&this.innerHTML&&(this._initialContent=this.innerHTML);let e=this.getAttribute(`header-title`)||`Seção`,t=this.getAttribute(`header-icon`)||`settings`,n=this.getAttribute(`section-id`)||``,r=this.hasAttribute(`hide-remove`);this.innerHTML=`
      <div class="card-module animate-slide-down group/card" data-id="${n}">
        <div class="flex justify-between items-center mb-4 border-b border-studio-border pb-2">
          <div class="flex items-center gap-2">
            ${r?``:`
              <div class="drag-handle cursor-grab active:cursor-grabbing text-studio-muted hover:text-white p-1 select-none">
                <ui-icon name="grip" size="md"></ui-icon>
              </div>
            `}
            <h4 class="font-sans font-semibold text-white flex items-center gap-2">
              <ui-icon name="${t}" size="sm"></ui-icon>
              ${e}
            </h4>
          </div>
          ${r?``:`
            <button class="btn-remove btn btn-danger py-1 px-2 text-[10px] uppercase font-mono tracking-tighter">
              <ui-icon name="trash" size="sm"></ui-icon>
            </button>
          `}
        </div>
        <div class="section-body">
          ${this._initialContent}
        </div>
      </div>
    `,this.querySelector(`.btn-remove`)?.addEventListener(`click`,e=>{e.stopPropagation(),this.dispatchEvent(new CustomEvent(`remove-section`,{detail:{id:n},bubbles:!0}))})}};customElements.define(`section-card`,C);function w(e){if(!e)return``;let t=document.createElement(`p`);return t.textContent=e,t.innerHTML}var T=document.createElement(`template`);T.innerHTML=`
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
`;var E={danger:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,warning:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>`,info:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>`},D={danger:`var(--uc-color-danger)`,warning:`var(--uc-color-warning)`,info:`var(--uc-color-info)`},ie=class extends HTMLElement{#e;#t=null;#n=null;#r=null;#i=0;#a=null;#o={};static observedAttributes=[`open`,`variant`,`title`,`message`,`confirm-text`,`cancel-text`,`countdown`];constructor(){super(),this.#e=this.attachShadow({mode:`open`}),this.#e.appendChild(T.content.cloneNode(!0)),this.#g()}connectedCallback(){this.#p(),this.#o.overlay.setAttribute(`aria-labelledby`,`uc-title`),this.#o.overlay.setAttribute(`aria-describedby`,`uc-message`),this.#o.title.id=`uc-title`,this.#o.message.id=`uc-message`,this.hasAttribute(`variant`)||this.setAttribute(`variant`,`danger`),this.hasAttribute(`confirm-text`)||this.setAttribute(`confirm-text`,`Confirmar`),this.hasAttribute(`cancel-text`)||this.setAttribute(`cancel-text`,`Cancelar`),this.hasAttribute(`countdown`)||this.setAttribute(`countdown`,`3`)}disconnectedCallback(){this.#y()}attributeChangedCallback(e,t,n){if(t!==n)switch(e){case`open`:n===null?this.#c():this.#s();break;case`variant`:this.#f(n??`danger`);break;case`title`:this.#o.title.textContent=n??``;break;case`message`:this.#o.message.textContent=n??``;break;case`confirm-text`:this.#o.btnOkLabel.textContent=n??`Confirmar`;break;case`cancel-text`:this.#o.btnCancel.textContent=n??`Cancelar`;break}}ask(e=``,t=``,{variant:n=`danger`,confirmText:r=`Confirmar`,cancelText:i=`Cancelar`,countdown:a=3}={}){return this.#n&&this.#l(!1,{silent:!0}),new Promise(o=>{this.#n=o,this.setAttribute(`variant`,n),this.setAttribute(`title`,e),this.setAttribute(`message`,t),this.setAttribute(`confirm-text`,r),this.setAttribute(`cancel-text`,i),this.setAttribute(`countdown`,String(a)),this.setAttribute(`open`,``)})}dismiss(){this.#l(!1)}#s(){this.#_(`ui-confirm:open`,{variant:this.getAttribute(`variant`)??void 0,title:this.getAttribute(`title`)??void 0,message:this.getAttribute(`message`)??void 0}),this.#u(),requestAnimationFrame(()=>this.#o.btnCancel.focus())}#c(){this.#d(),this.#h()}#l(e,{silent:t=!1}={}){this.#d(),t||this.#_(`ui-confirm:result`,{result:e}),this.removeAttribute(`open`);let n=this.#v;setTimeout(()=>{this.#n&&=(this.#n(e),null),t||this.#_(`ui-confirm:close`,{result:e})},n)}#u(){let e=parseInt(this.getAttribute(`countdown`)??`3`,10);this.#i=Number.isFinite(e)&&e>0?e:0;let t=this.#o.btnOk,n=this.#o.countdownBadge;if(this.#i===0){t.disabled=!1,n.hidden=!0;return}t.disabled=!0,n.hidden=!1,n.textContent=String(this.#i),this.#r=window.setInterval(()=>{--this.#i,this.#i<=0?(this.#d(),t.disabled=!1,n.hidden=!0,t.focus()):n.textContent=String(this.#i)},1e3)}#d(){this.#r!==null&&(clearInterval(this.#r),this.#r=null),this.#o.btnOk.disabled=!1,this.#o.countdownBadge.hidden=!0}#f(e){let t=D[e]??D.danger;this.style.setProperty(`--_accent`,t),this.#o.iconWrapper.innerHTML=E[e]??E.danger}#p(){this.#t=new AbortController;let{signal:e}=this.#t;this.#o.btnOk.addEventListener(`click`,()=>{this.#o.btnOk.disabled||this.#l(!0)},{signal:e}),this.#o.btnCancel.addEventListener(`click`,()=>this.#l(!1),{signal:e}),this.#o.backdrop.addEventListener(`click`,()=>this.#l(!1),{signal:e}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.hasAttribute(`open`)&&(e.stopPropagation(),this.#l(!1))},{signal:e,capture:!0}),this.#o.overlay.addEventListener(`keydown`,e=>{e.key!==`Tab`||!this.hasAttribute(`open`)||this.#m(e)},{signal:e})}#m(e){let t=Array.from(this.#o.panel.querySelectorAll(`button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])`)).filter(e=>e.offsetParent!==null);if(t.length===0)return;let n=t[0],r=t[t.length-1],i=this.#e.activeElement;e.shiftKey?i===n&&(e.preventDefault(),r.focus()):i===r&&(e.preventDefault(),n.focus())}#h(){this.#a&&`focus`in this.#a&&typeof this.#a.focus==`function`&&this.#a.focus()}#g(){let e=e=>this.#e.getElementById(e);this.#o={overlay:this.#e.querySelector(`#overlay`),backdrop:e(`backdrop`),panel:e(`panel`),iconWrapper:e(`icon-wrapper`),title:e(`title`),message:e(`message`),btnCancel:e(`btn-cancel`),btnOk:e(`btn-ok`),btnOkLabel:e(`btn-ok-label`),countdownBadge:e(`countdown-badge`)}}#_(e,t){this.dispatchEvent(new CustomEvent(e,{detail:t,bubbles:!0,composed:!0}))}get#v(){let e=getComputedStyle(this).getPropertyValue(`--uc-transition-duration`).trim(),t=e.endsWith(`ms`)?parseFloat(e):parseFloat(e)*1e3;return Number.isFinite(t)?t:280}#y(){this.#t?.abort(),this.#d(),this.#n&&=(this.#n(!1),null)}};customElements.define(`ui-confirm`,ie);var O=(()=>{let e=document.querySelector(`ui-confirm`);return e||(e=document.createElement(`ui-confirm`),document.body.appendChild(e)),e})(),k=`/relatorio-fotografico/assets/logo-C2sOsZNf.png`,A={async process(e,t=.7,r=1200){return n.debug(`Image`,`Processando imagem: ${e.name} (${(e.size/1024).toFixed(1)} KB)`),new Promise((i,a)=>{let o=new FileReader;o.readAsDataURL(e),o.onload=e=>{let o=new Image;o.src=e.target?.result,o.onload=()=>{let e=document.createElement(`canvas`),s=o.width,c=o.height;if(s>r){let e=r/s;s=r,c*=e}e.width=s,e.height=c;let l=e.getContext(`2d`);if(!l)return a(`Falha ao obter contexto Canvas`);l.drawImage(o,0,0,s,c);let u=e.toDataURL(`image/jpeg`,t);n.debug(`Image`,`Imagem otimizada: ${(u.length/1024).toFixed(1)} KB`),i(u)},o.onerror=e=>a(e)},o.onerror=e=>a(e)})},estimateSize(e){return e.length*(3/4)-(e.endsWith(`==`)?2:e.endsWith(`=`)?1:0)}},j=class extends HTMLElement{connectedCallback(){this.render(),this.setupListeners()}setupListeners(){let e=this.querySelector(`input[type="file"]`),t=this.querySelector(`.dropzone`);e?.addEventListener(`change`,async t=>{let n=Array.from(t.target.files);await this.processFiles(n),e.value=``}),t?.addEventListener(`dragover`,e=>{e.preventDefault(),t.classList.add(`border-accent-primary`,`bg-accent-primary/5`)}),t?.addEventListener(`dragleave`,()=>{t.classList.remove(`border-accent-primary`,`bg-accent-primary/5`)}),t?.addEventListener(`drop`,async e=>{e.preventDefault(),t.classList.remove(`border-accent-primary`,`bg-accent-primary/5`);let n=Array.from(e.dataTransfer.files);await this.processFiles(n)})}async processFiles(e){let t=e.filter(e=>e.type.startsWith(`image/`));if(t.length===0)return;n.info(`Uploader`,`Iniciando processamento de ${t.length} arquivos...`);let r=[];for(let e of t)try{let t=await A.process(e);r.push(t)}catch(t){n.error(`Uploader`,`Erro ao processar ${e.name}`,t)}r.length>0&&this.dispatchEvent(new CustomEvent(`images-added`,{detail:{images:r},bubbles:!0}))}render(){this.innerHTML=`
      <div class="dropzone border-2 border-dashed border-studio-border rounded-lg p-6 transition-all hover:border-studio-muted cursor-pointer flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
        <input 
          type="file" 
          accept="image/*" 
          multiple 
          class="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div class="text-3xl transition-transform group-hover:scale-110"><ui-icon name="camera" size="64"></ui-icon></div>
        <div class="text-center">
          <p class="text-sm font-semibold text-white">Clique ou arraste as fotos</p>
          <p class="text-[10px] text-studio-muted uppercase font-mono mt-1">PNG, JPG ou Direto da Câmera</p>
        </div>
      </div>
    `}};customElements.define(`image-uploader`,j);var M=class extends HTMLElement{static get observedAttributes(){return[`section-id`]}connectedCallback(){this.render()}updateData(e){let t=this.getAttribute(`section-id`);i.updateSectionData(t,e)}render(){let e=this.getAttribute(`section-id`),t=i.state.sections.find(t=>t.id===e);if(!t||t.type!==`images`)return;let n=t.data;this.innerHTML=`
      <div class="space-y-4">
        <!-- Título Personalizado da Seção -->
        <app-input label="Título da Galeria" value="${w(n.title)}" id="gal-title"></app-input>

        <div class="flex items-center justify-between mb-4">
          <label class="label-technical mb-0! text-[10px]">Colunas no PDF</label>
          <select class="bg-studio-elevated border border-studio-border text-white text-[10px] rounded px-2 py-1 outline-none font-mono uppercase" id="col-select">
            <option value="1" ${n.columns===1?`selected`:``}>1 Coluna</option>
            <option value="2" ${n.columns===2?`selected`:``}>2 Colunas</option>
            <option value="3" ${n.columns===3?`selected`:``}>3 Colunas</option>
          </select>
        </div>

        <image-uploader></image-uploader>

        <div class="grid grid-cols-2 gap-2 mt-4" id="images-preview">
          ${n.images.map((e,t)=>`
            <div class="relative group rounded border border-studio-border overflow-hidden bg-studio-base shadow-sm">
              <img src="${e.src}" class="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="btn-edit bg-accent-primary text-white rounded-full w-8 h-8 flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition-transform" data-index="${t}" title="Desenhar"><ui-icon name="pencil" size="sm"></ui-icon></button>
                <button class="btn-del bg-accent-danger text-white rounded-full w-8 h-8 flex items-center justify-center text-[14px] shadow-lg hover:scale-110 transition-transform" data-index="${t}" title="Excluir"><ui-icon name="trash" size="sm"></ui-icon></button>
              </div>

              <input 
                type="text" 
                class="w-full bg-studio-elevated/80 text-[10px] p-1.5 border-t border-studio-border text-white outline-none placeholder:text-studio-muted" 
                placeholder="Legenda..." 
                value="${e.caption||``}" 
                data-index="${t}"
              />
            </div>
          `).join(``)}
        </div>
      </div>
    `,this.setupListeners()}setupListeners(){let e=this.getAttribute(`section-id`);this.querySelector(`#gal-title`)?.addEventListener(`app-input`,e=>{this.updateData({title:e.detail.value})}),this.querySelector(`image-uploader`)?.addEventListener(`images-added`,t=>{let n=t.detail.images.map(e=>({src:e,caption:``})),r=i.state.sections.find(t=>t.id===e)?.data;this.updateData({images:[...r.images,...n]}),this.render()}),this.querySelectorAll(`.btn-del`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`)),r=(i.state.sections.find(t=>t.id===e)?.data).images.filter((e,t)=>t!==n);this.updateData({images:r}),this.render()})}),this.querySelectorAll(`.btn-edit`).forEach(t=>{t.addEventListener(`click`,()=>{let n=parseInt(t.getAttribute(`data-index`)),r=i.state.sections.find(t=>t.id===e)?.data,a=document.querySelector(`#global-image-editor`);a&&a.open(r.images[n].src,e,n)})}),this.querySelectorAll(`input[data-index]`).forEach(t=>{t.addEventListener(`input`,n=>{let r=parseInt(t.getAttribute(`data-index`)),a=[...(i.state.sections.find(t=>t.id===e)?.data).images];a[r].caption=n.target.value,this.updateData({images:a})})}),this.querySelector(`#col-select`)?.addEventListener(`change`,e=>{this.updateData({columns:parseInt(e.target.value)})})}};customElements.define(`image-section-editor`,M);var N=class extends HTMLElement{static get observedAttributes(){return[`section-id`]}connectedCallback(){this.render()}update(e,t){let n=this.getAttribute(`section-id`);i.updateSectionData(n,{[e]:t})}render(){let e=this.getAttribute(`section-id`),t=i.state.sections.find(t=>t.id===e);if(!t||t.type!==`equipment`)return;let n=t.data;this.innerHTML=`
      <div class="grid grid-cols-1 gap-2">
        <app-input label="Descrição" value="${n.description}" data-field="description"></app-input>
        <div class="grid grid-cols-2 gap-2">
          <app-input label="Modelo" value="${n.model}" data-field="model"></app-input>
          <app-input label="Patrimônio" value="${n.patrimony}" data-field="patrimony"></app-input>
        </div>
        <app-input label="Proprietário / Responsável" value="${n.owner}" data-field="owner"></app-input>
      </div>
    `,this.querySelectorAll(`app-input`).forEach(e=>{e.addEventListener(`app-input`,t=>{let n=e.getAttribute(`data-field`);this.update(n,t.detail.value)})})}};customElements.define(`equipment-section-editor`,N);var P=class extends HTMLElement{static get observedAttributes(){return[`section-id`]}connectedCallback(){this.render()}render(){let e=this.getAttribute(`section-id`),t=i.state.sections.find(t=>t.id===e);if(!t||t.type!==`text`)return;let n=t.data;this.innerHTML=`
      <div class="space-y-4">
        <app-input label="Título da Seção" value="${n.title}" data-field="title"></app-input>
        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="label-technical mb-0!">Conteúdo</label>
            <span class="text-[9px] font-mono text-studio-muted flex items-center gap-1 opacity-70 cursor-help" title="
# Markdown Suportado

Cabeçalhos: # H1, ## H2, ### H3

Ênfase: *itálico* ou _itálico_; **negrito** ou __negrito__

Listas: - item (não ordenada) ou 1. item (ordenada)

Links: [texto](url)

Imagens: ![alt](url)

Código:  \`código\` (inline) ou \`\`\` código \`\`\` (bloco)

Citações: > texto

Tabelas: | col1 | col2 |

Linha horizontal: ---">
              <span class="border border-studio-border rounded flex items-center justify-center text-[9px] font-bold">M↓</span>
              Markdown Ativo
            </span>
          </div>
          <textarea 
            class="input-technical min-h-30 resize-y" 
            placeholder="Digite o laudo ou observações..."
          >${n.content}</textarea>
        </div>
      </div>
    `,this.querySelector(`app-input`)?.addEventListener(`app-input`,t=>{i.updateSectionData(e,{title:t.detail.value})}),this.querySelector(`textarea`)?.addEventListener(`input`,t=>{i.updateSectionData(e,{content:t.target.value})})}};customElements.define(`text-section-editor`,P);var F=class extends HTMLElement{static get observedAttributes(){return[`section-id`]}connectedCallback(){this.render()}getSectionData(){let e=this.getAttribute(`section-id`),t=i.state.sections.find(t=>t.id===e);return t&&t.type===`bullets`?t.data:null}updateItems(e){let t=this.getAttribute(`section-id`);i.updateSectionData(t,{items:e})}render(){let e=this.getSectionData();e&&(this.innerHTML=`
      <div class="space-y-4">
        <app-input label="Título da Lista" value="${e.title}" data-field="title"></app-input>
        
        <div class="space-y-2" id="items-container">
          ${e.items.map((e,t)=>`
            <div class="flex gap-2 group">
              <div class="w-6 h-8 flex items-center justify-center text-studio-muted font-mono text-[10px]">${t+1}</div>
              <input 
                type="text" 
                class="input-technical flex-1 py-1.5! text-xs" 
                value="${e}" 
                data-index="${t}" 
                placeholder="Item ${t+1}"
              />
              <button class="btn-del-item text-accent-danger opacity-0 group-hover:opacity-100 p-1 transition-opacity" data-index="${t}"><ui-icon name="trash" size="xs"></ui-icon></button>
            </div>
          `).join(``)}
        </div>

        <app-button variant="outline" id="add-item" class="py-1.5! text-[10px] uppercase font-mono">
          <ui-icon name="plus" size="sm"></ui-icon> Adicionar Item
        </app-button>
      </div>
    `,this.setupListeners())}setupListeners(){let e=this.getAttribute(`section-id`);this.querySelector(`app-input`)?.addEventListener(`app-input`,t=>{i.updateSectionData(e,{title:t.detail.value})}),this.querySelectorAll(`input[data-index]`).forEach(e=>{e.addEventListener(`input`,e=>{let t=parseInt(e.target.getAttribute(`data-index`)),n=this.getSectionData();if(n){let r=[...n.items];r[t]=e.target.value,this.updateItems(r)}})}),this.querySelectorAll(`.btn-del-item`).forEach(e=>{e.addEventListener(`click`,()=>{let t=parseInt(e.getAttribute(`data-index`)),n=this.getSectionData();if(n){let e=n.items.filter((e,n)=>n!==t);this.updateItems(e),this.render()}})}),this.querySelector(`#add-item`)?.addEventListener(`click`,()=>{let e=this.getSectionData();e&&(this.updateItems([...e.items,``]),this.render())})}};customElements.define(`bullet-section-editor`,F);var I=class extends HTMLElement{dragSrcEl=null;connectedCallback(){this.setupObserver()}setupObserver(){new MutationObserver(()=>this.applyDraggable()).observe(this,{childList:!0}),this.applyDraggable()}applyDraggable(){Array.from(this.children).forEach((e,t)=>{e.tagName.toLowerCase()===`section-card`&&(e.hasAttribute(`hide-remove`)||(e.setAttribute(`draggable`,`true`),e.setAttribute(`data-index`,t.toString()),e.onmousedown=t=>{t.target.closest(`.drag-handle`)?e.setAttribute(`draggable`,`true`):e.setAttribute(`draggable`,`false`)},e.addEventListener(`dragstart`,this.handleDragStart.bind(this)),e.addEventListener(`dragover`,this.handleDragOver.bind(this)),e.addEventListener(`dragleave`,this.handleDragLeave.bind(this)),e.addEventListener(`drop`,this.handleDrop.bind(this)),e.addEventListener(`dragend`,this.handleDragEnd.bind(this))))})}handleDragStart(e){this.dragSrcEl=e.target,e.dataTransfer&&(e.dataTransfer.effectAllowed=`move`,e.dataTransfer.setData(`text/plain`,this.dragSrcEl.getAttribute(`data-index`)||``)),this.dragSrcEl.classList.add(`opacity-20`,`border-accent-primary`,`border-2`)}handleDragOver(e){e.preventDefault&&e.preventDefault();let t=e.target.closest(`section-card`);return t&&t!==this.dragSrcEl&&t.classList.add(`border-t-4`,`border-accent-primary`,`pt-2`),!1}handleDragLeave(e){let t=e.target.closest(`section-card`);t&&t.classList.remove(`border-t-4`,`border-accent-primary`,`pt-2`)}handleDrop(e){e.stopPropagation();let t=e.target.closest(`section-card`);if(this.dragSrcEl&&t&&this.dragSrcEl!==t){let e=parseInt(this.dragSrcEl.getAttribute(`data-index`)||`0`),r=parseInt(t.getAttribute(`data-index`)||`0`);n.debug(`SortableList`,`Reordenando seção de ${e} para ${r}`),this.dispatchEvent(new CustomEvent(`items-reordered`,{detail:{fromIndex:e,toIndex:r},bubbles:!0}))}return!1}handleDragEnd(){Array.from(this.children).forEach(e=>{e.classList.remove(`opacity-20`,`border-accent-primary`,`border-2`,`border-t-4`,`pt-2`)})}};customElements.define(`sortable-list`,I);var L=class extends HTMLElement{isSaving=!1;lastSaved=`--:--:--`;storageUsage=`0.0`;warnings=[];connectedCallback(){this.render(),this.setupListeners(),this.updateLastSaved()}setupListeners(){e.on(r.REPORT_UPDATED,()=>this.render()),e.on(r.PERSISTENCE_SAVING,()=>{this.isSaving=!0,this.render()}),e.on(r.PERSISTENCE_SAVED,()=>{this.isSaving=!1,this.updateLastSaved(),this.render()}),e.on(r.VALIDATION_UPDATED,(e=[])=>{this.warnings=e,this.render()})}updateLastSaved(){this.lastSaved=new Date().toLocaleTimeString(`pt-BR`,{hour12:!1}),this.storageUsage=(JSON.stringify(i.state).length/(1024*1024)).toFixed(2)}render(){let e=i.state,t=e.sections.length,n=e.sections.reduce((e,t)=>t.type===`images`?e+t.data.images.length:e,0),r=e.sections.filter(e=>e.type===`pagebreak`).length+1,a=e.meta.createdAt.toString(36).toUpperCase(),o=`Último salvamento: ${this.lastSaved}\nUso de Disco: ${this.storageUsage}MB / 50MB (Estimado)\nTrace ID: ${a}\nVersão do Schema: ${e.meta.schemaVersion}\n\nPENPENDÊNCIAS:\n${this.warnings.length>0?this.warnings.map(e=>`• `+e.message).join(`
`):`Nenhuma`}`;this.className=`fixed bottom-0 left-0 w-105 bg-studio-base border-t border-studio-border h-8 flex items-center px-4 justify-between z-50 select-none`,this.innerHTML=`
      <div class="flex items-center gap-4 font-mono text-[9px] text-studio-muted h-full">
        <div class="flex items-center gap-1.5 cursor-help" title="${o}">
          <span class="w-1.5 h-1.5 rounded-full ${this.isSaving?`bg-accent-cyan animate-pulse`:`bg-green-500`}"></span>
          <span class="uppercase tracking-widest">${this.isSaving?`Syncing...`:`Sync`}</span>
        </div>
        <div class="w-px h-3 bg-studio-border"></div>
        <div class="flex gap-3 h-full items-center">
          <span title="Total de Módulos">MODS: ${t}</span>
          <span title="Total de Fotos">FOTOS: ${n}</span>
          <span title="Páginas Estimadas">PAGS: ${r}</span>
          ${this.warnings.length>0?`<span class="text-[#F59E0B] font-bold animate-pulse" title="${this.warnings.map(e=>e.message).join(`
`)}"><ui-icon name="alert-triangle" size="xs" class="shrink-0"></ui-icon> ${this.warnings.length}</span>`:``}
          <span id="view-toggle-status" class="text-accent-primary font-bold cursor-pointer hover:scale-110 transition-transform px-1" title="Alternar Preview (Alt+P)">VIEW: ${e.ui.previewVisible?`<ui-icon name="eye" size="xs"></ui-icon>`:`<ui-icon name="eye-off" size="xs"></ui-icon>`}</span>
        </div>
      </div>
      <div class="flex items-center gap-2 font-mono text-[9px] text-studio-muted cursor-help" title="${o}">
        <span>ID: ${a}</span>
        <div class="w-px h-3 bg-studio-border"></div>
        <span>${this.storageUsage}MB</span>
      </div>
    `,this.querySelector(`#view-toggle-status`)?.addEventListener(`click`,e=>{e.stopPropagation(),i.togglePreview()})}};customElements.define(`app-status-bar`,L);var R=[`default`,`success`,`danger`,`warning`,`info`],z=[`sm`,`md`,`lg`,`xl`,`fullscreen`],B=[`fade`,`scale`,`slide`,`flip`],V={default:{accent:`#6366f1`,fg:`#fff`,icon:null},success:{accent:`#16a34a`,fg:`#fff`,icon:`✓`},danger:{accent:`#dc2626`,fg:`#fff`,icon:`!`},warning:{accent:`#d97706`,fg:`#fff`,icon:`⚠`},info:{accent:`#0284c7`,fg:`#fff`,icon:`i`}},H={sm:`28rem`,md:`40rem`,lg:`56rem`,xl:`72rem`,fullscreen:`100vw`};function U(e){return R.includes(e)}function W(e){return z.includes(e)}function G(e){return B.includes(e)}var K=`
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
`,q=`
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
`,J=`a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),details>summary`,Y=class extends HTMLElement{#e;#t;#n=null;#r;#i;#a;#o;#s;#c;#l;#u=!1;#d=!1;#f=null;static formAssociated=!0;static observedAttributes=[`variant`,`size`,`animation`,`heading`,`open`];constructor(){super(),this.#e=this.attachShadow({mode:`open`}),this.#t=this.attachInternals();let e=new CSSStyleSheet;e.replaceSync(K),this.#e.adoptedStyleSheets=[e],this.#e.innerHTML=q,this.#m()}connectedCallback(){if(this.#d)return;this.#d=!0,this.#n=new AbortController;let e=this.#n.signal;this.#a.addEventListener(`click`,()=>this.close(),{signal:e}),this.#r.addEventListener(`click`,e=>{e.target===this.#r&&this.#b()},{signal:e}),this.#l.addEventListener(`slotchange`,()=>{let e=this.#l.assignedNodes({flatten:!0}).length>0;this.#c.classList.toggle(`hidden`,!e)},{signal:e}),this.#r.addEventListener(`keydown`,e=>{if(e.key===`Escape`){e.preventDefault(),this.#b();return}e.key===`Tab`&&this.#C(e)},{signal:e}),this.#h()}disconnectedCallback(){this.#d=!1,this.#n?.abort()}attributeChangedCallback(e,t,n){if(t!==n)switch(e){case`variant`:this.#g(n);break;case`size`:this.#_(n);break;case`animation`:break;case`heading`:this.#o.textContent=n??``;break;case`open`:{let e=n!==null;e&&!this.#p&&!this.#u&&this.#v(),!e&&this.#p&&!this.#u&&this.#y();break}}}open(){this.#p||this.#u||this.setAttribute(`open`,``)}close(){!this.#p||this.#u||this.removeAttribute(`open`)}toggle(){this.#p?this.close():this.open()}get isOpen(){return this.#p}get variant(){let e=this.getAttribute(`variant`);return U(e)?e:`default`}set variant(e){this.setAttribute(`variant`,U(e)?e:`default`)}get size(){let e=this.getAttribute(`size`);return W(e)?e:`md`}set size(e){this.setAttribute(`size`,W(e)?e:`md`)}get animation(){let e=this.getAttribute(`animation`);return G(e)?e:`scale`}set animation(e){this.setAttribute(`animation`,G(e)?e:`scale`)}get heading(){return this.getAttribute(`heading`)??``}set heading(e){this.setAttribute(`heading`,e)}addEventListener(e,t,n){super.addEventListener(e,t,n)}removeEventListener(e,t,n){super.removeEventListener(e,t,n)}get#p(){return this.#r.classList.contains(`is-open`)}#m(){let e=e=>this.#e.querySelector(e);this.#r=e(`.overlay`),this.#i=e(`.panel`),this.#a=e(`.close-btn`),this.#o=e(`#modal-title`),this.#s=e(`.icon-badge`),this.#c=e(`.footer`),this.#l=e(`slot[name="footer"]`)}#h(){this.hasAttribute(`variant`)&&this.#g(this.getAttribute(`variant`)),this.hasAttribute(`size`)&&this.#_(this.getAttribute(`size`)),this.hasAttribute(`heading`)&&(this.#o.textContent=this.getAttribute(`heading`)),this.hasAttribute(`open`)&&this.#v()}#g(e){let t=V[U(e)?e:`default`],n=this.#e.host;n.style.setProperty(`--_accent`,t.accent),n.style.setProperty(`--_fg`,t.fg),this.#s.textContent=t.icon??``}#_(e){let t=W(e)?e:`md`;this.#i.style.setProperty(`--_width`,H[t])}#v(){this.#u=!0,this.#f=document.activeElement,this.#r.classList.add(`is-open`),this.#r.removeAttribute(`aria-hidden`),this.#t.states?.add(`open`),requestAnimationFrame(()=>{(this.#T()??this.#a).focus(),this.#u=!1}),this.#S(`ui-modal:open`)}#y(e=!1){this.#u=!0,this.#r.classList.replace(`is-open`,`is-closing`);let t=this.#x(getComputedStyle(this.#e.host).getPropertyValue(`--modal-duration`));setTimeout(()=>{this.#r.classList.remove(`is-closing`),this.#r.setAttribute(`aria-hidden`,`true`),this.#t.states?.delete(`open`),this.#u=!1,this.#f?.focus?.(),this.#f=null,e&&this.#S(`ui-modal:cancel`),this.#S(`ui-modal:close`)},t)}#b(){!this.#p||this.#u||(this.#u=!0,this.removeAttribute(`open`),this.#y(!0))}#x(e){let t=e.trim().match(/^(\d+(?:\.\d+)?)(ms|s)?$/);if(!t||t[1]===void 0)return 280;let n=parseFloat(t[1]);return(t[2]??`ms`)===`s`?n*1e3:n}#S(e){let t={modal:this};this.dispatchEvent(new CustomEvent(e,{bubbles:!0,composed:!0,detail:t}))}#C(e){let t=this.#w();if(!t.length){e.preventDefault(),this.#a.focus();return}let n=t[0],r=t[t.length-1],i=this.#e.activeElement??document.activeElement;if(!i||!t.includes(i)){e.preventDefault(),n.focus();return}e.shiftKey&&i===n?(e.preventDefault(),r.focus()):!e.shiftKey&&i===r&&(e.preventDefault(),n.focus())}#w(){return[...Array.from(this.#e.querySelectorAll(J)),...Array.from(this.querySelectorAll(J))]}#T(){return this.#w().find(e=>e!==this.#a)??null}};customElements.define(`ui-modal`,Y);var ae=class extends HTMLElement{isInitialized=!1;draftTemplate=null;connectedCallback(){this.isInitialized||=(this.renderSkeleton(),!0),this.renderSections(),this.setupGlobalListeners()}setupGlobalListeners(){e.on(r.SECTION_ADDED,()=>this.renderSections()),e.on(r.SECTION_REMOVED,()=>this.renderSections()),e.on(r.SECTIONS_REORDERED,()=>this.renderSections()),e.on(r.STATE_LOADED,()=>this.renderSections()),e.on(r.REPORT_UPDATED,e=>{this.syncInputs(e)}),e.on(r.LAYOUT_WARNING,e=>{let t=this.querySelector(`#layout-alert`);t&&(e.hasOverflow?(t.classList.remove(`hidden`),t.classList.add(`flex`)):(t.classList.add(`hidden`),t.classList.remove(`flex`)))})}renderSkeleton(){let{config:e}=i.state;this.className=`panel-editor`,this.innerHTML=`
      <!-- Alerta de Layout -->
      <div id="layout-alert" class="hidden mb-6 bg-accent-danger text-white p-3 rounded-md text-[11px] font-bold uppercase tracking-wider animate-pulse items-center gap-3 shadow-lg">
        <ui-icon name="alert-triangle" size="md" class="shrink-0"></ui-icon>
        <span>Atenção: O conteúdo ultrapassou o limite da página A4. Insira uma quebra de página ou reduza os textos.</span>
      </div>

      <!-- Cabeçalho com Logo Profissional Aura Technical -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-3">
          <img src="${k}" alt="Aura Technical" class="w-8 h-8 object-contain" onerror="this.style.display='none'" />
          <h1 class="title-studio mb-0! tracking-tight">Aura Estúdio</h1>
        </div>
        <button id="toggle-preview" class="btn btn-outline py-1! px-2! text-xs" title="Alternar Preview (Alt+P)">
          ${i.state.ui.previewVisible?`<ui-icon name="eye" size="sm"></ui-icon>`:`<ui-icon name="eye-off" size="sm"></ui-icon>`}
        </button>
      </div>

      <!-- Ações Rápidas -->
      <div class="grid grid-cols-6 gap-2 mb-6">
        <button id="quick-start" class="col-span-5 btn btn-primary py-2! text-[11px]! uppercase tracking-wider">
          <ui-icon name="lightning" size="sm"></ui-icon> Início Rápido
        </button>
        <button id="edit-template" class="btn btn-secondary p-0! flex items-center justify-center text-sm" title="Configurar Template Padrão">
          <ui-icon name="settings" size="sm"></ui-icon>
        </button>
      </div>

      <!-- Como section-card usa atributos HTML para o título, removemos o emoji.
           Sugestão futura: adicionar um atributo 'header-icon="settings"' no seu componente Custom! -->
      <section-card header-title="Configurações Gerais" section-id="global-config" hide-remove>
        <div class="space-y-4">
          <!-- Upload de Logo -->
          <div>
            <label class="label-technical">Logo da Empresa</label>
            <div class="flex items-center gap-4">
              <div id="logo-preview" class="w-12 h-12 rounded border border-studio-border bg-studio-elevated flex items-center justify-center overflow-hidden">
                ${e.logo?`<img src="${e.logo}" class="w-full h-full object-contain" />`:`<ui-icon name="image" size="lg" class="text-studio-muted"></ui-icon>`}
              </div>
              <input type="file" id="input-logo" accept="image/*" class="hidden" />
              <app-button variant="outline" class="py-1! text-[10px]" onclick="document.getElementById('input-logo').click()">
                <ui-icon name="upload-cloud" size="sm"></ui-icon> Trocar
              </app-button>
            </div>
          </div>

          <!-- Cor Primária -->
          <div>
            <label class="label-technical">Cor do Relatório</label>
            <div class="flex gap-3 items-center">
              <input type="color" id="input-color" value="${e.primaryColor||`#4f46e5`}" class="w-10 h-10 rounded bg-transparent border-none cursor-pointer" />
              <span class="font-mono text-xs text-studio-muted uppercase">${e.primaryColor}</span>
            </div>
          </div>

          <app-input label="Título do Relatório" value="${w(e.title)}" data-prop="title" id="input-title"></app-input>
          <app-input label="Empresa / Cliente" value="${w(e.company||``)}" data-prop="company" id="input-company"></app-input>
          
          <div class="grid grid-cols-2 gap-2">
            <app-input label="Nº Relatório" value="${w(e.reportNumber||``)}" data-prop="reportNumber"></app-input>
            <app-input label="Data" value="${w(e.reportDate||``)}" data-prop="reportDate"></app-input>
          </div>
        </div>
      </section-card>

      <sortable-list id="sections-container" class="mt-8 block space-y-4"></sortable-list>

      <!-- Inserir Módulos -->
      <div class="mt-12 pt-8 border-t border-studio-border">
        <label class="label-technical mb-4 flex items-center justify-center gap-2">
          <ui-icon name="blocks" size="sm"></ui-icon> Inserir Novo Módulo
        </label>
        <div class="grid grid-cols-2 gap-3">
          <app-button variant="secondary" id="add-equipment"><ui-icon name="package" size="sm"></ui-icon> Equipamento</app-button>
          <app-button variant="secondary" id="add-text"><ui-icon name="text" size="sm"></ui-icon> Texto Livre</app-button>
          <app-button variant="secondary" id="add-bullets"><ui-icon name="list" size="sm"></ui-icon> Lista Itens</app-button>
          <app-button variant="secondary" id="add-images"><ui-icon name="image" size="sm"></ui-icon> Galeria</app-button>
          <app-button variant="outline" id="add-pagebreak" class="col-span-2"><ui-icon name="arrow-uturn-down" size="sm"></ui-icon> Quebra de Página</app-button>
        </div>
      </div>

      <!-- Gestão de Dados -->
      <div class="mt-10 pt-8 border-t border-studio-border">
        <label class="label-technical mb-4 flex items-center gap-2">
          <ui-icon name="database" size="sm"></ui-icon> Gestão de Dados (JSON)
        </label>
        <div class="grid grid-cols-2 gap-3">
          <app-button variant="outline" id="export-json" class="py-2! text-[10px]!">
            <ui-icon name="download" size="sm"></ui-icon> Exportar Backup
          </app-button>
          <app-button variant="outline" id="import-json" class="py-2! text-[10px]!">
            <ui-icon name="upload" size="sm"></ui-icon> Importar JSON
          </app-button>
          <input type="file" id="input-import-json" accept=".json" class="hidden" />
        </div>
      </div>

      <!-- Rodapé / Ações Perigosas -->
      <div class="mt-10 pb-12">
        <div class="flex items-center gap-2 mb-3 group cursor-pointer" onclick="this.querySelector('input').click()">
          <input type="checkbox" id="keep-config" class="w-4 h-4 rounded border-studio-border bg-studio-elevated accent-accent-primary cursor-pointer" checked />
          <label class="label-technical mb-0! cursor-pointer group-hover:text-white transition-colors">Manter Logo e Dados da Empresa</label>
        </div>
        <app-button variant="danger" id="clear-report" class="w-full">
          <ui-icon name="trash" size="sm"></ui-icon> Novo Relatório (Limpar)
        </app-button>
      </div>

      <!-- Modal: Editor de Template -->
      <ui-modal id="modal-template" size="md" animation="scale">
        <div slot="header" class="flex items-center gap-2 text-white font-mono uppercase tracking-tight text-sm">
          <ui-icon name="lightning" size="md" class="text-accent-primary"></ui-icon> Configurar Início Rápido
        </div>
        
        <div class="space-y-6">
          <p class="text-xs text-studio-muted leading-relaxed">
            Defina a "receita" padrão que será carregada ao clicar no botão de Início Rápido.
          </p>
          
          <div id="template-editor-list" class="space-y-2 border-y border-studio-border py-4">
            <!-- Gerado dinamicamente -->
          </div>

          <div class="flex flex-wrap gap-2">
            <button class="btn btn-secondary py-1! text-[10px]!" data-add-tmpl="equipment"><ui-icon name="plus" size="xs"></ui-icon> Equipamento</button>
            <button class="btn btn-secondary py-1! text-[10px]!" data-add-tmpl="images"><ui-icon name="plus" size="xs"></ui-icon> Galeria</button>
            <button class="btn btn-secondary py-1! text-[10px]!" data-add-tmpl="text"><ui-icon name="plus" size="xs"></ui-icon> Texto</button>
            <button class="btn btn-secondary py-1! text-[10px]!" data-add-tmpl="bullets"><ui-icon name="plus" size="xs"></ui-icon> Lista</button>
            <button class="btn btn-secondary py-1! text-[10px]!" data-add-tmpl="pagebreak"><ui-icon name="plus" size="xs"></ui-icon> Quebra</button>
          </div>
        </div>

        <div slot="footer" class="flex justify-end gap-3">
          <button class="btn btn-outline" onclick="document.getElementById('modal-template').close()">Cancelar</button>
          <button class="btn btn-primary" id="save-template-btn">Salvar Template</button>
        </div>
      </ui-modal>

      <app-status-bar></app-status-bar>
    `,this.setupActions()}renderSections(){let e=this.querySelector(`#sections-container`);if(!e)return;let{sections:t}=i.state;e.innerHTML=t.map(e=>`
      <section-card header-icon="${w(this.getSectionLabel(e.type).iconName)}" header-title="${w(this.getSectionLabel(e.type).label)}" section-id="${e.id}">
        ${this.renderSectionEditor(e.id,e.type)}
      </section-card>
    `).join(``)}renderSectionEditor(e,t){switch(t){case`images`:return`<image-section-editor section-id="${e}"></image-section-editor>`;case`equipment`:return`<equipment-section-editor section-id="${e}"></equipment-section-editor>`;case`text`:return`<text-section-editor section-id="${e}"></text-section-editor>`;case`bullets`:return`<bullet-section-editor section-id="${e}"></bullet-section-editor>`;case`pagebreak`:return`<div class="py-4 border border-dashed border-studio-border text-center text-[10px] text-studio-muted font-mono uppercase tracking-widest">Página encerra aqui</div>`;default:return`<p class="text-studio-muted text-[10px]">Editor não encontrado</p>`}}syncInputs(e){if(!e.config)return;e.config.primaryColor&&document.documentElement.style.setProperty(`--report-primary-color`,e.config.primaryColor);let t=this.querySelector(`#logo-preview`);t&&(t.innerHTML=e.config.logo?`<img src="${e.config.logo}" class="w-full h-full object-contain" />`:`<ui-icon name="image" size="lg" class="text-studio-muted"></ui-icon>`),this.querySelectorAll(`app-input[data-prop]`).forEach(t=>{let n=t.getAttribute(`data-prop`);n&&e.config[n]!==void 0&&document.activeElement!==t.querySelector(`input`)&&t.setAttribute(`value`,w(e.config[n]))});let n=this.querySelector(`#toggle-preview`),r=n?.querySelector(`ui-icon`);n&&r&&(r.name=e.ui.previewVisible?`eye`:`eye-off`)}setupActions(){this.querySelector(`#toggle-preview`)?.addEventListener(`click`,()=>i.togglePreview()),this.querySelector(`#quick-start`)?.addEventListener(`click`,async()=>{await O.ask(`Iniciar com Template?`,`Isso irá apagar as seções atuais e criar a estrutura padrão de inspeção. Os dados da empresa serão mantidos.`,{confirmText:`Sim, Iniciar`,cancelText:`Manter Atual`,countdown:1,variant:`warning`})&&i.applyTemplate(i.getQuickTemplate())});let e=this.querySelector(`#modal-template`),t=this.querySelector(`#template-editor-list`);this.querySelector(`#edit-template`)?.addEventListener(`click`,()=>{this.draftTemplate=JSON.parse(JSON.stringify(i.getQuickTemplate())),this.renderTemplateList(t),e.open()}),this.addEventListener(`click`,e=>{let n=e.target.getAttribute(`data-add-tmpl`);n&&this.draftTemplate&&(this.draftTemplate.sections.push({type:n,defaultTitle:this.getSectionLabel(n).label}),this.renderTemplateList(t));let r=e.target.closest(`.btn-remove-tmpl`);if(r&&this.draftTemplate){let e=parseInt(r.dataset.index);this.draftTemplate.sections.splice(e,1),this.renderTemplateList(t)}}),this.querySelector(`#save-template-btn`)?.addEventListener(`click`,()=>{this.draftTemplate&&(i.setCustomTemplate(this.draftTemplate),e.close(),h.show({message:`Template configurado com sucesso!`,type:`success`}))}),this.querySelector(`#export-json`)?.addEventListener(`click`,()=>{let e=i.state,t=new Blob([JSON.stringify(e,null,2)],{type:`application/json`}),r=URL.createObjectURL(t),a=document.createElement(`a`),o=new Date().toISOString().split(`T`)[0],s=`aura_report_${e.config.reportNumber||`backup`}_${o}.json`;a.href=r,a.download=s,a.click(),URL.revokeObjectURL(r),h.show({message:`Backup exportado com sucesso!`,type:`success`}),n.info(`EditorPanel`,`Relatório exportado como JSON:`,s)});let r=this.querySelector(`#input-import-json`);this.querySelector(`#import-json`)?.addEventListener(`click`,()=>r.click()),r?.addEventListener(`change`,async e=>{let t=e.target.files[0];if(t)try{let e=await t.text(),a=JSON.parse(e);if(!a.meta||!a.config||!Array.isArray(a.sections))throw Error(`Formato de arquivo Aura inválido.`);await O.ask(`Importar Dados?`,`Isso irá substituir completamente o relatório atual pelos dados do arquivo. Deseja continuar?`,{variant:`warning`,confirmText:`Sim, Importar`,cancelText:`Cancelar`,countdown:1})&&(i.loadState(a),r.value=``,h.show({message:`Relatório importado com sucesso!`,type:`success`}),n.info(`EditorPanel`,`Relatório importado com sucesso:`,t.name))}catch(e){h.show({message:`Erro na importação: `+e.message,type:`error`}),n.error(`EditorPanel`,`Falha ao importar JSON:`,e)}}),window.addEventListener(`keydown`,e=>{e.altKey&&(e.key===`p`||e.key===`P`)&&(e.preventDefault(),i.togglePreview())}),this.querySelector(`#add-equipment`)?.addEventListener(`click`,()=>i.addSection(`equipment`)),this.querySelector(`#add-text`)?.addEventListener(`click`,()=>i.addSection(`text`)),this.querySelector(`#add-bullets`)?.addEventListener(`click`,()=>i.addSection(`bullets`)),this.querySelector(`#add-images`)?.addEventListener(`click`,()=>i.addSection(`images`)),this.querySelector(`#add-pagebreak`)?.addEventListener(`click`,()=>i.addSection(`pagebreak`)),this.querySelector(`#input-color`)?.addEventListener(`input`,e=>{let t=e.target.value;i.updateConfig({primaryColor:t}),this.querySelector(`#input-color + span`).textContent=t}),this.querySelector(`#input-logo`)?.addEventListener(`change`,e=>{let t=e.target.files[0];if(t){let e=new FileReader;e.onload=e=>{let t=e.target?.result;i.updateConfig({logo:t}),this.querySelector(`#logo-preview`).innerHTML=`<img src="${t}" class="w-full h-full object-contain" />`},e.readAsDataURL(t)}}),this.querySelector(`#keep-config`)?.addEventListener(`click`,e=>e.stopPropagation()),this.querySelector(`#clear-report`)?.addEventListener(`click`,async()=>{let e=this.querySelector(`#keep-config`)?.checked,t=e?`Deseja limpar todas as seções? (A logo e os dados da empresa serão mantidos).`:`Deseja limpar TODO o relatório e configurações? Esta ação é irreversível.`;await O.ask(`Novo Relatório`,t,{variant:`danger`,confirmText:`Sim, Limpar`,cancelText:`Cancelar`,countdown:3})&&i.clearReport(e)}),this.addEventListener(`app-input`,e=>{let t=e.target.getAttribute(`data-prop`);t&&i.updateConfig({[t]:e.detail.value})}),this.addEventListener(`remove-section`,e=>i.removeSection(e.detail.id)),this.addEventListener(`items-reordered`,e=>i.reorderSections(e.detail.fromIndex,e.detail.toIndex))}renderTemplateList(e){if(this.draftTemplate){if(this.draftTemplate.sections.length===0){e.innerHTML=`<p class="text-center py-4 text-studio-muted italic text-[10px]">Nenhum módulo definido. Adicione abaixo.</p>`;return}e.innerHTML=this.draftTemplate.sections.map((e,t)=>`
      <div class="flex items-center justify-between bg-studio-elevated p-2 rounded border border-studio-border group">
        <span class="text-[11px] font-mono text-white"><ui-icon name="${this.getSectionLabel(e.type).iconName}" size="sm"></ui-icon> ${this.getSectionLabel(e.type).label}</span>
        <button type="button" class="btn-remove-tmpl p-1 opacity-0 group-hover:opacity-100 text-accent-danger hover:scale-110 transition-all" data-index="${t}"><ui-icon name="trash" size="sm"></ui-icon></button>
      </div>
    `).join(``)}}getSectionLabel(e){return{equipment:{label:`Equipamento`,iconName:`package`},text:{label:`Texto Livre`,iconName:`text`},bullets:{label:`Lista de Itens`,iconName:`list`},images:{label:`Registro Fotográfico`,iconName:`image`},pagebreak:{label:`Quebra de Página`,iconName:`arrow-uturn-down`}}[e]}};customElements.define(`editor-panel`,ae);var oe=class{logger;MAX_INPUT_SIZE=1e6;rules;constructor(e){this.logger=e||console,this.rules=Object.freeze([{name:`header6`,pattern:/^######\s+(.+)$/gm,replacement:`<h6 class="md-h6">$1</h6>`},{name:`header5`,pattern:/^#####\s+(.+)$/gm,replacement:`<h5 class="md-h5">$1</h5>`},{name:`header4`,pattern:/^####\s+(.+)$/gm,replacement:`<h4 class="md-h4">$1</h4>`},{name:`header3`,pattern:/^###\s+(.+)$/gm,replacement:`<h3 class="md-h3">$1</h3>`},{name:`header2`,pattern:/^##\s+(.+)$/gm,replacement:`<h2 class="md-h2">$1</h2>`},{name:`header1`,pattern:/^#\s+(.+)$/gm,replacement:`<h1 class="md-h1">$1</h1>`},{name:`codeBlockLang`,pattern:/```(\w+)?\n([\s\S]*?)```/g,replacement:(e,t)=>`<pre class="md-code-block"><code class="${e?` language-${this._escapeHtml(e)}`:``}">${this._escapeHtml(t.trim())}</code></pre>`},{name:`inlineCode`,pattern:/`([^`]+)`/g,replacement:e=>`<code class="md-inline-code">${this._escapeHtml(e)}</code>`},{name:`boldItalic`,pattern:/\*\*\*(.+?)\*\*\*/g,replacement:`<strong><em class="md-bold-italic">$1</em></strong>`},{name:`bold`,pattern:/\*\*(.+?)\*\*/g,replacement:`<strong class="md-bold">$1</strong>`},{name:`italic`,pattern:/\*(.+?)\*/g,replacement:`<em class="md-italic">$1</em>`},{name:`image`,pattern:/!\[([^\]]*)\]\(([^)]+)\)/g,replacement:(e,t)=>`<img src="${this._escapeHtml(t)}" alt="${this._escapeHtml(e)}" class="md-image">`},{name:`link`,pattern:/\[([^\]]+)\]\(([^)]+)\)/g,replacement:(e,t)=>`<a href="${this._escapeHtml(t)}" class="md-link">${this._escapeHtml(e)}</a>`},{name:`blockquote`,pattern:/^>\s+(.+)$/gm,replacement:`<blockquote class="md-blockquote">$1</blockquote>`},{name:`hr`,pattern:/^---$/gm,replacement:`<hr class="md-hr">`},{name:`tableSeparator`,pattern:/^\|(?:[-: ]+\|)+$/gm,replacement:`<tr class="md-table-row" data-type="table-separator"></tr>`},{name:`tableRow`,pattern:/^\|(.+)\|$/gm,replacement:e=>`<tr class="md-table-row" data-type="table-row">${e.split(`|`).map(e=>`<td class="md-table-cell">${e.trim()}</td>`).join(``)}</tr>`},{name:`unorderedListItem`,pattern:/^-\s+(.+)$/gm,replacement:`<li class="md-list-item" data-type="unordered">$1</li>`},{name:`unorderedListItemAsterisk`,pattern:/^\*\s+(.+)$/gm,replacement:`<li class="md-list-item" data-type="unordered">$1</li>`},{name:`orderedListItem`,pattern:/^\d+\.\s+(.+)$/gm,replacement:`<li class="md-list-item" data-type="ordered">$1</li>`}]),this.logger.info(`MarkdownParser`,`MarkdownParser inicializado com regras de conversão`)}_escapeHtml(e){let t={"&":`&amp;`,"<":`&lt;`,">":`&gt;`,'"':`&quot;`,"'":`&#039;`};return e.replace(/[&<>"']/g,e=>t[e])}_wrapBlockquotes(e){return e.replace(/(<blockquote class="md-blockquote">.*?<\/blockquote>\n?)+/gs,e=>`<blockquote class="md-blockquote">${e.replace(/<blockquote class="md-blockquote">/g,``).replace(/<\/blockquote>\n?/g,`<br>`).replace(/<br>$/,``)}</blockquote>\n`)}_wrapLists(e){return e=e.replace(/(<li class="md-list-item" data-type="unordered">.*?<\/li>\n?)+/gs,e=>`<ul class="md-list">\n${e.replace(/ data-type="unordered"/g,``)}</ul>\n`),e=e.replace(/(<li class="md-list-item" data-type="ordered">.*?<\/li>\n?)+/gs,e=>`<ol class="md-list">\n${e.replace(/ data-type="ordered"/g,``)}</ol>\n`),e}_wrapTables(e){return e.replace(/(<tr class="md-table-row" data-type="table[\w-]+"[^>]*>.*?<\/tr>\n?)+/gs,e=>{let t=[...e.matchAll(/<tr[^>]*data-type="([\w-]+)"[^>]*>(.*?)<\/tr>/gs)],n=!0,r=[],i=[];return t.forEach(([,e,t])=>{if(e!==`table-separator`)if(n){let e=t.replace(/<td class="md-table-cell">/g,`<th class="md-table-header">`).replace(/<\/td>/g,`</th>`);r.push(`<tr class="md-table-row">${e}</tr>`),n=!1}else i.push(`<tr class="md-table-row">${t}</tr>`)}),`<table class="md-table">\n${`<thead class="md-table-head">\n${r.join(`
`)}\n</thead>`}\n${i.length?`<tbody class="md-table-body">\n${i.join(`
`)}\n</tbody>`:``}\n</table>\n`})}_processParagraphs(e){return e.split(/\n\n+/).map(e=>{let t=e.trim();return/^<(h[1-6]|ul|ol|pre|blockquote|hr|img|div|table)/.test(t)?t:t?`<p class="md-paragraph">${t}</p>`:``}).filter(Boolean).join(`
`)}_wrapContainer(e){return`<div class="md-container">\n${e}\n</div>`}_applyRules(e){let t=e;return this.rules.forEach(e=>{t=typeof e.replacement==`function`?t.replace(e.pattern,(...t)=>e.replacement.call(this,...t)):t.replace(e.pattern,e.replacement)}),t}parse(e){if(typeof e!=`string`)throw TypeError(`O input deve ser uma string`);if(e.length===0)return`<div class="md-container"></div>`;if(e.length>this.MAX_INPUT_SIZE)throw RangeError(`Input muito grande (limite: ${this.MAX_INPUT_SIZE/1e6}MB)`);return[this._applyRules.bind(this),this._wrapBlockquotes.bind(this),this._wrapLists.bind(this),this._wrapTables.bind(this),this._processParagraphs.bind(this),this._wrapContainer.bind(this)].reduce((e,t)=>t(e),e.trim())}validateOutput(e){let t=/<(\w+)[^>]*>/g,n=/<\/(\w+)>/g,r=e.match(t)||[],i=e.match(n)||[],a=[`img`,`hr`,`br`],o=r.filter(e=>{let t=e.match(/<(\w+)/),n=t?t[1]:``;return!a.includes(n)}).length;return Math.abs(o-i.length)<=1}},X={tutorialSection:[{id:1,title:`O que é`,content:`Aura Technical é um estúdio de evidências para criação de laudos e relatórios de inspeção. Opera como PWA totalmente offline, com motor de compressão de imagens via Canvas e layout A4 em unidades físicas (mm) para fidelidade de impressão 1:1.`,imageDescription:``},{id:2,title:`Quando usar`,content:`Registro fotográfico de equipamentos, patrimônios ou inspeções técnicas. Ambientes sem conectividade (offline-first). Necessidade de rastreabilidade por Trace ID e paginação automática. Geração de PDF profissional com margens técnicas controladas.`,imageDescription:``},{id:3,title:`Passo a passo`,content:`1. Iniciar relatório: acesse o app ou abra o link. Se não houver relatório em edição, inicie um novo ou carregue um template.
2. Configurar cabeçalho: preencha empresa, número do relatório, data, cor primária e logo.
3. Adicionar seções: escolha entre Equipamento, Texto (Markdown), Lista com marcadores, Imagens (1–3 colunas) ou Quebra de página.
4. Inserir e editar imagens: faça upload ou arraste; compressão automática; clique na imagem para anotações (círculos, setas), zoom, rotação, corte.
5. Reordenar seções: arraste pelos ícones de grip.
6. Validar conformidade: barra de status mostra pendências (empresa, número, logo, seções).
7. Ajustar visualização: use zoom (+/-/1:1) ou Alt+P para alternar preview.
8. Exportar e gerar PDF: clique em Gerar PDF; no diálogo, escolha Salvar como PDF, margens Nenhuma e ative Gráficos de fundo.
9. Salvar e compartilhar: salvamento automático em IndexedDB; exportar/importar JSON.`,imageDescription:``},{id:4,title:`Erros comuns`,content:`Problemas frequentes: PDF com bordas cortadas (solução: usar Margens: Nenhuma e ativar Gráficos de fundo). Conteúdo excede a página (solução: dividir seção, ajustar colunas ou inserir quebra de página). Imagem não aparece (solução: verificar formato JPEG/PNG/WebP, tamanho <20MB). Relatório não salva (solução: liberar IndexedDB no navegador). Editor de anotações não desenha (solução: usar botão Limpar/Reset).`,imageDescription:``},{id:5,title:`Dicas avançadas`,content:`Templates personalizados: use o Editor de templates para salvar estruturas pré-definidas. Markdown em seções de texto: suporta negrito, itálico, listas, links e cabeçalhos. Controle de versão: cada página tem Trace ID único. Limpeza seletiva: mantenha configurações de empresa ao limpar apenas seções. Atalhos: Alt+P alterna preview; Ctrl+S força salvamento manual. PWA: instale o app para uso offline completo.`,imageDescription:``},{id:6,title:`Resumo rápido`,content:`1. Configure cabeçalho (empresa, número, logo).
2. Adicione seções (equipamento, texto, imagens).
3. Edite imagens com anotações.
4. Reordene seções por arrasto.
5. Valide pendências na barra de status.
6. Gere PDF com Margens: Nenhuma.
7. Use exportação/importação JSON para backup.`,imageDescription:``}],faqItens:[{q:`PDF sai com bordas cortadas ou conteúdo deslocado.`,a:`Causa: margens configuradas no diálogo de impressão. Solução: use "Margens: Nenhuma" e ative "Gráficos de fundo".`},{q:`Conteúdo excede a página (transbordo).`,a:`Causa: seção muito longa ou imagens grandes. Solução: divida a seção, ajuste colunas ou insira quebra de página manual.`},{q:`Imagem não aparece após upload.`,a:`Causa: erro de compressão ou formato não suportado. Solução: use JPEG, PNG, WebP; evite arquivos >20 MB; verifique console (F12).`},{q:`Relatório não salva automaticamente.`,a:`Causa: armazenamento do navegador bloqueado. Solução: habilite cookies/IndexedDB e garanta espaço disponível.`},{q:`Editor de anotações não desenha ou perde precisão.`,a:`Causa: interrupção na sessão de desenho. Solução: use o botão "Limpar" ou "Reset" no toolbar para reiniciar.`}],proTips:[{icon:`layout-template`,tip:`Crie templates personalizados no 'Editor de templates' e carregue-os rapidamente para iniciar novos relatórios.`},{icon:`code`,tip:`Use Markdown nas seções de texto: **negrito**, *itálico*, listas, links e cabeçalhos.`},{icon:`fingerprint`,tip:`Cada página do PDF recebe um Trace ID único (timestamp + hash) para auditoria e rastreabilidade.`},{icon:`eraser`,tip:`Limpe apenas as seções mantendo configurações de empresa, cor e logo (menu 'Mais opções').`},{icon:`keyboard`,tip:`Atalhos úteis: Alt+P alterna visibilidade do preview; Ctrl+S força salvamento manual.`},{icon:`download-cloud`,tip:`Instale o aplicativo como PWA (botão 'Instalar' na barra de endereço) para funcionar 100% offline.`},{icon:`image`,tip:`Imagens são comprimidas automaticamente para <300KB; use o editor integrado para anotações e ajustes.`},{icon:`grid`,tip:`O editor de imagens exibe um grid estilo CAD, facilitando o alinhamento de anotações.`},{icon:`file-json`,tip:`Exporte o relatório como JSON para backup ou transferência entre dispositivos; importe depois para restaurar.`},{icon:`eye`,tip:`Ajuste o zoom do preview (20% a 200%) e o estado é persistido automaticamente.`}]},se=class extends HTMLElement{overflowDetected=!1;parser;constructor(){super(),this.parser=new oe(n)}connectedCallback(){this.render(),e.on(r.REPORT_UPDATED,()=>this.render()),e.on(r.VALIDATION_UPDATED,e=>this.updateValidationAlert(e))}checkOverflow(){let t=this.querySelectorAll(`.sheet-a4`),i=!1;t.forEach(e=>{let t=e.querySelector(`.preview-content`),r=e.querySelector(`#overflow-alert`);t&&(t.scrollHeight>t.clientHeight+5?(e.classList.add(`ring-4`,`ring-accent-danger/30`,`border-accent-danger`),i=!0,r?.classList.remove(`hidden`),n.info(`PreviewPanel`,`Over flow detectado`)):(e.classList.remove(`ring-4`,`ring-accent-danger/30`,`border-accent-danger`),r?.classList.add(`hidden`)))}),i!==this.overflowDetected&&(this.overflowDetected=i,e.emit(r.LAYOUT_WARNING,{hasOverflow:i}))}updateValidationAlert(e){let t=this.querySelector(`#validation-alert`);if(!t)return;if(e.length===0){t.classList.add(`hidden`);return}n.debug(`PreviewPanel`,`Array de alertas: `,e);let r=e.length,i=r>1?`s`:``;t.classList.remove(`hidden`),t.innerHTML=`
    <div class="flex items-center justify-between gap-4">
      <span class="flex items-center gap-2">
        <span class="text-amber-500"><ui-icon name="alert-triangle" size="sm"></ui-icon></span>
        <span>${r} pendência${i} detectada${i}</span>
      </span>
      <button 
        id="btn-show-validation-details" 
        class="underline hover:text-amber-700 transition-colors"
      >
        Ver detalhes
      </button>
    </div>
  `,this.querySelector(`#btn-show-validation-details`)?.addEventListener(`click`,()=>{this.showValidationModal(e)})}showValidationModal(e){let t=document.createElement(`ui-modal`);t.id=`modal-validation-details`,t.setAttribute(`size`,`md`),t.setAttribute(`animation`,`scale`),t.innerHTML=`
    <div slot="header">
      <h1 slot="header" class="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tight font-mono">
        <span class="text-accent-primary"><ui-icon name="clipboard-pen" size="md"></ui-icon></span> Pendências de Conformidade
      </h1>
    </div>
    <div class="space-y-4">
      <p class="text-xs text-studio-muted leading-relaxed">
        Os itens abaixo não impedem a geração do PDF, mas podem comprometer a qualidade profissional do relatório.
      </p>
      <ul class="space-y-2 border-t border-studio-border pt-4 max-h-[60vh] overflow-y-auto">
        ${e.map(e=>`
          <li class="flex items-start gap-3 text-sm text-studio-muted">
            <span class="text-amber-500 mt-0.5">▸</span>
            <span class="flex-1">${w(e.message)}</span>
          </li>
        `).join(``)}
      </ul>
    </div>
    <div slot="footer" class="flex justify-end">
      <button class="btn btn-primary" onclick="this.closest('ui-modal').close()">
        Entendido
      </button>
    </div>
  `,document.body.appendChild(t),t.open(),t.addEventListener(`close`,()=>{t.remove()})}render(){let{config:e,sections:t,meta:n,ui:r}=i.state;if(this.className=`panel-preview`,e.primaryColor&&document.documentElement.style.setProperty(`--report-primary-color`,e.primaryColor),t.length===0){this.innerHTML=this.renderPage(e,`
        <div class="flex flex-col items-center justify-center py-10 opacity-20 border-2 border-dashed border-paper-text/20 rounded-xl">
          <span class="text-6xl mb-4"><ui-icon name="pencil-ruler" size="256"></ui-icon></span>
          <p class="font-bold uppercase tracking-widest text-center text-paper-text">Inicie o relatório adicionando<br>módulos no painel lateral</p>
        </div>
      `,1,1,!0,``,r.previewScale);return}let a=[],o=``;t.forEach(e=>{let t=e.data;if(e.type===`pagebreak`){a.push(o),o=``;return}let n=``;switch(e.type){case`equipment`:n=`
            <div class="grid grid-cols-2 gap-y-4 gap-x-8 bg-slate-50 p-6 rounded border border-slate-200 equipment-box">
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Descrição</label><p class="text-sm font-semibold leading-tight">${w(t.description||`-`)}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Modelo</label><p class="text-sm font-semibold leading-tight">${w(t.model||`-`)}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Patrimônio</label><p class="text-sm font-semibold leading-tight">${w(t.patrimony||`-`)}</p></div>
              <div><label class="block text-[10px] font-bold report-text-primary uppercase mb-1">Responsável</label><p class="text-sm font-semibold leading-tight">${w(t.owner||`-`)}</p></div>
            </div>
          `;break;case`text`:n=`<div class="text-sm text-paper-text leading-relaxed text-justify whitespace-pre-wrap wrap-break-word">${this.parser.parse(t.content||`...`)}</div>`;break;case`bullets`:n=`
            <ul class="list-disc list-inside space-y-2 text-sm text-paper-text">
              ${t.items.filter(e=>e.trim()).map(e=>`<li class="wrap-break-word">${w(e)}</li>`).join(``)||`<li class="italic text-paper-text/40">Lista vazia</li>`}
            </ul>
          `;break;case`images`:n=`
            <div class="grid gap-4" style="grid-template-columns: repeat(${t.columns}, 1fr)">
              ${t.images.map(e=>`
                <div class="flex flex-col gap-2 break-inside-avoid overflow-hidden">
                  <div class="w-full bg-slate-50 rounded-sm border border-paper-desk flex items-center justify-center overflow-hidden" style="height: ${t.columns===1?`110mm`:t.columns===2?`65mm`:`45mm`}">
                    <img src="${e.src}" class="w-full h-full object-contain" />
                  </div>
                  ${e.caption?`
                    <p class="text-[9px] text-center italic text-paper-text/60 leading-tight break-all whitespace-normal px-1">
                      ${w(e.caption)}
                    </p>`:``}
                </div>
              `).join(``)}
            </div>
          `;break}o+=`
        <div class="preview-section">
          ${t.title?`<h3 class="report-text-primary font-bold uppercase text-[10px] tracking-widest mb-4 border-b report-border-primary pb-1">${w(t.title)}</h3>`:``}
          ${n}
        </div>
      `}),o&&a.push(o);let s=n.createdAt.toString(36).toUpperCase();this.innerHTML=`
      <div class="preview-actions flex flex-col gap-4 mb-8 sticky top-0 z-20 bg-paper-desk/80 backdrop-blur-xs p-4 rounded-lg shadow-sm w-full max-w-[210mm]">
        <div class="flex justify-between gap-4 items-center w-full">
          <div class="flex justify-between items-center gap-2">
            <app-button variant="primary" id="btn-print-action" title="Selecione 'Salvar como PDF'
Configure:
  - Tamanho do papel: A4
  - Margens: Nenhuma (None)
  - Gráficos de fundo: Ativado ✅ (para preservar cores)"><ui-icon name="printer" size="sm"></ui-icon> PDF</app-button>
            <div class="flex items-center bg-white/50 rounded-md border border-paper-desk p-1 gap-1">
              <button id="zoom-out" class="p-1 w-8 h-8 hover:bg-white text-paper-text/30 hover:text-paper-text rounded transition-colors" title="Zoom Out"><ui-icon name="minus" size="sm"></ui-icon></button>
              
              <span class="text-[10px] font-mono font-bold w-12 text-center text-paper-text/60">${Math.round(r.previewScale*100)}%</span>
              <button id="zoom-in" class="p-1 w-8 h-8 hover:bg-white text-paper-text/30 hover:text-paper-text hover:scale-110 rounded transition-colors" title="Zoom In"><ui-icon name="plus" size="sm"></ui-icon></button>
              
              <button id="zoom-reset" class="text-[10px] px-1 w-8 h-8 text-paper-text/30 hover:text-paper-text hover:scale-110 hover:bg-white rounded transition-colors font-bold" title="Reset Zoom"><ui-icon name="shrink" size="sm"></ui-icon></button>
            </div>
          </div>
          <div class="flex items-center gap-2 text-paper-text/40 text-[10px] font-mono">
            <span>A4 210x297mm</span>
            <span class="w-1 h-1 rounded-full bg-paper-text/20"></span>
            <span>ID: ${s}</span>
          </div>
        </div>
        <div id="overflow-alert" class="hidden animate-pulse bg-accent-danger/10 text-accent-danger border border-accent-danger/20 p-2 rounded text-[10px] font-bold uppercase tracking-widest text-center">
          <ui-icon name="alert-triangle" size="md" class="shrink-0"></ui-icon> Conteúdo excedeu o limite. Use "Quebra de Página".
        </div>
        <div id="validation-alert" class="hidden bg-amber-500/10 text-amber-600 animate-pulse border border-amber-500/20 p-2 rounded text-[10px] font-bold uppercase tracking-widest">
          <!-- Conteúdo gerado dinamicamente -->
        </div>
      </div>
      <!-- O HUD Trigger (Nosso FAB Técnico) -->
      <button class="fab-hud" onclick="document.getElementById('modal-system-help').open()">
        <!-- Container fixo do ícone (Garante centro perfeito) -->
        <div class="hud-icon-wrapper">
          <ui-icon name="book-open" size="sm"></ui-icon>
        </div>
        
        <!-- Container do Texto e Tecla -->
        <div class="hud-content">
          <span class="hud-text">Manual do Sistema</span>
          <kbd class="hud-key">F1</kbd>
        </div>
      </button>
      <div class="sheets-wrapper flex flex-col items-center">
        ${a.map((t,n)=>this.renderPage(e,t,n+1,a.length,n===0,s,r.previewScale)).join(``)}
      </div>
      ${this.renderHelpModal()}
    `,this.querySelector(`#btn-print-action`)?.addEventListener(`click`,()=>window.print()),this.querySelector(`#zoom-in`)?.addEventListener(`click`,()=>i.setPreviewScale(r.previewScale+.1)),this.querySelector(`#zoom-out`)?.addEventListener(`click`,()=>i.setPreviewScale(r.previewScale-.1)),this.querySelector(`#zoom-reset`)?.addEventListener(`click`,()=>i.setPreviewScale(1)),setTimeout(()=>this.checkOverflow(),150)}renderPage(e,t,n,r,i,a,o=1){let s=e.reportNumber?`REF: ${w(e.reportNumber)} • ${a}`:`TRC: ${a}`;return`
      <div class="sheet-a4 transition-all duration-300 origin-top" style="transform: scale(${o}); margin-bottom: calc(-297mm * ${1-o} + 10mm)">
        ${i?`
          <header class="flex justify-between items-start border-b-4 report-border-primary pb-6 mb-8">
            <div class="flex gap-6 items-start">
              ${e.logo?`<img src="${e.logo}" class="h-16 w-auto max-w-[40mm] object-contain" />`:``}
              <div>
                <h1 class="text-2xl font-bold text-paper-text uppercase tracking-tight leading-tight">${w(e.title)}</h1>
                <p class="text-md font-medium text-paper-text/80">${w(e.company||`Empresa não informada`)}</p>
              </div>
            </div>
            <div class="text-right font-mono text-[10px] text-paper-text/60 space-y-1">
              <p class="font-bold text-paper-text">Nº: ${w(e.reportNumber||`---`)}</p>
              <p>DATA: ${w(e.reportDate)}</p>
            </div>
          </header>
        `:`
          <header class="flex justify-between items-center border-b border-paper-desk/50 pb-2 mb-6 opacity-40">
            <span class="text-[9px] font-bold uppercase tracking-widest">${w(e.title)}</span>
            <span class="text-[9px] font-mono">${s}</span>
          </header>
        `}

        <div class="preview-content overflow-hidden" style="max-height: ${i?`210mm`:`250mm`};">
          ${t}
        </div>

        <footer class="mt-20 flex justify-between items-end border-t border-paper-desk pt-4 absolute bottom-[20mm] left-[20mm] right-[20mm]">
           <div class="flex flex-col">
             <p class="text-[8px] font-mono text-paper-text/30 italic uppercase tracking-wider">Aura Tech Evidence Log | Authenticity Verified</p>
             <p class="text-[7px] font-mono text-paper-text/20 uppercase">${s}</p>
           </div>
           <p class="text-[8px] font-mono text-paper-text/30 uppercase tracking-widest text-right whitespace-nowrap">Page ${n} / ${r}</p>
        </footer>
      </div>
    `}renderHelpModal(){return`
    <ui-modal id="modal-system-help" size="xl" animation="scale">
      <div slot="header" class="flex items-center gap-3 text-accent-cyan font-mono uppercase tracking-widest text-sm">
        <ui-icon name="book-open" size="md"></ui-icon>
        Documentação do Sistema
      </div>

      <!-- Layout Split: Sidebar (Índice) + Conteúdo -->
      <div class="flex flex-col md:flex-row gap-8 h-[65vh]">
        
        <!-- Sidebar Navegação -->
        <div class="w-full md:w-64 shrink-0 flex flex-col gap-2 border-b md:border-b-0 md:border-r border-studio-border pb-4 md:pb-0 md:pr-6">
          <div class="label-technical mb-2">Índice Operacional</div>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-studio-elevated border border-studio-border text-white text-sm text-left transition-colors hover:border-accent-primary" href="#help-tutorial">
            <ui-icon name="cpu" size="sm"></ui-icon> Operação Base
          </a>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-transparent border border-transparent text-studio-muted text-sm text-left transition-colors hover:bg-studio-elevated hover:text-white" href="#help-faq">
            <ui-icon name="stethoscope" size="sm"></ui-icon> Diagnóstico (FAQ)
          </a>
          
          <a class="flex items-center gap-3 p-3 rounded-md bg-transparent border border-transparent text-studio-muted text-sm text-left transition-colors hover:bg-studio-elevated hover:text-white" href="#help-tips">
            <ui-icon name="sparkles" size="sm"></ui-icon> Telemetria (Dicas)
          </a>
        </div>

        <!-- Área de Leitura (Scrollable) -->
        <div class="flex-1 overflow-y-auto pr-4 scroll-smooth" id="help-scroll-area">
          
          <!-- Seção 1: Tutorial -->
          <section id="help-tutorial" class="mb-16">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">01.</span> OPERAÇÃO BASE
            </h3>
            ${X.tutorialSection.map(e=>`
    <div class="mb-8 group">
      <h4 class="flex items-center gap-2 text-white font-mono text-sm uppercase tracking-wider mb-3">
        <ui-icon name="command-line" size="sm" class="text-accent-primary"></ui-icon>
        ${e.id}. ${e.title}
      </h4>
      <div class="pl-6 border-l-2 border-studio-border group-hover:border-accent-primary transition-colors duration-300">
        <p class="text-studio-muted text-sm leading-relaxed whitespace-pre-line">${e.content}</p>
      </div>
    </div>
  `).join(``)}
          </section>

          <!-- Seção 2: FAQ -->
          <section id="help-faq" class="mb-16">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">02.</span> DIAGNÓSTICO (FAQ)
            </h3>
            ${X.faqItens.map(e=>`
    <div class="bg-studio-base p-4 rounded-lg border border-studio-border mb-4 hover:border-studio-muted transition-colors">
      <div class="flex items-start gap-3 mb-2">
        <ui-icon name="alert-circle" size="sm" class="text-accent-danger shrink-0 mt-0.5"></ui-icon>
        <span class="text-white text-sm font-medium leading-snug">${e.q}</span>
      </div>
      <div class="flex items-start gap-3 pl-8">
        <ui-icon name="corner-down-right" size="sm" class="text-accent-cyan shrink-0"></ui-icon>
        <span class="text-studio-muted text-sm leading-relaxed">${e.a}</span>
      </div>
    </div>
  `).join(``)}
          </section>

          <!-- Seção 3: Pro Tips -->
          <section id="help-tips" class="mb-8">
            <h3 class="text-xl font-bold text-white mb-8 font-mono border-b border-studio-border pb-3 flex items-center gap-2">
              <span class="text-accent-primary">03.</span> TELEMETRIA AVANÇADA
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              ${X.proTips.map(e=>`
    <div class="bg-studio-elevated p-4 rounded-lg border border-studio-border hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col gap-3">
      <div class="w-8 h-8 rounded-full bg-studio-base border border-studio-border flex items-center justify-center text-accent-cyan shadow-inner">
        <ui-icon name="${e.icon||`sparkles`}" size="sm"></ui-icon>
      </div>
      <p class="text-studio-muted text-xs leading-relaxed">${e.tip}</p>
    </div>
  `).join(``)}
            </div>
          </section>

        </div>
      </div>

      <!-- Footer do Modal -->
      <div slot="footer" class="flex justify-between items-center w-full">
        <div class="text-studio-muted text-xs font-mono">
          Aura Technical OS v4.0.0
        </div>
        <button class="btn btn-primary" onclick="document.getElementById('modal-system-help').close()">
          <ui-icon name="check-circle" size="sm"></ui-icon> Compreendido
        </button>
      </div>
    </ui-modal>
  `}};customElements.define(`preview-panel`,se);var ce=class extends HTMLElement{canvas=null;ctx=null;isDrawing=!1;startX=0;startY=0;currentTool=`brush`;currentColor=`#E11D48`;currentThickness=6;currentZoom=1;baseWidth=0;baseHeight=0;imageSrc=``;sectionId=``;imageIndex=-1;undoStack=[];MAX_UNDO=15;open(e,t,n){this.imageSrc=e,this.sectionId=t,this.imageIndex=n,this.undoStack=[],this.render(),this.querySelector(`#modal-evidence-editor`).open(),this.initCanvas()}initCanvas(){let e=new Image;e.src=this.imageSrc,e.onload=()=>{if(this.canvas=this.querySelector(`canvas`),!this.canvas)return;this.baseWidth=e.width,this.baseHeight=e.height,this.canvas.width=this.baseWidth,this.canvas.height=this.baseHeight,this.ctx=this.canvas.getContext(`2d`,{willReadFrequently:!0}),this.ctx?.drawImage(e,0,0);let t=this.querySelector(`#canvas-scroll-container`);if(t){let e=(t.clientWidth-64)/this.baseWidth,n=(t.clientHeight-64)/this.baseHeight;this.currentZoom=Math.min(e,n,1)}this.saveToUndo(),this.setupDrawingEvents(),this.applyDisplayZoom()}}saveToUndo(){if(!this.ctx||!this.canvas)return;let e=this.ctx.getImageData(0,0,this.canvas.width,this.canvas.height);this.undoStack.push(e),this.undoStack.length>this.MAX_UNDO&&this.undoStack.shift()}undo(){if(this.undoStack.length<=1||!this.ctx)return;this.undoStack.pop();let e=this.undoStack[this.undoStack.length-1];this.ctx.putImageData(e,0,0),h.show({message:`Ação desfeita`,type:`info`,duration:800})}setupDrawingEvents(){if(!this.canvas||!this.ctx)return;let e=e=>{let t=this.canvas.getBoundingClientRect(),n=this.canvas.width/t.width,r=this.canvas.height/t.height,i=e.clientX||e.touches?.[0].clientX,a=e.clientY||e.touches?.[0].clientY;return{x:(i-t.left)*n,y:(a-t.top)*r}},t=t=>{this.isDrawing=!0;let{x:n,y:r}=e(t);this.startX=n,this.startY=r,this.currentTool===`brush`&&(this.ctx.beginPath(),this.ctx.moveTo(n,r))},n=t=>{if(!this.isDrawing)return;let{x:n,y:r}=e(t);if(this.currentTool===`brush`)this.drawBrush(n,r);else{let e=this.undoStack[this.undoStack.length-1];this.ctx.putImageData(e,0,0),this.setupStyle(),this.currentTool===`circle`&&this.drawCircle(this.startX,this.startY,n,r),this.currentTool===`arrow`&&this.drawArrow(this.startX,this.startY,n,r)}},r=()=>{this.isDrawing&&(this.isDrawing=!1,this.saveToUndo())};this.canvas.onmousedown=t,this.canvas.onmousemove=n,window.onmouseup=r,this.canvas.ontouchstart=e=>{e.preventDefault(),t(e)},this.canvas.ontouchmove=e=>{e.preventDefault(),n(e)},this.canvas.ontouchend=r}setupStyle(){let e=this.canvas.width/800;this.ctx.strokeStyle=this.currentColor,this.ctx.lineWidth=this.currentThickness*e,this.ctx.lineCap=`round`,this.ctx.lineJoin=`round`}drawBrush(e,t){this.setupStyle(),this.ctx.lineTo(e,t),this.ctx.stroke()}drawCircle(e,t,n,r){let i=Math.sqrt((n-e)**2+(r-t)**2);this.ctx.beginPath(),this.ctx.arc(e,t,i,0,2*Math.PI),this.ctx.stroke()}drawArrow(e,t,n,r){let i=this.ctx.lineWidth*4,a=Math.atan2(r-t,n-e);this.ctx.beginPath(),this.ctx.moveTo(e,t),this.ctx.lineTo(n,r),this.ctx.lineTo(n-i*Math.cos(a-Math.PI/6),r-i*Math.sin(a-Math.PI/6)),this.ctx.moveTo(n,r),this.ctx.lineTo(n-i*Math.cos(a+Math.PI/6),r-i*Math.sin(a+Math.PI/6)),this.ctx.stroke()}rotate(){if(!this.canvas||!this.ctx)return;let e=document.createElement(`canvas`);e.width=this.canvas.height,e.height=this.canvas.width;let t=e.getContext(`2d`);t.translate(e.width/2,e.height/2),t.rotate(Math.PI/2),t.drawImage(this.canvas,-this.canvas.width/2,-this.canvas.height/2),this.canvas.width=e.width,this.canvas.height=e.height,this.baseWidth=this.canvas.width,this.baseHeight=this.canvas.height,this.ctx.drawImage(e,0,0),this.saveToUndo(),this.applyDisplayZoom()}applyDisplayZoom(){this.canvas&&(this.canvas.style.width=`${this.baseWidth*this.currentZoom}px`,this.canvas.style.height=`${this.baseHeight*this.currentZoom}px`,this.querySelector(`#zoom-val`).textContent=`${Math.round(this.currentZoom*100)}%`)}async save(){if(!this.canvas||!this.ctx)return;let e=i.state.meta,t=i.state.config,n=e.createdAt.toString(36).toUpperCase(),r=t.reportNumber?`REF: ${w(t.reportNumber)} • ${n}`:`TRC: ${n}`,a=this.querySelector(`#check-watermark`)?.checked,o=this.querySelector(`#meta-location`),s=this.querySelector(`#meta-date`),c=o?.getAttribute(`value`)||``,l=s?.getAttribute(`value`)||``;if(a){this.ctx.fillStyle=`rgba(0,0,0,0.4)`;let e=Math.max(this.canvas.width/40,14),t=e*2.2;this.ctx.fillRect(0,this.canvas.height-t,this.canvas.width,t),this.ctx.fillStyle=`rgba(255,255,255,0.4)`,this.ctx.font=`bold ${e}px monospace`;let n=`${r} | DATA: ${l} | LOCAL: ${c.toUpperCase()||`NÃO INFORMADO`}`;this.ctx.fillText(n,e,this.canvas.height-e*.7)}let u=this.canvas.toDataURL(`image/jpeg`,.8),d=i.state.sections.find(e=>e.id===this.sectionId);if(d&&d.type===`images`){let e=[...d.data.images];e[this.imageIndex]={...e[this.imageIndex],src:u,location:c,date:l},i.updateSectionData(this.sectionId,{images:e}),h.show({message:`Evidência atualizada!`,type:`success`})}this.querySelector(`#modal-evidence-editor`).close()}render(){let e=(i.state.sections.find(e=>e.id===this.sectionId)?.data)?.images[this.imageIndex]||{};this.innerHTML=`
      <ui-modal id="modal-evidence-editor" size="lg" animation="scale">
      <!-- Header Técnico (Mono) -->
      <h2 slot="header" class="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-tight font-mono">
        <span class="text-accent-primary"><ui-icon name="edit" size="md"></ui-icon></span> Estúdio de Evidências
      </h2>

      <div class="flex flex-col gap-4">
        <!-- Toolbar Superior (Bandeja principal afundada) -->
        <div class="flex flex-wrap items-center justify-between gap-4 bg-studio-base p-2 rounded-lg border border-studio-border shadow-inner">
          
          <!-- Bandeja de Ferramentas de Desenho -->
          <div class="flex items-center gap-1 bg-studio-elevated p-1 rounded-md border border-studio-border" id="tools-group">
            <!-- Substitua a lógica de classe pela atribuição de .active ou data-active="true" via JS -->
            <button class="btn-tool ${this.currentTool===`brush`?`active`:``}" data-tool="brush" title="Pincel"><ui-icon name="pencil" size="sm"></ui-icon></button>
            <button class="btn-tool ${this.currentTool===`arrow`?`active`:``}" data-tool="arrow" title="Seta"><ui-icon name="arrow" size="sm"></ui-icon></button>
            <button class="btn-tool ${this.currentTool===`circle`?`active`:``}" data-tool="circle" title="Círculo"><ui-icon name="circle" size="sm"></ui-icon></button>
            
            <div class="w-px h-5 bg-studio-border mx-1"></div> <!-- Divisor -->
            
            <button class="btn-tool" id="action-rotate" title="Girar 90°"><ui-icon name="rotate-ccw" size="sm"></ui-icon></button>
            <button class="btn-tool" id="action-undo" title="Desfazer"><ui-icon name="undo" size="sm"></ui-icon></button>
          </div>

          <!-- Bandeja de Controles Secundários -->
          <div class="flex items-center gap-3">
            
            <!-- Espessura (Select embutido de forma técnica) -->
            <div class="flex items-center bg-studio-elevated border border-studio-border rounded-md overflow-hidden">
              <span class="px-2 text-[10px] text-studio-muted font-mono uppercase"><ui-icon name="pencil" size="xs"></ui-icon> Lápis</span>
              <select id="select-thickness" class="bg-studio-elevated text-white text-[11px] font-mono pl-1 pr-2 py-1.5 outline-none cursor-pointer border-l border-studio-border">
                <option value="3">FINO</option>
                <option value="6" selected>MÉDIO</option>
                <option value="12">GROSSO</option>
                <option value="24">EXTRA</option>
              </select>
            </div>

            <!-- Cores (Ring-offset para não encostar na cor) -->
            <div class="flex items-center gap-1.5 bg-studio-elevated p-1.5 rounded-md border border-studio-border" id="colors-group">
              <button class="w-5 h-5 rounded-full bg-[#E11D48] ${this.currentColor===`#E11D48`?`ring-2 ring-white ring-offset-2 ring-offset-studio-elevated`:``}" data-color="#E11D48"></button>
              <button class="w-5 h-5 rounded-full bg-[#F59E0B] ${this.currentColor===`#F59E0B`?`ring-2 ring-white ring-offset-2 ring-offset-studio-elevated`:``}" data-color="#F59E0B"></button>
              <button class="w-5 h-5 rounded-full bg-[#06B6D4] ${this.currentColor===`#06B6D4`?`ring-2 ring-white ring-offset-2 ring-offset-studio-elevated`:``}" data-color="#06B6D4"></button>
            </div>

            <!-- Zoom -->
            <div class="flex items-center gap-1 bg-studio-elevated p-1 rounded-md border border-studio-border">
              <button id="zoom-out-editor" class="btn-tool w-6! h-6!"><ui-icon name="minus" size="sm"></ui-icon></button>
              <span id="zoom-val" class="text-[10px] font-mono w-10 text-center text-white">100%</span>
              <button id="zoom-in-editor" class="btn-tool w-6! h-6!"><ui-icon name="plus" size="sm"></ui-icon></button>
            </div>
          </div>
        </div>

        <!-- Canvas Container (Com Dot Grid de Engenharia) -->
        <div id="canvas-scroll-container" class="canvas-workspace rounded-lg border border-studio-border overflow-auto h-[50vh] relative flex items-center justify-center">
          <!-- A div wrapper ao redor do canvas ajuda se precisar aplicar zoom com transform no JS -->
          <div class="inline-block p-4">
            <!-- O Canvas ganha ring preto para separar bem do grid -->
            <canvas class="cursor-crosshair shadow-2xl bg-white block ring-1 ring-black"></canvas>
          </div>
        </div>

        <!-- Metadados e Marca d'água -->
        <div class="bg-studio-elevated p-4 rounded-lg border border-studio-border space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <app-input label-icon="map-pin" label="Localização" id="meta-location" value="${w(e.location||``)}" placeholder="Ex: Setor A"></app-input>
            <app-input label-icon="calendar" label="Data" id="meta-date" type="date" value="${e.date||new Date().toISOString().split(`T`)[0]}"></app-input>
          </div>
          <div class="flex items-center gap-3 bg-studio-base p-3 rounded border border-studio-border">
            <!-- Tailwind v4 inline accent color se necessário: style="accent-color: var(--color-accent-primary)" -->
            <input type="checkbox" id="check-watermark" style="accent-color: var(--color-accent-primary);" class="w-4 h-4 rounded cursor-pointer" />
            <label for="check-watermark" class="label-technical mb-0! cursor-pointer hover:text-white transition-colors">
              Gravar metadados permanentemente na imagem (Marca d'água)
            </label>
          </div>
        </div>
      </div>

      <div slot="footer" class="flex justify-end gap-3">
        <button class="btn btn-outline" id="btn-close-modal">Cancelar</button>
        <button class="btn btn-primary" id="btn-save-final">Salvar Evidência</button>
      </div>
    </ui-modal>
    `,this.setupUIEvents()}setupUIEvents(){this.querySelector(`#tools-group`)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-tool]`)?.dataset.tool;t&&(this.currentTool=t,this.querySelectorAll(`[data-tool]`).forEach(e=>e.classList.remove(`ring-2`,`ring-accent-primary`)),e.target.closest(`[data-tool]`).classList.add(`ring-2`,`ring-accent-primary`))}),this.querySelector(`#colors-group`)?.addEventListener(`click`,e=>{let t=e.target.dataset.color;t&&(this.currentColor=t,this.querySelectorAll(`[data-color]`).forEach(e=>e.classList.remove(`ring-2`,`ring-white`)),e.target.classList.add(`ring-2`,`ring-white`))}),this.querySelector(`#select-thickness`)?.addEventListener(`change`,e=>{this.currentThickness=parseInt(e.target.value)}),this.querySelector(`#action-rotate`)?.addEventListener(`click`,()=>this.rotate()),this.querySelector(`#action-undo`)?.addEventListener(`click`,()=>this.undo()),this.querySelector(`#zoom-in-editor`)?.addEventListener(`click`,()=>{this.currentZoom+=.2,this.applyDisplayZoom()}),this.querySelector(`#zoom-out-editor`)?.addEventListener(`click`,()=>{this.currentZoom=Math.max(.1,this.currentZoom-.2),this.applyDisplayZoom()}),this.querySelector(`#btn-save-final`)?.addEventListener(`click`,()=>this.save()),this.querySelector(`#btn-close-modal`)?.addEventListener(`click`,()=>this.querySelector(`#modal-evidence-editor`).close()),this.addEventListener(`app-input`,e=>{e.target.setAttribute(`value`,e.detail.value)})}};customElements.define(`image-editor-modal`,ce);var le=class extends HTMLElement{connectedCallback(){this.className=`layout-container`,this.render(),e.on(r.REPORT_UPDATED,()=>this.updateLayout())}updateLayout(){let e=this.querySelector(`preview-panel`),t=this.querySelector(`editor-panel`);e&&t&&(i.state.ui.previewVisible?(e.classList.remove(`collapsed`),t.classList.remove(`full-width`)):(e.classList.add(`collapsed`),t.classList.add(`full-width`)))}render(){this.innerHTML=`
      <editor-panel></editor-panel>
      <preview-panel></preview-panel>
      <image-editor-modal id="global-image-editor"></image-editor-modal>
    `,this.updateLayout()}};customElements.define(`main-layout`,le);var ue=`modulepreload`,de=function(e){return`/relatorio-fotografico/`+e},Z={},fe=function(e,t,n){let r=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),i=document.querySelector(`meta[property=csp-nonce]`),a=i?.nonce||i?.getAttribute(`nonce`);function o(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}r=o(t.map(t=>{if(t=de(t,n),t in Z)return;Z[t]=!0;let r=t.endsWith(`.css`),i=r?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let i=e[n];if(i.href===t&&(!r||i.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${i}`))return;let o=document.createElement(`link`);if(o.rel=r?`stylesheet`:ue,r||(o.as=`script`),o.crossOrigin=``,o.href=t,a&&o.setAttribute(`nonce`,a),document.head.appendChild(o),r)return new Promise((e,n)=>{o.addEventListener(`load`,e),o.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function i(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return r.then(t=>{for(let e of t||[])e.status===`rejected`&&i(e.reason);return e().catch(i)})},pe=`false`,me=`false`,Q=pe===`true`,he=me===`true`;function ge(e={}){let{immediate:t=!1,onNeedRefresh:n,onOfflineReady:r,onRegistered:i,onRegisteredSW:a,onRegisterError:o}=e,s,c,l,u=async(e=!0)=>{await c,Q||l?.()};async function d(){if(`serviceWorker`in navigator){if(s=await fe(async()=>{let{Workbox:e}=await import(`./workbox-window.prod.es5-Bq4GJJid.js`);return{Workbox:e}},[]).then(({Workbox:e})=>new e(`/relatorio-fotografico/sw.js`,{scope:`/relatorio-fotografico/`,type:`classic`})).catch(e=>{o?.(e)}),!s)return;if(l=()=>{s?.messageSkipWaiting()},!he)if(Q)s.addEventListener(`activated`,e=>{(e.isUpdate||e.isExternal)&&window.location.reload()}),s.addEventListener(`installed`,e=>{e.isUpdate||r?.()});else{let e=!1,t=()=>{e=!0,s?.addEventListener(`controlling`,e=>{e.isUpdate&&window.location.reload()}),n?.()};s.addEventListener(`installed`,n=>{n.isUpdate===void 0?n.isExternal===void 0?!e&&r?.():n.isExternal?t():!e&&r?.():n.isUpdate||r?.()}),s.addEventListener(`waiting`,t)}s.register({immediate:t}).then(e=>{a?a(`/relatorio-fotografico/sw.js`,e):i?.(e)}).catch(e=>{o?.(e)})}}return c=d(),u}var $=new class{styles=`
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
  `;constructor(){this.injectStyles()}injectStyles(){let e=document.createElement(`style`);e.textContent=this.styles,document.head.appendChild(e)}getIconForType(e){let t={update:`🔄`,offline:`📡`,error:`❌`,default:`📱`};return t[e]||t.default}createNotification(e,t,n,r){let i=document.createElement(`div`);return i.className=`pwa-notification fixed top-6 right-6 max-w-sm p-5 rounded-lg shadow-2xl z-[200] font-sans text-sm border border-studio-border backdrop-blur-xl ${{update:`bg-studio-base/90 border-accent-primary text-white`,offline:`bg-studio-base/90 border-accent-cyan text-white`,error:`bg-accent-danger/20 border-accent-danger text-white`}[e]||`bg-studio-elevated text-white`}`,i.innerHTML=`
      <div class="flex items-center gap-3 mb-2 font-bold uppercase tracking-wider text-[11px] font-mono text-studio-muted">
        <span>${this.getIconForType(e)}</span>
        <span>${t}</span>
      </div>
      <div class="mb-4 text-studio-muted leading-relaxed">${n}</div>
      ${r?`
        <div class="flex gap-2 justify-end">
          ${r.map((e,t)=>`
            <button class="btn ${e.primary?`btn-primary`:`btn-outline`} py-1! px-3! text-[10px]! pwa-btn-${t}">
              ${e.text}
            </button>
          `).join(``)}
        </div>
      `:``}
    `,r&&r.forEach((e,t)=>{i.querySelector(`.pwa-btn-${t}`)?.addEventListener(`click`,()=>{e.action(),this.removeNotification(i)})}),r||setTimeout(()=>this.removeNotification(i),8e3),document.body.appendChild(i),i}removeNotification(e){e.classList.add(`removing`),setTimeout(()=>e.remove(),300)}showUpdate(e){this.createNotification(`update`,`Sistema Atualizado`,`Uma nova versão do Aura Estúdio está disponível. Deseja atualizar?`,[{text:`Agora`,action:e,primary:!0},{text:`Depois`,action:()=>{}}])}showOffline(){this.createNotification(`offline`,`Modo Offline Ativo`,`O app está pronto para ser usado sem internet.`)}},_e=ge({immediate:!0,onNeedRefresh(){$.showUpdate(()=>_e(!0))},onOfflineReady(){$.showOffline()}});async function ve(){n.info(`App`,`Iniciando Aura Technical v2.0...`),await o.initialize(),ye(),h.show({message:`Bem-vindo ao Aura Technical v2.0!`,type:`info`,duration:5e3}),setTimeout(be,5e3)}function ye(){let e=document.querySelector(`#app`);e.innerHTML=`<main-layout></main-layout>`}var be=()=>{let e=document.getElementById(`modal-system-help`),t=`aura_studio_intro_seen_v1`;!localStorage.getItem(t)&&e&&(e?.open(),localStorage.setItem(t,`true`))};ve();