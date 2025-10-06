# 📊 Dados de Exemplo - Sistema Tribunal

Esta pasta contém arquivos CSV de exemplo para testar todas as funcionalidades do sistema.

## 📁 Arquivos Disponíveis

### 1. **dados_tribunal_exemplo.csv**
- **Delimitador**: Vírgula (,)
- **Registros**: 408 linhas de dados
- **Período**: 12 meses (2024-01 a 2024-12)
- **Encoding**: UTF-8

### 2. **dados_tribunal_exemplo_pv.csv**
- **Delimitador**: Ponto e vírgula (;)
- **Registros**: 408 linhas de dados (mesmo conteúdo)
- **Período**: 12 meses (2024-01 a 2024-12)
- **Encoding**: UTF-8

## 📋 Estrutura dos Dados

```csv
data_processo,entrancia,comarca,serventia,casos_novos,baixados,pendentes
2024-01,INICIAL,São Paulo,1ª Vara Cível,150,120,80
2024-02,INTERMEDIÁRIA,Rio de Janeiro,2ª Vara Criminal,200,180,120
2024-03,FINAL,Brasília,Tribunal Superior,300,280,200
```

### Colunas Obrigatórias:
- **data_processo**: Data no formato YYYY-MM
- **entrancia**: INICIAL, INTERMEDIÁRIA ou FINAL
- **comarca**: Nome da comarca
- **serventia**: Nome da serventia/vara
- **casos_novos**: Número inteiro (novos processos)
- **baixados**: Número inteiro (processos finalizados)
- **pendentes**: Número inteiro (processos em andamento)

## 📈 Conteúdo dos Dados

### Entrâncias (3):
- **INICIAL**: 4 comarcas, casos de menor complexidade
- **INTERMEDIÁRIA**: 4 comarcas, casos de média complexidade  
- **FINAL**: 3 comarcas, casos de alta complexidade

### Comarcas (11):
**INICIAL**: São Paulo, Rio de Janeiro, Belo Horizonte, Salvador  
**INTERMEDIÁRIA**: Brasília, Porto Alegre, Recife, Fortaleza  
**FINAL**: Supremo Tribunal Federal, Superior Tribunal de Justiça, Tribunal Superior do Trabalho

### Serventias (21):
Cada comarca possui entre 2-4 serventias/varas diferentes

## 🚀 Como Testar

### Passo a Passo:
1. **Inicie a aplicação**: `python app.py`
2. **Acesse**: http://localhost:5000
3. **Upload**: Clique em "Escolher arquivo"
4. **Selecione**: Um dos arquivos desta pasta
5. **Configure delimitador**:
   - `dados_tribunal_exemplo.csv` → Vírgula (,)
   - `dados_tribunal_exemplo_pv.csv` → Ponto e vírgula (;)
6. **Upload**: Clique em "Fazer Upload e Processar"
7. **Aguarde**: "Processamento Concluído!"
8. **Explore**: Use os filtros e visualizações

### Funcionalidades Testáveis:
- ✅ **Upload com diferentes delimitadores**
- ✅ **Filtros em cascata** (Entrância → Comarca → Serventia)
- ✅ **Períodos predefinidos** (12 meses, Biênio, Triênio)
- ✅ **Tabela paginada** com ordenação
- ✅ **Gráficos interativos** Plotly
- ✅ **Cartões de métricas** dinâmicos
- ✅ **Exportação** CSV e Excel
- ✅ **Cálculo automático** taxa de congestionamento

## 📊 Estatísticas dos Dados

- **Total registros**: 408
- **Total casos novos**: ~89.000
- **Total baixados**: ~78.000
- **Total pendentes**: ~55.000
- **Taxa média congestionamento**: ~42%

### Por Entrância:
- **INICIAL**: ~41% taxa de congestionamento
- **INTERMEDIÁRIA**: ~44% taxa de congestionamento
- **FINAL**: ~40% taxa de congestionamento

## 🔍 Validações Implementadas

O sistema verifica automaticamente:
- ✅ Extensão do arquivo (.csv)
- ✅ Tamanho máximo (100MB)
- ✅ Colunas obrigatórias presentes
- ✅ Tipos de dados corretos
- ✅ Valores numéricos válidos
- ✅ Datas no formato correto

## ⚠️ Notas Importantes

- **Dados simulados**: Criados para demonstração, não são reais
- **Representatividade**: Baseados em cenários realísticos
- **Teste completo**: Cobrem todas as funcionalidades do sistema
- **Performance**: Otimizados para resposta rápida
- **Compatibilidade**: Testados em Windows, Linux e Mac

---

**💡 Dica**: Para dados reais, mantenha exatamente a mesma estrutura de colunas e formatos apresentados nos exemplos.