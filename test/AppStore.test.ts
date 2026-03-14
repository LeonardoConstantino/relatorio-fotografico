import { describe, it, expect, beforeEach, vi } from 'vitest';
import { store, STORE_EVENTS } from '../src/store/AppStore';
import EventBus from '../src/libs/EventBus';

describe('AppStore', () => {
  beforeEach(() => {
    // Reset do estado antes de cada teste se necessário (ou criar nova instância)
    // Como o store é singleton, vamos limpar as seções manualmente para o teste
    store.loadState({
      meta: {
        schemaVersion: '2.0',
        createdAt: Date.now(),
        lastModified: Date.now(),
      },
      config: {
        logo: '',
        title: 'Teste',
        primaryColor: '#000',
        company: '',
        reportNumber: '',
        reportDate: '',
      },
      sections: [],
    });
  });

  it('deve adicionar uma seção e incrementar o array', () => {
    store.addSection('text');
    expect(store.state.sections.length).toBe(1);
    expect(store.state.sections[0].type).toBe('text');
  });

  it('deve remover uma seção pelo ID e decrementar o array', () => {
    store.addSection('equipment');
    const id = store.state.sections[0].id;
    store.removeSection(id);
    expect(store.state.sections.length).toBe(0);
  });

  it('deve atualizar a configuração e refletir no estado', () => {
    store.updateConfig({ title: 'Novo Título', company: 'Empresa X' });
    expect(store.state.config.title).toBe('Novo Título');
    expect(store.state.config.company).toBe('Empresa X');
  });

  it('deve emitir evento REPORT_UPDATED ao mudar o estado', () => {
    const spy = vi.fn();
    EventBus.on(STORE_EVENTS.REPORT_UPDATED, spy);

    store.addSection('bullets');

    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        sections: expect.arrayContaining([
          expect.objectContaining({ type: 'bullets' }),
        ]),
      }),
    );
  });

  it('deve reordenar as seções corretamente', () => {
    store.addSection('text'); // ID 0
    store.addSection('images'); // ID 1

    const firstId = store.state.sections[0].id;

    store.reorderSections(0, 1);

    expect(store.state.sections[1].id).toBe(firstId);
    expect(store.state.sections[0].type).toBe('images');
  });
});
