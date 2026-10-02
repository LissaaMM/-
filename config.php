<?php
// Define o fuso horário padrão do sistema
date_default_timezone_set('America/Sao_Paulo');

// Data base do sistema para análise dos prazos
$data_atual_servidor = "2026-10-02";

// Função utilitária para formatar datas para o padrão brasileiro
function formatarDataBR($data) {
    return date('d/m/Y', strtotime($data));
}
?>
