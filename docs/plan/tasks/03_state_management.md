# Task 03: Gerenciamento de Estado (Store & EventBus)

## Objetivo
Migrar as libs `EventBus` e `Logger` para TypeScript e implementar o `AppStore`.

## Arquivos de Entrada
- `src/libs/eventBus.js`
- `src/libs/Logger.js`

## Arquivos de Saída
- `src/libs/EventBus.ts`
- `src/libs/Logger.ts`
- `src/store/AppStore.ts`

## Detalhamento da Execução

1.  **Refatoração Libs:**
    *   Converter JS para TS, adicionando tipos genéricos ao EventBus para type-safety nos eventos.

2.  **AppStore (Singleton):**
    *   Estado Privado: `_report: Report`.
    *   Métodos Públicos: `get report()`, `addSection()`, `updateSection()`, `setConfig()`.
    *   Reatividade: Disparar eventos via `EventBus` (ex: `store:updated`) após mutações.
    *   **Auto-Save Trigger:** O Store deve emitir um evento que o `PersistenceService` (Task 04) escutará. O Store não deve chamar o IndexedDB diretamente para manter desacoplamento.

## Critérios de Aceite
- [x] Teste unitário: Adicionar seção atualiza o estado e dispara evento.
- [x] EventBus tipado impede envio de dados incorretos (se possível com TS).
