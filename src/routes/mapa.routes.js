const { Router } = require('express');
const c = require('../controllers/mapa.controller');

const router = Router();
router.get('/', c.index);
router.get('/api/estados', c.estados);
router.get('/api/indicadores', c.indicadores);
router.get('/api/universidades', c.universidades);

module.exports = router;
