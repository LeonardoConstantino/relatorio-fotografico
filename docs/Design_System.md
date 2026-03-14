# 🎨 Design System: Aura Technical (Tailwind v4 Edition)

## 📌 1. Filosofia de Design e Conceito (Instruções para a IA)
**Objetivo do Agente:** Ao gerar código HTML para este projeto, você DEVE utilizar classes utilitárias do **Tailwind CSS v4** e as classes semânticas definidas no nosso `main.css`.

**Conceito "Studio Interface":**
- Não utilizamos um "Dark Mode" de sistema. A aplicação divide a tela em duas realidades físicas:
  1. **Painel de Edição (Estúdio):** Sempre em Dark Mode. Estética de software de engenharia (IDE, Figma). Foco na operação.
  2. **Painel de Preview (Papel):** Sempre em Light Mode. Emula uma mesa clara onde a folha A4 repousa.
- **Estética:** Brutalismo refinado, alto contraste, sem bordas excessivamente arredondadas (`rounded-md` no máximo), fontes precisas.

---

## 🎨 2. Tokens de Design (Tailwind `@theme`)

Os seguintes tokens já estão injetados no Tailwind via diretiva `@theme` no `main.css`. Use-os com os prefixos padrão do Tailwind (`bg-`, `text-`, `border-`, etc).

### Zona do Estúdio (Dark)
| Utilidade Tailwind | Código Hex | Descrição |
| :--- | :--- | :--- |
| `bg-studio-base` | `#0A0A0B` | Fundo principal do painel lateral. |
| `bg-studio-elevated` | `#161618` | Fundo de inputs, cards e dropdowns. |
| `border-studio-border` | `#27272A` | Linhas divisórias e bordas padrão. |
| `text-studio-muted` | `#A1A1AA` | Textos secundários, placeholders, labels. |

### Zona do Papel (Light)
| Utilidade Tailwind | Código Hex | Descrição |
| :--- | :--- | :--- |
| `bg-paper-desk` | `#E4E4E7` | A "mesa" cinza claro atrás do papel A4. |
| `bg-paper-sheet` | `#FFFFFF` | A cor de fundo da folha A4. |
| `text-paper-text` | `#09090B` | Texto impresso no relatório. |

### Acentos (Neon/Elétricos)
| Utilidade Tailwind | Código Hex | Descrição |
| :--- | :--- | :--- |
| `bg-accent-primary` | `#4F46E5` | Indigo vibrante para ações principais (Salvar, Gerar PDF). |
| `bg-accent-cyan` | `#06B6D4` | Cor de destaque secundária ou sucesso. |
| `text-accent-danger` | `#E11D48` | Vermelho para exclusões e erros. |

---

## 🖋️ 3. Tipografia

O projeto utiliza duas fontes do Google Fonts, já configuradas no Tailwind:

- **Fonte Principal (`font-sans`):** *Plus Jakarta Sans*. Usada para botões, títulos, inputs e conteúdo do relatório.
- **Fonte Técnica (`font-mono`):** *JetBrains Mono*. Usada **exclusivamente** para rótulos (labels de formulário), números de versão e metadados.

**Exemplo de Label Técnico:**
```html
<label class="font-mono text-[11px] text-studio-muted uppercase tracking-wider">
  Nome da Empresa
</label>
<!-- Ou simplesmente use a classe semântica: -->
<label class="label-technical">Nome da Empresa</label>
```

---

## 🧱 4. Componentes Semânticos (`@layer components`)

Para evitar poluição excessiva de classes do Tailwind no HTML (`div soup`), criamos componentes semânticos no `main.css` que você DEVE usar:

### Estrutura
- `layout-container`: Container flexível que segura o editor e o preview.
- `panel-editor`: O aside escuro (Estúdio).
- `panel-preview`: A área de rolagem onde o A4 fica.
- `sheet-a4`: A folha de papel branca com sombra realista.

### Formulários (`.input-technical`)
Sempre envolva os campos em divs para espaçamento e use o componente de input técnico.
```html
<div class="mb-4">
  <label class="label-technical">Título do Relatório</label>
  <input type="text" class="input-technical" placeholder="Ex: Inspeção..." />
</div>
```

### Botões (`.btn`)
Eles têm efeitos táteis programados (scale ao clicar, shadow no hover).
- `<button class="btn btn-primary">` → Ações positivas/principais.
- `<button class="btn btn-secondary">` → Ações neutras dentro de cards.
- `<button class="btn btn-outline">` → Ações secundárias globais.
- `<button class="btn btn-danger">` → Excluir/Remover.

### Cards de Módulo (`.card-module`)
Use isso para agrupar as "Seções" que o usuário adiciona.
```html
<div class="card-module animate-slide-down">
  <div class="flex justify-between">
    <h4 class="font-sans font-semibold text-white">📦 Equipamento</h4>
    <button class="btn btn-danger py-1 px-2 text-xs">Remover</button>
  </div>
  <!-- Conteúdo do card... -->
</div>
```

---

## 🤖 5. Diretrizes Comportamentais para Agentes de IA

1. **Uso de Tailwind v4:** Não crie variáveis no HTML inline. Use sempre as utilidades do Tailwind. Se precisar de um valor arbitrário específico, use a sintaxe de colchetes: `w-[420px]`, `text-[13px]`.
2. **Sem Ícones Externos:** Continue usando Emojis ou SVGs inline estritamente limpos.
3. **Zonas Estritas:** NUNCA aplique as classes `*-studio-*` dentro do conteúdo da classe `sheet-a4`. O relatório impresso deve permanecer em tons de cinza ou usar a cor de acento do usuário (Primary Color escolhida no input color).
