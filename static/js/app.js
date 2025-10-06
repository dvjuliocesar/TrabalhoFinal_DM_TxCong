/**
 * Sistema de Gestão de Dados do Tribunal
 * JavaScript Principal
 */

// Variáveis globais
let currentData = [];
let filteredData = [];
let currentPage = 1;
const itemsPerPage = 20;

// ===== INICIALIZAÇÃO =====

$(document).ready(function() {
    console.log('🚀 Sistema Tribunal inicializado');

    // Inicializar componentes
    initializeComponents();
    initializeEventListeners();
    carregarOpcoesIniciais();
});

function initializeComponents() {
    // Inicializar Select2
    $('.select2-multiple').select2({
        theme: 'bootstrap-5',
        placeholder: function() {
            return $(this).data('placeholder');
        },
        allowClear: true,
        closeOnSelect: false
    });

    // Inicializar tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function initializeEventListeners() {
    // Form upload
    $('#uploadForm').on('submit', function(e) {
        mostrarProgressoUpload();
    });

    // Filtros em cascata
    $('#entrancia-filter').on('change', function() {
        atualizarComarcas();
    });

    $('#comarca-filter').on('change', function() {
        atualizarServentias();
    });

    // Auto-aplicar filtros quando período mudar
    $('#periodo-filter').on('change', function() {
        if (currentData.length > 0) {
            aplicarFiltros();
        }
    });

    // Validação de arquivo
    $('#file').on('change', function() {
        validarArquivo(this);
    });
}

// ===== UPLOAD DE ARQUIVO =====

function mostrarProgressoUpload() {
    const progressBar = $('#uploadProgress');
    const progress = progressBar.find('.progress-bar');

    progressBar.show();
    progress.css('width', '0%');

    // Simular progresso
    let width = 0;
    const interval = setInterval(function() {
        width += Math.random() * 15;
        if (width >= 90) {
            clearInterval(interval);
        }
        progress.css('width', width + '%');
    }, 200);
}

function validarArquivo(input) {
    const file = input.files[0];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!file) return;

    // Validar extensão
    const allowedExtensions = ['.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!allowedExtensions.includes(fileExtension)) {
        mostrarAlerta('Apenas arquivos CSV são permitidos.', 'danger');
        input.value = '';
        return false;
    }

    // Validar tamanho
    if (file.size > maxSize) {
        mostrarAlerta('Arquivo muito grande. Tamanho máximo: 100MB.', 'danger');
        input.value = '';
        return false;
    }

    // Mostrar informações do arquivo
    const fileInfo = `Arquivo: ${file.name} (${formatarTamanho(file.size)})`;
    $('.form-text').text(fileInfo).addClass('text-success');

    return true;
}

function formatarTamanho(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// ===== CARREGAMENTO DE DADOS =====

function carregarOpcoesIniciais() {
    fetch('/api/options')
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.log('Nenhum dado carregado ainda');
                return;
            }

            preencherOpcoesFiltros(data);

            // Carregar dados automaticamente se disponível
            aplicarFiltros();
        })
        .catch(error => {
            console.log('Aguardando upload de dados');
        });
}

function preencherOpcoesFiltros(opcoes) {
    // Entrância
    const entranciaSelect = $('#entrancia-filter');
    entranciaSelect.empty();
    opcoes.entrancia.forEach(entrancia => {
        entranciaSelect.append(new Option(entrancia, entrancia));
    });

    // Comarca
    const comarcaSelect = $('#comarca-filter');
    comarcaSelect.empty();
    opcoes.comarca.forEach(comarca => {
        comarcaSelect.append(new Option(comarca, comarca));
    });

    // Serventia
    const serventiaSelect = $('#serventia-filter');
    serventiaSelect.empty();
    opcoes.serventia.forEach(serventia => {
        serventiaSelect.append(new Option(serventia, serventia));
    });

    // Atualizar Select2
    $('.select2-multiple').trigger('change');
}

// ===== FILTROS EM CASCATA =====

function atualizarComarcas() {
    const entranciasSelecionadas = $('#entrancia-filter').val();

    if (!entranciasSelecionadas || entranciasSelecionadas.length === 0) {
        // Se nenhuma entrância selecionada, mostrar todas as comarcas
        return;
    }

    // Filtrar comarcas baseado nas entrâncias selecionadas
    if (currentData.length > 0) {
        const comarcasDisponiveis = [...new Set(
            currentData
                .filter(item => entranciasSelecionadas.includes(item.entrancia))
                .map(item => item.comarca)
        )].sort();

        const comarcaSelect = $('#comarca-filter');
        const valoresAtuais = comarcaSelect.val() || [];

        comarcaSelect.empty();
        comarcasDisponiveis.forEach(comarca => {
            comarcaSelect.append(new Option(comarca, comarca));
        });

        // Manter seleções válidas
        const valoresValidos = valoresAtuais.filter(valor => comarcasDisponiveis.includes(valor));
        comarcaSelect.val(valoresValidos).trigger('change');
    }
}

