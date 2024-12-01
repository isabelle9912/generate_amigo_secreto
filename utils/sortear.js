function randomizeSecretSanta(participantes) {
  let shuffled;
  let hasSelfAssignment;

  do {
    shuffled = [...participantes].sort(() => Math.random() - 0.5);
    hasSelfAssignment = participantes.some(
      (participante, index) => participante.nome === shuffled[index].nome
    );
  } while (hasSelfAssignment);

  const resultados = participantes.map((participante, index) => ({
    nome: participante.nome,
    amigo: shuffled[index].nome,
  }));

  return resultados;
}

module.exports = { randomizeSecretSanta };
