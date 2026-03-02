        const API_TOKEN = 'COLOQUE_SEU_TOKEN_AQUI';

        // ========== VARIÁVEIS GLOBAIS ==========
        let idEdicao = null;
        let idEdicaoDividendo = null;

        // ========== PALETA DE CORES ==========
        const paletaCores = ['#001435', '#FDB913', '#1e88e5', '#43a047', '#e53935', '#fb8c00', '#8e24aa', '#3949ab', '#00acc1', '#7cb342'];

        // ========== CLASSE GERENCIADOR DE APORTES ==========
        class GerenciadorAportes {
            constructor() {
                this.aportes = this.carregarDados();
            }

            carregarDados() {
                const dados = localStorage.getItem('mercadoBolsaBR_aportes');
                return dados ? JSON.parse(dados) : [];
            }

            salvar() {
                localStorage.setItem('mercadoBolsaBR_aportes', JSON.stringify(this.aportes));
            }

            adicionar(aporte) {
                aporte.id = Date.now();
                this.aportes.push(aporte);
                this.salvar();
            }

            obterTodos() {
                return this.aportes;
            }

            obterPorId(id) {
                return this.aportes.find(a => a.id === id);
            }

            remover(id) {
                this.aportes = this.aportes.filter(a => a.id !== id);
                this.salvar();
            }

            atualizar(id, aporte) {
                const i = this.aportes.findIndex(x => x.id === id);
                if (i !== -1) {
                    this.aportes[i] = { ...this.aportes[i], ...aporte };
                    this.salvar();
                }
            }
        }

        // ========== CLASSE GERENCIADOR DE DIVIDENDOS ==========
        class GerenciadorDividendos {
            constructor() {
                this.dividendos = this.carregarDados();
            }

            carregarDados() {
                const dados = localStorage.getItem('mercadoBolsaBR_dividendos');
                return dados ? JSON.parse(dados) : [];
            }

            salvar() {
                localStorage.setItem('mercadoBolsaBR_dividendos', JSON.stringify(this.dividendos));
            }

            adicionar(dividendo) {
                dividendo.id = Date.now();
                this.dividendos.push(dividendo);
                this.salvar();
            }

            obterTodos() {
                return this.dividendos;
            }

            obterPorId(id) {
                return this.dividendos.find(d => d.id === id);
            }

            remover(id) {
                this.dividendos = this.dividendos.filter(d => d.id !== id);
                this.salvar();
            }

            atualizar(id, d) {
                const i = this.dividendos.findIndex(x => x.id === id);
                if (i !== -1) {
                    this.dividendos[i] = { ...this.dividendos[i], ...d };
                    this.salvar();
                }
            }
        }

        // ========== CLASSE GERENCIADOR DE RADAR ==========
        class GerenciadorRadar {
            constructor() {
                this.itens = this.carregarDados();
            }

            carregarDados() {
                const dados = localStorage.getItem('mercadoBolsaBR_radar');
                return dados ? JSON.parse(dados) : [];
            }

            salvar() {
                localStorage.setItem('mercadoBolsaBR_radar', JSON.stringify(this.itens));
            }

            adicionarItem(codigo, precoTeto) {
                if (this.existeItem(codigo)) {
                    mostrarAlerta('Este ativo já está no radar!', 'erro');
                    return false;
                }
                const item = {
                    id: Date.now(),
                    codigo: codigo.toUpperCase(),
                    precoTeto: parseFloat(precoTeto),
                    dataCriacao: new Date().toISOString()
                };
                this.itens.push(item);
                this.salvar();
                return true;
            }

            removerItem(id) {
                this.itens = this.itens.filter(i => i.id !== id);
                this.salvar();
            }

            obterTodos() {
                return this.itens;
            }

            obterPorId(id) {
                return this.itens.find(i => i.id === id);
            }

            existeItem(codigo) {
                return this.itens.some(i => i.codigo === codigo.toUpperCase());
            }
        }

        // ========== INSTÂNCIAS GLOBAIS ==========
        const gerenciador = new GerenciadorAportes();
        const gDividendos = new GerenciadorDividendos();
        const gerenciadorRadar = new GerenciadorRadar();

        // ========== FUNÇÕES UTILITÁRIAS ==========
        function formatarMoeda(valor) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
        }

        function formatarData(data) {
            return new Date(data).toLocaleDateString('pt-BR');
        }

        function formatarDataInput(data) {
            return new Date(data).toISOString().split('T')[0];
        }

        function mostrarAlerta(mensagem, tipo = 'sucesso') {
            const alerta = document.createElement('div');
            alerta.className = `alerta ${tipo}`;
            alerta.textContent = mensagem;
            document.body.insertBefore(alerta, document.body.firstChild);
            setTimeout(() => alerta.remove(), 3000);
        }

        // ========== INTEGRAÇÃO COM API BRAPI ==========
        async function buscarCotacaoReal(codigo) {
            try {
                const response = await fetch(`https://brapi.dev/api/quote/${codigo}?token=${API_TOKEN}`);
                if (!response.ok) throw new Error('Erro na API');
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    return data.results[0].regularMarketPrice;
                }
                return null;
            } catch (error) {
                console.error(`Erro ao buscar cotação de ${codigo}:`, error);
                return null;
            }
        }

        // ========== FUNÇÕES DE FORMULÁRIO ==========
        document.getElementById('formAporte').addEventListener('submit', (e) => {
            e.preventDefault();
            const dados = {
                codigoAtivo: document.getElementById('codigoAporte').value.toUpperCase(),
                setorAporte: document.getElementById('setorAporte').value,
                quantidade: parseInt(document.getElementById('quantidadeAporte').value),
                precoPago: parseFloat(document.getElementById('precoAporte').value),
                dataCompra: document.getElementById('dataAporte').value,
                nota: document.getElementById('notaCorretagem').value
            };

            if (idEdicao === null) {
                gerenciador.adicionar(dados);
                mostrarAlerta('Aporte salvo com sucesso!');
            } else {
                gerenciador.atualizar(idEdicao, dados);
                mostrarAlerta('Aporte atualizado com sucesso!');
                cancelarEdicao();
            }

            document.getElementById('formAporte').reset();
            document.getElementById('dataAporte').valueAsDate = new Date();
            atualizarInterface();
        });

        function entrarModoEdicao(id) {
            const aporte = gerenciador.obterPorId(id);
            if (!aporte) return;

            idEdicao = id;
            document.getElementById('codigoAporte').value = aporte.codigoAtivo;
            document.getElementById('setorAporte').value = aporte.setorAporte;
            document.getElementById('quantidadeAporte').value = aporte.quantidade;
            document.getElementById('precoAporte').value = aporte.precoPago;
            document.getElementById('dataAporte').value = formatarDataInput(aporte.dataCompra);
            document.getElementById('notaCorretagem').value = aporte.nota || '';

            document.getElementById('btnSubmitAporte').textContent = 'Atualizar Aporte';
            document.getElementById('btnCancelarAporte').style.display = 'inline-block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function cancelarEdicao() {
            idEdicao = null;
            document.getElementById('formAporte').reset();
            document.getElementById('dataAporte').valueAsDate = new Date();
            document.getElementById('btnSubmitAporte').textContent = 'Salvar Aporte';
            document.getElementById('btnCancelarAporte').style.display = 'none';
        }

        document.getElementById('btnCancelarAporte').addEventListener('click', cancelarEdicao);

        // ========== FUNÇÕES DE TABELA DE APORTES ==========
        function atualizarTabelaAportes() {
            const aportes = gerenciador.obterTodos() .sort((a, b) => new Date(b.dataCompra) - new Date(a.dataCompra));
            const container = document.getElementById('tabelaContainer');

            if (aportes.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">Nenhum aporte registrado.</p>';
                return;
            }

            let html = '<table><thead><tr><th>Ativo</th><th>Setor</th><th>Data</th><th>Quantidade</th><th>Preço Unitário</th><th>Total Investido</th><th>Nota</th><th>Ações</th></tr></thead><tbody>';

            aportes.forEach(aporte => {
                const total = aporte.quantidade * aporte.precoPago;
                const notaHtml = aporte.nota ? `<a href="${aporte.nota}" target="_blank">🔗 Abrir</a>` : '-';
                html += `<tr>
                    <td>${aporte.codigoAtivo}</td>
                    <td>${aporte.setorAporte}</td>
                    <td>${formatarData(aporte.dataCompra)}</td>
                    <td>${aporte.quantidade}</td>
                    <td>${formatarMoeda(aporte.precoPago)}</td>
                    <td>${formatarMoeda(total)}</td>
                    <td>${notaHtml}</td>
                    <td>
                        <button class="btn-edit" onclick="entrarModoEdicao(${aporte.id})">Editar</button>
                        <button class="btn-danger" onclick="excluirAporte(${aporte.id})">Excluir</button>
                    </td>
                </tr>`;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function excluirAporte(id) {
            if (confirm('Tem certeza que deseja excluir este aporte?')) {
                gerenciador.remover(id);
                mostrarAlerta('Aporte excluído com sucesso!');
                atualizarInterface();
            }
        }

        // ========== FUNÇÕES DE CARTEIRA CONSOLIDADA ==========
        async function atualizarCarteiraConsolidada() {
            const aportes = gerenciador.obterTodos();
            const container = document.getElementById('tabelaCarteiraContainer');

            if (aportes.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">Nenhum aporte registrado.</p>';
                return;
            }

            const carteira = {};
            aportes.forEach(aporte => {
                if (!carteira[aporte.codigoAtivo]) {
                    carteira[aporte.codigoAtivo] = {
                        codigo: aporte.codigoAtivo,
                        setor: aporte.setorAporte,
                        quantidade: 0,
                        totalInvestido: 0
                    };
                }
                carteira[aporte.codigoAtivo].quantidade += aporte.quantidade;
                carteira[aporte.codigoAtivo].totalInvestido += aporte.quantidade * aporte.precoPago;
            });

            Object.keys(carteira).forEach(codigo => {
                carteira[codigo].precoMedio = carteira[codigo].totalInvestido / carteira[codigo].quantidade;
            });

            let html = '<table><thead><tr><th>Ativo</th><th>Setor</th><th>Qtd</th><th>Preço Médio</th><th>Cotação Atual</th><th>Total Atual</th><th>Lucro/Prejuízo</th><th>YoC (%)</th></tr></thead><tbody>';

            for (const codigo of Object.keys(carteira)) {
                const ativo = carteira[codigo];
                const cotacao = await buscarCotacaoReal(codigo) || ativo.precoMedio;
                const totalAtual = ativo.quantidade * cotacao;
                const lucroPreju = totalAtual - ativo.totalInvestido;
                const percentualLucro = (lucroPreju / ativo.totalInvestido) * 100;

                const dividendosAtivo = gDividendos.obterTodos()
                    .filter(d => d.codigoDividendo === codigo)
                    .reduce((sum, d) => sum + parseFloat(d.valorDividendo), 0);
                const yoc = (dividendosAtivo / ativo.totalInvestido) * 100;

                const corLucro = lucroPreju >= 0 ? '#388e3c' : '#d32f2f';
                html += `<tr>
                    <td><strong>${codigo}</strong></td>
                    <td>${ativo.setor}</td>
                    <td>${ativo.quantidade}</td>
                    <td>${formatarMoeda(ativo.precoMedio)}</td>
                    <td>${formatarMoeda(cotacao)}</td>
                    <td>${formatarMoeda(totalAtual)}</td>
                    <td style="color: ${corLucro};">${formatarMoeda(lucroPreju)} (${percentualLucro.toFixed(2)}%)</td>
                    <td>${yoc.toFixed(2)}%</td>
                </tr>`;
            }

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        // ========== FUNÇÕES DE DIVIDENDOS ==========
        document.getElementById('formDividendos').addEventListener('submit', (e) => {
            e.preventDefault();
            const dados = {
                codigoDividendo: document.getElementById('codigoDividendo').value.toUpperCase(),
                valorDividendo: parseFloat(document.getElementById('valorDividendo').value),
                dataPagamento: document.getElementById('dataPagamento').value,
                descricaoDividendo: document.getElementById('descricaoDividendo').value
            };

            if (idEdicaoDividendo === null) {
                gDividendos.adicionar(dados);
                mostrarAlerta('Dividendo salvo com sucesso!');
            } else {
                gDividendos.atualizar(idEdicaoDividendo, dados);
                mostrarAlerta('Dividendo atualizado com sucesso!');
                cancelarEdicaoDividendo();
            }

            document.getElementById('formDividendos').reset();
            document.getElementById('dataPagamento').valueAsDate = new Date();
            atualizarInterface();
        });

        function editarDividendo(id) {
            const dividendo = gDividendos.obterPorId(id);
            if (!dividendo) return;

            idEdicaoDividendo = id;
            document.getElementById('codigoDividendo').value = dividendo.codigoDividendo;
            document.getElementById('valorDividendo').value = dividendo.valorDividendo;
            document.getElementById('dataPagamento').value = formatarDataInput(dividendo.dataPagamento);
            document.getElementById('descricaoDividendo').value = dividendo.descricaoDividendo || '';

            document.getElementById('btnSubmitDividendo').textContent = 'Atualizar Dividendo';
            document.getElementById('btnCancelarDividendo').style.display = 'inline-block';

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function cancelarEdicaoDividendo() {
            idEdicaoDividendo = null;
            document.getElementById('formDividendos').reset();
            document.getElementById('dataPagamento').valueAsDate = new Date();
            document.getElementById('btnSubmitDividendo').textContent = 'Salvar Dividendo';
            document.getElementById('btnCancelarDividendo').style.display = 'none';
        }

        document.getElementById('btnCancelarDividendo').addEventListener('click', cancelarEdicaoDividendo);

        function atualizarTabelaDividendos() {
            const dividendos = gDividendos.obterTodos() .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
            const container = document.getElementById('tabelaDividendosContainer');

            if (dividendos.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">Nenhum dividendo registrado.</p>';
                return;
            }

            let html = '<table><thead><tr><th>Ativo</th><th>Data</th><th>Descrição</th><th>Valor</th><th>Ações</th></tr></thead><tbody>';

            dividendos.forEach(dividendo => {
                const descricao = dividendo.descricaoDividendo || '-';
                html += `<tr>
                    <td>${dividendo.codigoDividendo}</td>
                    <td>${formatarData(dividendo.dataPagamento)}</td>
                    <td>${descricao}</td>
                    <td>${formatarMoeda(parseFloat(dividendo.valorDividendo))}</td>
                    <td>
                        <button class="btn-edit" onclick="editarDividendo(${dividendo.id})">Editar</button>
                        <button class="btn-danger" onclick="excluirDividendo(${dividendo.id})">Excluir</button>
                    </td>
                </tr>`;
            });

            html += '</tbody></table>';
            container.innerHTML = html;
        }

        function excluirDividendo(id) {
            if (confirm('Tem certeza que deseja excluir este dividendo?')) {
                gDividendos.remover(id);
                mostrarAlerta('Dividendo excluído com sucesso!');
                atualizarInterface();
            }
        }

        // ========== FUNÇÕES DE GRÁFICOS ==========
        let chart1, chart2, chart3, chart4;

        function atualizarGraficos() {
            const aportes = gerenciador.obterTodos();
            const dividendos = gDividendos.obterTodos();

            if (aportes.length === 0) {
                document.querySelectorAll('canvas').forEach(canvas => {
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                });
                return;
            }

            // Gráfico 1: Composição da Carteira (Doughnut)
            const ativos = {};
            aportes.forEach(aporte => {
                if (!ativos[aporte.codigoAtivo]) {
                    ativos[aporte.codigoAtivo] = 0;
                }
                ativos[aporte.codigoAtivo] += aporte.quantidade * aporte.precoPago;
            });

            const labels = Object.keys(ativos);
            const valores = Object.values(ativos);

            if (chart1) chart1.destroy();
            const ctx1 = document.getElementById('chartComposicao').getContext('2d');
            chart1 = new Chart(ctx1, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: valores,
                        backgroundColor: paletaCores.slice(0, labels.length),
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
            });

            // Gráfico 2: Valor Investido por Ativo (Bar)
            if (chart2) chart2.destroy();
            const ctx2 = document.getElementById('chartValores').getContext('2d');
            chart2 = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Valor Investido (R$)',
                        data: valores,
                        backgroundColor: paletaCores.slice(0, labels.length),
                        borderColor: labels.map(() => '#001435'),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true } }
                }
            });

            // Gráfico 3: Composição por Setor (Doughnut)
            const setoresAgrupados = {};
            aportes.forEach(aporte => {
                if (!setoresAgrupados[aporte.setorAporte]) {
                    setoresAgrupados[aporte.setorAporte] = 0;
                }
                setoresAgrupados[aporte.setorAporte] += aporte.quantidade * aporte.precoPago;
            });

            const labelSetores = Object.keys(setoresAgrupados);
            const valoresSetores = Object.values(setoresAgrupados);

            if (chart3) chart3.destroy();
            const ctx3 = document.getElementById('graficoSetor').getContext('2d');
            chart3 = new Chart(ctx3, {
                type: 'doughnut',
                data: {
                    labels: labelSetores,
                    datasets: [{
                        data: valoresSetores,
                        backgroundColor: paletaCores.slice(0, labelSetores.length),
                        borderColor: '#fff',
                        borderWidth: 2
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true } } }
            });

            // Gráfico 4: Evolução de Dividendos (Bar)
            const dividendosPorMes = {};
            dividendos.forEach(div => {
                const data = new Date(div.dataPagamento);
                const mesAno = `${String(data.getMonth() + 1).padStart(2, '0')}/${data.getFullYear()}`;
                if (!dividendosPorMes[mesAno]) {
                    dividendosPorMes[mesAno] = 0;
                }
                dividendosPorMes[mesAno] += parseFloat(div.valorDividendo);
            });

            const labelMeses = Object.keys(dividendosPorMes).sort();
            const valoresMeses = labelMeses.map(mes => dividendosPorMes[mes]);

            if (chart4) chart4.destroy();
            const ctx4 = document.getElementById('graficoDividendos').getContext('2d');
            chart4 = new Chart(ctx4, {
                type: 'bar',
                data: {
                    labels: labelMeses,
                    datasets: [{
                        label: 'Dividendos Recebidos (R$)',
                        data: valoresMeses,
                        backgroundColor: '#388e3c',
                        borderColor: '#2e7d32',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'x',
                    plugins: { legend: { display: true } },
                    scales: { y: { beginAtZero: true } }
                }
            });
        }

        // ========== FUNÇÕES DE RADAR ==========
        document.getElementById('formRadar').addEventListener('submit', (e) => {
            e.preventDefault();
            const codigo = document.getElementById('codigoRadar').value.toUpperCase();
            const precoTeto = parseFloat(document.getElementById('precoTeto').value);

            if (gerenciadorRadar.adicionarItem(codigo, precoTeto)) {
                document.getElementById('formRadar').reset();
                mostrarAlerta('Ativo adicionado ao radar!');
                atualizarInterface();
            }
        });

        async function atualizarRadar() {
            const itens = gerenciadorRadar.obterTodos();
            const container = document.getElementById('radarContainer');

            if (itens.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: #999;">Nenhum ativo no radar.</p>';
                return;
            }

            let html = '';

            for (const item of itens) {
                const cotacao = await buscarCotacaoReal(item.codigo);
                let status, statusClass;

                if (cotacao === null) {
                    status = '⚠️ Indisponível';
                    statusClass = 'status-indisponivel';
                } else if (cotacao <= item.precoTeto) {
                    status = '🟢 Comprar (Desconto)';
                    statusClass = 'status-compra';
                } else {
                    status = '🔴 Aguardar (Caro)';
                    statusClass = 'status-aguardar';
                }

                html += `<div class="radar-card">
                    <button class="radar-remove" onclick="removerDoRadar(${item.id})">🗑️</button>
                    <strong>${item.codigo}</strong><br>
                    Preço Teto: ${formatarMoeda(item.precoTeto)}<br>
                    Cotação Atual: ${cotacao ? formatarMoeda(cotacao) : 'Carregando...'}<br>
                    <span class="radar-status ${statusClass}">${status}</span>
                </div>`;
            }

            container.innerHTML = html;
        }

        function removerDoRadar(id) {
            if (confirm('Tem certeza que deseja remover este ativo do radar?')) {
                gerenciadorRadar.removerItem(id);
                mostrarAlerta('Ativo removido do radar com sucesso!');
                atualizarInterface();
            }
        }

        // ========== FUNÇÕES DE EXPORTAÇÃO ==========
        function atualizarResumoGeral() {
            const totalInvestido = gerenciador.obterTodos().reduce((acc, a) => acc + (a.quantidade * a.precoPago), 0);
            const totalDividendos = gDividendos.obterTodos().reduce((acc, d) => acc + parseFloat(d.valorDividendo), 0);
            const retorno = totalInvestido > 0 ? (totalDividendos / totalInvestido) * 100 : 0;

            document.getElementById('resumoInvestido').textContent = formatarMoeda(totalInvestido);
            document.getElementById('resumoDividendos').textContent = formatarMoeda(totalDividendos);
            document.getElementById('resumoRetorno').textContent = retorno.toFixed(2) + '%';
        }

        function exportarParaCSV() {
            const aportes = gerenciador.obterTodos();
            if (aportes.length === 0) {
                mostrarAlerta('Nenhum aporte para exportar!', 'erro');
                return;
            }

            let csv = 'Data;Ativo;Setor;Quantidade;Preço Unitário;Total Investido;Link da Nota\n';
            aportes.forEach(aporte => {
                const total = aporte.quantidade * aporte.precoPago;
                const nota = aporte.nota || '';
                csv += `${aporte.dataCompra};${aporte.codigoAtivo};${aporte.setorAporte};${aporte.quantidade};${aporte.precoPago.toFixed(2)};${total.toFixed(2)};${nota}\n`;
            });

            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'meus_aportes_b3.csv';
            link.click();
            mostrarAlerta('Aportes exportados com sucesso!');
        }

        function exportarDividendosParaCSV() {
            const dividendos = gDividendos.obterTodos();
            if (dividendos.length === 0) {
                mostrarAlerta('Nenhum dividendo para exportar!', 'erro');
                return;
            }

            let csv = 'Data;Ativo;Descrição;Valor\n';
            dividendos.forEach(div => {
                const descricao = div.descricaoDividendo || '';
                csv += `${div.dataPagamento};${div.codigoDividendo};${descricao};${parseFloat(div.valorDividendo).toFixed(2)}\n`;
            });

            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'meus_dividendos_b3.csv';
            link.click();
            mostrarAlerta('Dividendos exportados com sucesso!');
        }

        // ========== FUNÇÕES DE IMPORTAÇÃO ==========
        function baixarModeloAportes() {
            const csv = 'Data (YYYY-MM-DD);Ativo;Setor;Quantidade;Preço Unitário;Link da Nota\n2023-10-15;BBAS3;Bancos;10;45.50;https://linkdanota.com\n';
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'modelo_aportes.csv';
            link.click();
        }

        function baixarModeloDividendos() {
            const csv = 'Data (YYYY-MM-DD);Ativo;Valor Recebido;Descrição\n2023-10-20;BBAS3;15.50;JCP\n';
            const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
            const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'modelo_dividendos.csv';
            link.click();
        }

        function importarAportes(arquivo) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const texto = e.target.result;
                const linhas = texto.split(/\r?\n/);
                let importados = 0;

                for (let i = 1; i < linhas.length; i++) {
                    const linha = linhas[i].trim();
                    if (!linha) continue;

                    const colunas = linha.split(';').map(c => c.trim());
                    if (colunas.length < 5) continue;

                    const dados = {
                        dataCompra: colunas[0],
                        codigoAtivo: colunas[1].toUpperCase(),
                        setorAporte: colunas[2],
                        quantidade: parseInt(colunas[3]),
                        precoPago: parseFloat(colunas[4]),
                        nota: colunas[5] || ''
                    };

                    gerenciador.adicionar(dados);
                    importados++;
                }

                mostrarAlerta(`${importados} aporte(s) importado(s) com sucesso!`);
                atualizarInterface();
                document.getElementById('fileImportAportes').value = '';
            };
            reader.readAsText(arquivo);
        }

        function importarDividendos(arquivo) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const texto = e.target.result;
                const linhas = texto.split(/\r?\n/);
                let importados = 0;

                for (let i = 1; i < linhas.length; i++) {
                    const linha = linhas[i].trim();
                    if (!linha) continue;

                    const colunas = linha.split(';').map(c => c.trim());
                    if (colunas.length < 3) continue;

                    const dados = {
                        dataPagamento: colunas[0],
                        codigoDividendo: colunas[1].toUpperCase(),
                        valorDividendo: parseFloat(colunas[2]),
                        descricaoDividendo: colunas[3] || ''
                    };

                    gDividendos.adicionar(dados);
                    importados++;
                }

                mostrarAlerta(`${importados} dividendo(s) importado(s) com sucesso!`);
                atualizarInterface();
                document.getElementById('fileImportDividendos').value = '';
            };
            reader.readAsText(arquivo);
        }

        // ========== FUNÇÕES DE CÓPIA DE GRÁFICO ==========
        async function copiarGrafico(canvasId) {
            try {
                const canvas = document.getElementById(canvasId);
                if (!canvas) {
                    mostrarAlerta('Gráfico não encontrado.', 'erro');
                    return;
                }

                const cardElement = canvas.closest('.chart-card');
                if (!cardElement) {
                    mostrarAlerta('Card não encontrado.', 'erro');
                    return;
                }

                const imageCanvas = await html2canvas(cardElement, {
                    backgroundColor: '#ffffff',
                    scale: 2,
                    logging: false
                });

                imageCanvas.toBlob(async (blob) => {
                    const item = new ClipboardItem({ "image/png": blob });
                    await navigator.clipboard.write([item]);
                    mostrarAlerta('Gráfico copiado para a área de transferência!');
                });
            } catch (err) {
                console.error('Erro ao copiar gráfico:', err);
                mostrarAlerta('Erro ao copiar gráfico.', 'erro');
            }
        }

        // ========== FUNCIONALIDADE DE COLLAPSE ==========
        function toggleSecao(botao) {
            const conteudo = botao.parentElement.nextElementSibling;
            if (conteudo.style.display === 'none') {
                conteudo.style.display = 'block';
                botao.textContent = '➖';
            } else {
                conteudo.style.display = 'none';
                botao.textContent = '➕';
            }
        }

        // ========== CONTROLE GLOBAL DE VISIBILIDADE ==========
        let todasOcultas = false;

        window.toggleTodasSecoes = function() {
            todasOcultas = !todasOcultas;
            
            const secoes = document.querySelectorAll('section.card, .card, section');
            
            secoes.forEach(secao => {
                const botao = secao.querySelector('button[onclick*="toggleSecao"]');
                const header = secao.querySelector('.card-header') || secao.querySelector('div[style*="flex"]');
                const conteudo = secao.querySelector('.conteudo-secao') || (header ? header.nextElementSibling : null);
                
                if (conteudo && conteudo.tagName === 'DIV') {
                    conteudo.style.display = todasOcultas ? 'none' : 'block';
                }
                
                if (botao) {
                    botao.textContent = todasOcultas ? '➕' : '➖';
                }
            });
        }

        // ========== EVENT LISTENERS ==========
        document.getElementById('btnExportarAportes').addEventListener('click', exportarParaCSV);
        document.getElementById('btnExportarDividendos').addEventListener('click', exportarDividendosParaCSV);
        document.getElementById('btnModeloAportes').addEventListener('click', baixarModeloAportes);
        document.getElementById('btnModeloDividendos').addEventListener('click', baixarModeloDividendos);
        document.getElementById('btnImportarAportes').addEventListener('click', () => document.getElementById('fileImportAportes').click());
        document.getElementById('btnImportarDividendos').addEventListener('click', () => document.getElementById('fileImportDividendos').click());
        document.getElementById('fileImportAportes').addEventListener('change', (e) => importarAportes(e.target.files[0]));
        document.getElementById('fileImportDividendos').addEventListener('change', (e) => importarDividendos(e.target.files[0]));

        // ========== FUNÇÃO DE ATUALIZAÇÃO DA INTERFACE ==========
        async function atualizarInterface() {
            atualizarResumoGeral();
            atualizarTabelaAportes();
            atualizarTabelaDividendos();
            atualizarGraficos();
            await atualizarCarteiraConsolidada();
            await atualizarRadar();
        }

        // ========== INICIALIZAÇÃO ==========
        window.addEventListener('load', atualizarInterface);
