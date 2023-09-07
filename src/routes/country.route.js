const router = require('express').Router();

const CountryController = require('../controllers/country.controller.js');

const AuthMiddleware = require('../middlewares/auth.middleware.js');

router.get('/', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), CountryController.getAll);
router.get('/:id', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), CountryController.getOne);
router.post('/', AuthMiddleware.hasPermissions(['admin']), CountryController.create);
router.put('/:id', AuthMiddleware.hasPermissions(['admin']), CountryController.update);
router.delete('/:id', AuthMiddleware.hasPermissions(['admin']), CountryController.delete);

module.exports = router;