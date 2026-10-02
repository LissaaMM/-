// Define a data atual correspondente ao servidor para manter o sincronismo
const DATA_HOJE = new Date("2026-10-02T00:00:00");

// Estado global do filtro ativo para manter a interface atualizada ao cadastrar/deletar
let filtroAtual = 'todos';

// Banco de dados em formato JSON embutido na memória
const dadosIniciais = [
    { cnpj: "18.298.069/0001-09", nome: "MN Mercantil Ltda", vencimento: "2027-05-04" },
    { cnpj: "23.529.609/0001-58", nome: "Moto Pecas R3 Ltda", vencimento: "2027-03-16" },
    { cnpj: "51.291.640/0001-39", nome: "Otica Conquista Ltda", vencimento: "2027-08-20" },
    { cnpj: "52.978.326/0001-91", nome: "Otica Vislumbre Ltda", vencimento: "2026-11-28" },
    { cnpj: "43.955.439/0001-00", nome: "DJ Moveis e Colchoes", vencimento: "2025-11-12" }
];

if (!localStorage.getItem('clientes_pastas')) {
    localStorage.setItem('clientes_pastas', JSON.stringify(dadosIniciais));
}

// MÁSCARA AUTOMÁTICA DE CNPJ
function aplicarMascaraCNPJ(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 14) valor = valor.slice(0, 14);
    if (valor.length > 12) {
        valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})\$/, "\$1.\$2.\$3/\$4-\$5");
    } else if (valor.length > 8) {
        valor = valor.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})\$/, "\$1.\$2.\$3/\$4");
    } else if (valor.length > 5) {
        valor = valor.replace(/^(\d{2})(\d{3})(\d{1,3})\$/, "\$1.\$2.\$3");
    } else if (valor.length > 2) {
        valor = valor.replace(/^(\d{2})(\d{1,3})\$/, "\$1.\$2");
    }
    input.value = valor;
}

// VALIDAÇÃO MATEMÁTICA DE CNPJ
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');
    if (cnpj == '' || cnpj.length !== 14 || /^(\d)\1+\$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(0)) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
        soma += numeros.charAt(tamanho - i) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado != digitos.charAt(1)) return false;
    return true;
}

document.addEventListener("DOMContentLoaded", function() {
    atualizarInterfaceLista();

    const inputCnpj = document.getElementById('cnpj');
    const inputBusca = document.getElementById('busca');

    inputCnpj.addEventListener('input', function() { aplicarMascaraCNPJ(this); });
    inputBusca.addEventListener('input', function() { 
        if (/^\d/.test(this.value.replace(/[^\w]/g, ''))) {
            aplicarMascaraCNPJ(this);
        }
    });

    // Form Cadastro / Edição
    document.getElementById('formCadastro').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cnpjVal = inputCnpj.value.trim();
        const nomeVal = document.getElementById('nome_empresa').value.trim();
        const dataVal = document.getElementById('data_vencimento').value;
        const modoEditando = document.getElementById('modo_editando').value;

        if (!validarCNPJ(cnpjVal)) {
            alert('❌ Erro: O CNPJ digitado é inválido! Por favor, confira os números.');
            return;
        }

        let baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
        
        if (modoEditando) {
            baseAtual = baseAtual.filter(c => c.cnpj !== modoEditando);
            document.getElementById('modo_editando').value = "";
            document.getElementById('btnSubmitForm').innerText = "Cadastrar Cliente";
            document.getElementById('tituloForm').innerText = "Cadastrar Nova Pasta de Cliente";
        } else {
            const existe = baseAtual.some(c => c.cnpj === cnpjVal);
            if (existe) {
                alert('Este CNPJ já está cadastrado no sistema!');
                return;
            }
        }
        
        baseAtual.push({ cnpj: cnpjVal, nome: nomeVal, vencimento: dataVal });
        localStorage.setItem('clientes_pastas', JSON.stringify(baseAtual));
        alert('Dados salvos com sucesso!');
        this.reset();
        atualizarInterfaceLista();
    });
});

