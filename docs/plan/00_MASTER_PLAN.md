# Master Plan: Refatoração Relatório Fotográfico (v2.0)

Este arquivo coordena a execução de tarefas por múltiplos agentes.

## Status do Projeto
- **Fase Atual:** 6. Refinamentos & UX
- **Design System:** [Aura Technical (Tailwind v4)](../Design_System.md)
- **Progresso Geral:** 90%

## Diretrizes para Agentes
1. **Leia a Task:** Abra o arquivo correspondente na pasta `tasks/`.
2. **Design System:** Siga rigorosamente o arquivo `docs/Design_System.md`.
3. **Qualidade:** Nenhuma task é considerada concluída sem testes e validação visual.

---

## Lista de Tarefas (Pipeline)

### Fase 1 a 5: Concluídas ✅

### Fase 6: Refinamentos & Features Avançadas
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **11** | [Barra de Status Fixa (Editor Footer)](./tasks/11_status_bar.md) | [x] | 03, 04, 06 |
| **12** | [Persistência de Configurações no Reset](./tasks/12_persistent_settings.md) | [x] | 03, 06 |
| **13** | [Controles de Visibilidade e Proporção](./tasks/13_layout_controls.md) | [x] | 06 |
| **14** | [Início Rápido e Editor de Templates](./tasks/14_templates_system.md) | [x] | 03, 04, 06 |
| **15** | [Importação/Exportação JSON Raw](./tasks/15_import_export_json.md) | [ ] | 02, 03, 06 |
| **16** | [Suporte a Markdown nas Seções de Texto](./tasks/16_markdown_support.md) | [ ] | 03, 06 |
| **17** | [Edição Avançada de Imagem (Crop, Rotate, Meta)](./tasks/17_advanced_image_editor.md) | [ ] | 07 |
| **18** | [Sistema de Validação de Conformidade](./tasks/18_validation_system.md) | [ ] | 03, 11 |

### Fase 7: Gestão de Arquivos (Dashboard)
| ID | Task | Status | Dependências |
|----|------|--------|--------------|
| **19** | [Arquitetura de Registro Multi-Relatórios](./tasks/19_multi_report_db.md) | [ ] | 04 |
| **20** | [Interface de Dashboard (Listagem e Busca)](./tasks/20_dashboard_ui.md) | [ ] | 19, 06 |
| **21** | [Ações de Arquivo (Duplicar, Excluir Lote)](./tasks/21_file_actions.md) | [ ] | 20 |

---
## Notas de Orquestração
- **Markdown:** Utilizar lib disponível em `@src/libs/`.
- **Dashboard:** O app deve iniciar no Dashboard caso não haja um relatório em edição.
