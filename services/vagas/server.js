const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Model = require('./src/model');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const base = '/vagas';

// Conexão com o MongoDB Atlas
const MONGO_URI_ATLAS =
  'mongodb+srv://admin:admin0720@cluster0.q06nh3q.mongodb.net/test?retryWrites=true&w=majority';

// Verifica se o ID é válido
const validId = (id) => mongoose.isValidObjectId(id);

// Tratamento de erros
const fail = (res, e) =>
  res
    .status(
      e.name === 'ValidationError' ||
      e.code === 11000 ||
      e.name === 'CastError'
        ? 400
        : 500
    )
    .json({
      erro:
        e.code === 11000
          ? 'Registro duplicado'
          : e.message
    });

// Normaliza os parâmetros recebidos pela URL.
// Evita erros quando o parâmetro é um array ou outro tipo.
const normalizarTexto = (valor) => {
  if (typeof valor === 'string') {
    return valor.trim();
  }

  if (Array.isArray(valor)) {
    const primeiro = valor.find(
      (item) => typeof item === 'string'
    );

    return primeiro ? primeiro.trim() : '';
  }

  return '';
};

// Verifica se o microsserviço está funcionando
app.get('/health', (req, res) => {
  res.json({
    servico: 'vagas',
    status: 'ok'
  });
});

// Listar vagas com filtros opcionais
app.get(base, async (req, res) => {
  try {
    let q = {};

    // Normaliza os parâmetros recebidos do front-end
    const busca = normalizarTexto(req.query.busca);
    const modalidade = normalizarTexto(req.query.modalidade);
    const status = normalizarTexto(req.query.status);

    // Filtro de busca por título ou descrição
    if (busca !== '') {
      const textoSeguro = busca.replace(
        /[^a-zA-Z0-9À-ÿ ]/g,
        ''
      );

      if (textoSeguro !== '') {
        const re = new RegExp(textoSeguro, 'i');

        q.$or = [
          { titulo: re },
          { descricao: re }
        ];
      }
    }

    // Filtro por modalidade
    if (modalidade !== '') {
      q.modalidade = modalidade;
    }

    // Filtro por status
    if (status !== '') {
      q.status = status;
    }

    // Busca as vagas mais recentes primeiro
    const rows = await Model.find(q)
      .sort({ createdAt: -1 })
      .lean();

    res.json(rows);
  } catch (e) {
    console.error('Erro ao listar vagas:', e);
    fail(res, e);
  }
});

// Buscar uma vaga pelo ID
app.get(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const row = await Model.findById(req.params.id);

    if (!row) {
      return res.status(404).json({
        erro: 'Não encontrado'
      });
    }

    res.json(row);
  } catch (e) {
    fail(res, e);
  }
});

// Cadastrar uma vaga
app.post(base, async (req, res) => {
  try {
    const row = await Model.create(req.body);

    res.status(201).json(row);
  } catch (e) {
    fail(res, e);
  }
});

// Atualizar uma vaga
app.put(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const row = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!row) {
      return res.status(404).json({
        erro: 'Não encontrado'
      });
    }

    res.json(row);
  } catch (e) {
    fail(res, e);
  }
});

// Excluir uma vaga
app.delete(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) {
      return res.status(400).json({
        erro: 'ID inválido'
      });
    }

    const row = await Model.findByIdAndDelete(req.params.id);

    if (!row) {
      return res.status(404).json({
        erro: 'Não encontrado'
      });
    }

    res.status(204).end();
  } catch (e) {
    fail(res, e);
  }
});

// Iniciar o microsserviço
async function start() {
  await mongoose.connect(MONGO_URI_ATLAS);

  console.log(
    'Microsserviço de Vagas conectado com sucesso ao MongoDB Atlas!'
  );

  return app.listen(
    process.env.VAGAS_PORT || 3102,
    () => {
      console.log(
        `Vagas rodando na porta ${process.env.VAGAS_PORT || 3102}`
      );
    }
  );
}

if (require.main === module) {
  start().catch((e) => {
    console.error('Erro ao iniciar o microsserviço:', e);
    process.exit(1);
  });
}

module.exports = { app, start };