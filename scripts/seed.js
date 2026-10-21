const path = require('path');
const mongoose = require('mongoose');

// Altere apenas o início do seu scripts/seed.js para incluir as coleções explícitas:
const Empresa = mongoose.model('Empresa', new mongoose.Schema({
  nome: String, cnpj: String, ramo: String
}), 'empresas');

const Candidato = mongoose.model('Candidato', new mongoose.Schema({
  nome: String, email: String, curriculo: String
}), 'candidatos');

const Vaga = mongoose.model('Vaga', new mongoose.Schema({
  titulo: String, descricao: String, empresaId: mongoose.Schema.Types.ObjectId, salario: Number
}), 'vagas');

const Candidatura = mongoose.model('Candidatura', new mongoose.Schema({
  vagaId: mongoose.Schema.Types.ObjectId, candidatoId: mongoose.Schema.Types.ObjectId, status: String, dataCandidatura: { type: Date, default: Date.now }
}), 'candidaturas');


// 2. Dados Iniciais para popular o Banco
const empresasDados = [
  { nome: "Tech Solutions", cnpj: "12.345.678/0001-99", ramo: "Tecnologia" },
  { nome: "Global RH", cnpj: "98.765.432/0001-11", ramo: "Recursos Humanos" }
];

const candidatosDados = [
  { nome: "Ana Silva", email: "ana.silva@email.com", curriculo: "Desenvolvedora Frontend React" },
  { nome: "Carlos Oliveira", email: "carlos.o@email.com", curriculo: "Desenvolvedor Backend Node.js" }
];

async function rodarSeed() {
  // ATENÇÃO: Acesse o painel do Atlas, clique em 'Connect' -> 'Drivers' e copie o link real.
  // Substitua a linha abaixo INTEIRA pelo seu link real do Atlas (não esqueça de trocar o 'xxxx' pelo código do seu cluster).
  const MONGO_URI = 'mongodb+srv://admin:admin0720@cluster0.q06nh3q.mongodb.net/';

  try {
    console.log(`Tentando conectar ao banco em: ${MONGO_URI}`);
    
    // Configuração para evitar alertas de depreciação de conexões do Mongoose
    await mongoose.connect(MONGO_URI);
    console.log('Conectado com sucesso ao MongoDB Atlas!');

    // Limpa a coleção antiga para evitar acúmulo de dados duplicados de testes anteriores
    console.log('Limpando dados antigos da coleção TRAMPOBR...');
    await Empresa.deleteMany({});
    await Candidato.deleteMany({});
    await Vaga.deleteMany({});
    await Candidatura.deleteMany({});

    // Inserindo Empresas e Candidatos
    console.log('Inserindo novas empresas e candidatos de teste...');
    const empresasCriadas = await Empresa.insertMany(empresasDados);
    const candidatosCriados = await Candidato.insertMany(candidatosDados);

    // Criando Vagas vinculadas às empresas criadas acima (usando o ID gerado pelo MongoDB)
    console.log('Inserindo vagas disponíveis...');
        // No seu scripts/seed.js, substitua o array vagasDados por este:
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

    // Criando Candidaturas vinculando os Candidatos às Vagas criadas acima
    console.log('Inserindo candidaturas de teste...');
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

    console.log('🎉 Banco de dados populado com sucesso para o TrampoBR!');
  } catch (erro) {
    console.error('❌ Erro crítico ao rodar o script de seed:', erro);
  } finally {
    // Fecha a conexão com o banco de dados de maneira limpa
    await mongoose.disconnect();
    console.log('Conexão com o MongoDB encerrada.');
  }
}

rodarSeed();
