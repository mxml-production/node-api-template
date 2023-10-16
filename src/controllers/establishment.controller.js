const axios = require('axios');

const ValidationManager = require('../utils/ValidationManager');

const { Establishment, User, Country, Region, Department, City } = require('../models');
const { EstablishmentValidation } = require('../validations');
const { successResponse, errorResponse, formatedGoogleGeocodeResponse } = require('../utils/Response');
const { EstablishmentService } = require('../services');

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

    static async getOne(req, res) {
        try {
            const { id } = req.params;

            let establishment = await Establishment.findById(id);
            if (!establishment) return res.status(404).json(errorResponse('Establishment not found', 'ESTABLISHMENT_NOT_FOUND'));

            establishment = establishment.toObject();

            const user = await User.findById(establishment.user);
            establishment.user = user ? user : null;

            const city = await City.findById(establishment.city);
            establishment.city = city ? city : null;

            const department = await Department.findById(city.department);
            establishment.department = department ? department : null;

            const region = await Region.findById(department.region);
            establishment.region = region ? region : null;

            const country = await Country.findById(region.country);
            establishment.country = country ? country : null;

            return res.status(200).json(successResponse('Establishment retrieved successfully', establishment));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async create(req, res) {
        try {
            const { data, valid, errors } = await ValidationManager(EstablishmentValidation.create, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            const request = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${data.address.formattedAddress}&key=${process.env.GOOGLE_API_KEY}`);
            const formatedData = formatedGoogleGeocodeResponse(request.data);
            if (!formatedData) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
            if (!compareObject(formatedData.address, data.address.address)) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
            if (!compareObject(formatedData.location, data.address.location)) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
            const { valid: adressValid, data: adressData, errors: errorsData } = await EstablishmentService.geocodeValidation(formatedData.address);
            if (!adressValid) return res.status(400).json(errorResponse(errorsData[0], 'VALIDATION_ERROR'));

            data.city = adressData.city;
            data.address = formatedData.formattedAddress;
            data.latitude = formatedData.location.latitude;
            data.longitude = formatedData.location.longitude;

            if (data.user) {
                const user = await User.findById(data.user);
                if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

                data.user = user._id;
            }

            const establishment = await Establishment.create(data);
            return res.status(201).json(successResponse('Establishment created successfully', establishment));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const establishment = await Establishment.findById(id);
            if (!establishment) return res.status(404).json(errorResponse('Establishment not found', 'ESTABLISHMENT_NOT_FOUND'));

            const { data, valid, errors } = await ValidationManager(EstablishmentValidation.update, req.body);
            if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

            if (data.address) {
                const request = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${data.address.formattedAddress}&key=${process.env.GOOGLE_API_KEY}`);
                const formatedData = formatedGoogleGeocodeResponse(request.data);
                if (!formatedData) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
                if (!compareObject(formatedData.address, data.address.address)) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
                if (!compareObject(formatedData.location, data.address.location)) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));
                const { valid: adressValid, data: adressData, errors: errorsData } = await EstablishmentService.geocodeValidation(formatedData.address);
                if (!adressValid) return res.status(400).json(errorResponse(errorsData[0], 'VALIDATION_ERROR'));

                data.city = adressData.city;
                data.address = formatedData.formattedAddress;
                data.latitude = formatedData.location.latitude;
                data.longitude = formatedData.location.longitude;
            }

            if (data.user) {
                const user = await User.findById(data.user);
                if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

                data.user = user._id;
            }

            const updatedEstablishment = await Establishment.findByIdAndUpdate(establishment._id, data, { new: true });
            if (!updatedEstablishment) return res.status(404).json(errorResponse('Establishment not found', 'ESTABLISHMENT_NOT_FOUND'));

            return res.status(200).json(successResponse('Establishment updated successfully', updatedEstablishment));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;

            const establishment = await Establishment.findByIdAndDelete(id);
            if (!establishment) return res.status(404).json(errorResponse('Establishment not found', 'ESTABLISHMENT_NOT_FOUND'));

            return res.status(200).json(successResponse('Establishment deleted successfully', establishment));
        } catch (error) {
            console.error('❌', error);
            return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async adressVerification(req, res) {
        try {
            const request = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${req.body.address}&key=${process.env.GOOGLE_API_KEY}`);
            const { data } = request;

            const formatedData = formatedGoogleGeocodeResponse(data);
            if (!formatedData) return res.status(400).json(errorResponse('Invalid adress', 'INVALID_ADRESS'));

            return res.status(200).json(successResponse('Adress verified successfully', formatedData));
        } catch (error) {
            console.error('❌', error);
            res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

    static async geocodeVerification(req, res) {
        try {
            const { address } = req.body;
            const { valid, data, errors } = await EstablishmentService.geocodeValidation(address);

            console.log(valid, data, errors);
            return res.status(200).json(successResponse('Adress verified successfully', { valid, data, errors }));
        } catch (error) {
            console.error('❌', error);
            res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
        }
    }

}

const compareObject = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    keys1.sort();
    keys2.sort();

    for (const key of keys1) {
        if (obj1[key] !== obj2[key]) return false;
    }

    return true;
}

module.exports = EstablishmentController;