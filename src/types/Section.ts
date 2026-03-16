/**
 * Tipos de seções suportadas pelo relatório
 */
export type SectionType =
  | 'equipment'
  | 'text'
  | 'bullets'
  | 'images'
  | 'pagebreak';

/**
 * Interface base para todas as seções
 */
export interface BaseSectionData {
  title: string;
}

export interface EquipmentData extends BaseSectionData {
  description: string;
  model: string;
  patrimony: string;
  owner: string;
}

export interface TextData extends BaseSectionData {
  content: string;
}

export interface BulletsData extends BaseSectionData {
  items: string[];
}

export interface ImagesData extends BaseSectionData {
  columns: 1 | 2 | 3;
  images: Array<{
    src: string; // Base64 ou URL
    caption: string;
  }>;
}

export interface PageBreakData extends BaseSectionData {}

/**
 * Union type para os dados das seções
 */
export type SectionData =
  | EquipmentData
  | TextData
  | BulletsData
  | ImagesData
  | PageBreakData;

/**
 * Definição de um template de início rápido
 */
export interface ReportTemplate {
  id: string;
  name: string;
  sections: Array<{
    type: SectionType;
    defaultTitle?: string;
  }>;
}


/**
 * Estrutura de uma seção no relatório
 */
export interface ReportSection {
  id: string; // UUID
  type: SectionType;
  data: SectionData;
}
