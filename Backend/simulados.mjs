
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql";

const raiz = path.dirname(fileURLToPath(import.meta.url));

const materia = "historia";
const idMateria = 3;

const conexao = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "bancointegrador_novo",
  connectTimeout: 10000
});

function consultar(sql, valores = []) {
  return new Promise((resolve, reject) => {
    conexao.query(
      { sql, values: valores, timeout: 30000 },
      (erro, resultado) => {
        if (erro) reject(erro);
        else resolve(resultado);
      }
    );
  });
}

async function importar() {
  let importados = 0;
  let existentes = 0;
  let falhas = 0;

  for (const ano of [6, 7, 8]) {
    const pasta = path.join(
      raiz, "simulados", materia, `${ano}ano`
    );

    let arquivos;

    try {
      arquivos = (await fs.readdir(pasta))
        .filter(arquivo => path.extname(arquivo).toLowerCase() === ".pdf")
        .sort((a, b) => a.localeCompare(b, "pt-BR"));
    } catch (erro) {
      if (erro.code === "ENOENT") {
        console.log(`Pasta não encontrada: ${pasta}`);
        continue;
      }
      throw erro;
    }

    const existentesNoBanco = await consultar(
      `SELECT id_simulado
       FROM simulados
       WHERE id_materia = ?
         AND ano_escolar = ?
         AND pdf_simulado IS NOT NULL`,
      [idMateria, ano]
    );

    if (existentesNoBanco.length > 0) {
      console.log(
        `Geografia ${ano}º ano já possui ${existentesNoBanco.length} PDF(s). Pulando para evitar duplicatas.`
      );
      existentes += arquivos.length;
      continue;
    }

    for (let i = 0; i < arquivos.length; i++) {
      const arquivo = arquivos[i];

      const titulo = `Geografia - ${ano}º ano - Simulado ${i + 1}`;

      try {
        const pdf = await fs.readFile(path.join(pasta, arquivo));

        console.log(`Importando: ${materia}/${ano}ano/${arquivo}`);

        await consultar(
          `INSERT INTO simulados
           (id_materia, titulo, pdf_simulado, ano_escolar)
           VALUES (?, ?, ?, ?)`,
          [idMateria, titulo, pdf, ano]
        );

        console.log(`OK: ${titulo}`);
        importados++;
      } catch (erro) {
        console.error(`FALHOU: ${arquivo}`);
        console.error(erro.message);
        falhas++;

        if (
          erro.fatal ||
          erro.code === "PROTOCOL_SEQUENCE_TIMEOUT" ||
          erro.code === "PROTOCOL_CONNECTION_LOST"
        ) {
          throw erro;
        }
      }
    }
  }

  console.log("\nRESUMO");
  console.log(`Importados: ${importados}`);
  console.log(`Já existentes/ignorados: ${existentes}`);
  console.log(`Falhas: ${falhas}`);
}

try {
  await importar();
} catch (erro) {
  console.error("Importação interrompida:", erro.message);
  process.exitCode = 1;
} finally {
  conexao.end();
}
