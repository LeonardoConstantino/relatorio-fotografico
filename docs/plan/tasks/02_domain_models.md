# Task 02: Definição de Tipos e Domain Models

## Objetivo
Criar as interfaces TypeScript que representam o Relatório Fotográfico.

## Arquivos de Saída
- `src/types/Report.ts`
- `src/types/Section.ts`

## Detalhamento da Execução

1.  **Tipos Base:**
    *   `SectionType`: `'equipment' | 'text' | 'bullets' | 'images' | 'pagebreak'`.

2.  **Interfaces de Dados (`SectionData`):**
    *   `EquipmentData`: `{ title: string, description: string, model: string, patrimony: string, owner: string }`.
    *   `TextData`: `{ title: string, content: string }`.
    *   `BulletData`: `{ title: string, items: string[] }`.
    *   `ImageData`: `{ title: string, columns: 1|2|3, images: Array<{ src: string, caption: string }> }`.

3.  **Interface Principal (`Report`):**
    *   `ReportConfig`: `{ title, company, reportNumber, date, primaryColor, logo }`.
    *   `ReportSection`: `{ id: string, type: SectionType, data: SectionData }`.
    *   `Report`: `{ meta: { version: string, lastModified: number }, config: ReportConfig, sections: ReportSection[] }`.

## Critérios de Aceite
- [x] Arquivos criados em `src/types/`.
- [x] Tipos exportados e compilando.
