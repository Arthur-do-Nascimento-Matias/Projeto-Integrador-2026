const CHAVE = "moki:missoes-locais:v2";

export const EVENTO_MISSOES = "moki:missoes-atualizadas";

// Uma missão de cada grupo será sorteada.
const grupos = [
  [
    {
      id: "atividade-1",
      tipo: "atividades",
      titulo: "Conclua uma atividade",
      descricao: "Finalize uma atividade hoje.",
      meta: 1,
      icone: "bandeira",
    },
    {
      id: "atividade-2",
      tipo: "atividades",
      titulo: "Conclua duas atividades",
      descricao: "Finalize duas atividades diferentes hoje.",
      meta: 2,
      icone: "bandeira",
    },
    {
      id: "atividade-3",
      tipo: "atividades",
      titulo: "Conclua três atividades",
      descricao: "Finalize três atividades diferentes hoje.",
      meta: 3,
      icone: "bandeira",
    },
  ],

  [
    {
      id: "acertos-3",
      tipo: "acertos",
      titulo: "Acerte três questões",
      descricao: "Responda corretamente três questões diferentes.",
      meta: 3,
      icone: "alvo",
    },
    {
      id: "acertos-5",
      tipo: "acertos",
      titulo: "Acerte cinco questões",
      descricao: "Responda corretamente cinco questões diferentes.",
      meta: 5,
      icone: "alvo",
    },
    {
      id: "acertos-8",
      tipo: "acertos",
      titulo: "Acerte oito questões",
      descricao: "Responda corretamente oito questões diferentes.",
      meta: 8,
      icone: "alvo",
    },
  ],

  [
    {
      id: "biblioteca-1",
      tipo: "biblioteca",
      titulo: "Explore a biblioteca",
      descricao: "Visite a biblioteca hoje.",
      meta: 1,
      icone: "livro",
    },
    {
      id: "livro-1",
      tipo: "livros",
      titulo: "Conheça um livro",
      descricao: "Abra um livro da biblioteca hoje.",
      meta: 1,
      icone: "livro",
    },
  ],
];

const catalogo = grupos.flat();

const tipos = [
  "atividades",
  "acertos",
  "biblioteca",
  "livros",
];

// Mantém o progresso durante a sessão se o navegador
// bloquear o localStorage.
let memoria = null;

export function dataLocal() {
  const agora = new Date();

  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function salvar(estado) {
  memoria = estado;

  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // Continua funcionando em memória nesta sessão.
  }
}

function criarDia() {
  const selecionadas = grupos.map((grupo) => {
    const indice = Math.floor(Math.random() * grupo.length);

    return grupo[indice].id;
  });

  return {
    data: dataLocal(),
    selecionadas,

    registros: {
      atividades: [],
      acertos: [],
      biblioteca: [],
      livros: [],
    },
  };
}

function estadoValido(estado) {
  if (!estado || estado.data !== dataLocal()) {
    return false;
  }

  if (
    !Array.isArray(estado.selecionadas) ||
    estado.selecionadas.length !== grupos.length
  ) {
    return false;
  }

  const selecaoValida = grupos.every((grupo, indice) =>
    grupo.some(
      (missao) => missao.id === estado.selecionadas[indice]
    )
  );

  const registrosValidos = tipos.every((tipo) => {
    const registros = estado.registros?.[tipo];

    return (
      Array.isArray(registros) &&
      registros.every((item) => typeof item === "string")
    );
  });

  return selecaoValida && registrosValidos;
}

function carregar() {
  let estado = memoria;

  try {
    const salvo = localStorage.getItem(CHAVE);

    if (salvo) {
      estado = JSON.parse(salvo);
    }
  } catch {
    // Usa o estado em memória se o armazenamento falhar.
  }

  if (!estadoValido(estado)) {
    estado = criarDia();
    salvar(estado);
  }

  memoria = estado;

  return estado;
}

export function obterMissoes() {
  const estado = carregar();

  return estado.selecionadas.map((id) => {
    const missao = catalogo.find((item) => item.id === id);

    const quantidade = new Set(
      estado.registros[missao.tipo]
    ).size;

    const progresso = Math.min(quantidade, missao.meta);

    return {
      ...missao,
      progresso,
      concluida: progresso >= missao.meta,
    };
  });
}

function registrar(tipo, identificador) {
  if (
    !tipos.includes(tipo) ||
    identificador === undefined ||
    identificador === null ||
    identificador === ""
  ) {
    return;
  }

  const estado = carregar();
  const chave = String(identificador);

  // A mesma ação não conta novamente naquele dia.
  if (estado.registros[tipo].includes(chave)) {
    return;
  }

  estado.registros[tipo].push(chave);

  salvar(estado);

  window.dispatchEvent(new Event(EVENTO_MISSOES));
}

export function registrarAtividadeConcluida(
  idMateria,
  idAtividade
) {
  if (idMateria == null || idAtividade == null) {
    return;
  }

  registrar(
    "atividades",
    JSON.stringify([idMateria, idAtividade])
  );
}

export function registrarAcerto(idMateria, idQuestao) {
  if (idMateria == null || idQuestao == null) {
    return;
  }

  registrar(
    "acertos",
    JSON.stringify([idMateria, idQuestao])
  );
}

export function registrarVisitaBiblioteca() {
  registrar("biblioteca", "visita");
}

export function registrarLivroAberto(idLivro) {
  registrar("livros", idLivro);
}