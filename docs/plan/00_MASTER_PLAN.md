# Master Plan: Refatoração Relatório Fotográfico (v2.0)

Este arquivo coordena a execução de tarefas por múltiplos agentes.

## Status do Projeto
- **Fase Atual:** 1. Infraestrutura & Segurança
- **Design System:** [Aura Technical (Tailwind v4)](../Design_System.md)
- **Progresso Geral:** 0%

## Diretrizes para Agentes
1. **Leia a Task:** Abra o arquivo correspondente na pasta `tasks/`.
2. **Design System:** Siga rigorosamente o arquivo `docs/Design_System.md` e use as classes de `src/styles/main.css`.
3. **Estilo:** Dark Mode para Editor (`.panel-editor`), Light Mode para Preview (`.panel-preview`).
4. **Testes:** Nenhuma task é considerada concluída sem testes (Unitários ou Integração).
5. **Reporte:** Ao finalizar, atualize o status abaixo para [X].

---

## Lista de Tarefas (Pipeline)

### Fase 1: Fundação & Segurança (Determinística)
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **01** | [Setup de Infraestrutura (Vite + TW4 + TS)](./tasks/01_infra_setup.md) | [X] | - |
| **02** | [Definição de Tipos e Domain Models](./tasks/02_domain_models.md) | [X] | 01 |

### Fase 2: Core Logic (O "Cérebro")
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **03** | [Gerenciamento de Estado (Store & EventBus)](./tasks/03_state_management.md) | [X] | 02 |
| **04** | [Serviço de Persistência (IndexedDB Wrapper)](./tasks/04_persistence_service.md) | [X] | 03 |

### Fase 3: Biblioteca de Componentes UI (Aura Technical)
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **05** | [Componentes Atômicos (Button, Input, Icon)](./tasks/05_ui_atoms.md) | [X] | 01, DS |
| **06** | [Layout Estrutural (Editor vs Preview)](./tasks/06_ui_layout.md) | [X] | 05 |

### Fase 4: Features Específicas
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **07** | [Editor de Imagens (Canvas & Compressão)](./tasks/07_image_editor.md) | [X] | 05, 03 |
| **08** | [Lista de Seções (Drag & Drop)](./tasks/08_drag_drop.md) | [X] | 05, 03 |
| **09** | [Geração de PDF e Impressão](./tasks/09_pdf_generation.md) | [X] | 02, 06 |

### Fase 5: Finalização
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **10** | [PWA & Service Workers](./tasks/10_pwa_setup.md) | [X] | Todas |

---
## Notas de Orquestração
- **Atenção:** O projeto usa Tailwind v4. Não criar `tailwind.config.js` antigo. Usar CSS puro com diretiva `@theme`.
