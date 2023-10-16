const bcrypt = require('bcryptjs');
const fs = require('fs');

const { User, Role, Token } = require('../models');

const TokenManager = require('../utils/TokenManager.js');
const ValidationManager = require('../utils/ValidationManager.js');
const FileManager = require('../utils/FileManager.js');
const { errorResponse, successResponse } = require('../utils/Response.js');

const { AuthValidation } = require('../validations');

class AuthController {
    static async register(req, res) {
        try {
            const { data, valid, errors } = await ValidationManager(AuthValidation.register, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            const { firstname, lastname, email, password } = data;

            const userExist = await User.findOne({ email });
            if (userExist) return res.status(400).json(errorResponse('User already exists', 'USER_EXISTS'));

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const defaultRole = await Role.findOne({ name: 'user' });
            if (!defaultRole) return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));

            const user = await User.create({ firstname, lastname, email, password: hashedPassword, salt, role: defaultRole._id });

            return res.status(201).json(successResponse('User created successfully', user));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async login(req, res) {
        try {
            const { data, valid, errors } = await ValidationManager(AuthValidation.login, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            const { email, password } = data;

            const user = await User.findOne({ email }).populate('role');
            if (!user) return res.status(400).json(errorResponse('Invalid credentials', 'INVALID_CREDENTIALS'));
            if (!user.enabled) return res.status(400).json(errorResponse('User is disabled', 'USER_DISABLED'));

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(400).json(errorResponse('Invalid credentials', 'INVALID_CREDENTIALS'));

            const newToken = await TokenManager.generateToken(user._id);
            const userAgent = req.get('User-Agent');
            const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            const token = await Token.create({ token: newToken, user: user._id, expires, userAgent });

            const { password: userPassword, salt, ...rest } = user._doc;

            return res.status(200).json(successResponse('Login successful', { user: rest, token: token.token }));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async logout(req, res) {
        try {
            const token = TokenManager.getHeaderToken(req);
            if (!token) return res.status(400).json(errorResponse('Token not found', 'TOKEN_NOT_FOUND'));

            const isValid = await TokenManager.verifyToken(token);
            if (!isValid) return res.status(400).json(errorResponse('Invalid token', 'TOKEN_NOT_VALID'));

            await Token.deleteOne({ token });
            return res.status(200).json(successResponse('Logout successful', null));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async logoutAll(req, res) {
        try {
            await Token.deleteMany({ user: req.user._id });
            return res.status(200).json(successResponse('Logout successful', null));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async getSessions(req, res) {
        try {
            const tokens = await Token.find({ user: req.user._id }, { user: 0 });
            const updatedTokens = tokens.map(token => {
                if (token.token === TokenManager.getHeaderToken(req)) {
                    return { ...token.toObject(), current: true, token: undefined };
                } else {
                    return { ...token.toObject(), current: false, token: undefined };
                }
            });

            return res.status(200).json(successResponse('Sessions retrieved successfully', updatedTokens));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async deleteSession(req, res) {
        try {
            const { id } = req.params;

            const token = Token.findById(id);
            if (!token) return res.status(400).json(errorResponse('Token not found', 'TOKEN_NOT_FOUND'));

            await token.deleteOne();
            return res.status(200).json(successResponse('Session deleted successfully', null));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async verify(req, res) {
        try {
            const token = TokenManager.getHeaderToken(req);
            if (!token) return res.status(400).json(errorResponse('Token not found', 'TOKEN_NOT_FOUND'));

            const isValid = await TokenManager.verifyToken(token);
            if (!isValid) return res.status(400).json(errorResponse('Invalid token', 'TOKEN_NOT_VALID'));

            const savedToken = await Token.findOne({ token });
            if (!savedToken) return res.status(400).json(errorResponse('Token not found', 'TOKEN_NOT_VALID'));
            if (savedToken.expires < Date.now()) {
                await savedToken.deleteOne();
                return res.status(400).json(errorResponse('Token expired', 'TOKEN_EXPIRED'));
            }

            const user = await User.findById(savedToken.user).populate('role');
            if (!user) return res.status(400).json(errorResponse('User not found', 'TOKEN_NOT_VALID'));
            if (!user.enabled) return res.status(400).json(errorResponse('User not active', 'USER_NOT_ACTIVE'));

            const { password, salt, ...rest } = user.toObject();
            return res.status(200).json(successResponse('Authenticated', { user: rest, token }));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async me(req, res) {
        try {
            const user = await User.findById(req.user._id).populate('role');
            if (!user) return res.status(400).json(errorResponse('User not found', 'USER_NOT_FOUND'));

            const { password, salt, ...rest } = user.toObject();
            return res.status(200).json(successResponse('User retrieved successfully', rest));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async updateMe(req, res) {
        try {
            const { data, valid, errors } = await ValidationManager(AuthValidation.updateMe, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            const { password } = data;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                data.password = hashedPassword;
                data.salt = salt;
            }

            if (data.role) {
                const role = await Role.find({ name: data.role });
                if (!role) return res.status(400).json(errorResponse('Role not found', 'ROLE_NOT_FOUND'));
                data.role = role._id;
            }

            if (req.files && req.files.profil) {
                const { profil } = req.files;
                const { file } = profil[0];

                const isFileValid = FileManager.verifyFile(file.filename, { allowedExtensions: ['png', 'jpg', 'jpeg'], maxSize: 1024 * 1024 * 5 });
                if (!isFileValid) {
                    await FileManager.deleteFilesFromRequest(profil);
                    return res.status(400).json(errorResponse('Invalid file', 'INVALID_FILE'));
                }

                const user = await User.findById(req.user._id);
                if (user.profil) await FileManager.deleteFile(user.profil);

                data.profil = file.filename;
            }

            await User.findByIdAndUpdate(req.user._id, data);
            return res.status(200).json(successResponse('User updated successfully', null));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }
}

module.exports = AuthController;