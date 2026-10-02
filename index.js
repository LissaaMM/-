// Define a data atual correspondente ao servidor para manter o sincronismo
const DATA_HOJE = new Date("2026-10-02T00:00:00");

// Banco de dados em formato JSON embutido na memória
const dadosIniciais = [
    { cnpj: "18.298.069/0001-09", nome: "MN Mercantil Ltda", vencimento: "2027-05-04" },
    { cnpj: "23.529.609/0001-58", nome: "Moto Pecas R3 Ltda", vencimento: "2027-03-16" },
    { cnpj: "51.291.640/0001-39", nome: "Otica Conquista Ltda", vencimento: "2027-08-20" },
    { cnpj: "52.978.326/0001-91", nome: "Otica Vislumbre Ltda", vencimento: "2026-11-28" },
    { cnpj: "43.955.439/0001-00", nome: "DJ Moveis e Colchoes", vencimento: "2025-11-12" }
];

// Alimenta o localStorage se estiver rodando pela primeira vez
if (!localStorage.getItem('clientes_pastas')) {
    localStorage.setItem('clientes_pastas', JSON.stringify(dadosIniciais));
}

// Configura os escutadores de eventos quando o documento HTML terminar de carregar
document.addEventListener("DOMContentLoaded", function() {
    atualizarInterfaceLista();

    document.getElementById('formCadastro').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const cnpjVal = document.getElementById('cnpj').value.trim();
        const nomeVal = document.getElementById('nome_empresa').value.trim();
        const dataVal = document.getElementById('data_vencimento').value;

        let baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
        
        // Remove duplicados pelo CNPJ antes de adicionar o novo
        baseAtual = baseAtual.filter(c => c.cnpj !== cnpjVal);
        
        baseAtual.push({
            cnpj: cnpjVal,
            nome: nomeVal,
            vencimento: dataVal
        });

        localStorage.setItem('clientes_pastas', JSON.stringify(baseAtual));
        alert('Pasta de dados guardada com sucesso!');
        this.reset();
        atualizarInterfaceLista();
    });
});

// Mecanismo de busca e cálculo dos avisos de vencimento
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

    // Define qual aviso estilizado aparecerá após a pesquisa
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

// Atualiza a listagem de pastas ativas na parte inferior da tela
function atualizarInterfaceLista() {
    const listaDiv = document.getElementById('listaVisual');
    const baseAtual = JSON.parse(localStorage.getItem('clientes_pastas')) || [];
    
    if (baseAtual.length === 0) {
        listaDiv.innerHTML = "<p style='color: #666;'>Nenhum registro armazenado.</p>";
        return;
    }

    listaDiv.innerHTML = "";
    baseAtual.forEach(c => {
        const dataVenc = new Date(c.vencimento + "T00:00:00");
        const dif = Math.ceil((dataVenc.getTime() - DATA_HOJE.getTime()) / (1000 * 60 * 60 * 24));
        
        let badgeHtml = '';
        if(dif < 0) {
            badgeHtml = '<span class="badge" style="background-color: var(--status-vencido)">Vencido</span>';
        } else if (dif <= 30) {
            badgeHtml = '<span class="badge" style="background-color: var(--status-vencer)">À Vencer</span>';
        } else {
            badgeHtml = '<span class="badge" style="background-color: var(--status-prazo)">No Prazo</span>';
        }

        listaDiv.innerHTML += `
            <div class="item-empresa">
                <div>
                    <strong>${c.nome}</strong> <br>
                    <small style="color: #666;">CNPJ: ${c.cnpj} | Vencimento: ${dataVenc.toLocaleDateString('pt-BR')}</small>
                </div>
                <div>${badgeHtml}</div>
            </div>
        `;
    });
}
