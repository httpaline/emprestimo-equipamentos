const $ = (seletor) => document.querySelector(seletor);

function el(tag, props = {}, ...filhos) {
    const no = Object.assign(document.createElement(tag), props);
    no.append(...filhos);
    return no;
}

/* ---------- constantes e estado ---------- */

const ICONES = {
    laptop: '<rect x="4" y="5" width="16" height="11" rx="2"/><path d="M2 19h20"/>',
    monitor: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    headset: '<path d="M4 15v-3a8 8 0 0116 0v3"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
};
const ICONE_DO_TIPO = { NOTEBOOK: 'laptop', MONITOR: 'monitor', HEADSET: 'headset' };
const PREFIXO_PATRIMONIO = { NOTEBOOK: 'NB', MONITOR: 'MN', HEADSET: 'HS' };
const POR_PAGINA = 6;

const dados = { equipamentos: [], colaboradores: [], emprestimos: [] };
const estado = { tela: '', busca: '', status: 'todos', pagina: 1 };

/* ---------- utilitários ---------- */

function icone(nome) {
    const span = el('span', { className: 'ic' });
    span.innerHTML = `<svg viewBox="0 0 24 24">${ICONES[nome]}</svg>`;
    return span;
}

const formatarData = (iso) => (iso ? iso.split('-').reverse().join('/') : '–');
const capitalizar = (texto) => (texto ? texto[0] + texto.slice(1).toLowerCase() : '');
const iniciais = (nome) => nome.split(' ').map((parte) => parte[0]).slice(0, 2).join('').toUpperCase();

let timerAviso;
function avisar(mensagem, erro = false) {
    const toast = $('#toast');
    toast.textContent = mensagem;
    toast.className = erro ? 'on err' : 'on';
    clearTimeout(timerAviso);
    timerAviso = setTimeout(() => (toast.className = ''), 3500);
}

/* ---------- API ---------- */

async function api(url, opcoes) {
    const resposta = await fetch(url, opcoes);
    if (!resposta.ok) {
        let mensagem = `Erro ${resposta.status}`;
        try { mensagem = (await resposta.json()).message || mensagem; } catch {}
        throw new Error(mensagem);
    }
    return resposta.status === 204 ? null : resposta.json();
}

const enviarJson = (metodo, corpo) => ({
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
});

async function executar(acao, sucesso) {
    try {
        await acao();
        fecharModal();
        if (sucesso) avisar(sucesso);
        renderizar();
    } catch (erro) {
        avisar(erro.message, true);
    }
}

function normalizarEmprestimo(e) {
    return {
        ...e,
        equipamentoId: e.equipamentoId ?? e.equipamento?.id ?? e.idEquipamento,
        colaboradorId: e.colaboradorId ?? e.colaborador?.id ?? e.idColaborador,
    };
}

async function carregarDados() {
    const [equipamentos, colaboradores, emprestimos] = await Promise.all([
        api('/equipamentos'), api('/colaboradores'), api('/emprestimos'),
    ]);
    Object.assign(dados, { equipamentos, colaboradores, emprestimos: emprestimos.map(normalizarEmprestimo) });
}

/* ---------- consultas sobre os dados ---------- */

const porId = (lista, id) => lista.find((item) => item.id === id);
const nomeEquipamento = (id) => porId(dados.equipamentos, id)?.nome ?? `#${id}`;
const nomeColaborador = (id) => porId(dados.colaboradores, id)?.nome ?? `#${id}`;
const tipoEquipamento = (id) => porId(dados.equipamentos, id)?.tipo;
const emprestimoAberto = (equipamentoId) => dados.emprestimos.find((e) => e.equipamentoId === equipamentoId && !e.dataDevolucao);
const emprestimosAbertos = () => dados.emprestimos.filter((e) => !e.dataDevolucao);

