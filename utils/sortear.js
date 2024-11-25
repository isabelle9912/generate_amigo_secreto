function randomizeSecretSanta(participantes) {
  const shuffled = [...participantes];
  let valid = false;

  while (!valid) {
    // Embaralha os participantes
    shuffled.sort(() => Math.random() - 0.5);

    valid = true; // Assume que o sorteio é válido
    for (let i = 0; i < participantes.length; i++) {
      if (participantes[i].nome === shuffled[i].nome) {
        valid = false; // Alguém tirou a si mesmo, sorteio inválido
        break;
      }
    }
  }

  // Mapeia o resultado associando cada participante ao seu amigo secreto
  const resultado = participantes.map((p, i) => ({
    ...p,
    amigo: shuffled[i].nome,
  }));

  return resultado;
}

module.exports = { randomizeSecretSanta };
