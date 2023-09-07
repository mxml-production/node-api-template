const yup = require('yup');

const EstablishmentValidation = {
    create: yup.object().shape({
        name: yup.string().required().min(3).max(50),
        description: yup.string().required().min(3).max(255),
        address: yup.string().required().min(3).max(50),
        zipCode: yup.string().required().min(5).max(5).matches(/^[0-9]+$/),
        phone: yup.string().required().min(10).max(10).matches(/^[0-9]+$/),
        email: yup.string().email().required(),
        price: yup.number().required().min(1),
        timeZone: yup.string().required().oneOf(['Europe/Paris', 'Europe/London', 'Europe/Berlin', 'Europe/Rome', 'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Brussels', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Prague', 'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich']),
        language: yup.string().required().oneOf(['fr', 'en', 'de', 'it', 'es', 'nl', 'pt', 'cs', 'sv', 'da', 'pl', 'hu']),
        currency: yup.string().required().oneOf(['EUR', 'GBP', 'CHF', 'USD', 'CAD', 'AUD', 'NZD', 'CZK', 'DKK', 'HUF', 'NOK', 'PLN', 'SEK']),
        visible: yup.boolean().required(),
        enable: yup.boolean().required()
    })
};

module.exports = EstablishmentValidation;