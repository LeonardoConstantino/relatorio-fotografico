import { describe, it, expect } from 'vitest';
import { Report } from '../src/types/Report';

describe('Domain Models (Task 02)', () => {
  it('deve validar a estrutura de um objeto Report completo', () => {
    const mockReport: Report = {
      meta: {
        schemaVersion: '2.0',
        createdAt: 123456789,
        lastModified: 123456789,
      },
      config: {
        logo: 'base64...',
        title: 'Relatório de Inspeção',
        primaryColor: '#4f46e5',
        company: 'Minha Empresa',
        reportNumber: 'ABC-123',
        reportDate: '12/03/2026',
      },
      sections: [
        {
          id: 'uuid-1',
          type: 'equipment',
          data: {
            title: 'Equipamento A',
            description: 'Trator Modelo X',
            model: 'X100',
            patrimony: 'PAT-001',
            owner: 'Cliente A',
          },
        },
        {
          id: 'uuid-2',
          type: 'images',
          data: {
            title: 'Fotos da Frente',
            columns: 2,
            images: [{ src: 'img1.jpg', caption: 'Lado Esquerdo' }],
          },
        },
      ],
    };

    expect(mockReport.meta.schemaVersion).toBe('2.0');
    expect(mockReport.sections[0].type).toBe('equipment');
    expect(mockReport.sections[1].data.title).toBe('Fotos da Frente');
  });
});
