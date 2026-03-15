# Task 11: Barra de Status Fixa (Editor Footer)

## Objetivo
Implementar uma barra de status minimalista e fixa na base do painel do editor para fornecer feedback de sistema em tempo real sem poluir a interface.

## Arquivos de Entrada
- `src/components/layout/EditorPanel.ts`
- `src/store/AppStore.ts`
- `src/libs/IndexedDBStorage.ts`

## Arquivos de Saída
- `src/components/ui/StatusBar.ts`

## Detalhamento da Execução

1.  **Criação do Componente `<app-status-bar>`:**
    *   Deve ser fixado no `bottom-0` do `.panel-editor`.
    *   Estética: Fundo `bg-studio-base`, borda superior `border-t border-studio-border`, altura reduzida.
    *   Fonte: `font-mono text-[10px]`.

2.  **Informações Minimalistas (Visíveis):**
    *   **Estado de Salvamento:** Ícone de check (verde se salvo, pulsante se salvando).
    *   **Contadores:** `MODS: X` (total de seções) | `PAGS: Y` (total de páginas estimadas).
    *   **Storage:** `%` de uso do IndexedDB.

3.  **Informações Detalhadas (Atributo `title`):**
    *   Ao passar o mouse, exibir:
        *   "Último salvamento: HH:MM:SS"
        *   "Uso de Disco: 1.2MB / 50MB (Estimado)"
        *   "Trace ID: [ID Atual]"
        *   "Versão do Schema: 2.0"

4.  **Integração:**
    *   O `EditorPanel` deve injetar este componente no seu rodapé.
    *   Deve escutar o `EventBus` para atualizar os contadores em tempo real.

## Critérios de Aceite
- [x] A barra permanece visível mesmo ao rolar o editor para cima.
- [x] Os contadores de seções atualizam imediatamente ao adicionar/remover.
- [x] O atributo `title` fornece as métricas detalhadas corretamente.
