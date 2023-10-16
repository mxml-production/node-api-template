const errorResponse = (message, code) => {
    return { error: true, message, code };
}

const successResponse = (message, data) => {
    return { error: false, message, data };
}

const formatedGoogleGeocodeResponse = (data) => {
    const { results } = data;

    if (!results.length) return null;

    const addressData = data.results[0];

    const streetNumber = addressData.address_components.find(component => component.types.includes("street_number"))?.long_name || "";
    const route = addressData.address_components.find(component => component.types.includes("route"))?.long_name || "";
    const city = addressData.address_components.find(component => component.types.includes("locality"))?.long_name || "";
    const zipCode = addressData.address_components.find(component => component.types.includes("postal_code"))?.long_name || "";
    const department = addressData.address_components.find(component => component.types.includes("administrative_area_level_2"))?.long_name || "";
    const region = addressData.address_components.find(component => component.types.includes("administrative_area_level_1"))?.long_name || "";
    const country = addressData.address_components.find(component => component.types.includes("country"))?.long_name || "";
    const latitude = addressData.geometry.location.lat;
    const longitude = addressData.geometry.location.lng;
    const formattedAddress = addressData.formatted_address;

    return {
        formattedAddress,
        address: {
            streetNumber,
            route,
            city,
            zipCode,
            department,
            region,
            country
        },
        location: {
            latitude,
            longitude
        }
    }
}

module.exports = { errorResponse, successResponse, formatedGoogleGeocodeResponse };