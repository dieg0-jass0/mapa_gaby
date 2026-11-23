// MODELO: carga el GeoJSON y la tabla de indicadores y los une por clave de entidad (id).
const fs = require('fs');
const path = require('path');

const leer = f => JSON.parse(fs.readFileSync(path.join(__dirname, '../data', f), 'utf8'));
const geo = leer('mexico.geojson');
const indicadores = leer('indicadores.json');

// Catálogo de indicadores disponibles (alimenta el selector de la vista)
const CATALOGO = [
  { key: 'pob2020', label: 'Población 2020', formato: 'entero' },
  { key: 'pob2010', label: 'Población 2010', formato: 'entero' },
  { key: 'crec',    label: 'Crecimiento 2010–2020 (%)', formato: 'porcentaje' },
  { key: 'esc2020', label: 'Escolaridad promedio 2020 (años)', formato: 'decimal' }
];

const Estado = {
  catalogo: () => CATALOGO,

  // Devuelve el GeoJSON con los indicadores unidos a properties
  conIndicadores() {
    return {
      type: 'FeatureCollection',
      features: geo.features.map(f => {
        const d = indicadores[f.properties.id] || {};
        const crec = d.pob2010 ? (d.pob2020 / d.pob2010 - 1) * 100 : null;
        return { ...f, properties: { ...f.properties, ...d, crec } };
      })
    };
  }
};

module.exports = Estado;
