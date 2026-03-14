# Task 04: Serviço de Persistência (IndexedDB)

## Objetivo
Implementar a camada de persistência robusta usando a lib `IndexedDBStorage` refatorada.

## Dependências
- `src/libs/IndexedDBStorage.ts` (Task 03 deve migrar a lib para TS)

## Arquivos de Saída
- `src/services/PersistenceService.ts`

## Detalhamento da Execução
1.  **Service:**
    *   Escutar eventos do `AppStore`.
    *   Salvar o snapshot completo do relatório.
    *   Carregar o último relatório ao iniciar o app.

## Critérios de Aceite
- [x] Dados persistem após F5.