// Pesquisa Inteligente
function pesquisarCertificado() {
    const termoBusca = document.getElementById('busca').value.trim().toLowerCase();
    const painel = document.getElementById('alertaResultado');
    
    if (!termoBusca) {
        painel.className = "painel-aviso status-erro";
        painel.innerHTML = "Por favor, informe o CNPJ ou Nome da empresa.";
        painel.style.display = "block";
        return;
    }

    const baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
    const clienteEncontrado = baseAtual.find(c => 
        c.cnpj.toLowerCase().includes(termoBusca) || 
        c.nome.toLowerCase().includes(termoBusca)
    );

    if (!clienteEncontrado) {
        painel.className = "painel-aviso status-erro";
        painel.innerHTML = "❌ Nenhuma pasta de cliente cadastrada com esses parâmetros.";
        painel.style.display = "block";
        return;
    }

    const dataVenc = new Date(clienteEncontrado.vencimento + "T00:00:00");
    const diferencaTempo = dataVenc.getTime() - DATA_HOJE.getTime();
    const diferencaDias = Math.ceil(diferencaTempo / (1000 * 60 * 60 * 24));
    const dataFormatada = dataVenc.toLocaleDateString('pt-BR');

    if (diferencaDias < 0) {
        painel.className = "painel-aviso status-vencido";
        painel.innerHTML = `⚠️ AVISO DE CERTIFICADO VENCIDO: A empresa [${clienteEncontrado.nome}] está expirada há ${Math.abs(diferencaDias)} dias! (Data: ${dataFormatada})`;
    } else if (diferencaDias <= 30) {
        painel.className = "painel-aviso status-vencer";
        painel.innerHTML = `⏰ AVISO DE RENOVAÇÃO: O prazo limite está próximo! Restam apenas ${diferencaDias} dias ativos. (Vence em: ${dataFormatada})`;
    } else {
        painel.className = "painel-aviso status-prazo";
        painel.innerHTML = `✅ DADOS NO PRAZO: Situação está em dia. A empresa possui mais ${diferencaDias} dias de validade. (Vence em: ${dataFormatada})`;
    }
    
    painel.style.display = "block";
}

// Controla a alteração de visualização pelos botões de filtro
function filtrarLista(tipoFiltro, botaoClicado) {
    filtroAtual = tipoFiltro;
    
    // Altera a classe ativa dos botões visuais
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(b => b.classList.remove('ativo'));
    botaoClicado.classList.add('ativo');
    
    atualizarInterfaceLista();
}

function editarEmpresa(cnpjIdentificador) {
    const baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
    const cliente = baseAtual.find(c => c.cnpj === cnpjIdentificador);
    
    if (cliente) {
        document.getElementById('cnpj').value = cliente.cnpj;
        document.getElementById('nome_empresa').value = cliente.nome;
        document.getElementById('data_vencimento').value = cliente.vencimento;
        
        document.getElementById('modo_editando').value = cliente.cnpj;
        document.getElementById('btnSubmitForm').innerText = "Salvar Alterações";
        document.getElementById('tituloForm').innerText = "📝 Editando Cadastro de: " + cliente.nome;
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function deletarEmpresa(cnpjIdentificador) {
    if (confirm("Tem certeza absoluta que deseja excluir de vez a pasta deste cliente?")) {
        let baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
        baseAtual = baseAtual.filter(c => c.cnpj !== cnpjIdentificador);
        localStorage.setItem('clientes_pastas', JSON.stringify(baseAtual));
        atualizarInterfaceLista();
        document.getElementById('alertaResultado').style.display = "none";
    }
}

// Renderiza e filtra dinamicamente a listagem de clientes cadastrados
function atualizarInterfaceLista() {
    const listaDiv = document.getElementById('listaVisual');
    const baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
    
    if (baseAtual.length === 0) {
        listaDiv.innerHTML = "<p style='color: #666;'>Nenhum registro armazenado.</p>";
        return;
    }

    listaDiv.innerHTML = "";
    let itensExibidos = 0;

    baseAtual.forEach(c => {
        const dataVenc = new Date(c.vencimento + "T00:00:00");
        const dif = Math.ceil((dataVenc.getTime() - DATA_HOJE.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = 'prazo';
        let badgeHtml = '';
        
        if(dif < 0) {
            status = 'vencido';
            badgeHtml = '<span class="badge" style="background-color: var(--status-vencido)">Vencido</span>';
        } else if (dif <= 30) {
            status = 'vencer';
            badgeHtml = '<span class="badge" style="background-color: var(--status-vencer)">À Vencer</span>';
        } else {
            status = 'prazo';
            badgeHtml = '<span class="badge" style="background-color: var(--status-prazo)">No Prazo</span>';
        }

        // Aplica o filtro selecionado pelo usuário
        if (filtroAtual === 'todos' || filtroAtual === status) {
            itensExibidos++;
            listaDiv.innerHTML += `
                <div class="item-empresa">
                    <div>
                        <strong>${c.nome}</strong> <br>
                        <small style="color: #666;">CNPJ: ${c.cnpj} | Vencimento: ${dataVenc.toLocaleDateString('pt-BR')} (${dif < 0 ? 'Vencido há ' + Math.abs(dif) : 'Restam ' + dif} dias)</small>
                    </div>
