# Task 13: Controles de Visibilidade e Proporção

## Objetivo
Implementar a funcionalidade de ocultar/mostrar o painel de preview e ajustar a proporção da tela para otimizar o espaço de trabalho em diferentes tamanhos de monitor.

## Arquivos de Entrada
- `src/components/layout/MainLayout.ts`
- `src/components/layout/EditorPanel.ts`
- `src/styles/main.css`

## Detalhamento da Execução

1.  **Estado do Layout:**
    *   Adicionar um estado local no `MainLayout` ou `AppStore` para controlar a visibilidade: `previewVisible: boolean`.

2.  **Interface de Controle:**
    *   Adicionar um botão de "Toggle Preview" (ícone de olho ou monitor) no topo do `EditorPanel` ou em uma pequena barra de ferramentas flutuante.
    *   Implementar atalho de teclado (ex: `Alt + P`) para alternar a visibilidade.

3.  **Ajustes de CSS Dinâmicos:**
    *   Quando o preview estiver oculto:
        *   `.panel-editor` deve expandir para `w-full` (ou ocupar o máximo de espaço).
        *   `.panel-preview` deve receber `display: none`.
    *   Adicionar transições suaves (`transition-all`) para a mudança de largura.

4.  **Ajuste de Proporção (Opcional/Avançado):**
    *   Permitir que o usuário "puxe" a divisória entre os painéis para redimensionar (Resizer Bar).

## Critérios de Aceite
- [ ] O usuário pode ocultar o preview com um clique, ganhando espaço total para o editor.
- [ ] O estado de visibilidade persiste ao recarregar a página (opcional, mas recomendado).
- [ ] Em telas pequenas, a aplicação deve se comportar de forma fluida ao alternar os modos.
- [ ] O botão de toggle deve ser visualmente consistente com o Design System.
