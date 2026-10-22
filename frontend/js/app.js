const $ = s => document.querySelector(s),
  app = $('#app'),
  page = location.pathname.split('/').pop().replace('.html', '') || 'index';

const params = new URLSearchParams(location.search),
  id = params.get('id');

const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[c]));

const api = async (path, options = {}) => {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw Error(data.erro || 'Falha na requisição');

  return data;
};

const money = v => v
  ? Number(v).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })
  : 'A combinar';

const field = (name, label, type = 'text', required = true, placeholder = '') =>
  `<div class="field">
    <label for="${name}">${label}${required ? ' *' : ''}</label>
    <input
      id="${name}"
      name="${name}"
      type="${type}"
      placeholder="${placeholder}"
      ${required ? 'required' : ''}
    >
  </div>`;

const area = (name, label, required = true) =>
  `<div class="field">
    <label for="${name}">${label}</label>
    <textarea
      id="${name}"
      name="${name}"
      ${required ? 'required' : ''}
    ></textarea>
  </div>`;

const select = (name, label, options) =>
  `<div class="field">
    <label for="${name}">${label}</label>
    <select id="${name}" name="${name}">
      ${options.map(o =>
        `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`
      ).join('')}
    </select>
  </div>`;

const notice = (message, error = false) =>
  `<div class="notice ${error ? 'error' : ''}" role="alert">
    ${escapeHtml(message)}
  </div>`;

function bindForm(endpoint, redirect) {
  const form = $('form[data-api]');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const button = form.querySelector('button[type=submit]');
    button.disabled = true;

    const data = Object.fromEntries(new FormData(form));

    try {
      const result = await api(endpoint, {
        method: id && form.dataset.edit === 'yes' ? 'PUT' : 'POST',
        body: JSON.stringify(data)
      });

      $('#feedback').innerHTML = notice('Dados salvos com sucesso!');

      if (redirect) {
        setTimeout(() => location.href = redirect(result), 650);
      } else {
        form.reset();
      }
    } catch (err) {
      $('#feedback').innerHTML = notice(err.message, true);
    } finally {
      button.disabled = false;
    }
  });
}

const jobCard = v =>
  `<article class="job">
    <div class="job-icon">▥</div>
    <div class="job-body">
      <h3>${escapeHtml(v.titulo)}</h3>
      <p>
        ${escapeHtml(v.empresa?.nome || 'Empresa')} ·
        ${escapeHtml(v.cidade || 'Local não informado')}
      </p>
      <span class="tag">${escapeHtml(v.modalidade)}</span>
      <span class="tag">${escapeHtml(v.area || 'Tecnologia')}</span>
      <span class="tag ${v.status === 'ABERTA' ? 'status' : ''}">
        ${escapeHtml(v.status)}
      </span>
    </div>
    <a class="btn small" href="/vaga.html?id=${encodeURIComponent(v._id)}">
      Ver detalhes
    </a>
  </article>`;

const showError = e => {
  const target = $('#feedback') || $('#featured') || app;
  target.insertAdjacentHTML('beforeend', notice(e.message, true));
};

