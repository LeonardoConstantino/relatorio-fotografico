// ==================== ESTADO DA APLICAÇÃO ====================
let appState = {
  config: {
    logo: '',
    title: 'Relatório de Recebimento',
    primaryColor: '#1976D2',
    company: '',
    reportNumber: '',
    reportDate: '',
  },
  sections: [],
};

let sectionCounter = 0;

// ==================== INICIALIZAÇÃO ====================
function init() {
  loadFromLocalStorage();
  setupEventListeners();
  updatePreview();
}

function setupEventListeners() {
  // Configurações gerais
  document
    .getElementById('logoInput')
    .addEventListener('change', handleLogoUpload);
  document.getElementById('reportTitle').addEventListener('input', (e) => {
    appState.config.title = e.target.value;
    autoSave();
  });
  document.getElementById('primaryColor').addEventListener('input', (e) => {
    appState.config.primaryColor = e.target.value;
    document.documentElement.style.setProperty(
      '--primary-color',
      e.target.value,
    );
    autoSave();
  });
  document.getElementById('companyName').addEventListener('input', (e) => {
    appState.config.company = e.target.value;
    autoSave();
  });
  document.getElementById('reportNumber').addEventListener('input', (e) => {
    appState.config.reportNumber = e.target.value;
    autoSave();
  });
  document.getElementById('reportDate').addEventListener('input', (e) => {
    appState.config.reportDate = e.target.value;
    autoSave();
  });
}

// ==================== UPLOAD DE LOGO ====================
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      appState.config.logo = event.target.result;
      autoSave();
    };
    reader.readAsDataURL(file);
  }
}

// ==================== ADICIONAR SEÇÕES ====================
function addSection(type) {
  const sectionId = `section-${++sectionCounter}`;
  let section = {
    id: sectionId,
    type: type,
    data: {},
  };

  // Dados padrão por tipo
  switch (type) {
    case 'equipment':
      section.data = {
        title: 'Identificação do Equipamento',
        description: '',
        model: '',
        patrimony: '',
        owner: '',
      };
      break;
    case 'pagebreak':
      section.data = {
        title: '--- Quebra de Página ---',
      };
      break;
    case 'text':
      section.data = {
        title: 'Observações',
        content: '',
      };
      break;
    case 'bullets':
      section.data = {
        title: 'Itens Verificados',
        items: [''],
      };
      break;
    case 'images':
      section.data = {
        title: 'Registro Fotográfico',
        images: [],
        columns: 2,
      };
      break;
  }

  appState.sections.push(section);
  renderSectionsList();
  autoSave();
}

