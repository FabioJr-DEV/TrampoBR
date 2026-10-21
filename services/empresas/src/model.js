const mongoose = require('mongoose');

const EmpresaSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  cnpj: { type: String, required: true, unique: true },
  email: { type: String },
  telefone: { type: String },
  cidade: { type: String },
  site: { type: String },
  descricao: { type: String },
  ramo: { type: String, required: false }
}, { collection: 'empresas' }); // Força o plural minúsculo

module.exports = mongoose.model('Empresa', EmpresaSchema);
