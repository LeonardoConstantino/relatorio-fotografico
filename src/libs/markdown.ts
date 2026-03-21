/**
 * Parser Markdown para HTML
 * Converte sintaxe Markdown básica em HTML com classes CSS
 */

// Interface para o logger (permite console ou implementação customizada)
interface Logger {
  info(context: string, message: string): void;
  warn?(context: string, message: string): void;
  error?(context: string, message: string): void;
}

// Tipo para funções de replacement customizadas
type ReplacementFunction = (match: string, ...args: any[]) => string;

// Interface para regras de conversão
interface ConversionRule {
  name: string;
  pattern: RegExp;
  replacement: string | ReplacementFunction;
}

class MarkdownParser {
  private readonly logger: Logger;
  private readonly MAX_INPUT_SIZE: number = 1_000_000; // 1MB
  private readonly rules: readonly ConversionRule[];

  constructor(logger?: Logger) {
    this.logger = logger || console;

    // Freeze rules para evitar mutações externas
    // IMPORTANTE: Ordem específica para evitar conflitos:
    // 1. Headers (mais específico → menos específico)
    // 2. Blocos de código (antes de inline code)
    // 3. Formatação inline (bold/italic antes de outros elementos)
    // 4. Links e imagens (após formatação inline)
    this.rules = Object.freeze([
      // Headers: Do mais específico ao menos específico para evitar match incorreto
      // Ex: "######" deve processar antes de "#" para não capturar parcialmente
      {
        name: 'header6',
        pattern: /^######\s+(.+)$/gm,
        replacement: '<h6 class="md-h6">$1</h6>',
      },
      {
        name: 'header5',
        pattern: /^#####\s+(.+)$/gm,
        replacement: '<h5 class="md-h5">$1</h5>',
      },
      {
        name: 'header4',
        pattern: /^####\s+(.+)$/gm,
        replacement: '<h4 class="md-h4">$1</h4>',
      },
      {
        name: 'header3',
        pattern: /^###\s+(.+)$/gm,
        replacement: '<h3 class="md-h3">$1</h3>',
      },
      {
        name: 'header2',
        pattern: /^##\s+(.+)$/gm,
        replacement: '<h2 class="md-h2">$1</h2>',
      },
      {
        name: 'header1',
        pattern: /^#\s+(.+)$/gm,
        replacement: '<h1 class="md-h1">$1</h1>',
      },

      // Blocos de código com suporte a linguagem
      // Processa antes de inline code para evitar conflito com backticks
      {
        name: 'codeBlockLang',
        pattern: /```(\w+)?\n([\s\S]*?)```/g,
        replacement: (lang: string, code: string): string => {
          const langClass = lang ? ` language-${this._escapeHtml(lang)}` : '';
          return `<pre class="md-code-block"><code class="${langClass}">${this._escapeHtml(code.trim())}</code></pre>`;
        },
      },

      // Inline code - escapa HTML para segurança
      {
        name: 'inlineCode',
        pattern: /`([^`]+)`/g,
        replacement: (code: string): string =>
          `<code class="md-inline-code">${this._escapeHtml(code)}</code>`,
      },

      // Bold e Italic: Ordem correta para evitar captura incorreta
      // *** deve processar antes de ** e *
      {
        name: 'boldItalic',
        pattern: /\*\*\*(.+?)\*\*\*/g,
        replacement: '<strong><em class="md-bold-italic">$1</em></strong>',
      },
      {
        name: 'bold',
        pattern: /\*\*(.+?)\*\*/g,
        replacement: '<strong class="md-bold">$1</strong>',
      },
      {
        name: 'italic',
        pattern: /\*(.+?)\*/g,
        replacement: '<em class="md-italic">$1</em>',
      },

      // Links e Imagens - CORRIGIDO: Escapa tanto URL quanto texto para prevenir XSS
      {
        name: 'image',
        pattern: /!\[([^\]]*)\]\(([^)]+)\)/g,
        replacement: (alt: string, url: string): string =>
          `<img src="${this._escapeHtml(url)}" alt="${this._escapeHtml(alt)}" class="md-image">`,
      },
      {
        name: 'link',
        pattern: /\[([^\]]+)\]\(([^)]+)\)/g,
        replacement: (text: string, url: string): string =>
          `<a href="${this._escapeHtml(url)}" class="md-link">${this._escapeHtml(text)}</a>`,
      },

      // Blockquote - Marca linhas individuais (agrupamento posterior em _wrapBlockquotes)
      {
        name: 'blockquote',
        pattern: /^>\s+(.+)$/gm,
        replacement: '<blockquote class="md-blockquote">$1</blockquote>',
      },

      // Linha horizontal
      { name: 'hr', pattern: /^---$/gm, replacement: '<hr class="md-hr">' },

      // Tabelas: marca cada linha com data-type para agrupamento posterior em _wrapTables
      // Linha separadora (|---|---| ou |:---|:---:|---:|) é marcada como "table-separator"
      // e será usada apenas para detectar o bloco — não vira HTML visível
      {
        name: 'tableSeparator',
        pattern: /^\|(?:[-: ]+\|)+$/gm,
        replacement:
          '<tr class="md-table-row" data-type="table-separator"></tr>',
      },
      {
        name: 'tableRow',
        pattern: /^\|(.+)\|$/gm,
        replacement: (cells: string): string => {
          // Divide células pelo delimitador |, apara espaços e gera <td> individuais
          const tds = cells
            .split('|')
            .map((cell) => `<td class="md-table-cell">${cell.trim()}</td>`)
            .join('');
          return `<tr class="md-table-row" data-type="table-row">${tds}</tr>`;
        },
      },

      // Listas não-ordenadas (agrupamento posterior em _wrapLists)
      {
        name: 'unorderedListItem',
        pattern: /^-\s+(.+)$/gm,
        replacement: '<li class="md-list-item" data-type="unordered">$1</li>',
      },
      {
        name: 'unorderedListItemAsterisk',
        pattern: /^\*\s+(.+)$/gm,
        replacement: '<li class="md-list-item" data-type="unordered">$1</li>',
      },

      // Listas ordenadas (agrupamento posterior em _wrapLists)
      {
        name: 'orderedListItem',
        pattern: /^\d+\.\s+(.+)$/gm,
        replacement: '<li class="md-list-item" data-type="ordered">$1</li>',
      },
    ]);

    this.logger.info(
      'MarkdownParser',
      'MarkdownParser inicializado com regras de conversão',
    );
  }

  /**
   * Escapa caracteres HTML para prevenir XSS
   * Converte caracteres especiais em entidades HTML seguras
   * @private
   * @param text - Texto a ser escapado
   * @returns Texto com caracteres HTML escapados
   */
  private _escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Agrupa linhas consecutivas de blockquote em um único bloco
   * Corrige problema de blockquotes multi-linha gerando múltiplos elementos
   * @private
   * @param html - HTML com blockquotes individuais
   * @returns HTML com blockquotes agrupados
   */
  private _wrapBlockquotes(html: string): string {
    // Encontra sequências consecutivas de <blockquote> e agrupa em um único bloco
    // Flag 's' permite que . capture quebras de linha
    return html.replace(
      /(<blockquote class="md-blockquote">.*?<\/blockquote>\n?)+/gs,
      (match) => {
        // Remove tags individuais e agrupa conteúdo
        const content = match
          .replace(/<blockquote class="md-blockquote">/g, '')
          .replace(/<\/blockquote>\n?/g, '<br>')
          .replace(/<br>$/, ''); // Remove <br> final
        return `<blockquote class="md-blockquote">${content}</blockquote>\n`;
      },
    );
  }

  /**
   * Agrupa itens de lista consecutivos em <ul> ou <ol>
   * Detecta tipo de lista pelo atributo data-type
   * @private
   * @param html - HTML com itens de lista individuais
   * @returns HTML com listas agrupadas
   */
  private _wrapLists(html: string): string {
    // Processa listas não-ordenadas
    // Busca sequências de <li> com data-type="unordered"
    html = html.replace(
      /(<li class="md-list-item" data-type="unordered">.*?<\/li>\n?)+/gs,
      (match) => {
        // Remove atributo data-type antes de agrupar
        const cleanedItems = match.replace(/ data-type="unordered"/g, '');
        return `<ul class="md-list">\n${cleanedItems}</ul>\n`;
      },
    );

    // Processa listas ordenadas
    // Busca sequências de <li> com data-type="ordered"
    html = html.replace(
      /(<li class="md-list-item" data-type="ordered">.*?<\/li>\n?)+/gs,
      (match) => {
        // Remove atributo data-type antes de agrupar
        const cleanedItems = match.replace(/ data-type="ordered"/g, '');
        return `<ol class="md-list">\n${cleanedItems}</ol>\n`;
      },
    );

    return html;
  }

  /**
   * Agrupa linhas de tabela consecutivas em <table> com <thead> e <tbody>
   * A primeira linha de dados vira <th>, o separador é descartado, o restante vira <td>
   * @private
   * @param html - HTML com linhas de tabela individuais marcadas com data-type
   * @returns HTML com tabelas completas e semânticas
   */
  private _wrapTables(html: string): string {
    // Captura blocos que contenham ao menos uma linha de tabela (separator incluso)
    return html.replace(
      /(<tr class="md-table-row" data-type="table[\w-]+"[^>]*>.*?<\/tr>\n?)+/gs,
      (match) => {
        // Separa as linhas marcadas em um array para processamento sequencial
        const rows = [
          ...match.matchAll(/<tr[^>]*data-type="([\w-]+)"[^>]*>(.*?)<\/tr>/gs),
        ];

        let isFirstDataRow = true; // Controla promoção da primeira linha para <thead>
        const theadRows: string[] = [];
        const tbodyRows: string[] = [];

        rows.forEach(([, type, innerHtml]) => {
          // Descarta o separador (|---|---| virou uma <tr> vazia que não tem valor visual)
          if (type === 'table-separator') return;

          if (isFirstDataRow) {
            // Primeira linha → promove <td> para <th> e vai para <thead>
            const headCells = innerHtml
              .replace(
                /<td class="md-table-cell">/g,
                '<th class="md-table-header">',
              )
              .replace(/<\/td>/g, '</th>');
            theadRows.push(`<tr class="md-table-row">${headCells}</tr>`);
            isFirstDataRow = false;
          } else {
            tbodyRows.push(`<tr class="md-table-row">${innerHtml}</tr>`);
          }
        });

        const thead = `<thead class="md-table-head">\n${theadRows.join('\n')}\n</thead>`;
        const tbody = tbodyRows.length
          ? `<tbody class="md-table-body">\n${tbodyRows.join('\n')}\n</tbody>`
          : '';

        return `<table class="md-table">\n${thead}\n${tbody}\n</table>\n`;
      },
    );
  }

  /**
   * Processa parágrafos corretamente
   * Divide o HTML em blocos separados por linhas duplas (\n\n)
   * e envolve blocos de texto puro em <p>, preservando elementos estruturais
   * @private
   * @param html - HTML para processar
   * @returns HTML com parágrafos formatados
   */
  private _processParagraphs(html: string): string {
    // Divide em blocos por linhas duplas (padrão Markdown para separar parágrafos)
    const blocks = html.split(/\n\n+/);

    return blocks
      .map((block) => {
        const trimmed = block.trim();

        // Não envolve em <p> se já for tag de bloco estrutural
        // Inclui: headers, listas, pre/code, blockquote, hr, img, div, table
        if (/^<(h[1-6]|ul|ol|pre|blockquote|hr|img|div|table)/.test(trimmed)) {
          return trimmed;
        }

        // Ignora blocos vazios ou apenas whitespace
        if (!trimmed) {
          return '';
        }

        // Envolve texto puro em parágrafo
        return `<p class="md-paragraph">${trimmed}</p>`;
      })
      .filter(Boolean)
      .join('\n');
  }

  /**
   * Envolve o HTML final em container
   * @private
   * @param html - HTML processado
   * @returns HTML com container wrapper
   */
  private _wrapContainer(html: string): string {
    return `<div class="md-container">\n${html}\n</div>`;
  }

  /**
   * Aplica todas as regras de transformação Markdown → HTML
   * @private
   * @param markdown - Texto Markdown
   * @returns HTML com transformações básicas aplicadas
   */
  private _applyRules(markdown: string): string {
    let html = markdown;

    // Itera sobre regras aplicando substituições
    // Arrow function mantém contexto 'this' sem necessidade de .bind()
    this.rules.forEach((rule) => {
      if (typeof rule.replacement === 'function') {
        // Usa call() com arrow function para manter contexto e evitar bind em loop
        html = html.replace(rule.pattern, (...args) =>
          (rule.replacement as ReplacementFunction).call(this, ...args),
        );
      } else {
        html = html.replace(rule.pattern, rule.replacement);
      }
    });

    return html;
  }

  /**
   * Converte Markdown para HTML
   * Pipeline de transformação em etapas sequenciais:
   * 1. Aplica regras básicas de conversão
   * 2. Agrupa blockquotes multi-linha
   * 3. Agrupa listas consecutivas
   * 4. Agrupa tabelas em <table> com <thead>/<tbody>
   * 5. Processa parágrafos
   * 6. Envolve em container
   *
   * @param markdown - Texto em formato Markdown
   * @returns HTML gerado com container wrapper e classes CSS
   * @throws {TypeError} Se markdown não for string
   * @throws {RangeError} Se markdown exceder limite de tamanho
   *
   * @example
   * const parser = new MarkdownParser();
   * const html = parser.parse('# Título\n\nParagrafo com **negrito**');
   * // Retorna: <div class="md-container">
   * //            <h1 class="md-h1">Título</h1>
   * //            <p class="md-paragraph">Paragrafo com <strong class="md-bold">negrito</strong></p>
   * //          </div>
   *
   * @see {@link https://spec.commonmark.org/} Especificação CommonMark
   */
  parse(markdown: string): string {
    // Validação de tipo
    if (typeof markdown !== 'string') {
      throw new TypeError('O input deve ser uma string');
    }

    // Tratamento de string vazia
    if (markdown.length === 0) {
      return '<div class="md-container"></div>';
    }

    // Proteção contra DoS por input muito grande
    if (markdown.length > this.MAX_INPUT_SIZE) {
      throw new RangeError(
        `Input muito grande (limite: ${this.MAX_INPUT_SIZE / 1_000_000}MB)`,
      );
    }

    // Pipeline de transformação
    // Cada função recebe o resultado da anterior e retorna HTML processado
    const pipeline = [
      this._applyRules.bind(this), // 1. Conversões básicas Markdown → HTML
      this._wrapBlockquotes.bind(this), // 2. Agrupa blockquotes consecutivos
      this._wrapLists.bind(this), // 3. Agrupa listas em <ul>/<ol>
      this._wrapTables.bind(this), // 4. Agrupa tabelas em <table> com <thead>/<tbody>
      this._processParagraphs.bind(this), // 5. Envolve texto em <p>
      this._wrapContainer.bind(this), // 6. Container final
    ];

    // Executa pipeline: reduce aplica cada função ao resultado acumulado
    return pipeline.reduce(
      (html, transform) => transform(html),
      markdown.trim(),
    );
  }

  /**
   * Valida se o HTML gerado é bem-formado (verificação básica)
   * @param html - HTML para validar
   * @returns True se HTML parece válido
   */
  validateOutput(html: string): boolean {
    // Verifica tags básicas balanceadas
    const tagRegex = /<(\w+)[^>]*>/g;
    const closeTagRegex = /<\/(\w+)>/g;

    const openTags = html.match(tagRegex) || [];
    const closeTags = html.match(closeTagRegex) || [];

    // Tags auto-fechadas não precisam de fechamento
    const selfClosing = ['img', 'hr', 'br'];
    const openCount = openTags.filter((tag) => {
      const match = tag.match(/<(\w+)/);
      const tagName = match ? match[1] : '';
      return !selfClosing.includes(tagName);
    }).length;

    // Validação simples: número de aberturas ≈ número de fechamentos
    return Math.abs(openCount - closeTags.length) <= 1; // Tolerância de 1 (container)
  }
}

// Exporta a classe para uso em outros módulos
export { MarkdownParser };
export type { Logger, ConversionRule, ReplacementFunction };
