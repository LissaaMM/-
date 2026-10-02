<?php require_once 'config.php'; ?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gerenciador de Certificados Digitais</title>
    <!-- Vincula o arquivo de estilos CSS externo -->
    <link rel="stylesheet" href="index.css">
</head>
<body>

<div class="container">
    <header>
        <h1>Sistema de Monitoramento de Certificados</h1>
        <p>Data Atual de Análise (PHP): <strong><?php echo formatarDataBR($data_atual_servidor); ?></strong></p>
    </header>

    <div class="grid">
        <!-- Pasta de Cadastro -->
        <div class="card">
            <h2>Organizar Nova Pasta de Cliente</h2>
            <form id="formCadastro">
                <div class="form-group">
                    <label for="cnpj">CNPJ do Cliente:</label>
                    <input type="text" id="cnpj" placeholder="00.000.000/0001-00" required>
                </div>
                <div class="form-group">
                    <label for="nome_empresa">Nome da Empresa:</label>
                    <input type="text" id="nome_empresa" placeholder="Razão Social Completa" required>
                </div>
                <div class="form-group">
                    <label for="data_vencimento">Data de Vencimento do Certificado:</label>
                    <input type="date" id="data_vencimento" required>
                </div>
                <button type="submit">Salvar na Base de Dados</button>
            </form>
        </div>

        <!-- Pasta de Pesquisa -->
        <div class="card">
            <h2>Pesquisar Situação do Certificado</h2>
            <div class="form-group">
                <label for="busca">Digite o CNPJ ou Nome Cadastrado:</label>
                <input type="text" id="busca" placeholder="Buscar por pasta de dados...">
            </div>
            <button type="button" onclick="pesquisarCertificado()">Executar Pesquisa Inteligente</button>

            <!-- Local onde o aviso JavaScript será exibido após a pesquisa -->
            <div id="alertaResultado" class="painel-aviso"></div>
        </div>
    </div>

    <!-- Monitor Geral -->
    <div class="card" style="margin-top: 20px;">
        <h2>Pastas de Clientes Ativas no Sistema</h2>
        <div id="listaVisual" class="lista-empresas"></div>
    </div>
</div>

<!-- Vincula o script Javascript externo -->
<script src="script.js"></script>
</body>
</html>
