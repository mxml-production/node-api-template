const router = require('express').Router();

const { EstablishmentController } = require('../controllers');

const AuthMiddleware = require('../middlewares/auth.middleware.js');
const { googleApiLimiter } = require('../middlewares/rate-limiter.middleware');

router.get('/', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.getAll);
router.get('/:id', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.getOne);
router.post('/', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.create);
router.delete('/:id', AuthMiddleware.hasPermissions(['host', 'admin']), EstablishmentController.delete);

router.post('/address-verification', [googleApiLimiter, AuthMiddleware.hasPermissions(['host', 'admin'])], EstablishmentController.adressVerification);
router.post('/geocode-verification', [googleApiLimiter, AuthMiddleware.hasPermissions(['host', 'admin'])], EstablishmentController.geocodeVerification);

module.exports = router;