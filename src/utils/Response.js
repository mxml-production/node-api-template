const errorResponse = (message, code) => {
    return { error: true, message, code };
}

const successResponse = (message, data) => {
    return { error: false, message, data };
}

module.exports = { errorResponse, successResponse };