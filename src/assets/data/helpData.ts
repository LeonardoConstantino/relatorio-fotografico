export const helpData = {
  tutorialSection: [
    {
      id: 1,
      title: 'O que é',
      content:
        'Aura Technical é um estúdio de evidências para criação de laudos e relatórios de inspeção. Opera como PWA totalmente offline, com motor de compressão de imagens via Canvas e layout A4 em unidades físicas (mm) para fidelidade de impressão 1:1.',
      imageDescription: '',
    },
    {
      id: 2,
      title: 'Quando usar',
      content:
        'Registro fotográfico de equipamentos, patrimônios ou inspeções técnicas. Ambientes sem conectividade (offline-first). Necessidade de rastreabilidade por Trace ID e paginação automática. Geração de PDF profissional com margens técnicas controladas.',
      imageDescription: '',
    },
    {
      id: 3,
      title: 'Passo a passo',
      content:
        '1. Iniciar relatório: acesse o app ou abra o link. Se não houver relatório em edição, inicie um novo ou carregue um template.\n2. Configurar cabeçalho: preencha empresa, número do relatório, data, cor primária e logo.\n3. Adicionar seções: escolha entre Equipamento, Texto (Markdown), Lista com marcadores, Imagens (1–3 colunas) ou Quebra de página.\n4. Inserir e editar imagens: faça upload ou arraste; compressão automática; clique na imagem para anotações (círculos, setas), zoom, rotação, corte.\n5. Reordenar seções: arraste pelos ícones de grip.\n6. Validar conformidade: barra de status mostra pendências (empresa, número, logo, seções).\n7. Ajustar visualização: use zoom (+/-/1:1) ou Alt+P para alternar preview.\n8. Exportar e gerar PDF: clique em Gerar PDF; no diálogo, escolha Salvar como PDF, margens Nenhuma e ative Gráficos de fundo.\n9. Salvar e compartilhar: salvamento automático em IndexedDB; exportar/importar JSON.',
      imageDescription: '',
    },
    {
      id: 4,
      title: 'Erros comuns',
      content:
        'Problemas frequentes: PDF com bordas cortadas (solução: usar Margens: Nenhuma e ativar Gráficos de fundo). Conteúdo excede a página (solução: dividir seção, ajustar colunas ou inserir quebra de página). Imagem não aparece (solução: verificar formato JPEG/PNG/WebP, tamanho <20MB). Relatório não salva (solução: liberar IndexedDB no navegador). Editor de anotações não desenha (solução: usar botão Limpar/Reset).',
      imageDescription: '',
    },
    {
      id: 5,
      title: 'Dicas avançadas',
      content:
        'Templates personalizados: use o Editor de templates para salvar estruturas pré-definidas. Markdown em seções de texto: suporta negrito, itálico, listas, links e cabeçalhos. Controle de versão: cada página tem Trace ID único. Limpeza seletiva: mantenha configurações de empresa ao limpar apenas seções. Atalhos: Alt+P alterna preview; Ctrl+S força salvamento manual. PWA: instale o app para uso offline completo.',
      imageDescription: '',
    },
    {
      id: 6,
      title: 'Resumo rápido',
      content:
        '1. Configure cabeçalho (empresa, número, logo).\n2. Adicione seções (equipamento, texto, imagens).\n3. Edite imagens com anotações.\n4. Reordene seções por arrasto.\n5. Valide pendências na barra de status.\n6. Gere PDF com Margens: Nenhuma.\n7. Use exportação/importação JSON para backup.',
      imageDescription: '',
    },
  ],
  faqItens: [
    {
      q: 'PDF sai com bordas cortadas ou conteúdo deslocado.',
      a: 'Causa: margens configuradas no diálogo de impressão. Solução: use "Margens: Nenhuma" e ative "Gráficos de fundo".',
    },
    {
      q: 'Conteúdo excede a página (transbordo).',
      a: 'Causa: seção muito longa ou imagens grandes. Solução: divida a seção, ajuste colunas ou insira quebra de página manual.',
    },
    {
      q: 'Imagem não aparece após upload.',
      a: 'Causa: erro de compressão ou formato não suportado. Solução: use JPEG, PNG, WebP; evite arquivos >20 MB; verifique console (F12).',
    },
    {
      q: 'Relatório não salva automaticamente.',
      a: 'Causa: armazenamento do navegador bloqueado. Solução: habilite cookies/IndexedDB e garanta espaço disponível.',
    },
    {
      q: 'Editor de anotações não desenha ou perde precisão.',
      a: 'Causa: interrupção na sessão de desenho. Solução: use o botão "Limpar" ou "Reset" no toolbar para reiniciar.',
    },
  ],
  proTips: [
    {
      icon: 'layout-template',
      tip: "Crie templates personalizados no 'Editor de templates' e carregue-os rapidamente para iniciar novos relatórios.",
    },
    {
      icon: 'code',
      tip: 'Use Markdown nas seções de texto: **negrito**, *itálico*, listas, links e cabeçalhos.',
    },
    {
      icon: 'fingerprint',
      tip: 'Cada página do PDF recebe um Trace ID único (timestamp + hash) para auditoria e rastreabilidade.',
    },
    {
      icon: 'eraser',
      tip: "Limpe apenas as seções mantendo configurações de empresa, cor e logo (menu 'Mais opções').",
    },
    {
      icon: 'keyboard',
      tip: 'Atalhos úteis: Alt+P alterna visibilidade do preview; Ctrl+S força salvamento manual.',
    },
    {
      icon: 'download-cloud',
      tip: "Instale o aplicativo como PWA (botão 'Instalar' na barra de endereço) para funcionar 100% offline.",
    },
    {
      icon: 'image',
      tip: 'Imagens são comprimidas automaticamente para <300KB; use o editor integrado para anotações e ajustes.',
    },
    {
      icon: 'grid',
      tip: 'O editor de imagens exibe um grid estilo CAD, facilitando o alinhamento de anotações.',
    },
    {
      icon: 'file-json',
      tip: 'Exporte o relatório como JSON para backup ou transferência entre dispositivos; importe depois para restaurar.',
    },
    {
      icon: 'eye',
      tip: 'Ajuste o zoom do preview (20% a 200%) e o estado é persistido automaticamente.',
    },
  ],
};
