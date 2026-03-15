# Task 15: Importação/Exportação JSON Raw

## Objetivo
Implementar a funcionalidade de exportar o relatório atual como um arquivo `.json` e importar arquivos compatíveis para restaurar estados completos de trabalho.

## Arquivos de Entrada
- `src/store/AppStore.ts`
- `src/components/layout/EditorPanel.ts`
- `src/types/Report.ts`

## Detalhamento da Execução

1.  **Lógica de Exportação:**
    *   Implementar função para converter o estado atual do `AppStore` em um Blob JSON.
    *   Gerar um link temporário e disparar o download com nome automático (ex: `relatorio_[data]_[id].json`).

2.  **Lógica de Importação:**
    *   Implementar seletor de arquivo (`input type="file"` oculto).
    *   Validar se o JSON importado respeita a interface `Report` (Task 02).
    *   Utilizar `store.loadState()` para injetar os dados importados.

3.  **Interface (EditorPanel):**
    *   Adicionar uma zona de "Gerenciamento de Dados" no rodapé ou dentro de um card de utilitários.
    *   Botões: **"📤 Exportar JSON"** e **"📥 Importar JSON"**.
    *   Estética: Seguir os botões `.btn-outline` para ações de sistema.

4.  **Feedback:**
    *   Exibir logs ou alertas de sucesso/erro durante a importação para garantir que o usuário saiba que os dados foram carregados.

## Critérios de Aceite
- [ ] O arquivo exportado contém todas as imagens (Base64), seções e configurações.
- [ ] Ao importar o arquivo gerado, o Preview e o Editor refletem o estado exato do momento da exportação.
- [ ] O sistema impede a importação de arquivos corrompidos ou com formato inválido.
