const jwt = require('jsonwebtoken');

class TokenManager {
    static generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET);
    }

    static async verifyToken(token) {
        try {
            const jwtValid = await jwt.verify(token, process.env.JWT_SECRET);
            return { error: false, ...jwtValid };
        } catch (error) {
            return { error: true, ...error };
        }
    }

    static getHeaderToken(req) {
        const authorization = req.get('Authorization');
        if (!authorization) return null;

        const token = authorization.split(' ')[1];
        return token;
    }
}

module.exports = TokenManager;