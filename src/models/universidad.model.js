// MODELO: capa de puntos (universidades)
const fs = require('fs');
const path = require('path');
const universidades = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/universidades.json'), 'utf8'));

module.exports = {
  todas: () => universidades,
  porEstado: id => universidades.filter(u => u.estado === id)
};