// Página inicial
async function home() {
  app.innerHTML = `
    <section class="hero">
      <div class="hero-content">
        <div class="eyebrow">✦ OPORTUNIDADES PARA VOCÊ</div>
        <h1>Encontre o seu próximo <em>emprego</em></h1>
        <p>
          Conectamos talentos a grandes empresas. Cadastre-se,
          candidate-se e faça parte do seu futuro!
        </p>

        <form id="home-search" class="searchbar">
          <input name="busca"
            placeholder="Pesquisar vagas, cargos ou empresas..."
            aria-label="Pesquisar vagas">
          <button class="primary">Buscar</button>
        </form>

        <div class="hero-actions">
          <a href="/vagas.html">Explorar vagas →</a>
          <a href="/candidato.html">Criar perfil de candidato →</a>
        </div>
      </div>

      <div class="hero-art">
        <div class="art-circle"><span>↗</span></div>
        <div class="hero-mini">
          <strong>Novas oportunidades</strong>
          <small>Encontre a vaga ideal</small>
          <strong>Empresas e talentos</strong>
          <small>Conectados em um só lugar</small>
        </div>
      </div>
    </section>

    <div class="section-head">
      <h2>Vagas em destaque</h2>
      <a href="/vagas.html">Ver todas as vagas →</a>
    </div>

    <div id="featured" class="featured-grid">
      <div class="empty">Carregando oportunidades...</div>
    </div>

    <section class="cards home-cards">
      <div class="panel">
        <div class="feature-icon">▥</div>
        <h3>Para empresas</h3>
        <p>Publique suas vagas e encontre profissionais qualificados.</p>
        <a href="/empresa.html">Cadastrar empresa →</a>
      </div>

      <div class="panel">
        <div class="feature-icon">♧</div>
        <h3>Para candidatos</h3>
        <p>Encontre novas oportunidades e impulsione sua carreira.</p>
        <a href="/candidato.html">Cadastrar candidato →</a>
      </div>

      <div class="panel">
        <div class="feature-icon">↗</div>
        <h3>É simples e rápido</h3>
        <p>Cadastre-se e comece agora a fazer parte do mercado de trabalho.</p>
        <a href="/vagas.html">Explorar vagas →</a>
      </div>
    </section>`;

  $('#home-search').onsubmit = e => {
    e.preventDefault();
    location.href = '/vagas.html?busca=' + encodeURIComponent(e.target.busca.value);
  };

  try {
    const vagas = await api('/vagas');

    $('#featured').innerHTML = vagas.slice(0, 4).map(v => `
      <article class="featured-job">
        <div class="featured-top">
          <div class="company-symbol">
            ${escapeHtml((v.empresa?.nome || 'E').charAt(0))}
          </div>
          <span class="tag">${escapeHtml(v.modalidade || 'A combinar')}</span>
        </div>

        <h3>${escapeHtml(v.titulo)}</h3>

        <p>
          ${escapeHtml(v.empresa?.nome || 'Empresa')} ·
          ${escapeHtml(v.cidade || 'Local a combinar')}
        </p>

        <p class="job-description">
          ${escapeHtml((v.descricao || 'Confira esta oportunidade.').slice(0, 100))}
        </p>

        <a class="btn" href="/vaga.html?id=${encodeURIComponent(v._id)}">
          Ver vaga →
        </a>
      </article>
    `).join('') || `
      <div class="empty">
        Nenhuma vaga publicada ainda.
        <a href="/nova-vaga.html">Publicar a primeira vaga →</a>
      </div>`;

  } catch (e) {
    $('#featured').innerHTML = notice(
      'Não foi possível carregar as vagas. Confira se o MongoDB e os quatro microserviços estão funcionando. Detalhes: ' + e.message,
      true
    );
  }
}

// Listagem de vagas
async function vagas() {
  app.innerHTML = `
    <h1>Vagas de emprego</h1>

    <div class="panel">
      <form id="filters" class="toolbar">
        <input name="busca"
          placeholder="Buscar por cargo, empresa ou cidade">

        <select name="modalidade">
          <option value="">Todas as modalidades</option>
          <option>Remoto</option>
          <option>Híbrido</option>
          <option>Presencial</option>
        </select>

        <button class="primary">Buscar</button>
      </form>

      <p class="muted" id="count"></p>
      <div id="results"></div>
    </div>

    <a class="btn" href="/nova-vaga.html">Publicar vaga</a>`;

  $('#filters').busca.value = params.get('busca') || '';

  async function load() {
    try {
      const f = $('#filters');
      const qs = new URLSearchParams(new FormData(f));
      const all = await api('/vagas?' + qs);

      $('#count').textContent = `Total de vagas: ${all.length}`;

      $('#results').innerHTML = all.map(jobCard).join('') ||
        '<div class="empty">Nenhuma vaga encontrada.</div>';

    } catch (e) {
      showError(e);
    }
  }

  $('#filters').onsubmit = e => {
    e.preventDefault();
    load();
  };

  load();
}

