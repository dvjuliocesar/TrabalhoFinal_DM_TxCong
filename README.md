# Sistema de Gestão de Dados do Tribunal

<div align="center">

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![Flask](https://img.shields.io/badge/flask-v3.0.0-green.svg)
![Bootstrap](https://img.shields.io/badge/bootstrap-v5.1.3-purple.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**Sistema web completo para análise de dados processuais do tribunal com integração Snowflake MCP**

</div>

## 📋 Sobre o Projeto

Sistema web desenvolvido em **Flask** para gestão e análise de dados processuais do tribunal, oferecendo:

- 📊 **Análise de Dados**: Upload e processamento de arquivos CSV
- 🎯 **Filtros Avançados**: Sistema de filtros em cascata
- 📈 **Visualizações**: Gráficos interativos com Plotly
- 📱 **Interface Moderna**: Design responsivo com Bootstrap 5

## ⚡ Demo Online

- [**Sistema Tribunal - Versão Completa**](https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/030e5a7c9b9ca074060c0f94f429a1e3/80c7e5ae-aeeb-489d-bf73-2680da80195c/index.html)

## 🚀 Instalação Rápida

```bash
# 1. Criar ambiente virtual
python -m venv tribunal_env

# 2. Ativar ambiente virtual
# Windows:
tribunal_env\Scripts\activate
# Linux/Mac:
source tribunal_env/bin/activate

# 3. Instalar dependências
pip install -r requirements.txt

# 4. Executar aplicação
python app.py
```

**Acesse: http://localhost:5000**

## 📊 Testando a Aplicação

1. **Acesse** http://localhost:5000
2. **Upload** um dos arquivos CSV da pasta `data/`:
   - `dados_tribunal_exemplo.csv` (vírgula)
   - `dados_tribunal_exemplo_pv.csv` (ponto e vírgula)
3. **Selecione o delimitador** correto
4. **Clique "Fazer Upload"**
5. **Explore** filtros e visualizações

## ✨ Funcionalidades

### 📤 Upload de Arquivos
- ✅ Múltiplos delimitadores (vírgula, ponto e vírgula, pipe, tabulação)
- ✅ Validação de estrutura e formato
- ✅ Processamento até 100MB
- ✅ Mensagem "Processamento Concluído!"

### 🔍 Filtros Dinâmicos
- ✅ **Entrância**: INICIAL, INTERMEDIÁRIA, FINAL
- ✅ **Comarca**: Lista dinâmica baseada nos dados
- ✅ **Serventia**: Dependente da comarca selecionada
- ✅ **Período**: Últimos 12 meses, Biênio, Triênio

### 📊 Indicadores
- 🔢 **Casos Novos**: Quantidade total
- 📋 **Baixados**: Quantidade total  
- ⏳ **Pendentes**: Quantidade total
- 📉 **Taxa de Congestionamento**: Cálculo automático

### 📈 Visualizações
- 📊 **Modo Tabela**: Dados tabulares com ordenação
- 📈 **Modo Gráfico**: Evolução da taxa de congestionamento
- 🏆 **Cartões de Métricas**: Totais consolidados
- 💾 **Exportação**: CSV e Excel

## 🛠️ Tecnologias

- **Python 3.8+** & **Flask 3.0.0**
- **Pandas** & **NumPy** para processamento
- **Plotly** para visualizações interativas
- **Bootstrap 5** para interface responsiva
- **Snowflake MCP** para data warehouse (opcional)

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.
