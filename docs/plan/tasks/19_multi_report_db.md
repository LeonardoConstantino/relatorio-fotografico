# Task 19: Arquitetura de Registro Multi-Relatórios

## Objetivo
Alterar a forma como os dados são armazenados para permitir múltiplos relatórios no mesmo dispositivo.

## Detalhamento
1.  **Refatoração do Database:**
    *   Criar um `Registry` no IndexedDB que armazena uma lista de metadados de todos os relatórios (ID, Título, Empresa, Data).
    *   Cada relatório completo é salvo em uma entrada separada no banco.
2.  **AppStore Multi-Instância:**
    *   Permitir trocar o relatório ativo carregando dados de um ID específico.

## Critérios de Aceite
- [ ] O salvamento automático agora respeita o ID do relatório atual sem sobrescrever outros.