function proximoPatrimonio(tipo) {
    const prefixo = PREFIXO_PATRIMONIO[tipo] ?? tipo.slice(0, 2);
    const numeros = dados.equipamentos
        .filter((e) => (e.patrimonio ?? '').startsWith(`${prefixo}-`))
        .map((e) => parseInt(e.patrimonio.split('-')[1]) || 0);
    return `${prefixo}-${String(Math.max(0, ...numeros) + 1).padStart(3, '0')}`;
}

/* ---------- componentes ---------- */

const etiqueta = (texto, tipo = '') => el('span', { className: `tag ${tipo}` }, texto);
const botao = (texto, classe, aoClicar, nomeIcone) =>
    el('button', { className: `btn ${classe}`, onclick: aoClicar }, ...(nomeIcone ? [icone(nomeIcone)] : []), texto);
const campo = (rotulo, entrada, dica) =>
    el('div', {}, el('label', {}, rotulo), entrada, dica ? el('small', { className: 'hint' }, dica) : '');
const itemComIcone = (visual, titulo, detalhe) =>
    el('div', { className: 'item' }, el('span', { className: 'box' }, visual), el('div', {}, el('b', {}, titulo), el('small', {}, detalhe)));

const statusEquipamento = (e) => (e.disponivel ? etiqueta('Disponível', 'ok') : etiqueta('Emprestado', 'info'));
const statusEmprestimo = (e) => {
    if (e.dataDevolucao) return etiqueta(`Devolvido ${formatarData(e.dataDevolucao)}`);
    return e.atrasado ? etiqueta('Atrasado', 'bad') : etiqueta('Em andamento', 'info');
};

const botaoDevolver = (e) =>
    botao('Devolver', 'ghost sm', () => executar(() => api(`/emprestimos/${e.id}/devolucao`, { method: 'PUT' }), 'Devolução registrada'));

const botaoRemover = (e) =>
    el('button', {
        className: 'icon',
        title: 'Remover',
        onclick: () => confirm(`Remover ${e.nome}?`) && executar(() => api(`/equipamentos/${e.id}`, { method: 'DELETE' }), 'Equipamento removido'),
    }, icone('trash'));

const celulaDeAcao = (conteudo) => ({ acao: conteudo });

function linha(...celulas) {
    return el('tr', {}, ...celulas.map((celula) =>
        celula?.acao !== undefined ? el('td', { className: 'r' }, celula.acao) : el('td', {}, celula)));
}

function tabela(colunas, linhas, mensagemVazia) {
    if (!linhas.length) return el('div', { className: 'empty' }, mensagemVazia);
    return el('div', { className: 'scroll' }, el('table', {},
        el('thead', {}, el('tr', {}, ...colunas.map((coluna) => el('th', {}, coluna)))),
        el('tbody', {}, ...linhas)));
}

function listagem({ nome, placeholder, vazio, status, itens, filtro, texto, colunas, linha: montarLinha }) {
    const corpo = el('div');
    const rodape = el('div', { className: 'rodape' });

    function desenhar() {
        const termo = estado.busca.toLowerCase();
        const filtrados = itens.filter((item) =>
            (estado.status === 'todos' || filtro(item, estado.status)) &&
            (!termo || texto(item).toLowerCase().includes(termo)));
        const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
        estado.pagina = Math.min(estado.pagina, paginas);
        const inicio = (estado.pagina - 1) * POR_PAGINA;
        const visiveis = filtrados.slice(inicio, inicio + POR_PAGINA);

        corpo.replaceChildren(tabela(colunas, visiveis.map(montarLinha), vazio));
        rodape.replaceChildren(
            el('span', {}, filtrados.length
                ? `Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${filtrados.length} ${nome}`
                : 'Nenhum resultado'),
            paginacao(paginas));
    }

    function paginacao(total) {
        const pagina = (texto, destino, desabilitado = false) => el('button', {
            className: `pg${destino === estado.pagina && !desabilitado && /\d/.test(texto) ? ' on' : ''}`,
            disabled: desabilitado,
            onclick: () => { estado.pagina = destino; desenhar(); },
        }, texto);
        return el('div', { className: 'pgs' },
            pagina('‹', estado.pagina - 1, estado.pagina === 1),
            ...Array.from({ length: total }, (_, i) => pagina(String(i + 1), i + 1)),
            pagina('›', estado.pagina + 1, estado.pagina === total));
    }

    const busca = el('div', { className: 'search' }, icone('search'), el('input', {
        placeholder,
        value: estado.busca,
        oninput: (ev) => { estado.busca = ev.target.value; estado.pagina = 1; desenhar(); },
    }));
    const seletor = status && el('select', {
        onchange: (ev) => { estado.status = ev.target.value; estado.pagina = 1; desenhar(); },
    }, ...status.map(([valor, texto]) => el('option', { value: valor, selected: valor === estado.status }, texto)));
    const limpar = el('button', {
        className: 'icon sq',
        title: 'Limpar filtros',
        onclick: () => Object.assign(estado, { busca: '', status: 'todos', pagina: 1 }) && renderizar(),
    }, icone('sliders'));

    desenhar();
    return el('div', { className: 'card' }, el('div', { className: 'tools' }, busca, ...(seletor ? [seletor] : []), limpar), corpo, rodape);
}

