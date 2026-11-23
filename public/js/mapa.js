// Cliente: consume la API del controlador y dibuja el mapa.
const COLORES = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];
const FORMATOS = {
  entero: v => Math.round(v).toLocaleString('es-MX'),
  decimal: v => v.toFixed(1),
  porcentaje: v => v.toFixed(1) + ' %'
};
let catalogo = [], actual, cortes = [], geoLayer, seleccion = null, estados, unis = [];

const map = L.map('map').setView([23.9, -102.5], 5);
const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 18 }).addTo(map);
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 });
L.control.layers({ 'CARTO claro': carto, 'OpenStreetMap': osm }).addTo(map);
L.control.scale({ imperial: false }).addTo(map);

const fmt = v => FORMATOS[actual.formato](v);
const valores = () => estados.features.map(f => f.properties[actual.key]);

function calcularCortes() {
  const v = valores().sort((a, b) => a - b);
  cortes = [1, 2, 3, 4].map(i => v[Math.floor(i * v.length / 5)]);
}
function color(v) { let i = 0; while (i < cortes.length && v >= cortes[i]) i++; return COLORES[i]; }
const estilo = f => ({ fillColor: color(f.properties[actual.key]), weight: 1, color: '#fff', fillOpacity: 0.85 });

const detalle = document.getElementById('detail');
function mostrarDetalle(f) {
  const filas = catalogo.map(ind => {
    const todos = estados.features.map(x => x.properties[ind.key]).sort((a, b) => b - a);
    const v = f.properties[ind.key];
    return `<tr><td>${ind.label}<br><small>lugar ${todos.indexOf(v) + 1} de 32</small></td><td>${FORMATOS[ind.formato](v)}</td></tr>`;
  }).join('');
  const lista = unis.filter(u => u.estado === f.properties.id).map(u => `<li>${u.nombre}</li>`).join('');
  detalle.innerHTML = `<h2>${f.properties.name}</h2><table>${filas}</table>
    <p><strong>Universidades en el mapa:</strong></p><ul>${lista || '<li>Sin registros</li>'}</ul>`;
}

function porCadaEstado(f, layer) {
  layer.on({
    mouseover: e => { e.target.setStyle({ weight: 2.5, color: '#333' }); e.target.bringToFront(); },
    mouseout: e => { if (e.target !== seleccion) geoLayer.resetStyle(e.target); },
    click: e => {
      if (seleccion) geoLayer.resetStyle(seleccion);
      seleccion = e.target; seleccion.setStyle({ weight: 3, color: '#000' });
      mostrarDetalle(f);
      map.fitBounds(e.target.getBounds(), { maxZoom: 7, padding: [20, 20] });
    }
  });
  layer.bindTooltip(() => `<strong>${f.properties.name}</strong><br>${actual.label}: ${fmt(f.properties[actual.key])}`, { sticky: true });
}

const leyenda = L.control({ position: 'bottomright' });
leyenda.onAdd = () => (leyenda._div = L.DomUtil.create('div', 'legend'));
function actualizarLeyenda() {
  const lim = [null, ...cortes, null];
  leyenda._div.innerHTML = `<strong>${actual.label}</strong><br>` + COLORES.map((c, i) => {
    const lo = lim[i], hi = lim[i + 1];
    const t = lo == null ? `< ${fmt(hi)}` : hi == null ? `≥ ${fmt(lo)}` : `${fmt(lo)} – ${fmt(hi)}`;
    return `<i style="background:${c}"></i>${t}`;
  }).join('<br>');
}

function redibujar() {
  calcularCortes();
  geoLayer.setStyle(estilo);
  if (seleccion) seleccion.setStyle({ weight: 3, color: '#000' });
  actualizarLeyenda();
}

async function iniciar() {
  const [cat, geo, uni] = await Promise.all([
    fetch('/api/indicadores').then(r => r.json()),
    fetch('/api/estados').then(r => r.json()),
    fetch('/api/universidades').then(r => r.json())
  ]);
  catalogo = cat; estados = geo; unis = uni; actual = catalogo[0];

  const sel = document.getElementById('sel');
  catalogo.forEach(i => sel.add(new Option(i.label, i.key)));
  sel.onchange = () => { actual = catalogo.find(i => i.key === sel.value); redibujar(); };

  calcularCortes();
  geoLayer = L.geoJSON(estados, { style: estilo, onEachFeature: porCadaEstado }).addTo(map);
  geoLayer.bringToBack();
  leyenda.addTo(map); actualizarLeyenda();

  const cluster = L.markerClusterGroup({ showCoverageOnHover: false });
  unis.forEach(u => cluster.addLayer(L.marker([u.lat, u.lng]).bindPopup(`<strong>${u.nombre}</strong>`)));
  map.addLayer(cluster);
  document.getElementById('chkUni').onchange = e => e.target.checked ? map.addLayer(cluster) : map.removeLayer(cluster);
}
iniciar().catch(err => { document.getElementById('detail').textContent = 'Error: ' + err; });
