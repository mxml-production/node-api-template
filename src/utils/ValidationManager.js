const ValidationManager = async (schema, data) => {
    try {
        const validData = await schema.validate(data, { stripUnknown: true, abortEarly: false });
        return { valid: true, data: validData };
    } catch (error) {
        return { valid: false, errors: error.errors };
    }
};

module.exports = ValidationManager;