// ==================== RENDERIZAR LISTA DE SEÇÕES ====================
function renderSectionsList() {
  const container = document.getElementById('sectionsList');

  if (appState.sections.length === 0) {
    container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <p>Nenhuma seção adicionada ainda</p>
                    </div>
                `;
    return;
  }

  container.innerHTML = appState.sections
    .map((section, index) => {
      const typeLabels = {
        equipment: '📦 Equipamento',
        text: '📝 Texto',
        bullets: '• Lista',
        images: '📷 Imagens',
        pagebreak: '⤵️ Quebra de Página',
      };

      return `
                    <div class="section-item">
                        <div class="section-header" onclick="toggleSection('${section.id}')">
                            <h4>
                                ${typeLabels[section.type] || section.type}
                                <span style="font-weight: normal; color: #999;">| ${section.data.title || 'Sem título'}</span>
                            </h4>
                            <div class="section-controls" onclick="event.stopPropagation();">
                                ${index > 0 ? `<button class="btn btn-outline" onclick="moveSection(${index}, -1)">↑</button>` : ''}
                                ${index < appState.sections.length - 1 ? `<button class="btn btn-outline" onclick="moveSection(${index}, 1)">↓</button>` : ''}
                                <button class="btn btn-danger" onclick="removeSection(${index})">×</button>
                            </div>
                        </div>
                        <div class="section-content" id="content-${section.id}">
                            ${renderSectionEditor(section, index)}
                        </div>
                    </div>
                `;
    })
    .join('');

  updatePreview();
}

// ==================== RENDERIZAR EDITOR DE SEÇÃO ====================
function renderSectionEditor(section, index) {
  switch (section.type) {
    case 'equipment':
      return `
                        <div class="form-group">
                            <label>Título da Seção</label>
                            <input type="text" value="${section.data.title}" 
                                onchange="updateSectionData(${index}, 'title', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Descrição</label>
                            <input type="text" value="${section.data.description || ''}" 
                                onchange="updateSectionData(${index}, 'description', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Modelo</label>
                            <input type="text" value="${section.data.model || ''}" 
                                onchange="updateSectionData(${index}, 'model', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Patrimônio</label>
                            <input type="text" value="${section.data.patrimony || ''}" 
                                onchange="updateSectionData(${index}, 'patrimony', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Proprietário</label>
                            <input type="text" value="${section.data.owner || ''}" 
                                onchange="updateSectionData(${index}, 'owner', this.value)">
                        </div>
                    `;

    case 'text':
      return `
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" value="${section.data.title}" 
                                onchange="updateSectionData(${index}, 'title', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Conteúdo</label>
                            <textarea onchange="updateSectionData(${index}, 'content', this.value)">${section.data.content || ''}</textarea>
                        </div>
                    `;

    case 'bullets':
      return `
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" value="${section.data.title}" 
                                onchange="updateSectionData(${index}, 'title', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Itens</label>
                            ${section.data.items
                              .map(
                                (item, i) => `
                                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                                    <input type="text" value="${item}" 
                                        onchange="updateBulletItem(${index}, ${i}, this.value)"
                                        placeholder="Item ${i + 1}">
                                    ${
                                      section.data.items.length > 1
                                        ? `<button class="btn btn-danger" onclick="removeBulletItem(${index}, ${i})">×</button>`
                                        : ''
                                    }
                                </div>
                            `,
                              )
                              .join('')}
                            <button class="btn btn-outline btn-block mt-10" onclick="addBulletItem(${index})">+ Adicionar Item</button>
                        </div>
                    `;

    case 'images':
      return `
                        <div class="form-group">
                            <label>Título</label>
                            <input type="text" value="${section.data.title}" 
                                onchange="updateSectionData(${index}, 'title', this.value)">
                        </div>
                        <div class="form-group">
                            <label>Colunas</label>
                            <select onchange="updateSectionData(${index}, 'columns', parseInt(this.value))">
                                <option value="1" ${section.data.columns === 1 ? 'selected' : ''}>1 coluna</option>
                                <option value="2" ${section.data.columns === 2 ? 'selected' : ''}>2 colunas</option>
                                <option value="3" ${section.data.columns === 3 ? 'selected' : ''}>3 colunas</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Adicionar Imagens</label>
                            <input type="file" accept="image/*" multiple onchange="handleImageUpload(event, ${index})">
                        </div>
                        ${
                          section.data.images.length > 0
                            ? `
                            <div class="image-preview-grid">
                                ${section.data.images
                                  .map(
                                    (img, i) => `
                                    <div class="image-preview-item">
                                        <img src="${img.src}" alt="Preview">
                                        <button class="remove-image" onclick="removeImage(${index}, ${i})">×</button>
                                        <input type="text" placeholder="Legenda" value="${img.caption || ''}"
                                            onchange="updateImageCaption(${index}, ${i}, this.value)">
                                    </div>
                                `,
                                  )
                                  .join('')}
                            </div>
                        `
                            : ''
                        }
                    `;
    case 'pagebreak':
      return `
                        <div style="text-align: center; padding: 20px; color: #999;">
                            <div style="font-size: 32px; margin-bottom: 10px;">⤵️</div>
                            <div style="font-weight: 600;">Marcador de Quebra de Página</div>
                            <div style="font-size: 12px; margin-top: 5px;">Uma nova página começará após este ponto</div>
                        </div>
                    `;
  }
}

// ==================== MANIPULAÇÃO DE SEÇÕES ====================
function toggleSection(sectionId) {
  const content = document.getElementById(`content-${sectionId}`);
  content.classList.toggle('collapsed');
}

function removeSection(index) {
  if (confirm('Remover esta seção?')) {
    appState.sections.splice(index, 1);
    renderSectionsList();
    autoSave();
  }
}

function moveSection(index, direction) {
  const newIndex = index + direction;
  if (newIndex >= 0 && newIndex < appState.sections.length) {
    [appState.sections[index], appState.sections[newIndex]] = [
      appState.sections[newIndex],
      appState.sections[index],
    ];
    renderSectionsList();
    autoSave();
  }
}

function updateSectionData(index, field, value) {
  appState.sections[index].data[field] = value;
  autoSave();
}

// ==================== MANIPULAÇÃO DE LISTAS ====================
function updateBulletItem(sectionIndex, itemIndex, value) {
  appState.sections[sectionIndex].data.items[itemIndex] = value;
  autoSave();
}

function addBulletItem(sectionIndex) {
  appState.sections[sectionIndex].data.items.push('');
  renderSectionsList();
}

function removeBulletItem(sectionIndex, itemIndex) {
  appState.sections[sectionIndex].data.items.splice(itemIndex, 1);
  renderSectionsList();
  autoSave();
}

// ==================== MANIPULAÇÃO DE IMAGENS ====================
function handleImageUpload(event, sectionIndex) {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        appState.sections[sectionIndex].data.images.push({
          src: e.target.result,
          caption: '',
        });
        renderSectionsList();
        autoSave();
      };
      reader.readAsDataURL(file);
    }
  });
}

function removeImage(sectionIndex, imageIndex) {
  appState.sections[sectionIndex].data.images.splice(imageIndex, 1);
  renderSectionsList();
  autoSave();
}

function updateImageCaption(sectionIndex, imageIndex, caption) {
  appState.sections[sectionIndex].data.images[imageIndex].caption = caption;
  autoSave();
}

// ==================== RENDERIZAR PREVIEW ====================
function updatePreview() {
  const container = document.getElementById('previewSheet');
  const { config, sections } = appState;

  // Se não há seções, mostra tela vazia
  if (sections.length === 0) {
    container.innerHTML = `
            <section class="sheet padding-20mm">
                <div class="empty-state">
                    <div class="empty-state-icon">👆</div>
                    <p>Configure as informações e adicione seções no painel lateral</p>
                </div>
            </section>
        `;
    return;
  }

  // Array para armazenar o conteúdo de cada página
  let pages = [];
  let currentPageContent = '';
  let isFirstPage = true;

  // Cabeçalho do relatório (vai na primeira página)
  const header = `
            <div class="report-header">
                <div class="report-header-left">
                    ${config.logo ? `<img src="${config.logo}" class="report-logo" alt="Logo">` : ''}
                    <div class="report-title" style="color: ${config.primaryColor}">${config.title}</div>
                    ${config.company ? `<div class="report-subtitle">${config.company}</div>` : ''}
                    ${config.reportNumber ? `<div class="report-subtitle">Nº ${config.reportNumber}</div>` : ''}
                </div>
                <div style="text-align: right; font-size: 12px; color: #666;">
                    <div id="reportDate">Data: ${config.reportDate || new Date().toLocaleDateString('pt-BR')}</div>
                </div>
            </div>
        `;

  currentPageContent = header;

  // Renderizar cada seção
  sections.forEach((section, index) => {
    // Se for quebra de página, finaliza a página atual e começa nova
    if (section.type === 'pagebreak') {
      // Adicionar marcador visual no preview
      currentPageContent += `
                <div class="page-break-marker">
                    ⤵️ QUEBRA DE PÁGINA
                </div>
            `;

      // Salvar página atual e começar nova
      if (currentPageContent.trim()) {
        pages.push(currentPageContent);
        currentPageContent = '';
        isFirstPage = false;
      }
      return; // Pula para próxima seção
    }

    let sectionHtml = `<div class="preview-section">`;
    sectionHtml += `<div class="preview-section-title" style="border-color: ${config.primaryColor}; color: ${config.primaryColor}">${section.data.title}</div>`;

    switch (section.type) {
      case 'equipment':
        sectionHtml += `
                    <div class="equipment-info">
                        <div class="info-field">
                            <div class="info-label">Descrição</div>
                            <div class="info-value">${section.data.description || '-'}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Modelo</div>
                            <div class="info-value">${section.data.model || '-'}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Patrimônio</div>
                            <div class="info-value">${section.data.patrimony || '-'}</div>
                        </div>
                        <div class="info-field">
                            <div class="info-label">Proprietário</div>
                            <div class="info-value">${section.data.owner || '-'}</div>
                        </div>
                    </div>
                `;
        break;

      case 'text':
        sectionHtml += `<div class="text-content">${section.data.content || ''}</div>`;
        break;

      case 'bullets':
        sectionHtml += `<ul class="bullet-list">`;
        section.data.items.forEach((item) => {
          if (item.trim()) {
            sectionHtml += `<li>${item}</li>`;
          }
        });
        sectionHtml += `</ul>`;
        break;

      case 'images':
        if (section.data.images.length > 0) {
          sectionHtml += `<div class="images-grid cols-${section.data.columns}">`;
          section.data.images.forEach((img) => {
            sectionHtml += `
                            <div class="image-item">
                                <img src="${img.src}" alt="${img.caption || 'Imagem'}">
                                ${img.caption ? `<div class="image-caption">${img.caption}</div>` : ''}
                            </div>
                        `;
          });
          sectionHtml += `</div>`;
        }
        break;
    }

    sectionHtml += `</div>`;

    // Adicionar seção ao conteúdo da página atual
    currentPageContent += sectionHtml;
  });

  // Adicionar última página se houver conteúdo
  if (currentPageContent.trim()) {
    pages.push(currentPageContent);
  }

  // Renderizar todas as páginas
  let finalHtml = '';
  pages.forEach((pageContent) => {
    finalHtml += `<section class="sheet padding-20mm">${pageContent}</section>`;
  });

  container.innerHTML = finalHtml;
}

// ==================== PERSISTÊNCIA ====================
function autoSave() {
  updatePreview();
  localStorage.setItem('reportState', JSON.stringify(appState));
  showAutoSaveIndicator();
}

function saveReport() {
  localStorage.setItem('reportState', JSON.stringify(appState));
  alert('Relatório salvo com sucesso!');
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem('reportState');
  if (saved) {
    try {
      appState = JSON.parse(saved);

      // Restaurar valores nos inputs
      document.getElementById('reportTitle').value = appState.config.title;
      document.getElementById('primaryColor').value =
        appState.config.primaryColor;
      document.getElementById('companyName').value =
        appState.config.company || '';
      document.getElementById('reportNumber').value =
        appState.config.reportNumber || '';

      // Aplicar cor primária
      document.documentElement.style.setProperty(
        '--primary-color',
        appState.config.primaryColor,
      );

      // Atualizar counter
      sectionCounter = appState.sections.length;

      renderSectionsList();
    } catch (e) {
      console.error('Erro ao carregar dados salvos:', e);
    }
  }
}

function clearReport() {
  if (
    confirm(
      'Tem certeza que deseja limpar todos os dados e criar um novo relatório?',
    )
  ) {
    appState = {
      config: {
        logo: '',
        title: 'Relatório de Recebimento',
        primaryColor: '#1976D2',
        company: '',
        reportNumber: '',
      },
      sections: [],
    };
    sectionCounter = 0;

    document.getElementById('reportTitle').value = appState.config.title;
    document.getElementById('primaryColor').value =
      appState.config.primaryColor;
    document.getElementById('companyName').value = '';
    document.getElementById('reportNumber').value = '';
    document.getElementById('logoInput').value = '';

    renderSectionsList();
    autoSave();
  }
}

function showAutoSaveIndicator() {
  const indicator = document.getElementById('autoSaveIndicator');
  indicator.style.display = 'flex';
  setTimeout(() => {
    indicator.style.display = 'none';
  }, 2000);
}

// ==================== INICIALIZAR APLICAÇÃO ====================
window.addEventListener('DOMContentLoaded', init);

// Prevenir perda de dados
window.addEventListener('beforeunload', (e) => {
  if (appState.sections.length > 0) {
    autoSave();
  }
});
