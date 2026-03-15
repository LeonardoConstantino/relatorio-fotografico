# Task 12: Persistência de Configurações no Reset

## Objetivo
Implementar uma opção para limpar apenas o conteúdo (seções) do relatório, mantendo as configurações de identidade visual e dados da empresa (Logo, Cor, Nome da Empresa, etc).

## Arquivos de Entrada
- `src/store/AppStore.ts`
- `src/components/layout/EditorPanel.ts`

## Detalhamento da Execução

1.  **Alteração no `AppStore.ts`:**
    *   Modificar o método `clearReport()` para aceitar um parâmetro booleano `keepConfig`.
    *   Se `keepConfig` for true, o novo estado deve herdar o objeto `config` do relatório atual.

2.  **Interface no `EditorPanel.ts`:**
    *   Adicionar um componente de checkbox (ou switch) próximo ao botão "Novo Relatório".
    *   Label sugerida: "Preservar dados da empresa e logo ao limpar".
    *   Estética: Seguir o padrão `label-technical` para o texto do checkbox.

3.  **Lógica de Interação:**
    *   Ao clicar em "Novo Relatório", ler o estado do checkbox.
    *   Passar este estado para a chamada `store.clearReport(keepConfig)`.

## Critérios de Aceite
- [ ] Ao marcar a opção e resetar, as seções desaparecem, mas a Logo e o Nome da Empresa permanecem.
- [ ] Ao desmarcar e resetar, tudo volta ao estado de fábrica (comportamento atual).
- [ ] O estado do checkbox deve ser intuitivo e estar visível na zona de ação de reset.
