const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Model = require('./src/model');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const base = '/empresas';

// URL direta apontando para o banco 'test' do seu MongoDB Atlas onde estão os dados
const MONGO_URI_ATLAS = 'mongodb+srv://admin:admin0720@cluster0.q06nh3q.mongodb.net/test?retryWrites=true&w=majority';

const validId = id => mongoose.isValidObjectId(id);
const fail = (res, e) => res.status(e.name === 'ValidationError' || e.code === 11000 || e.name === 'CastError' ? 400 : 500).json({ erro: e.code === 11000 ? 'Registro duplicado' : e.message });

app.get('/health', (req, res) => res.json({ servico: 'empresas', status: 'ok' }));

app.get(base, async (req, res) => {
  try {
    let q = {};
    if (req.query.busca) {
      const re = new RegExp(String(req.query.busca).replace(/[^a-zA-Z0-9À-ÿ ]/g, ''), 'i');
      q.$or = ["nome", "cnpj", "ramo", "cidade"].map(k => ({ [k]: re }));
    }
    
    let rows = await Model.find(q).sort({ createdAt: -1 }).lean();
    res.json(rows);
  } catch (e) {
    fail(res, e);
  }
});

app.get(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    let row = await Model.findById(req.params.id);
    if (!row) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    fail(res, e);
  }
});

app.post(base, async (req, res) => {
  try {
    const row = await Model.create(req.body);
    res.status(201).json(row);
  } catch (e) {
    fail(res, e);
  }
});

app.put(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const row = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!row) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(row);
  } catch (e) {
    fail(res, e);
  }
});

app.delete(base + '/:id', async (req, res) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ erro: 'ID inválido' });
    const row = await Model.findByIdAndDelete(req.params.id);
    if (!row) return res.status(404).json({ erro: 'Não encontrado' });
    res.status(204).end();
  } catch (e) {
    fail(res, e);
  }
});

async function start() {
  await mongoose.connect(MONGO_URI_ATLAS);
  console.log('Microsserviço de Empresas conectado com sucesso ao MongoDB Atlas!');
  
  return app.listen(process.env.EMPRESAS_PORT || 3101, () => 
    console.log('Empresas rodando na porta 3101')
  );
}

if (require.main === module) {
  start().catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { app, start };