// Detalhes de uma vaga
async function vaga() {
  if (!id) {
    app.innerHTML = notice('Vaga não informada', true);
    return;
  }

  try {
    const v = await api('/vagas/' + id);

    app.innerHTML = `
      <p><a href="/vagas.html">← Voltar para a lista</a></p>

      <div class="panel">
        <div class="job">
          <div class="job-icon">▥</div>

          <div class="job-body">
            <h2>${escapeHtml(v.titulo)}</h2>
            <p>
              ${escapeHtml(v.empresa?.nome || 'Empresa')} ·
              ${escapeHtml(v.cidade)}
            </p>
            <span class="tag">${escapeHtml(v.modalidade)}</span>
            <span class="tag">${escapeHtml(v.status)}</span>
          </div>
        </div>

        <h3>Descrição da vaga</h3>
        <p style="white-space:pre-line">${escapeHtml(v.descricao)}</p>

        <h3>Requisitos</h3>
        <p style="white-space:pre-line">
          ${escapeHtml(v.requisitos || 'Não informados')}
        </p>

        <h3>Informações</h3>
        <p>
          Salário: ${money(v.salario)} ·
          Contrato: ${escapeHtml(v.tipoContrato || 'Não informado')}
        </p>

        ${v.empresa ? `
          <p>
            Empresa: ${escapeHtml(v.empresa.nome)} ·
            ${escapeHtml(v.empresa.email)}
          </p>
        ` : ''}

        <div class="actions">
          ${v.status === 'ABERTA' ? `
            <a class="btn" href="/candidatura.html?id=${id}">
              Candidatar-se
            </a>
          ` : ''}

          <a class="btn outline" href="/nova-vaga.html?id=${id}">
            Editar vaga
          </a>

          <button id="delete" class="outline">Excluir vaga</button>
        </div>

        <div id="feedback"></div>
      </div>`;

    $('#delete').onclick = async () => {
      if (confirm('Excluir esta vaga?')) {
        try {
          await api('/vagas/' + id, { method: 'DELETE' });
          location.href = '/vagas.html';
        } catch (e) {
          $('#feedback').innerHTML = notice(e.message, true);
        }
      }
    };

  } catch (e) {
    showError(e);
  }
}

// Cadastro e edição de empresas
async function empresa() {
  app.innerHTML = `
    <div class="panel">
      <h1>${id ? 'Editar' : 'Cadastro de'} empresa</h1>
      <p>Preencha os dados para começar a publicar vagas.</p>

      <form data-api data-edit="yes">
        <div class="form-grid">
          ${field('nome', 'Nome da empresa')}
          ${field('cnpj', 'CNPJ')}
          ${field('email', 'E-mail corporativo', 'email')}
          ${field('telefone', 'Telefone')}
          ${field('cidade', 'Cidade')}
          ${field('site', 'Site (opcional)', 'url', false)}
        </div>

        ${area('descricao', 'Descrição da empresa', false)}

        <button class="primary" type="submit">Salvar empresa</button>
      </form>

      <div id="feedback"></div>
    </div>`;

  if (id) {
    try {
      const v = await api('/empresas/' + id);

      for (const [k, val] of Object.entries(v)) {
        if ($(`[name="${k}"]`)) {
          $(`[name="${k}"]`).value = val || '';
        }
      }
    } catch (e) {
      showError(e);
    }
  }

  bindForm('/empresas' + (id ? '/' + id : ''), v => '/empresas.html');
}

