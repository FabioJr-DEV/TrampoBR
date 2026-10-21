const mongoose = require('mongoose');

const VagaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  empresaId: { type: mongoose.Schema.Types.ObjectId, required: true },
  salario: { type: Number, required: true }
}, { collection: 'TRAMPOBR' });

module.exports = mongoose.model('Vaga', VagaSchema);
