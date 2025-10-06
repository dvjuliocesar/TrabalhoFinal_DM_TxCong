"""
Sistema de Gestão de Dados do Tribunal
Aplicação Flask principal
"""

import os
import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, request, jsonify, render_template, redirect, url_for, flash, send_file
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge
import plotly
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder
from config import config

# Configuração da aplicação
app = Flask(__name__)
app.config.from_object(config[os.getenv('FLASK_ENV', 'development')])

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Colunas obrigatórias no CSV
REQUIRED_COLUMNS = ['data_processo', 'entrancia', 'comarca', 'serventia', 
                   'casos_novos', 'baixados', 'pendentes']

# Dados em memória (para desenvolvimento)
current_data = []

def allowed_file(filename):
    """Verificar se a extensão do arquivo é permitida"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def validate_csv_structure(df):
    """Validar estrutura do CSV"""
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_columns:
        return False, f"Colunas obrigatórias ausentes: {', '.join(missing_columns)}"

    # Validar tipos de dados
    numeric_columns = ['casos_novos', 'baixados', 'pendentes']
    for col in numeric_columns:
        if not pd.api.types.is_numeric_dtype(df[col]):
            try:
                df[col] = pd.to_numeric(df[col], errors='coerce')
            except Exception as e:
                return False, f"Coluna '{col}' deve conter apenas números"

    # Verificar valores nulos críticos
    if df[REQUIRED_COLUMNS].isnull().any().any():
        return False, "Dados obrigatórios estão faltando em algumas linhas"

    return True, "Estrutura válida"

def calculate_congestion_rate(df):
    """Calcular taxa de congestionamento"""
    # Evitar divisão por zero
    denominator = df['pendentes'] + df['baixados']
    df['taxa_congestionamento'] = np.where(
        denominator > 0,
        100 * (df['pendentes'] / denominator),
        0
    )
    df['taxa_congestionamento'] = df['taxa_congestionamento'].round(2)
    return df

def process_csv_data(df):
    """Processar dados do CSV"""
    try:
        # Validar estrutura
        is_valid, message = validate_csv_structure(df)
        if not is_valid:
            return None, message

        # Calcular métricas
        df = calculate_congestion_rate(df)

        # Padronizar formato de data
        df['data_processo'] = pd.to_datetime(df['data_processo'], format='%Y-%m', errors='coerce')
        df = df.dropna(subset=['data_processo'])

        # Converter data de volta para string para JSON serialization
        df['data_processo'] = df['data_processo'].dt.strftime('%Y-%m')

        logger.info(f"Dados processados: {len(df)} registros")
        return df, "Processamento concluído com sucesso"

    except Exception as e:
        logger.error(f"Erro ao processar dados: {e}")
        return None, f"Erro no processamento: {str(e)}"

@app.route('/')
def index():
    """Página principal"""
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Processar upload de arquivo"""
    try:
        if 'file' not in request.files:
            flash('Nenhum arquivo selecionado', 'error')
            return redirect(url_for('index'))

        file = request.files['file']
        delimiter = request.form.get('delimiter', ',')

        if file.filename == '':
            flash('Nenhum arquivo selecionado', 'error')
            return redirect(url_for('index'))

        if not allowed_file(file.filename):
            flash('Tipo de arquivo não permitido. Use apenas arquivos CSV.', 'error')
            return redirect(url_for('index'))

        # Salvar arquivo temporariamente
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        # Criar diretório se não existir
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        file.save(filepath)

        # Processar CSV
        try:
            df = pd.read_csv(filepath, sep=delimiter, encoding='utf-8')
        except UnicodeDecodeError:
            try:
                df = pd.read_csv(filepath, sep=delimiter, encoding='latin-1')
            except Exception as e:
                flash(f'Erro ao ler arquivo: {str(e)}', 'error')
                return redirect(url_for('index'))

        # Processar dados
        processed_df, message = process_csv_data(df)

        if processed_df is None:
            flash(f'Erro no processamento: {message}', 'error')
            if os.path.exists(filepath):
                os.remove(filepath)
            return redirect(url_for('index'))

        # Armazenar dados globalmente (em produção, usar base de dados)
        global current_data
        current_data = processed_df.to_dict('records')

        # Remover arquivo temporário
        if os.path.exists(filepath):
            os.remove(filepath)

        flash('Processamento Concluído!', 'success')
        return redirect(url_for('index'))

    except RequestEntityTooLarge:
        flash('Arquivo muito grande. Tamanho máximo: 100MB', 'error')
        return redirect(url_for('index'))

    except Exception as e:
        logger.error(f"Erro no upload: {e}")
        flash(f'Erro no processamento do arquivo: {str(e)}', 'error')
        return redirect(url_for('index'))

