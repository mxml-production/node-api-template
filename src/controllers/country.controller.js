const yup = require('yup');

const { Country } = require('../models');

const ValidationManager = require('../utils/ValidationManager');
const { successResponse, errorResponse } = require('../utils/Response');

class CountryController {
    static async getAll(req, res) {
        try {
            const countries = await Country.find();
            return res.status(200).json(successResponse('Countries retrieved successfully', countries));
        } catch (error) {
            console.log('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            const country = await Country.findById(id);
            if (!country) return res.status(404).json(errorResponse('Country not found', 'COUNTRY_NOT_FOUND'));

            return res.status(200).json(successResponse('Country retrieved successfully', country));
        } catch (error) {
            console.log('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async create(req, res) {
        try {
            // Validate the request body against the schema and catch any errors
            const { name, slug } = await schemas.create.validate(req.body).catch((err) => {
                return res.status(400).json(errorResponse(err.errors[0], 'VALIDATION_ERROR'));
            });

            const countryExists = await Country.findOne({ slug });
            if (countryExists) return res.status(400).json(errorResponse('Country already exists', 'COUNTRY_ALREADY_EXISTS'));

            const country = new Country({ name, slug });
            await country.save();

            return res.status(201).json(successResponse('Country created successfully', country));
        } catch (error) {
            console.log('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const { name, slug, region } = req.body;

            const country = await Country.findById(id);
            if (!country) return res.status(404).json(errorResponse('Country not found', 'COUNTRY_NOT_FOUND'));

            country.name = name;
            country.slug = slug;
            country.region = region;

            await country.save();

            return res.status(200).json(successResponse('Country updated successfully', country));
        } catch (error) {
            console.log('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const country = await Country.findById(id);
            if (!country) return res.status(404).json(errorResponse('Country not found', 'COUNTRY_NOT_FOUND'));

            await country.delete();

            return res.status(200).json(successResponse('Country deleted successfully', country));
        } catch (error) {
            console.log('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }
}

const schemas = {
    create: yup.object().shape({
        name: yup.string().required().min(3).max(50),
        slug: yup.string().required().matches(/^[a-z][a-z\-]*[a-z]$/)
    })
};

module.exports = CountryController;