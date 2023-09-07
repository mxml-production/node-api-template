const router = require('express').Router();

const { EstablishmentController } = require('../controllers');

const AuthMiddleware = require('../middlewares/auth.middleware.js');

router.get('/', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.getAll);
router.post('/', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.create);

module.exports = router;