/* ---------- modal ---------- */

function abrirModal(titulo, campos, textoBotao, aoEnviar, sucesso) {
    const formulario = $('#modal-form');
    $('#modal-title').textContent = titulo;
    formulario.replaceChildren(...campos, el('button', { className: 'btn btn-block', type: 'submit' }, textoBotao));
    formulario.onsubmit = (ev) => { ev.preventDefault(); executar(aoEnviar, sucesso); };
    $('#modal').classList.add('on');
    $('#overlay').classList.add('on');
    formulario.querySelector('input:not([readonly]), select')?.focus();
}

function fecharModal() {
    $('#modal').classList.remove('on');
    $('#overlay').classList.remove('on');
}

function novoEmprestimo() {
    const equipamento = el('select', { required: true },
        ...dados.equipamentos.filter((e) => e.disponivel).map((e) => el('option', { value: e.id }, `${e.nome} (${e.patrimonio})`)));
    const colaborador = el('select', { required: true },
        ...dados.colaboradores.map((c) => el('option', { value: c.id }, c.nome)));
    if (!equipamento.options.length) return avisar('Nenhum equipamento disponível.', true);
    if (!colaborador.options.length) return avisar('Cadastre um colaborador primeiro.', true);

    abrirModal('Novo empréstimo', [
            campo('Equipamento', equipamento, 'Só aparecem os disponíveis'),
            campo('Colaborador', colaborador, 'A devolução é prevista para daqui a 14 dias'),
        ], 'Emprestar',
        () => api(`/emprestimos?equipamentoId=${equipamento.value}&colaboradorId=${colaborador.value}`, { method: 'POST' }),
        'Equipamento emprestado');
}

function novoEquipamento() {
    const tipo = el('select', {}, ...Object.keys(PREFIXO_PATRIMONIO).map((t) => el('option', { value: t }, capitalizar(t))));
    const patrimonio = el('input', { readOnly: true, value: proximoPatrimonio(tipo.value) });
    const nome = el('input', { required: true, placeholder: 'Ex.: Notebook Dell Latitude' });
    tipo.onchange = () => { patrimonio.value = proximoPatrimonio(tipo.value); };

    abrirModal('Novo equipamento', [
            campo('Tipo', tipo),
            campo('Patrimônio', patrimonio, 'Gerado automaticamente a partir do tipo'),
            campo('Nome', nome),
        ], 'Cadastrar',
        () => api('/equipamentos', enviarJson('POST', { patrimonio: patrimonio.value, nome: nome.value, tipo: tipo.value })),
        'Equipamento cadastrado');
}

