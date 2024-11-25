const express = require("express");
const bodyParser = require("body-parser");
const { randomizeSecretSanta } = require("./utils/sortear"); // Função para sortear
const { sendMessage } = require("./utils/mensageiro"); // Função para enviar mensagem

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

let participantes = [];

// Rota para adicionar participantes
app.post("/add-participante", (req, res) => {
  const { nome, telefone } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ error: "Nome e telefone são obrigatórios!" });
  }

  participantes.push({ nome, telefone });
  res.status(201).json({ message: "Participante adicionado com sucesso!" });
});

// Rota para realizar o sorteio
app.post("/sortear", async (req, res) => {
  if (participantes.length < 2) {
    return res
      .status(400)
      .json({ error: "É necessário pelo menos 2 participantes!" });
  }

  try {
    const resultado = randomizeSecretSanta(participantes);

    // Enviar mensagens via WhatsApp
    for (const { nome, telefone, amigo } of resultado) {
      await sendMessage(telefone, `Olá ${nome}, seu amigo secreto é ${amigo}!`);
    }

    res
      .status(200)
      .json({ message: "Sorteio realizado com sucesso e mensagens enviadas!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao realizar o sorteio!" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
