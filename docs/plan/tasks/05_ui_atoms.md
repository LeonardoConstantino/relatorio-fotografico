# Task 05: Componentes Atômicos (Aura Atoms)

## Objetivo
Criar Web Components que encapsulam o CSS do Tailwind v4 definido em `main.css`.

## Arquivos de Entrada
- `src/styles/main.css` (Classes: `.btn`, `.input-technical`, `.label-technical`)

## Arquivos de Saída
- `src/components/ui/AppButton.ts`
- `src/components/ui/AppInput.ts`
- `src/components/ui/SectionCard.ts`

## Detalhamento da Execução

1.  **`<app-button>`:**
    *   Props: `variant` ('primary' | 'secondary' | 'outline' | 'danger').
    *   Render: `<button class="btn btn-${variant}">...</button>`.
    *   Deve preservar classes extras passadas via atributo `class`.

2.  **`<app-input>`:**
    *   Props: `label` (string), `placeholder`, `value`.
    *   Render:
        ```html
        <div class="mb-4">
            <label class="label-technical">${label}</label>
            <input class="input-technical" ... />
        </div>
        ```

3.  **`<section-card>`:**
    *   Render: `<div class="card-module animate-slide-down">...<slot></slot>...</div>`.
    *   Deve ter header padrão com Título e Botão de Remover.

## Notas Técnicas
*   Use **Light DOM** (`this.innerHTML`) para aproveitar o CSS global do Tailwind sem precisar injetar estilos no Shadow DOM.

## Critérios de Aceite
- [x] Componentes renderizam visualmente idênticos ao Design System.
- [x] Interatividade (cliques, inputs) funciona.
