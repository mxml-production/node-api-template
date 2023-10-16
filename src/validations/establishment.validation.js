const yup = require('yup');

const EstablishmentValidation = {
    create: yup.object().shape({
        name: yup.string().required().min(3).max(50),
        description: yup.string().required().min(3).max(255),
        phone: yup.string().required().min(10).max(10).matches(/^[0-9]+$/),
        link: yup.string().url(),
        email: yup.string().email().required(),
        minPrice: yup.number().required().min(1),
        maxPrice: yup.number().required().min(1),
        visible: yup.boolean().required(),
        enable: yup.boolean().required(),
        address: yup.object().required().shape({
            formattedAddress: yup.string().required(),
            address: yup.object().required().shape({
                streetNumber: yup.string().required(),
                route: yup.string().required(),
                city: yup.string().required(),
                zipCode: yup.string().required(),
                region: yup.string().required(),
                department: yup.string().required(),
                country: yup.string().required(),
            }).required(),
            location: yup.object().required().shape({
                latitude: yup.number().required(),
                longitude: yup.number().required(),
            }).required(),
        }).required(),
        user: yup.string(),
    }),
    update: yup.object().shape({
        name: yup.string().min(3).max(50),
        description: yup.string().min(3).max(255),
        phone: yup.string().min(10).max(10).matches(/^[0-9]+$/),
        link: yup.string().url(),
        email: yup.string().email(),
        minPrice: yup.number().min(1),
        maxPrice: yup.number().min(1),
        visible: yup.boolean(),
        enable: yup.boolean(),
        address: yup.object().shape({
            formattedAddress: yup.string(),
            address: yup.object().shape({
                streetNumber: yup.string(),
                route: yup.string(),
                city: yup.string(),
                zipCode: yup.string(),
                region: yup.string(),
                department: yup.string(),
                country: yup.string(),
            }),
            location: yup.object().shape({
                latitude: yup.number(),
                longitude: yup.number(),
            }),
        }),
        user: yup.string(),
    }),
};

module.exports = EstablishmentValidation;