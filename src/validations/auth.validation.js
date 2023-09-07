const yup = require('yup');

const AuthValidation = {
    register: yup.object().shape({
        firstname: yup.string().required().min(3).max(20),
        lastname: yup.string().required().min(3).max(20),
        email: yup.string().required().email(),
        password: yup.string().required().min(6).max(20)
    }),
    login: yup.object().shape({
        email: yup.string().required().email(),
        password: yup.string().required().min(6).max(20)
    }),
    deleteSession: yup.object().shape({
        id: yup.string().required()
    }),
    updateMe: yup.object().shape({
        firstname: yup.string().min(3).max(20),
        lastname: yup.string().min(3).max(20),
        email: yup.string().email(),
        password: yup.string().min(6).max(20),
        role: yup.string().oneOf(['user', 'admin', 'host'])
    })
};

module.exports = AuthValidation;