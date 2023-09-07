const ValidationManager = require('../utils/ValidationManager');

const { Establishment } = require('../models');
const { EstablishmentValidation } = require('../validations');
const { successResponse, errorResponse } = require('../utils/Response');

class EstablishmentController {
    static async getAll(req, res) {
        try {
            const establishments = await Establishment.find();
            return res.status(200).json(successResponse('Establishments retrieved successfully', establishments));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async create(req, res) {
        try {
            const { data, valid, errors } = await ValidationManager(EstablishmentValidation.create, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            const establishment = await Establishment.create(data);
            return res.status(201).json(successResponse('Establishment created successfully', establishment));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }
}

module.exports = EstablishmentController;