function atualizarServentias() {
    const entranciasSelecionadas = $('#entrancia-filter').val() || [];
    const comarcasSelecionadas = $('#comarca-filter').val() || [];

    if (currentData.length > 0) {
        let dadosFiltrados = currentData;

        if (entranciasSelecionadas.length > 0) {
            dadosFiltrados = dadosFiltrados.filter(item => 
                entranciasSelecionadas.includes(item.entrancia)
            );
        }

        if (comarcasSelecionadas.length > 0) {
            dadosFiltrados = dadosFiltrados.filter(item => 
                comarcasSelecionadas.includes(item.comarca)
            );
        }

        const serventiasDisponiveis = [...new Set(
            dadosFiltrados.map(item => item.serventia)
        )].sort();

        const serventiaSelect = $('#serventia-filter');
        const valoresAtuais = serventiaSelect.val() || [];

        serventiaSelect.empty();
        serventiasDisponiveis.forEach(serventia => {
            serventiaSelect.append(new Option(serventia, serventia));
        });

        // Manter seleções válidas
        const valoresValidos = valoresAtuais.filter(valor => serventiasDisponiveis.includes(valor));
        serventiaSelect.val(valoresValidos).trigger('change');
    }
}

// ===== APLICAÇÃO DE FILTROS =====

function aplicarFiltros() {
    mostrarLoader();

    // Construir parâmetros de filtro
    const params = new URLSearchParams();

    const entrancia = $('#entrancia-filter').val();
    const comarca = $('#comarca-filter').val();
    const serventia = $('#serventia-filter').val();
    const periodo = $('#periodo-filter').val();

    if (entrancia && entrancia.length > 0) {
        params.append('entrancia', entrancia.join(','));
    }

    if (comarca && comarca.length > 0) {
        params.append('comarca', comarca.join(','));
    }

    if (serventia && serventia.length > 0) {
        params.append('serventia', serventia.join(','));
    }

    if (periodo) {
        const dataFim = new Date();
        const dataInicio = new Date();
        dataInicio.setMonth(dataInicio.getMonth() - parseInt(periodo));

        params.append('data_inicio', dataInicio.toISOString().substring(0, 7));
        params.append('data_fim', dataFim.toISOString().substring(0, 7));
    }

    // Fazer requisição
    fetch(`/api/data?${params.toString()}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                mostrarAlerta(data.error, 'warning');
                return;
            }

            currentData = data.data;
            filteredData = data.data;

            atualizarMetricas(data.totals);
            atualizarTabela(data.data);
            mostrarSecoesDados();

            // Animar entrada dos dados
            $('#metrics-cards, #data-container').addClass('fade-in');
        })
        .catch(error => {
            console.error('Erro ao aplicar filtros:', error);
            mostrarAlerta('Erro ao carregar dados. Tente novamente.', 'danger');
        })
        .finally(() => {
            esconderLoader();
        });
}

function limparFiltros() {
    $('#entrancia-filter, #comarca-filter, #serventia-filter').val(null).trigger('change');
    $('#periodo-filter').val('12');

    if (currentData.length > 0) {
        aplicarFiltros();
    }
}

// ===== ATUALIZAÇÃO DA INTERFACE =====

function atualizarMetricas(totais) {
    $('#total-casos-novos').text(formatarNumero(totais.total_casos_novos));
    $('#total-baixados').text(formatarNumero(totais.total_baixados));
    $('#total-pendentes').text(formatarNumero(totais.total_pendentes));
    $('#taxa-congestionamento').text(totais.taxa_congestionamento_media.toFixed(2) + '%');

    // Adicionar animação de contagem
    animarContadores();
}

function atualizarTabela(dados, pagina = 1) {
    const tbody = $('#data-table tbody');
    tbody.empty();

    if (dados.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="8" class="text-center text-muted py-4">
                    <i class="fas fa-search fa-2x mb-2 d-block"></i>
                    Nenhum dado encontrado com os filtros aplicados
                </td>
            </tr>
        `);
        return;
    }

    // Paginação
    const startIndex = (pagina - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const dadosPaginados = dados.slice(startIndex, endIndex);

    dadosPaginados.forEach(row => {
        const tr = $(`
            <tr>
                <td>${row.data_processo}</td>
                <td><span class="badge bg-primary">${row.entrancia}</span></td>
                <td>${row.comarca}</td>
                <td>${row.serventia}</td>
                <td class="text-end">${formatarNumero(row.casos_novos)}</td>
                <td class="text-end">${formatarNumero(row.baixados)}</td>
                <td class="text-end">${formatarNumero(row.pendentes)}</td>
                <td class="text-end">
                    <span class="badge ${getCorTaxaCongestionamento(row.taxa_congestionamento)}">
                        ${row.taxa_congestionamento.toFixed(2)}%
                    </span>
                </td>
            </tr>
        `);
        tbody.append(tr);
    });

    // Atualizar paginação
    atualizarPaginacao(dados.length, pagina);
}

