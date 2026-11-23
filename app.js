const express = require('express');
const path = require('path');
const { engine } = require('express-handlebars');
const mapaRoutes = require('./src/routes/mapa.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Motor de vistas (V)
app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, 'src/views/layouts')
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', mapaRoutes);

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