// Listagem de empresas
async function empresas() {
  app.innerHTML = `
    <h1>Empresas cadastradas</h1>
    <div id="list"></div>
    <a class="btn" href="/empresa.html">Cadastrar empresa</a>`;

  try {
    $('#list').innerHTML = (await api('/empresas')).map(v => `
      <div class="job">
        <div class="job-icon">▥</div>

        <div class="job-body">
          <h3>${escapeHtml(v.nome)}</h3>
          <p>
            ${escapeHtml(v.cidade)} · ${escapeHtml(v.email)}
          </p>
        </div>

        <a class="btn small" href="/empresa.html?id=${v._id}">Editar</a>
        <button class="small outline" data-delete="${v._id}">Excluir</button>
      </div>
    `).join('') || '<p>Nenhuma empresa cadastrada.</p>';

    document.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('Excluir empresa?')) {
          try {
            await api('/empresas/' + b.dataset.delete, {
              method: 'DELETE'
            });
            location.reload();
          } catch (e) {
            showError(e);
          }
        }
      };
    });

  } catch (e) {
    showError(e);
  }
}

// Cadastro e edição de vagas
async function novaVaga() {
  let empresas = [];

  try {
    empresas = await api('/empresas');
  } catch (e) {
    showError(e);
  }

  // Exibe o nome da empresa e mantém o ID no value
  const opcoesEmpresas = `
    <div class="field">
      <label for="empresaId">Empresa</label>

      <select id="empresaId" name="empresaId" required>
        <option value="">Selecione uma empresa</option>

        ${empresas.map(e => `
          <option value="${escapeHtml(e._id)}">
            ${escapeHtml(e.nome || 'Empresa sem nome')}
          </option>
        `).join('')}
      </select>
    </div>`;

  app.innerHTML = `
    <div class="panel">
      <h1>${id ? 'Editar' : 'Cadastrar'} vaga</h1>

      <form data-api data-edit="yes">
        <div class="form-grid">
          ${field('titulo', 'Cargo')}
          ${opcoesEmpresas}
          ${field('area', 'Área de atuação')}
          ${field('cidade', 'Localização')}

          ${select('modalidade', 'Modalidade', [
            'Presencial',
            'Híbrido',
            'Remoto'
          ])}

          ${select('tipoContrato', 'Tipo de contrato', [
            'CLT',
            'PJ',
            'Estágio',
            'Temporário'
          ])}

          ${field('salario', 'Salário', 'number', false)}

          ${select('status', 'Status', [
            'ABERTA',
            'FECHADA'
          ])}
        </div>

        ${area('descricao', 'Descrição da vaga')}
        ${area('requisitos', 'Requisitos', false)}

        <button class="primary" type="submit">Salvar vaga</button>
      </form>

      <div id="feedback"></div>

      <p class="muted">
        Empresas disponíveis:
        ${
          empresas.map(e => escapeHtml(e.nome || 'Empresa sem nome')).join(', ')
          || 'Cadastre uma empresa primeiro.'
        }
      </p>
    </div>`;

  // Ao editar, carrega os dados e seleciona a empresa atual
  if (id) {
    try {
      const v = await api('/vagas/' + id);

      for (const [k, val] of Object.entries(v)) {
        const campo = $(`[name="${k}"]`);

        if (campo) {
          campo.value =
            k === 'empresaId' && val && typeof val === 'object'
              ? (val._id || '')
              : (val ?? '');
        }
      }
    } catch (e) {
      showError(e);
    }
  }

  bindForm(
    '/vagas' + (id ? '/' + id : ''),
    v => '/vaga.html?id=' + v._id
  );
}

// Cadastro e edição de candidatos
async function candidato() {
  app.innerHTML = `
    <div class="panel">
      <h1>${id ? 'Editar' : 'Cadastro de'} candidato</h1>
      <p>Preencha seus dados para se candidatar às vagas.</p>

      <form data-api data-edit="yes">
        <div class="form-grid">
          ${field('nome', 'Nome completo')}
          ${field('email', 'E-mail', 'email')}
          ${field('telefone', 'Telefone')}
          ${field('cidade', 'Cidade')}
          ${field('habilidades', 'Habilidades')}
          ${field('curriculoUrl', 'URL do currículo', 'url', false)}
        </div>

        <button class="primary" type="submit">Salvar candidato</button>
      </form>

      <div id="feedback"></div>
    </div>`;

  if (id) {
    try {
      const v = await api('/candidatos/' + id);

      for (const [k, val] of Object.entries(v)) {
        if ($(`[name="${k}"]`)) {
          $(`[name="${k}"]`).value = val || '';
        }
      }
    } catch (e) {
      showError(e);
    }
  }

  bindForm('/candidatos' + (id ? '/' + id : ''), v => '/candidatos.html');
}

