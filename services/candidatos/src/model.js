const mongoose = require('mongoose');

const CandidatoSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  telefone: { type: String },
  cidade: { type: String },
  habilidades: { type: String },
  curriculo: { type: String, required: false },
  urlCurriculo: { type: String }
}); // <-- REMOVA o ', { collection: 'TRAMPOBR' }' daqui

module.exports = mongoose.model('Candidato', CandidatoSchema);
