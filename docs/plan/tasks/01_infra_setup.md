# Task 01: Setup de Infraestrutura e Tooling (Aura Tech)

## Objetivo
Configurar o ambiente Vite com suporte nativo a Tailwind CSS v4 e TypeScript rigoroso.

## Arquivos de Entrada
- `src/styles/main.css` (Já existente com configurações do TW4)

## Arquivos de Saída (Criar/Modificar)
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `.gitignore` (Garantir exclusão de node_modules, dist, etc)

## Detalhamento da Execução

1.  **Inicialização de Pacotes:**
    *   `npm init -y` (se necessário).
    *   Instalar Deps Dev: `vite`, `typescript`, `tailwindcss @tailwindcss/vite`, `vitest`, `jsdom`.
    *   Instalar Deps Prod: (Nenhuma por enquanto, usaremos Web Components nativos).

2.  **Configuração Vite (`vite.config.ts`):**
    *   Importar `tailwindcss` de `@tailwindcss/vite`.
    *   Adicionar o plugin `tailwindcss()` na lista de plugins.
    *   Configurar alias `@` para `src/` (opcional, mas recomendado).

3.  **Configuração TypeScript (`tsconfig.json`):**
    *   `target`: `ESNext` (já que usamos Vite).
    *   `strict`: `true`.
    *   `moduleResolution`: `bundler`.
    *   `allowImportingTsExtensions`: `true` (para imports .ts diretos se necessário).

4.  **Integração do CSS:**
    *   Garantir que `src/styles/main.css` esteja sendo importado no entry point (ex: `src/main.ts` ou `index.html`).

5.  **Scripts npm:**
    *   `dev`: `vite`
    *   `build`: `tsc && vite build`
    *   `test`: `vitest`

## Critérios de Aceite
- [x] `npm run dev` inicia o servidor e o `main.css` é carregado corretamente (verificar se as variáveis CSS do `@theme` aparecem no inspecionar elemento).
- [x] `npm run build` gera a pasta `dist` sem erros de TS.
