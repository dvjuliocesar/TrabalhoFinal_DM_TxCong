# 📖 Guia de Instalação Completo

## Pré-requisitos

### Software Necessário:
- **Python 3.8+** (recomendado 3.9 ou 3.10)
- **pip** (gerenciador de pacotes Python)
- **Git** (opcional, para clonar repositório)

### Verificar Instalação:
```bash
python --version
pip --version
```

## 🚀 Instalação Passo a Passo

### 1. Obter o Projeto

#### Opção A: Download ZIP
- Extrair arquivo: `sistema-tribunal-*.zip`
- Entrar na pasta: `cd sistema-tribunal`

#### Opção B: Git Clone
```bash
git clone https://github.com/seu-usuario/sistema-tribunal.git
cd sistema-tribunal
```

### 2. Ambiente Virtual

#### Windows:
```bash
python -m venv tribunal_env
tribunal_env\Scripts\activate
```

#### Linux/Mac:
```bash
python -m venv tribunal_env
source tribunal_env/bin/activate
```

### 3. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 4. Configuração

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar configurações (opcional)
nano .env  # Linux/Mac
notepad .env  # Windows
```

### 5. Testar Instalação

```bash
python app.py
```

**Acesse**: http://localhost:5000

## 🐳 Instalação com Docker

### Pré-requisitos:
- Docker
- Docker Compose

### Comandos:
```bash
# Build da imagem
docker build -t sistema-tribunal .

# Executar container
docker run -p 5000:5000 sistema-tribunal

# Ou usar Docker Compose
docker-compose up -d
```

## 🔧 Configurações Avançadas

### Variáveis de Ambiente (.env):

```env
# Flask
FLASK_ENV=development
SECRET_KEY=sua-chave-secreta
MAX_CONTENT_LENGTH=104857600

# Snowflake (opcional)
SNOWFLAKE_ENABLED=false
SNOWFLAKE_ACCOUNT=sua-conta
SNOWFLAKE_USER=seu-usuario
SNOWFLAKE_PASSWORD=sua-senha

# Produção
PORT=5000
WORKERS=4
```

## 🚨 Solução de Problemas

### Erro: "Module not found"
```bash
pip install -r requirements.txt
```

### Erro: "Permission denied"
```bash
# Linux/Mac
chmod +x app.py
sudo chown -R $USER:$USER .

# Windows - Executar como Administrador
```

### Erro: "Port already in use"
```bash
# Alterar porta
export PORT=8000
python app.py
```

### Erro de encoding CSV
- Use arquivos UTF-8 ou Latin-1
- Verifique delimitadores corretos

## 📝 Próximos Passos

1. **Teste com dados exemplo** (pasta `data/`)
2. **Configure filtros** conforme necessidade
3. **Personalize interface** (CSS em `static/css/`)
4. **Implemente Snowflake** (se necessário)
5. **Deploy em produção** (Heroku, AWS, etc.)

## 🆘 Suporte

- **Documentação**: README.md
- **Issues**: GitHub Issues
- **Email**: suporte@exemplo.com