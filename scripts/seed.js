const path = require('path');
const mongoose = require('mongoose');


// 1. Definição dos Schemas com as coleções no plural minúsculo compatível com os serviços
const Empresa = mongoose.model('Empresa', new mongoose.Schema({
  nome: String,
  cnpj: String,
  ramo: String
}), 'empresas');

const Candidato = mongoose.model('Candidato', new mongoose.Schema({
  nome: String,
  email: String,
  curriculo: String
}), 'candidatos');

const Vaga = mongoose.model('Vaga', new mongoose.Schema({
  titulo: String,
  descricao: String,
  empresaId: mongoose.Schema.Types.ObjectId,
  salario: Number,
  modalidade: String,
  area: String,
  status: String,
  cidade: String
}), 'vagas');

const Candidatura = mongoose.model('Candidatura', new mongoose.Schema({
  vagaId: mongoose.Schema.Types.ObjectId,
  candidatoId: mongoose.Schema.Types.ObjectId,
  status: String,
  dataCandidatura: { type: Date, default: Date.now }
}), 'candidaturas');

// 2. Dados Iniciais
const empresasDados = [
  { nome: "Tech Solutions", cnpj: "12.345.678/0001-99", ramo: "Tecnologia" },
  { nome: "Global RH", cnpj: "98.765.432/0001-11", ramo: "Recursos Humanos" }
];

const candidatosDados = [
  { nome: "Ana Silva", email: "ana.silva@email.com", curriculo: "Desenvolvedora Frontend React" },
  { nome: "Carlos Oliveira", email: "carlos.o@email.com", curriculo: "Desenvolvedor Backend Node.js" }
];

async function rodarSeed() {
  const MONGO_URI = 'mongodb+srv://admin:admin0720@cluster0.q06nh3q.mongodb.net/test?retryWrites=true&w=majority';

  try {
    console.log(`Tentando conectar ao banco em: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('Conectado com sucesso ao MongoDB Atlas!');

    // Limpa todas as coleções antigas para evitar lixo eletrônico
    console.log('Limpando coleções antigas...');
    await Empresa.deleteMany({});
    await Candidato.deleteMany({});
    await Vaga.deleteMany({});
    await Candidatura.deleteMany({});

    // Inserindo dados novos e guardando o retorno
    console.log('Inserindo novas empresas e candidatos de teste...');
    const empresasCriadas = await Empresa.insertMany(empresasDados);
    const candidatosCriados = await Candidato.insertMany(candidatosDados);

    // Ajustado o índice do array [0] para ler o ID real gerado na nuvem
    console.log('Inserindo vagas com relacionamentos corretos...');
    const vagasDados = [
      { 
        titulo: "Desenvolvedor(a) Fullstack Junior", 
        descricao: "Vaga para atuar com Node.js e React", 
        empresaId: empresasCriadas[0]._id, 
        salario: 4500,
        modalidade: "Remoto",
        area: "Tecnologia",
        status: "ABERTA",
        cidade: "São Paulo"
      },
      { 
        titulo: "Gerente de Projetos", 
        descricao: "Coordenação de times ágeis de desenvolvimento", 
        empresaId: empresasCriadas[1]._id, 
        salario: 8000,
        modalidade: "Híbrido",
        area: "Tecnologia",
        status: "ABERTA",
        cidade: "Porto Alegre"
      }
    ];
    const vagasCriadas = await Vaga.insertMany(vagasDados);

    // Amarrando candidaturas usando chaves válidas de 24 caracteres do Atlas
    console.log('Inserindo candidaturas vinculadas...');
    const candidaturasDados = [
      { 
        vagaId: vagasCriadas[0]._id, 
        candidatoId: candidatosCriados[0]._id, 
        status: "Em Análise" 
      },
      { 
        vagaId: vagasCriadas[1]._id, 
        candidatoId: candidatosCriados[1]._id, 
        status: "Entrevista Agendada" 
      }
    ];
    await Candidatura.insertMany(candidaturasDados);

    console.log('🎉 Banco de dados povoado de forma perfeita nas novas coleções!');
  } catch (erro) {
    console.error('❌ Erro crítico ao rodar o script de seed:', erro);
  } finally {
    await mongoose.disconnect();
    console.log('Conexão com o MongoDB encerrada.');
  }
}

rodarSeed();
