const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const bcrypt = require("bcrypt");
const { Sorteio, Participante } = require("./models/Models");
const { randomizeSecretSanta } = require("./utils/sortear");

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Static Files
app.use(express.static("public"));

// Página inicial
app.get("/", (req, res) => {
  res.render("home");
});

// Página de criação de sorteio
app.get("/criar-sorteio", (req, res) => {
  res.render("criar-sorteio");
});

// Criar novo sorteio
app.post("/criar-sorteio", async (req, res) => {
  const { nome, descricao } = req.body;

  try {
    const sorteio = await Sorteio.create({ nome, descricao });
    res.redirect(`/sorteio/${sorteio.id}`);
  } catch (error) {
    console.error("Erro ao criar sorteio:", error);
    res.status(500).send("Erro ao criar sorteio!");
  }
});

// Gerenciar sorteio
app.get("/sorteio/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const sorteio = await Sorteio.findByPk(id, { include: Participante });
    if (!sorteio) {
      return res.status(404).send("Sorteio não encontrado!");
    }

    // Extrair os dados dos participantes
    const participantes = sorteio.Participantes.map((participante) => ({
      id: participante.id,
      nome: participante.nome,
      amigo: participante.amigo || "Não sorteado",
    }));

    res.render("gerenciar-sorteio", {
      id: sorteio.id,
      nome: sorteio.nome,
      descricao: sorteio.descricao,
      participantes,
    });
  } catch (error) {
    console.error("Erro ao carregar sorteio:", error);
    res.status(500).send("Erro ao carregar sorteio!");
  }
});

// Adicionar participante ao sorteio
app.post("/sorteio/:id/add-participante", async (req, res) => {
  const { id } = req.params;
  const { nome, senha } = req.body;

  try {
    const sorteio = await Sorteio.findByPk(id);
    if (!sorteio) {
      return res.status(404).send("Sorteio não encontrado!");
    }

    const hashedSenha = await bcrypt.hash(senha, 10);
    await Participante.create({ nome, senha: hashedSenha, SorteioId: id });

    res.redirect(`/sorteio/${id}`);
  } catch (error) {
    console.error("Erro ao adicionar participante:", error);
    res.status(500).send("Erro ao adicionar participante!");
  }
});

// Realizar sorteio
app.post("/sorteio/:id/sortear", async (req, res) => {
  const { id } = req.params;

  try {
    const sorteio = await Sorteio.findByPk(id, { include: Participante });

    if (!sorteio) {
      return res.status(404).send("Sorteio não encontrado!");
    }

    const participantes = sorteio.Participantes;
    if (participantes.length < 2) {
      return res
        .status(400)
        .send(
          "É necessário pelo menos 2 participantes para realizar o sorteio!"
        );
    }

    const resultados = randomizeSecretSanta(participantes);

    await Promise.all(
      resultados.map(async (item) => {
        await Participante.update(
          { amigo: item.amigo },
          { where: { nome: item.nome, SorteioId: id } }
        );
      })
    );

    res.redirect(`/sorteio/${id}`);
  } catch (error) {
    console.error("Erro ao realizar sorteio:", error);
    res.status(500).send("Erro ao realizar sorteio!");
  }
});

// Listar sorteios
app.get("/sorteios", async (req, res) => {
  try {
    const sorteios = await Sorteio.findAll();

    const data = sorteios.map((s) => ({
      id: s.dataValues.id,
      nome: s.dataValues.nome,
      descricao: s.dataValues.descricao,
    }));
    res.render("listar-sorteios", { sorteios: data });
  } catch (error) {
    console.error("Erro ao carregar sorteios:", error);
    res.status(500).send("Erro ao carregar sorteios!");
  }
});

// Login do participante para ver o resultado
app.post("/sorteio/:id/login", async (req, res) => {
  const { id } = req.params;
  const { nome, senha } = req.body;
  console.log("a" + nome + "a");

  try {
    const participante = await Participante.findOne({
      where: { nome, SorteioId: id },
    });

    if (!participante) {
      return res.status(404).send("Participante não encontrado neste sorteio!");
    }

    const senhaValida = await bcrypt.compare(senha, participante.senha);
    if (!senhaValida) {
      return res.status(401).send("Senha incorreta!");
    }

    if (!participante.amigo) {
      return res.status(400).send("O sorteio ainda não foi realizado!");
    }

    res.render("resultado-individual", {
      nome: participante.nome,
      amigo: participante.amigo,
    });
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).send("Erro no login!");
  }
});

// Página de login do participante
app.get("/sorteio/:id/login-participante", (req, res) => {
  const { id } = req.params;
  res.render("login-participante", { id });
});

// Uma coisa bonita
app.get("/bonita", (req, res) => {
  res.render("uma-coisa-bonita");
});

// Conexão ao banco e inicialização do servidor
const conn = require("./db/conn");
app.listen(port, async () => {
  try {
    await conn.sync(); // Use { force: true } para recriar tabelas durante o desenvolvimento
    console.log(`Servidor rodando em http://localhost:${port}`);
  } catch (error) {
    console.error("Erro ao conectar ao banco de dados:", error);
  }
});
