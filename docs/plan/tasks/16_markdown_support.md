# Task 16: Suporte a Markdown nas Seções de Texto

## Objetivo
Permitir que o usuário utilize sintaxe Markdown básica para formatar laudos técnicos, dando destaque a pontos críticos (Negrito, Itálico, Listas).

## Detalhamento
1.  **Integração da Lib:** Utilizar a biblioteca de conversão disponível em `src/libs/`.
2.  **Interface de Edição:** Manter o `textarea`, mas adicionar uma dica visual de que Markdown é suportado.
3.  **Renderização no Preview:**
    *   No `PreviewPanel.ts`, passar o conteúdo da seção de texto pela função de parse antes de injetar no HTML.
    *   Garantir que o CSS do preview suporte estilos de Markdown (ex: `strong` em azul primary ou negrito pesado).

## Critérios de Aceite
- [x] Usuário digita `**Critico**` e no PDF aparece em negrito.
- [x] A sanitização de HTML deve ocorrer *antes* ou de forma integrada ao parse de Markdown para manter a segurança.
