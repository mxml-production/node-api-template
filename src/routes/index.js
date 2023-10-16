const router = require('express').Router();

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const countryRoutes = require('./country.route');
const establishmentRoutes = require('./establishment.route');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/countries', countryRoutes);
router.use('/establishments', establishmentRoutes);

module.exports = router;