function novoColaborador() {
    const nome = el('input', { required: true });
    const email = el('input', { type: 'email', required: true });
    const cargo = el('input');

    abrirModal('Novo colaborador', [campo('Nome', nome), campo('E-mail', email), campo('Cargo', cargo)], 'Cadastrar',
        () => api('/colaboradores', enviarJson('POST', { nome: nome.value, email: email.value, cargo: cargo.value })),
        'Colaborador cadastrado');
}

/* ---------- telas ---------- */

function montarTela(titulo, subtitulo, acoes, conteudo) {
    $('#titulo').textContent = titulo;
    $('#bc').textContent = titulo;
    $('#subtitulo').textContent = subtitulo;
    $('#acoes').replaceChildren(...acoes);
    $('#conteudo').replaceChildren(...conteudo);
}

function visaoGeral() {
    const total = dados.equipamentos.length;
    const disponiveis = dados.equipamentos.filter((e) => e.disponivel).length;
    const emUso = total - disponiveis;
    const percentual = total ? Math.round((emUso / total) * 100) : 0;
    const atrasados = dados.emprestimos.filter((e) => e.atrasado);
    const recentes = [...dados.emprestimos].sort((a, b) => b.id - a.id).slice(0, 5);

    const indicador = (rotulo, valor, detalhe, classe = '') =>
        el('div', { className: `card kpi ${classe}` }, el('span', {}, rotulo), el('b', {}, String(valor)), el('small', {}, detalhe));
    const painel = (titulo, conteudo) => el('section', { className: 'card' }, el('h2', {}, titulo), conteudo);

    const uso = el('div', { className: 'card kpi' },
        el('span', {}, 'Em uso'), el('b', {}, `${percentual}%`),
        el('div', { className: 'meter' }, el('i', { style: `width:${percentual}%` })),
        el('small', {}, `${emUso} de ${total} equipamentos`));

    const indicadores = el('div', { className: 'kpis' },
        indicador('Equipamentos', total, `${disponiveis} disponíveis`),
        uso,
        indicador('Atrasados', atrasados.length, atrasados.length ? 'Cobrar devolução' : 'Tudo em dia', atrasados.length ? 'bad' : ''),
        indicador('Colaboradores', dados.colaboradores.length, 'cadastrados'));

    const tabelaRecentes = tabela(['Equipamento', 'Colaborador', 'Status'],
        recentes.map((e) => linha(nomeEquipamento(e.equipamentoId), nomeColaborador(e.colaboradorId), statusEmprestimo(e))),
        'Nenhum empréstimo ainda.');

    montarTela('Visão geral', 'Como está o seu inventário hoje.', [], [
        indicadores,
        painel('Últimos empréstimos', tabelaRecentes),
    ]);
}

function telaEquipamentos() {
    montarTela('Equipamentos', 'Seu inventário organizado, do cadastro à devolução.',
        [botao('Novo equipamento', '', novoEquipamento, 'plus')], [listagem({
            nome: 'equipamentos',
            placeholder: 'Buscar equipamento ou patrimônio…',
            vazio: 'Nenhum equipamento encontrado.',
            status: [['todos', 'Todos os status'], ['disponivel', 'Disponível'], ['emprestado', 'Emprestado']],
            itens: dados.equipamentos,
            filtro: (e, status) => (status === 'disponivel' ? e.disponivel : !e.disponivel),
            texto: (e) => `${e.nome} ${e.patrimonio} ${e.tipo}`,
            colunas: ['Equipamento', 'Categoria', 'Patrimônio', 'Status', ''],
            linha: (e) => {
                const aberto = emprestimoAberto(e.id);
                const detalhe = aberto ? `Com ${nomeColaborador(aberto.colaboradorId)}` : 'Pronto para empréstimo';
                return linha(itemComIcone(icone(ICONE_DO_TIPO[e.tipo] ?? 'laptop'), e.nome, detalhe),
                    capitalizar(e.tipo), e.patrimonio, statusEquipamento(e), celulaDeAcao(botaoRemover(e)));
            },
        })]);
}

