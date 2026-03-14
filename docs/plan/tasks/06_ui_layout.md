# Task 06: Layout Estrutural (Aura Layout)

## Objetivo
Implementar a estrutura macro da aplicação: Editor (Dark) à esquerda, Preview (Light) à direita.

## Arquivos de Entrada
- `src/styles/main.css` (Classes: `.layout-container`, `.panel-editor`, `.panel-preview`)

## Arquivos de Saída
- `src/components/layout/MainLayout.ts`
- `src/components/layout/EditorPanel.ts`
- `src/components/layout/PreviewPanel.ts`

## Detalhamento da Execução

1.  **`<main-layout>`:**
    *   Container principal. Aplica a classe `.layout-container`.
    *   Contém slots ou instâncias diretas dos dois painéis.

2.  **`<editor-panel>`:**
    *   Aside esquerdo. Classe `.panel-editor`.
    *   Contém o título (`.title-studio`) e o slot para os controles de configuração e lista de seções.

3.  **`<preview-panel>`:**
    *   Área principal. Classe `.panel-preview`.
    *   Contém o elemento `.sheet-a4` onde o relatório será renderizado.

## Critérios de Aceite
- [x] Layout responsivo (em mobile vira coluna, em desk vira linha - ver `main.css`).
- [x] Scroll independente em cada painel.
