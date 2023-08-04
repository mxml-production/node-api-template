const { Token, User } = require('../models');

const TokenManager = require('../utils/TokenManager');
const { errorResponse } = require('../utils/Response');

class AuthMiddleware {
    static hasPermissions(requiredPermissions) {
        return async (req, res, next) => {
            try {
                const token = TokenManager.getHeaderToken(req);
                if (!token) return res.status(401).json(errorResponse('Unauthorized', 'UNAUTHORIZED'));

                const decoded = await TokenManager.verifyToken(token);
                if (decoded.error) return res.status(401).json(errorResponse('Unauthorized', 'TOKEN_NOT_VALID'));

                const user = await User.findById(decoded.id).populate('role');
                if (!user) return res.status(401).json(errorResponse('Unauthorized', 'TOKEN_NOT_VALID'));

                if (!user.enabled) return res.status(401).json(errorResponse('Unauthorized', 'FORBIDDEN'));
                if (!requiredPermissions.includes(user.role.name)) return res.status(403).json(errorResponse('Forbidden', 'FORBIDDEN'));

                const saveToken = await Token.findOne({ token, user: user._id });
                if (!saveToken) return res.status(401).json(errorResponse('Unauthorized', 'TOKEN_NOT_VALID'));
                if (saveToken.expires < Date.now()) return res.status(401).json(errorResponse('Unauthorized', 'TOKEN_NOT_VALID'));

                saveToken.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await saveToken.save();

                const { _id, email, firstname, lastname, role } = user;
                req.user = { _id, email, firstname, lastname, role: role.name };
                return next();
            } catch (error) {
                console.error('❌', error.name);
                return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
            }
        }
    }
}

module.exports = AuthMiddleware;