// Listagem de candidatos
async function candidatos() {
  app.innerHTML = `
    <h1>Candidatos</h1>

    <div class="panel">
      <input id="search" placeholder="Buscar por nome ou e-mail">
      <div id="list"></div>
    </div>

    <a class="btn" href="/candidato.html">Cadastrar candidato</a>`;

  let all = [];

  try {
    all = await api('/candidatos');
  } catch (e) {
    showError(e);
  }

  function draw() {
    const q = $('#search').value.toLowerCase();

    $('#list').innerHTML = all
      .filter(c => (c.nome + ' ' + c.email).toLowerCase().includes(q))
      .map(c => `
        <div class="job">
          <div class="job-icon">●</div>

          <div class="job-body">
            <h3>${escapeHtml(c.nome)}</h3>
            <p>
              ${escapeHtml(c.email)} · ${escapeHtml(c.habilidades)}
            </p>
          </div>

          <a class="btn small" href="/candidato.html?id=${c._id}">
            Ver perfil
          </a>

          <button class="small outline" data-delete="${c._id}">
            Excluir
          </button>
        </div>
      `).join('') || '<div class="empty">Nenhum candidato encontrado.</div>';

    document.querySelectorAll('[data-delete]').forEach(b => {
      b.onclick = async () => {
        if (confirm('Excluir candidato?')) {
          try {
            await api('/candidatos/' + b.dataset.delete, {
              method: 'DELETE'
            });

            all = all.filter(c => c._id !== b.dataset.delete);
            draw();
          } catch (e) {
            showError(e);
          }
        }
      };
    });
  }

  $('#search').oninput = draw;
  draw();
}

// Candidatura a uma vaga
async function candidatura() {
  if (!id) {
    app.innerHTML = notice('Selecione uma vaga antes de se candidatar.', true);
    return;
  }

  try {
    const [v, cs] = await Promise.all([
      api('/vagas/' + id),
      api('/candidatos')
    ]);

    app.innerHTML = `
      <div class="panel">
        <h1>Candidatar-se à vaga</h1>

        ${jobCard(v)}

        <p>
          Selecione seu cadastro ou
          <a href="/candidato.html">cadastre-se primeiro</a>.
        </p>

        <form id="apply">
          <div class="field">
            <label>Candidato *</label>

            <select name="candidatoId" required>
              <option value="">Selecione</option>

              ${cs.map(c => `
                <option value="${c._id}">
                  ${escapeHtml(c.nome)} — ${escapeHtml(c.email)}
                </option>
              `).join('')}
            </select>
          </div>

          ${area('resumo', 'Resumo profissional', false)}

          <button class="primary" type="submit">
            Enviar candidatura
          </button>
        </form>

        <div id="feedback"></div>
      </div>`;

    $('#apply').onsubmit = async e => {
      e.preventDefault();

      try {
        await api('/candidaturas', {
          method: 'POST',
          body: JSON.stringify({
            candidatoId: e.target.candidatoId.value,
            vagaId: id,
            resumo: e.target.resumo.value
          })
        });

        $('#feedback').innerHTML = notice('Candidatura enviada com sucesso!');
        e.target.reset();

      } catch (err) {
        $('#feedback').innerHTML = notice(err.message, true);
      }
    };

  } catch (e) {
    showError(e);
  }
}

// Dashboard

