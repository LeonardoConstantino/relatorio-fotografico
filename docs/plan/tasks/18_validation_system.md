# Task 18: Sistema de Validação de Conformidade

## Objetivo
Garantir que o relatório gerado esteja completo e profissional, alertando o usuário sobre campos esquecidos.

## Detalhamento
1.  **Motor de Validação:** Criar regras por tipo de seção (ex: Seção de Equipamento exige Patrimônio).
2.  **Feedback Visual:**
    *   Campos obrigatórios vazios ficam com borda `accent-danger` suave.
    *   Ícone de alerta no card da seção no Editor.
3.  **Bloqueio de Impressão (Opcional):**
    *   Avisar no botão de Gerar PDF: "Existem 3 pendências de preenchimento".

## Critérios de Aceite
- [ ] O usuário consegue identificar visualmente quais módulos estão incompletos. // TODO implementação futura
- [x] A barra de status (Task 11) exibe o total de alertas de conformidade.