@app.route('/api/data')
def get_data():
    """API para obter dados filtrados"""
    global current_data

    if not current_data:
        return jsonify({'error': 'Nenhum dado disponível'}), 404

    try:
        # Aplicar filtros
        entrancia = request.args.get('entrancia')
        comarca = request.args.get('comarca')
        serventia = request.args.get('serventia')
        data_inicio = request.args.get('data_inicio')
        data_fim = request.args.get('data_fim')

        df = pd.DataFrame(current_data)

        # Filtrar dados
        if entrancia and entrancia != 'todos':
            df = df[df['entrancia'] == entrancia]

        if comarca and comarca != 'todos':
            df = df[df['comarca'] == comarca]

        if serventia and serventia != 'todos':
            df = df[df['serventia'] == serventia]

        if data_inicio:
            df = df[df['data_processo'] >= data_inicio]

        if data_fim:
            df = df[df['data_processo'] <= data_fim]

        # Calcular totais
        totals = {
            'total_casos_novos': int(df['casos_novos'].sum()),
            'total_baixados': int(df['baixados'].sum()),
            'total_pendentes': int(df['pendentes'].sum()),
            'taxa_congestionamento_media': float(df['taxa_congestionamento'].mean()) if len(df) > 0 else 0
        }

        return jsonify({
            'data': df.to_dict('records'),
            'totals': totals,
            'count': len(df)
        })

    except Exception as e:
        logger.error(f"Erro na API: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/options')
def get_options():
    """API para obter opções de filtros"""
    global current_data

    if not current_data:
        return jsonify({'error': 'Nenhum dado disponível'}), 404

    try:
        df = pd.DataFrame(current_data)

        options = {
            'entrancia': sorted(df['entrancia'].unique().tolist()),
            'comarca': sorted(df['comarca'].unique().tolist()),
            'serventia': sorted(df['serventia'].unique().tolist()),
            'periodo': {
                'min': df['data_processo'].min() if len(df) > 0 else None,
                'max': df['data_processo'].max() if len(df) > 0 else None
            }
        }

        return jsonify(options)

    except Exception as e:
        logger.error(f"Erro nas opções: {e}")
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/graficos')
def graficos():
    """Página de gráficos"""
    global current_data

    if not current_data:
        flash('Nenhum dado disponível. Faça upload de um arquivo CSV primeiro.', 'warning')
        return redirect(url_for('index'))

    # Preparar dados para gráfico
    df = pd.DataFrame(current_data)

    # Agrupar por período e entrância
    df_grouped = df.groupby(['data_processo', 'entrancia']).agg({
        'casos_novos': 'sum',
        'baixados': 'sum',
        'pendentes': 'sum'
    }).reset_index()

    # Recalcular taxa de congestionamento
    df_grouped = calculate_congestion_rate(df_grouped)

    # Criar gráfico Plotly
    fig = go.Figure()

    colors = {'INICIAL': '#3498db', 'INTERMEDIÁRIA': '#e74c3c', 'FINAL': '#2ecc71'}

    for entrancia in df_grouped['entrancia'].unique():
        entrancia_data = df_grouped[df_grouped['entrancia'] == entrancia].sort_values('data_processo')

        fig.add_trace(go.Scatter(
            x=entrancia_data['data_processo'],
            y=entrancia_data['taxa_congestionamento'],
            mode='lines+markers',
            name=entrancia,
            line=dict(width=3, color=colors.get(entrancia, '#95a5a6')),
            marker=dict(size=8),
            hovertemplate='<b>%{fullData.name}</b><br>' +
                         'Período: %{x}<br>' +
                         'Taxa: %{y:.2f}%<br>' +
                         '<extra></extra>'
        ))

    fig.update_layout(
        title={
            'text': 'Evolução da Taxa de Congestionamento por Entrância',
            'x': 0.5,
            'xanchor': 'center',
            'font': {'size': 18}
        },
        xaxis_title='Período',
        yaxis_title='Taxa de Congestionamento (%)',
        hovermode='x unified',
        template='plotly_white',
        height=500,
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.02,
            xanchor="right",
            x=1
        )
    )

    # Converter para JSON
    graph_json = json.dumps(fig, cls=PlotlyJSONEncoder)

    # Calcular métricas para cartões
    totals = {
        'total_pendentes': int(df['pendentes'].sum()),
        'total_baixados': int(df['baixados'].sum()),
        'taxa_atual': float(df['taxa_congestionamento'].mean())
    }

    return render_template('graficos.html', graph_json=graph_json, totals=totals)

@app.route('/export')
def export_data():
    """Exportar dados filtrados"""
    global current_data

    if not current_data:
        return jsonify({'error': 'Nenhum dado disponível'}), 404

    try:
        format_type = request.args.get('format', 'csv')
        df = pd.DataFrame(current_data)

        # Aplicar filtros (mesmo sistema da API)
        entrancia = request.args.get('entrancia')
        if entrancia and entrancia != 'todos':
            df = df[df['entrancia'] == entrancia]

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

        if format_type == 'csv':
            filename = f'dados_tribunal_{timestamp}.csv'
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            df.to_csv(filepath, index=False, encoding='utf-8')
            return send_file(filepath, as_attachment=True, download_name=filename)

        elif format_type == 'excel':
            filename = f'dados_tribunal_{timestamp}.xlsx'
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            df.to_excel(filepath, index=False)
            return send_file(filepath, as_attachment=True, download_name=filename)

        else:
            return jsonify({'error': 'Formato não suportado'}), 400

    except Exception as e:
        logger.error(f"Erro na exportação: {e}")
        return jsonify({'error': 'Erro ao exportar dados'}), 500

@app.errorhandler(413)
def too_large(e):
    """Erro de arquivo muito grande"""
    flash('Arquivo muito grande. Tamanho máximo: 100MB', 'error')
    return redirect(url_for('index'))

@app.errorhandler(404)
def not_found(e):
    """Página não encontrada"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def server_error(e):
    """Erro interno do servidor"""
    logger.error(f"Erro interno: {e}")
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Criar diretórios necessários
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs('logs', exist_ok=True)

    # Executar aplicação
    debug_mode = app.config['DEBUG']
    port = int(os.getenv('PORT', 5000))

    print(f"🚀 Iniciando Sistema de Gestão de Dados do Tribunal...")
    print(f"📡 Servidor: http://localhost:{port}")
    print(f"🔧 Modo: {'Desenvolvimento' if debug_mode else 'Produção'}")

    app.run(debug=debug_mode, host='0.0.0.0', port=port)
