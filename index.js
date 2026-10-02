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

// Inicializa o armazenamento local se estiver vazio
if (localStorage.getItem('clientes_pastas') === null) {
    localStorage.setItem('clientes_pastas', JSON.stringify(dadosIniciais));
}

// MÁSCARA DE CNPJ TOTALMENTE LIMPA (Sem expressões regulares complexas que travam editores)
function aplicarMascaraCNPJ(input) {
    if (!input) return;
    
    // Mantém apenas os números digitados
    let numeros = "";
    for (let i = 0; i < input.value.length; i++) {
        if ("0123456789".indexOf(input.value[i]) !== -1) {
            numeros += input.value[i];
        }
    }
    
    // Limita o tamanho ao máximo de um CNPJ (14 dígitos)
    if (numeros.length > 14) {
        numeros = numeros.slice(0, 14);
    }
    
    // Monta a máscara manualmente caractere por caractere para orientação do usuário
    let resultadoFormatado = "";
    for (let i = 0; i < numeros.length; i++) {
        if (i === 2 || i === 5) {
            resultadoFormatado += ".";
        } else if (i === 8) {
            resultadoFormatado += "/";
        } else if (i === 12) {
            resultadoFormatado += "-";
        }
        resultadoFormatado += numeros[i];
    }
    
    input.value = resultadoFormatado;
}

// VALIDAÇÃO MATEMÁTICA SIMPLIFICADA DE CNPJ
function validarCNPJ(cnpj) {
    let limpo = "";
    for (let i = 0; i < cnpj.length; i++) {
        if ("0123456789".indexOf(cnpj[i]) !== -1) limpo += cnpj[i];
    }
    
    if (limpo.length !== 14) return false;
    
    // Evita sequências repetidas simples de validação
    let igual = true;
    for (let i = 1; i < limpo.length; i++) {
        if (limpo[i] !== limpo[0]) igual = false;
    }
    if (igual) return false;
    
    // Cálculo do primeiro dígito verificador
    let tamanho = 12;
    let numeros = limpo.substring(0, tamanho);
    let digitos = limpo.substring(tamanho);
    let soma = 0;
    let pos = 5;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    
    // Cálculo do segundo dígito verificador
    tamanho = 13;
    numeros = limpo.substring(0, tamanho);
    soma = 0;
    pos = 6;
    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
        if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    
    return true;
}

// Inicialização segura da interface
document.addEventListener("DOMContentLoaded", function() {
    try {
        atualizarInterfaceLista();

        const inputCnpj = document.getElementById('cnpj');
        const inputBusca = document.getElementById('busca');

        if (inputCnpj) {
            inputCnpj.addEventListener('input', function() { aplicarMascaraCNPJ(this); });
        }
        
        if (inputBusca) {
            inputBusca.addEventListener('input', function() { 
                // Aplica formatação se o primeiro caractere digitado for número
                if (this.value.length > 0 && "0123456789".indexOf(this.value[0]) !== -1) {
                    aplicarMascaraCNPJ(this);
                }
            });
        }

        const form = document.getElementById('formCadastro');
        if (form) {
            form.addEventListener('submit', function(e) {
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
                form.reset();
                atualizarInterfaceLista();
            });
        }
    } catch (err) {
        console.error("Erro na inicialização dos elementos: ", err);
    }
});

// Mecanismo de Busca Inteligência Individual
function pesquisarCertificado() {
    const termoBusca = document.getElementById('busca').value.trim().toLowerCase();
    const painel = document.getElementById('alertaResultado');
    if (!painel) return;
    
    if (!termoBusca) {
        painel.className = "painel-aviso status-erro";
        painel.innerHTML = "Por favor, informe o CNPJ ou Nome da empresa.";
        painel.style.display = "block";
        return;
    }

    const baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
    
    if (baseAtual.length === 0) {
        painel.className = "painel-aviso status-erro";
        painel.innerHTML = "❌ Erro: O banco de dados está vazio. Registre um cliente primeiro.";
        painel.style.display = "block";
        return;
    }

    const clienteEncontrado = baseAtual.find(c => 
        c.cnpj.toLowerCase().indexOf(termoBusca) !== -1 || 
        c.nome.toLowerCase().indexOf(termoBusca) !== -1
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
    const botoes = document.querySelectorAll('.btn-filtro');
    botoes.forEach(b => b.classList.remove('ativo'));
    if (botaoClicado) botaoClicado.classList.add('ativo');
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
        const painel = document.getElementById('alertaResultado');