function telaEmprestimos() {
    montarTela('Empréstimos', 'Quem está com o quê, e até quando.',
        [botao('Novo empréstimo', '', novoEmprestimo, 'plus')], [listagem({
            nome: 'empréstimos',
            placeholder: 'Buscar equipamento ou colaborador…',
            vazio: 'Nenhum empréstimo encontrado.',
            status: [['todos', 'Todos os status'], ['andamento', 'Em andamento'], ['atrasado', 'Atrasado'], ['devolvido', 'Devolvido']],
            itens: [...dados.emprestimos].sort((a, b) => b.id - a.id),
            filtro: (e, status) => {
                if (status === 'devolvido') return e.dataDevolucao;
                if (status === 'atrasado') return e.atrasado;
                return !e.dataDevolucao && !e.atrasado;
            },
            texto: (e) => `${nomeEquipamento(e.equipamentoId)} ${nomeColaborador(e.colaboradorId)}`,
            colunas: ['Equipamento', 'Colaborador', 'Saída', 'Previsto', 'Status', ''],
            linha: (e) => linha(
                itemComIcone(icone(ICONE_DO_TIPO[tipoEquipamento(e.equipamentoId)] ?? 'laptop'), nomeEquipamento(e.equipamentoId), `Empréstimo #${e.id}`),
                nomeColaborador(e.colaboradorId), formatarData(e.dataEmprestimo), formatarData(e.dataPrevistaDevolucao),
                statusEmprestimo(e), celulaDeAcao(e.dataDevolucao ? '' : botaoDevolver(e))),
        })]);
}

function telaColaboradores() {
    montarTela('Colaboradores', 'Pessoas que podem pegar equipamentos emprestados.',
        [botao('Novo colaborador', '', novoColaborador, 'plus')], [listagem({
            nome: 'colaboradores',
            placeholder: 'Buscar por nome, e-mail ou cargo…',
            vazio: 'Nenhum colaborador encontrado.',
            itens: dados.colaboradores,
            texto: (c) => `${c.nome} ${c.email} ${c.cargo}`,
            colunas: ['Colaborador', 'Cargo', 'Empréstimos ativos'],
            linha: (c) => linha(itemComIcone(iniciais(c.nome), c.nome, c.email), c.cargo || '–',
                String(emprestimosAbertos().filter((e) => e.colaboradorId === c.id).length)),
        })]);
}

const telas = {
    'visao-geral': visaoGeral,
    equipamentos: telaEquipamentos,
    emprestimos: telaEmprestimos,
    colaboradores: telaColaboradores,
};

/* ---------- inicialização ---------- */

async function renderizar() {
    const hash = location.hash.slice(1);
    const tela = hash in telas ? hash : 'visao-geral';
    if (tela !== estado.tela) Object.assign(estado, { tela, busca: '', status: 'todos', pagina: 1 });
    document.querySelectorAll('.menu a').forEach((link) => link.classList.toggle('on', link.dataset.tela === tela));

    try {
        await carregarDados();
        $('#badge').textContent = emprestimosAbertos().length || '';
        telas[tela]();
    } catch (erro) {
        avisar(erro.message, true);
    }
}

function mostrarData() {
    const hoje = new Date();
    const mes = hoje.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    $('#data').textContent = `${hoje.getDate()} ${mes}, ${hoje.getFullYear()}`;
}

function alternarMenu(aberto) {
    document.body.classList.toggle('menu-aberto', aberto);
    $('#menu-btn').setAttribute('aria-expanded', String(aberto));
}

$('#menu-btn').onclick = () => alternarMenu(!document.body.classList.contains('menu-aberto'));
$('#scrim').onclick = () => alternarMenu(false);
$('#modal-close').onclick = fecharModal;
$('#overlay').onclick = fecharModal;
addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { fecharModal(); alternarMenu(false); } });
addEventListener('hashchange', () => { fecharModal(); alternarMenu(false); renderizar(); });
mostrarData();
renderizar();