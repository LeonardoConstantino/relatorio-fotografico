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
 * Estrutura completa de um Relatório Fotográfico (Domain Model)
 */
export interface Report {
  meta: ReportMeta;
  config: ReportConfig;
  sections: ReportSection[];
}
