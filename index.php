<?php require_once 'config.php'; ?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Certificados Digitais</title>
    <link rel="stylesheet" href="index.css">
    <style>
        /* Estilos adicionais para os botões de filtro */
        .filtros-container {
            display: flex;
            gap: 8px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        .btn-filtro {
            background-color: #7f8c8d;
            color: white;
            border: none;
            padding: 8px 12px;
            font-size: 0.85rem;
            border-radius: 4px;
            cursor: pointer;
            transition: opacity 0.2s;
            width: auto;
        }
        .btn-filtro:hover { opacity: 0.9; }
        .btn-filtro.ativo { font-weight: bold; box-shadow: inset 0 0 5px rgba(0,0,0,0.3); }
        .filtro-todos.ativo { background-color: #2c3e50; }
        .filtro-prazo.ativo { background-color: #2ecc71; }
        .filtro-vencer.ativo { background-color: #f1c40f; color: #333; }
        .filtro-vencido.ativo { background-color: #e74c3c; }
    </style>
</head>
<body>

<div class="container">
    <header>
        <h1>Sistema de Monitoramento de Certificados</h1>
        <p>Data Atual de Análise (PHP): <strong><?php echo formatarDataBR($data_atual_servidor); ?></strong></p>
    </header>

    <div class="grid">
        <!-- Esquerda: Cadastrar Cliente -->
        <div class="card">
            <h2 id="tituloForm">Cadastrar Nova Pasta de Cliente</h2>
            <form id="formCadastro">
                <input type="hidden" id="modo_editando" value="">

                <div class="form-group">
                    <label for="cnpj">CNPJ do Cliente:</label>
                    <input type="text" id="cnpj" placeholder="00.000.000/0001-00" maxlength="18" required>
                </div>
                <div class="form-group">
                    <label for="nome_empresa">Nome da Empresa:</label>
                    <input type="text" id="nome_empresa" placeholder="Razão Social Completa" required>
                </div>
                <div class="form-group">
                    <label for="data_vencimento">Data de Vencimento do Certificado:</label>
                    <input type="date" id="data_vencimento" required>
                </div>
                <button type="submit" id="btnSubmitForm">Cadastrar Cliente</button>
            </form>
        </div>

        <!-- Direita: Pesquisar Situação Individual -->
        <div class="card">
            <h2>Pesquisar Situação do Certificado</h2>
            <div class="form-group">
                <label for="busca">Digite o CNPJ ou Nome Cadastrado:</label>
                <input type="text" id="busca" placeholder="00.000.000/0001-00 ou Razão Social">
            </div>
            <button type="button" onclick="pesquisarCertificado()">Executar Pesquisa Inteligente</button>

            <div id="alertaResultado" class="painel-aviso"></div>
        </div>
    </div>

    <!-- Baixo: Painel Completo para Ver Clientes Cadastrados -->
    <div class="card" style="margin-top: 20px;">
        <h2>Ver Clientes Cadastrados</h2>
        
        <!-- Botões de Filtragem Rápida -->
        <div class="filtros-container">
            <button class="btn-filtro filtro-todos ativo" onclick="filtrarLista('todos', this)">📁 Todos</button>
            <button class="btn-filtro filtro-prazo" onclick="filtrarLista('prazo', this)">✅ No Prazo</button>
            <button class="btn-filtro filtro-vencer" onclick="filtrarLista('vencer', this)">⏰ À Vencer (30 dias)</button>
            <button class="btn-filtro filtro-vencido" onclick="filtrarLista('vencido', this)">⚠️ Vencidos</button>
        </div>

        <!-- Lista onde aparecem as empresas filtradas -->
        <div id="listaVisual" class="lista-empresas"></div>
    </div>
</div>

<script src="index.js"></script>
</body>
</html>
