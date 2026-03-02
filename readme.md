# 📈 Aporte Inteligente — Gestão de Carteira e Dividendos

<p align="center">
  <img src="https://img.shields.io/badge/Status-Vers%C3%A3o%202.0-success?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-yellow?style=for-the-badge&logo=javascript" alt="JS">
  <img src="https://img.shields.io/badge/CSS3-Responsive-blue?style=for-the-badge&logo=css3" alt="CSS">
  <img src="https://img.shields.io/badge/HTML5-Semantic-orange?style=for-the-badge&logo=html5" alt="HTML">
</p>

O **Aporte Inteligente** é um cockpit financeiro completo, desenvolvido para pequenos e médios investidores focados na estratégia de **Buy and Hold** e na geração de **Renda Passiva**. Esqueça as planilhas complexas: tenha o controle absoluto da sua carteira diretamente no seu navegador.

---

## 🎯 Sobre o Projeto

O projeto nasceu da necessidade de automatizar o controle de investimentos na **B3 (Bolsa Brasileira)** de forma simples, visual e, acima de tudo, **privada**. 

> [!IMPORTANT]
> **Privacidade em Primeiro Lugar:** Seus dados financeiros nunca saem do seu computador. Todo o armazenamento é feito localmente no seu navegador através do `localStorage`.

---

## ✨ Funcionalidades Principais

### 💼 Gestão de Carteira
- **Carteira Consolidada:** Visualize Preço Médio, Quantidade, Total Atual e Lucro/Prejuízo em tempo real.
- **Cálculo de YoC (Yield on Cost):** Saiba exatamente qual o retorno real que seus dividendos geram sobre o capital investido.
- **Categorização por Setor:** Organize seus ativos por setores (Bancos, Energia, FIIs, etc.) para um rebalanceamento eficiente.

### 📊 Visualização e Relatórios
- **Dashboard de Gráficos:** Composição da Carteira, Valor por Ativo e Evolução da "Bola de Neve" de Dividendos.
- **Copiar Gráficos:** Botão integrado para copiar cards de gráficos em alta resolução (PNG) para compartilhar ou documentar.
- **Resumo Geral:** Cards no topo com Total Investido, Total em Dividendos e Rentabilidade Acumulada.

### 🎯 Estratégia e Monitoramento
- **Radar de Oportunidades:** Monitore ativos com base no **Preço Teto** (Estratégia Bazin/Barsi).
- **Sinal de Trânsito:** Alertas visuais automáticos (🟢 Comprar / 🔴 Aguardar) baseados em cotações reais via API.

### 📥 Importação e Exportação
- **Gestão de Dados (CSV):** Importação e exportação inteligente de Aportes e Dividendos.
- **Compatibilidade Total:** Lógica robusta para lidar com diferentes formatos de arquivos (Windows/Mac/Linux) e tratamento de caracteres especiais (`\r\n`).
- **Modelos Prontos:** Baixe templates de CSV diretamente da aplicação para facilitar a migração de dados.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza uma stack moderna, leve e sem dependências pesadas:

- **JavaScript Vanilla:** Lógica pura para máxima performance e compatibilidade.
- **Chart.js:** Renderização de gráficos interativos e responsivos.
- **html2canvas:** Captura de elementos HTML para geração de imagens de alta qualidade.
- **Brapi API:** Integração real para cotações da B3 em tempo real.
- **CSS3 Flexbox/Grid:** Layout totalmente responsivo adaptado para Desktop e Mobile.

---

## 📱 Como Usar (Instalação Local)

1. **Baixe os Arquivos:** Faça o download dos arquivos `index.html`, `style.css` e `script.js`.
2. **Obtenha seu Token:**
   - Crie uma conta gratuita em [brapi.dev](https://brapi.dev).
   - Copie seu Token de API.
3. **Configure o Script:**
   - Abra o arquivo `script.js`.
   - Na primeira linha, substitua `'COLOQUE_SEU_TOKEN_AQUI'` pelo seu token real.
4. **Execute:**
   - Abra o arquivo `index.html` em qualquer navegador moderno.
   - Comece a registrar seus aportes e veja sua renda passiva crescer! 🚀

---

## 🛠️ Estrutura de Arquivos

```text
.
├── index.html    # Estrutura semântica e interface do usuário
├── style.css     # Identidade visual (B3 Style) e regras de responsividade
├── script.js     # Lógica de negócio, integração com API e persistência
└── README.md     # Documentação técnica do projeto
```

---

## 🤝 Contribuições e Créditos

Este projeto foi desenvolvido como uma ferramenta pessoal de gestão de patrimônio e busca pela independência financeira. 

> [!NOTE]
> O desenvolvimento contou com o auxílio de Inteligência Artificial (**Gemini** e **Manus**) para a estruturação lógica, refatoração de código e otimização de UI/UX.

---
<p align="center">
  <i>Construindo patrimônio e renda passiva no longo prazo.</i> 📈
</p>
