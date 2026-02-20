# 📋 Gerador de Relatórios Fotográficos

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![License](https://img.shields.io/badge/licença-MIT-green?style=flat)

> Ferramenta web para criação e exportação de relatórios fotográficos profissionais no formato A4, diretamente no navegador — sem necessidade de servidor ou instalação.

---

## 📌 Sobre o Projeto

O **Gerador de Relatórios Fotográficos** é uma aplicação web 100% client-side que permite criar relatórios visuais estruturados de forma rápida e intuitiva. Por meio de um painel lateral de edição, o usuário configura o cabeçalho do relatório, adiciona seções de diferentes tipos (textos, listas, imagens, informações de equipamento e quebras de página) e visualiza o resultado em tempo real em um layout A4 fiel ao que será impresso ou exportado como PDF.

Todo o estado da aplicação é persistido automaticamente via `localStorage`, garantindo que o trabalho não seja perdido ao recarregar a página. A exportação do relatório é feita diretamente pelo recurso de impressão do navegador, gerando um PDF de alta fidelidade sem depender de bibliotecas externas de geração de arquivos.

---

## ✨ Funcionalidades

- **Editor em tempo real** com painel lateral e preview A4 sincronizado
- **Seções modulares** e reordenáveis:
  - 📦 Identificação de Equipamento (descrição, modelo, patrimônio, proprietário)
  - 📝 Texto Livre
  - • Lista com Marcadores
  - 📷 Grade de Imagens (1, 2 ou 3 colunas, com legendas)
  - ⤵️ Quebra de Página
- **Upload de logo** da empresa no cabeçalho
- **Cor primária personalizável** aplicada em tempo real
- **Autosave automático** via `localStorage`
- **Exportação para PDF** via impressão nativa do navegador
- **Sem dependências de backend** — roda completamente no navegador

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                     Navegador (Browser)                 │
│                                                         │
│  ┌────────────────┐        ┌──────────────────────────┐ │
│  │  Editor Panel  │◄──────►│     Preview Panel (A4)   │ │
│  │  (aside)       │        │     (main)               │ │
│  │                │        │                          │ │
│  │ • Config Geral │  state │ • Cabeçalho do Relatório │ │
│  │ • Adicionar    │◄──────►│ • Seções renderizadas    │ │
│  │   Seções       │        │ • Páginas separadas      │ │
│  │ • Seções       │        │                          │ │
│  │   Adicionadas  │        └──────────────────────────┘ │
│  └────────────────┘                    │                 │
│           │                           │                 │
│           ▼                           ▼                 │
│     localStorage                window.print()          │
│     (autosave)                  (PDF export)            │
└─────────────────────────────────────────────────────────┘
```

**Fluxo de dados:**
1. O usuário interage com o `Editor Panel`
2. Alterações atualizam o objeto `appState` em memória
3. `updatePreview()` re-renderiza o HTML do relatório
4. `autoSave()` persiste o estado no `localStorage`

---

## 🚀 Como Usar

### Pré-requisitos

Nenhum. Apenas um navegador moderno (Chrome, Edge ou Firefox recomendados para melhor fidelidade na exportação PDF).

### Execução

1. Faça o download ou clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/gerador-relatorio-fotografico.git
   ```

2. Abra o arquivo `index.html` diretamente no navegador:
   ```bash
   # Linux / macOS
   open index.html

   # Windows
   start index.html
   ```

> Não é necessário servidor HTTP. A aplicação funciona como arquivo local.

### Criando um Relatório

| Passo | Ação |
|-------|------|
| 1 | Preencha as **Configurações Gerais** (título, empresa, número, data, cor e logo) |
| 2 | Clique nos botões de **Adicionar Seção** para incluir blocos de conteúdo |
| 3 | Edite cada seção no painel lateral — o preview atualiza em tempo real |
| 4 | Reordene seções com as setas ↑ ↓ ou remova com o botão × |
| 5 | Clique em **🖨️ Gerar PDF** para abrir o diálogo de impressão e salvar como PDF |

---

## 📁 Estrutura do Projeto

```
gerador-relatorio-fotografico/
└── index.html        # Aplicação completa (HTML + CSS + JS em único arquivo)
```

A aplicação foi intencionalmente construída como um único arquivo HTML autocontido, facilitando distribuição e uso offline.

---

## 🧩 Tipos de Seção

### 📦 Identificação do Equipamento
Exibe uma grade com campos: **Descrição**, **Modelo**, **Patrimônio** e **Proprietário**.

### 📝 Texto Livre
Bloco de parágrafo com título configurável. Ideal para observações, conclusões ou laudos.

### • Lista com Marcadores
Lista de itens verificados ou anotações pontuais, com adição e remoção dinâmica de linhas.

### 📷 Grade de Imagens
Upload de múltiplas fotos com suporte a legendas individuais. Layout configurável em 1, 2 ou 3 colunas.

### ⤵️ Quebra de Página
Força o início de uma nova página A4 no PDF gerado.

---

## 💾 Persistência de Dados

O estado completo do relatório (configurações e todas as seções, incluindo imagens em Base64) é salvo automaticamente no `localStorage` do navegador a cada alteração. Para recuperar um relatório anterior, basta reabrir o arquivo no mesmo navegador.

> ⚠️ **Atenção:** Limpar os dados do navegador ou usar o modo anônimo apagará o relatório salvo. Use o botão **💾 Salvar** para garantir a persistência antes de fechar.

---

## 🖨️ Exportação para PDF

1. Clique no botão **🖨️ Gerar PDF** no topo da área de preview
2. No diálogo de impressão do navegador, selecione **"Salvar como PDF"**
3. Configure:
   - **Tamanho do papel:** A4
   - **Margens:** Nenhuma (None)
   - **Gráficos de fundo:** Ativado ✅ (para preservar cores)

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Uso |
|------------|-----|
| HTML5 | Estrutura e semântica |
| CSS3 | Layout, variáveis CSS, media queries de impressão |
| JavaScript (ES6+) | Lógica de estado, renderização dinâmica, FileReader API |
| [Paper CSS](https://github.com/cognitom/paper-css) v0.3.0 | Simulação de folhas A4 no navegador |
| localStorage API | Persistência client-side |
| FileReader API | Conversão de imagens para Base64 |
| `window.print()` | Exportação para PDF |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do projeto
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/minha-feature
   ```
3. Commit suas alterações:
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin feature/minha-feature
   ```
5. Abra um **Pull Request**

### Sugestões de melhorias futuras
- [ ] Exportação direta para `.docx`
- [ ] Templates pré-definidos de relatórios
- [ ] Campo de assinatura digital
- [ ] Suporte a tabelas personalizadas
- [ ] Importação/exportação do estado em JSON

---

## ❓ FAQ

**O relatório é salvo na nuvem?**
Não. Todos os dados ficam armazenados localmente no seu navegador via `localStorage`. Nenhuma informação é enviada a servidores.

**Posso usar em dispositivos móveis?**
A aplicação é responsiva no layout geral, mas a experiência de edição é otimizada para desktops. A exportação PDF em mobile depende do suporte do navegador.

**As imagens ficam armazenadas no arquivo?**
As imagens são convertidas para Base64 e armazenadas no `localStorage`. Imagens grandes podem atingir o limite de armazenamento (~5MB). Prefira imagens comprimidas.

**Posso usar sem conexão com a internet?**
Sim, exceto pelo carregamento inicial do Paper CSS via CDN. Para uso totalmente offline, faça o download do `paper.css` e ajuste o caminho no `<link>`.

---

## 📄 Licença

Este projeto está licenciado sob a **Licença MIT**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
  Feito com ❤️ para facilitar a criação de relatórios profissionais
</div>