const { DataTypes } = require("sequelize");

const db = require("../db/conn");

const Sorteio = db.define(
  "Sorteio",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { timestamps: false }
);

const Participante = db.define(
  "Participante",
  {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amigo: {
      type: DataTypes.STRING, // Nome do amigo tirado no sorteio
      allowNull: true,
    },
  },
  { timestamps: false }
);

// Relação entre Sorteios e Participantes
Sorteio.hasMany(Participante, { onDelete: 'CASCADE' });
Participante.belongsTo(Sorteio);


module.exports = {Participante, Sorteio};
