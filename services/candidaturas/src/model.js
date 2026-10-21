const mongoose = require('mongoose');

const CandidaturaSchema = new mongoose.Schema({
  vagaId: { type: mongoose.Schema.Types.ObjectId, required: true },
  candidatoId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, default: 'Em Análise' },
  dataCandidatura: { type: Date, default: Date.now }
}, { collection: 'TRAMPOBR' });

module.exports = mongoose.model('Candidatura', CandidaturaSchema);
