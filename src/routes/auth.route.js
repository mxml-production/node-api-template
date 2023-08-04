const router = require('express').Router();

const AuthController = require('../controllers/auth.controller.js');

const AuthMiddleware = require('../middlewares/auth.middlewares.js');

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), AuthController.logout);
router.post('/logout-all', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), AuthController.logoutAll);

router.get('/verify', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), AuthController.verify);

router.get('/sessions', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), AuthController.getSessions);
router.delete('/sessions/:id', AuthMiddleware.hasPermissions(['host', 'admin', 'user']), AuthController.deleteSession);

router.get('/test', AuthMiddleware.hasPermissions(['host', 'admin']), AuthController.test);


// router.post('/logout', authMiddleware, authController.logout);
// router.post('/logout-all', authMiddleware, authController.logoutAll);

module.exports = router;