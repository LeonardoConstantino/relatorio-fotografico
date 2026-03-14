# Task 08: Drag and Drop (Lista de Seções)

## Objetivo
Permitir reordenar seções.

## Arquivos de Saída
- `src/components/features/SortableList.ts`

## Detalhamento da Execução

1.  **Lógica:**
    *   Usar API nativa `draggable="true"`.
    *   Eventos: `dragstart`, `dragover`, `drop`.
    *   Visual: Adicionar classe de opacidade ao item sendo arrastado.

2.  **Integração:**
    *   Ao soltar, calcular novos índices e chamar `AppStore.reorderSection(from, to)`.

## Critérios de Aceite
- [x] Reordenação funciona suavemente.
- [x] Feedback visual claro.
