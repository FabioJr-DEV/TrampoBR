const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json()); // Permite ler o corpo das requisições POST/PUT

const PORT = process.env.GATEWAY_PORT || 3000;

// Mapeamento direto das URLs locais dos microsserviços
const SERVICOS = {
  empresas: `http://127.0.0.1:${process.env.EMPRESAS_PORT || 3101}`,
  vagas: `http://127.0.0.1:${process.env.VAGAS_PORT || 3102}`,
  candidatos: `http://127.0.0.1:${process.env.CANDIDATOS_PORT || 3103}`,
  candidaturas: `http://127.0.0.1:${process.env.CANDIDATURAS_PORT || 3104}`
};

// FUNÇÃO DIRETORA: Captura qualquer requisição vinda do app.js e repassa ao microsserviço correto
const redirecionar = (servicoKey) => async (req, res) => {
  const urlDestino = `${SERVICOS[servicoKey]}${req.originalUrl.replace('/api', '')}`;
  try {
    const resposta = await axios({
      method: req.method,
      url: urlDestino,
      data: req.body,
      params: req.query,
      headers: { 'Content-Type': 'application/json' }
    });
    return res.status(resposta.status).json(resposta.data);
  } catch (erro) {
    if (erro.response) {
      return res.status(erro.response.status).json(erro.response.data);
    }
    return res.status(500).json({ erro: `O microsserviço de ${servicoKey} está fora do ar.` });
  }
};

// Cria as rotas explicitamente para o app.js encontrar sem erro 404
app.all('/api/empresas*', redirecionar('empresas'));
app.all('/api/vagas*', redirecionar('vagas'));
app.all('/api/candidatos*', redirecionar('candidatos'));
app.all('/api/candidaturas*', redirecionar('candidaturas'));
app.all('/api/candidaturass*', redirecionar('candidaturas'));

// SERVIR OS ARQUIVOS VISUAIS DO FRONTEND
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 GATEWAY REESTRUTURADO E PRONTO!`);
  console.log(`👉 Acesse no Navegador: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
