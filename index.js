const express = require("express");
const bodyParser = require("body-parser");
const { randomizeSecretSanta } = require("./utils/sortear");
const { sendMessage } = require("./utils/mensageiro");
const exphbs = require("express-handlebars");

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

// Adicionar participante
app.post("/add-participante", (req, res) => {
  const { nome } = req.body;

  if (!nome) {
    return res.status(400).send("Nome é obrigatório!");
  }

  participantes.push({ nome });
  res.redirect("/"); // Redireciona para a página inicial
});

// Realizar sorteio
app.post("/sortear", (req, res) => {
  try {
    if (participantes.length < 2) {
      return res.status(400).send("É necessário pelo menos 2 participantes!");
    }

    // Sorteia e salva o resultado
    resultadoSorteio = randomizeSecretSanta(participantes);

    res.redirect("/links"); // Redireciona para a página de links individuais
  } catch (error) {
    res.status(500).send("Erro ao realizar o sorteio!");
  }
});

// Página para listar os links individuais
app.get('/links', (req, res) => {
    const links = resultadoSorteio.map((p) => ({
        nome: p.nome,
        link: `/participante/${encodeURIComponent(p.nome)}`,
    }));

    res.render('links', { links });
});

// Página individual para cada participante
app.get('/participante/:nome', (req, res) => {
    const { nome } = req.params;
    const participante = resultadoSorteio.find((p) => p.nome === nome);

    if (!participante) {
        return res.status(404).send('Participante não encontrado!');
    }

    res.render('resultado-individual', { nome: participante.nome, amigo: participante.amigo });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
