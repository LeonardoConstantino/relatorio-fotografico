import { ReportConfig } from './Config';
import { ReportSection } from './Section';

/**
 * Metadados do relatório para controle de versão e auditoria
 */
export interface ReportMeta {
  schemaVersion: string;
  createdAt: number;
  lastModified: number;
}

/**
 * Estado da interface local (não impresso no relatório)
 */
export interface ReportUI {
  previewVisible: boolean;
  previewScale: number; // Ex: 1.0, 0.75, 0.5
}

/**
 * Estrutura completa de um Relatório Fotográfico (Domain Model)
 */
export interface Report {
  meta: ReportMeta;
  config: ReportConfig;
  sections: ReportSection[];
  ui: ReportUI;
}
