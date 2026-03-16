# Task 14: Início Rápido e Editor de Templates

## Objetivo
Implementar um sistema de templates que permite ao usuário carregar uma estrutura pré-definida de seções e personalizar essa estrutura através de um editor dedicado.

## Arquivos de Entrada
- `src/store/AppStore.ts`
- `src/components/layout/EditorPanel.ts`
- `src/services/PersistenceService.ts`

## Detalhamento da Execução

1.  **Modelo de Dados do Template:**
    *   Criar uma interface `ReportTemplate` (basicamente uma lista de `SectionType` e títulos padrão).
    *   Armazenar o template no `IndexedDB` para persistência.

2.  **Interface de Início Rápido (EditorPanel):**
    *   Adicionar uma zona de "Ações Rápidas" no topo do painel lateral.
    *   Botão **"⚡ Início Rápido"**: Carrega o template atual (ex: Equipamento + 3 Galerias de Fotos + Observações).
    *   Botão **"⚙️" (Editar Template)**: Abre o modal de configuração de template.

3.  **Modal de Editor de Template:**
    *   Interface simples para definir a "receita" do relatório padrão.
    *   O usuário escolhe quais seções e em qual ordem elas devem aparecer no "Início Rápido".

4.  **Lógica no AppStore:**
    *   Método `loadTemplate()`: Limpa o relatório atual e insere as seções definidas no template.

## Critérios de Aceite
- [x] O botão "Início Rápido" cria instantaneamente um relatório estruturado.
- [x] O usuário pode mudar a "receita" do template através do modal.
- [x] O template personalizado persiste mesmo após fechar o navegador.
- [x] Visual consistente com o estilo industrial do Aura Technical.
