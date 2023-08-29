const router = require('express').Router();

const UserController = require('../controllers/user.controller.js');

const AuthMiddleware = require('../middlewares/auth.middlewares.js');

router.get('/', AuthMiddleware.hasPermissions(['admin']), UserController.getAll);
router.get('/:id', AuthMiddleware.hasPermissions(['admin']), UserController.getOne);
router.post('/', AuthMiddleware.hasPermissions(['admin']), UserController.create);
router.put('/:id', AuthMiddleware.hasPermissions(['admin']), UserController.update);
router.delete('/:id', AuthMiddleware.hasPermissions(['admin']), UserController.delete);

module.exports = router;