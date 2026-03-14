# Task 09: Geração de PDF

## Objetivo
Garantir fidelidade na impressão.

## Arquivos de Saída
- `src/components/preview/PrintHandler.ts`

## Detalhamento da Execução

1.  **Handler:**
    *   Monitorar evento `beforeprint` e `afterprint`.
    *   Função `window.print()`.

2.  **CSS de Impressão (Verificar `main.css`):**
    *   Garantir que `@media print` oculte `.panel-editor` e mostre apenas `.sheet-a4`.
    *   Remover sombras e backgrounds de "mesa" na impressão.

## Critérios de Aceite
- [x] CTRL+P gera apenas o relatório, sem UI do app.
