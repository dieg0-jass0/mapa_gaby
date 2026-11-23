// CONTROLADOR: recibe la petición, consulta los modelos y responde con vista o JSON.
const Estado = require('../models/estado.model');
const Universidad = require('../models/universidad.model');

exports.index = (req, res) => {
  res.render('mapa', { titulo: 'Mapa interactivo de México' });
};

exports.estados = (req, res) => res.json(Estado.conIndicadores());
exports.indicadores = (req, res) => res.json(Estado.catalogo());
exports.universidades = (req, res) => {
  const { estado } = req.query; // filtro opcional: /api/universidades?estado=MX-SLP
  res.json(estado ? Universidad.porEstado(estado) : Universidad.todas());
};
