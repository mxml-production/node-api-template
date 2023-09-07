const yup = require('yup');

const UserValidation = {
    create: yup.object().shape({
        firstname: yup.string().required().min(3).max(20).lowercase().trim(),
        lastname: yup.string().required().min(3).max(20).lowercase().trim(),
        email: yup.string().email().required().trim().lowercase(),
        password: yup.string().required().min(6).max(20),
        role: yup.string().oneOf(['user', 'host', 'admin']).required(),
    }),
    update: yup.object().shape({
        firstname: yup.string().min(3).max(20).lowercase().trim(),
        lastname: yup.string().min(3).max(20).lowercase().trim(),
        email: yup.string().email().trim().lowercase(),
        password: yup.string().min(6).max(20),
        role: yup.string().oneOf(['user', 'host', 'admin']),
    }),
};

module.exports = UserValidation;