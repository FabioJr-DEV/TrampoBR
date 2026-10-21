# Arquitetura e histórias de usuário

- Empresa: cadastrar dados, editar informações, consultar lista, publicar e atualizar vagas.
- Candidato: cadastrar perfil, pesquisar vagas, visualizar detalhes, candidatar-se.
- Gestor: consultar candidaturas e atualizar status no dashboard.

Serviços separados por contexto: empresas, vagas, candidatos e candidaturas. Gateway expõe `/api/*` e frontend estático. Cada serviço persiste em sua coleção MongoDB. Vagas consultam empresas via REST; candidaturas validam candidato e vaga via REST.

Limitações para evolução: autenticação, autorização por proprietário, paginação, transações/eventos para exclusões em cascata, rate limiting e validações mais fortes para produção.