function atualizarPaginacao(totalItens, paginaAtual) {
    const totalPaginas = Math.ceil(totalItens / itemsPerPage);
    const pagination = $('#pagination');
    pagination.empty();

    if (totalPaginas <= 1) return;

    // Botão anterior
    if (paginaAtual > 1) {
        pagination.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual - 1})">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `);
    }

    // Números das páginas
    const inicio = Math.max(1, paginaAtual - 2);
    const fim = Math.min(totalPaginas, paginaAtual + 2);

    for (let i = inicio; i <= fim; i++) {
        pagination.append(`
            <li class="page-item ${i === paginaAtual ? 'active' : ''}">
                <a class="page-link" href="#" onclick="mudarPagina(${i})">${i}</a>
            </li>
        `);
    }

    // Botão próximo
    if (paginaAtual < totalPaginas) {
        pagination.append(`
            <li class="page-item">
                <a class="page-link" href="#" onclick="mudarPagina(${paginaAtual + 1})">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `);
    }
}

function mudarPagina(pagina) {
    currentPage = pagina;
    atualizarTabela(filteredData, pagina);

    // Scroll para o topo da tabela
    $('html, body').animate({
        scrollTop: $('#data-container').offset().top - 100
    }, 500);
}

// ===== EXPORTAÇÃO =====

function exportarDados(formato) {
    if (!currentData || currentData.length === 0) {
        mostrarAlerta('Nenhum dado disponível para exportação.', 'warning');
        return;
    }

    mostrarLoader('Preparando exportação...');

    // Construir URL com filtros atuais
    const params = new URLSearchParams();
    params.append('format', formato);

    const entrancia = $('#entrancia-filter').val();
    if (entrancia && entrancia.length > 0) {
        params.append('entrancia', entrancia.join(','));
    }

    // Criar link temporário para download
    const link = document.createElement('a');
    link.href = `/export?${params.toString()}`;
    link.download = `dados_tribunal_${new Date().toISOString().split('T')[0]}.${formato}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    esconderLoader();
    mostrarAlerta(`Dados exportados em formato ${formato.toUpperCase()}!`, 'success');
}

// ===== UTILITÁRIOS =====

function formatarNumero(numero) {
    return new Intl.NumberFormat('pt-BR').format(numero);
}

function getCorTaxaCongestionamento(taxa) {
    if (taxa < 30) return 'bg-success';
    if (taxa < 50) return 'bg-warning';
    if (taxa < 70) return 'bg-orange';
    return 'bg-danger';
}

function mostrarSecoesDados() {
    $('#metrics-cards, #data-container').show();
}

function mostrarLoader(mensagem = 'Carregando...') {
    $('#loading-spinner').show();
    if (mensagem !== 'Carregando...') {
        $('#loading-spinner p').text(mensagem);
    }
}

function esconderLoader() {
    $('#loading-spinner').hide();
    $('#loading-spinner p').text('Processando dados...');
}

function mostrarAlerta(mensagem, tipo = 'info') {
    const alertClass = tipo === 'danger' ? 'alert-danger' : 
                      tipo === 'success' ? 'alert-success' : 
                      tipo === 'warning' ? 'alert-warning' : 'alert-info';

    const icon = tipo === 'danger' ? 'exclamation-triangle' : 
                tipo === 'success' ? 'check-circle' : 
                tipo === 'warning' ? 'exclamation-triangle' : 'info-circle';

    const alerta = $(`
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            <i class="fas fa-${icon} me-2"></i>
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `);

    // Inserir no topo da página
    $('.container').prepend(alerta);

    // Auto-remover após 5 segundos
    setTimeout(() => {
        alerta.alert('close');
    }, 5000);

    // Scroll para o topo
    $('html, body').animate({ scrollTop: 0 }, 300);
}

function animarContadores() {
    $('.metric-value').each(function() {
        const $this = $(this);
        const text = $this.text();

        // Se for um número, animar
        if (!isNaN(text.replace(/[.,]/g, ''))) {
            $this.addClass('pulse');
            setTimeout(() => {
                $this.removeClass('pulse');
            }, 1000);
        }
    });
}

// ===== INICIALIZAÇÃO DOS FILTROS =====

function initializeFilters() {
    // Configurar Select2 com tema Bootstrap
    $('.select2-multiple').select2({
        theme: 'bootstrap-5',
        placeholder: function() {
            return $(this).data('placeholder');
        },
        allowClear: true,
        closeOnSelect: false,
        width: '100%'
    });
}

// ===== FUNÇÕES GLOBAIS =====

// Tornar funções disponíveis globalmente
window.aplicarFiltros = aplicarFiltros;
window.limparFiltros = limparFiltros;
window.exportarDados = exportarDados;
window.mudarPagina = mudarPagina;
window.initializeFilters = initializeFilters;

// Log de inicialização
console.log('✅ App.js carregado com sucesso');