async function dashboard() {
  app.innerHTML = `
    <h1>Dashboard</h1>

    <div class="cards" id="stats"></div>

    <div class="panel">
      <h2>Candidaturas recentes</h2>
      <div id="applications"></div>
    </div>`;

  try {
    const [empresas, vagas, candidatos, candidaturas] =
      await Promise.all([
        api('/empresas'),
        api('/vagas'),
        api('/candidatos'),
        api('/candidaturas')
      ]);

    // Cria mapas para converter os IDs nos respectivos nomes.
    const mapaCandidatos = new Map(
      candidatos.map(c => [String(c._id), c])
    );

    const mapaVagas = new Map(
      vagas.map(v => [String(v._id), v])
    );

    $('#stats').innerHTML = [
      ['Empresas', empresas.length],
      ['Vagas', vagas.length],
      ['Candidatos', candidatos.length],
      ['Candidaturas', candidaturas.length]
    ].map(([nome, total]) => `
      <div class="panel">
        <h3>${escapeHtml(nome)}</h3>
        <div class="stat">${total}</div>
      </div>
    `).join('');

    // Exibe primeiro as candidaturas mais recentes.
    const recentes = [...candidaturas].sort(
      (a, b) =>
        new Date(b.dataCandidatura || 0) -
        new Date(a.dataCandidatura || 0)
    );

    $('#applications').innerHTML = recentes.map(c => {
      const candidato = mapaCandidatos.get(
        String(c.candidatoId?._id || c.candidatoId || '')
      );

      const vaga = mapaVagas.get(
        String(c.vagaId?._id || c.vagaId || '')
      );

      const nomeCandidato = candidato?.nome || 'Candidato não encontrado';
      const tituloVaga = vaga?.titulo || 'Vaga não encontrada';

      // Mantém os status compatíveis com os dados do banco.
      const statusDisponiveis = [
        'Enviada',
        'Em Análise',
        'Entrevista Agendada',
        'Aprovada',
        'Rejeitada'
      ];

      const statusAtual = c.status || 'Enviada';

      if (!statusDisponiveis.includes(statusAtual)) {
        statusDisponiveis.push(statusAtual);
      }

      return `
        <div class="job">
          <div class="job-body">
            <p>
              <strong>Candidato:</strong>
              ${escapeHtml(nomeCandidato)}
            </p>

            <p>
              <strong>Vaga:</strong>
              ${escapeHtml(tituloVaga)}
            </p>

            <p>
              <strong>Data:</strong>
              ${c.dataCandidatura
                ? escapeHtml(
                    new Date(c.dataCandidatura).toLocaleDateString('pt-BR')
                  )
                : 'Não informada'}
            </p>
          </div>

          <select data-status="${escapeHtml(c._id)}"
                  aria-label="Status da candidatura">
            ${statusDisponiveis.map(status => `
              <option value="${escapeHtml(status)}"
                ${status === statusAtual ? 'selected' : ''}>
                ${escapeHtml(status)}
              </option>
            `).join('')}
          </select>
        </div>
      `;
    }).join('') || '<p>Nenhuma candidatura cadastrada.</p>';

    // Atualiza o status no backend quando o usuário altera a seleção.
    document.querySelectorAll('#applications [data-status]')
      .forEach(selectStatus => {
        selectStatus.addEventListener('change', async () => {
          const statusAnterior = selectStatus.dataset.previous
            || selectStatus.value;

          try {
            await api('/candidaturas/' + selectStatus.dataset.status, {
              method: 'PUT',
              body: JSON.stringify({
                status: selectStatus.value
              })
            });

            selectStatus.dataset.previous = selectStatus.value;
          } catch (e) {
            alert('Não foi possível atualizar o status: ' + e.message);
            selectStatus.value = statusAnterior;
          }
        });

        selectStatus.dataset.previous = selectStatus.value;
      });

  } catch (e) {
    showError(e);
  }
}


// Identifica a página e executa sua função
({
  index: home,
  vagas,
  vaga,
  empresa,
  empresas,
  'nova-vaga': novaVaga,
  candidato,
  candidatos,
  candidatura,
  dashboard
}[page] || home)();