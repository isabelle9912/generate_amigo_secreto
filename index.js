const express = require("express");
const bodyParser = require("body-parser");
const { randomizeSecretSanta } = require("./utils/sortear");
const { sendMessage } = require("./utils/mensageiro");
const exphbs = require("express-handlebars");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração do Handlebars
app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");

// Public path
app.use(express.static("public"));

let participantes = [];
let resultadoSorteio = [];

// Página inicial
app.get("/", (req, res) => {
  res.render("home", { participantes });
});

// Adicionar participante (com senha)
app.post("/add-participante", async (req, res) => {
  const { nome, senha } = req.body;

  if (!nome || !senha) {
    return res.status(400).send("Nome e senha são obrigatórios!");
  }

  const hashedSenha = await bcrypt.hash(senha, 10); // Criptografa a senha
  participantes.push({ nome, senha: hashedSenha });
  res.redirect("/"); // Redireciona para a página inicial
});

// Realizar sorteio
app.post("/sortear", (req, res) => {
  if (participantes.length < 2) {
    return res.status(400).send("É necessário pelo menos 2 participantes!");
  }

  resultadoSorteio = randomizeSecretSanta(participantes);

  res.redirect("/login"); // Redireciona para a página de login
});

// Página de login
app.get("/login", (req, res) => {
  res.render("login");
});

// Autenticar participante
app.post("/login", async (req, res) => {
  const { nome, senha } = req.body;

  const participante = participantes.find((p) => p.nome === nome);
  if (!participante) {
    return res.status(400).send("Participante não encontrado!");
  }

  const senhaValida = await bcrypt.compare(senha, participante.senha);
  if (!senhaValida) {
    return res.status(401).send("Senha incorreta!");
  }

  const resultado = resultadoSorteio.find((p) => p.nome === nome);
  if (!resultado) {
    return res.status(404).send("Resultado não encontrado!");
  }

  res.render("resultado-individual", {
    nome: resultado.nome,
    amigo: resultado.amigo,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
