const slugify = require('slugify');
const yup = require('yup');

const ValidationManager = require('../utils/ValidationManager');

const { Establishment, Country, Region, Department, City } = require('../models');

class EstablishmentService {
    static async geocodeValidation(address) {
        try {
            const { data, valid, errors } = await ValidationManager(addressSchema, address);
            if (!valid) return { valid: false, errors: errors };

            const countrySlug = slugify(data.country, { lower: true });
            let country = await Country.findOne({ slug: countrySlug });
            if (!country) {
                country = await Country.create({ name: data.country, slug: countrySlug });
            }

            const regionSlug = slugify(data.region, { lower: true });
            let region = await Region.findOne({ slug: regionSlug });
            if (!region) {
                region = await Region.create({ name: data.region, slug: regionSlug, country: country._id });
            }

            const departmentSlug = slugify(data.department, { lower: true });
            let department = await Department.findOne({ slug: departmentSlug });
            if (!department) {
                department = await Department.create({ name: data.department, slug: departmentSlug, region: region._id });
            }

            const citySlug = slugify(data.city, { lower: true });
            let city = await City.findOne({ slug: citySlug });
            if (!city) {
                city = await City.create({ name: data.city, slug: citySlug, department: department._id, zipCode: data.zipCode });
            }

            data.country = country._id;
            data.region = region._id;
            data.department = department._id;
            data.city = city._id;

            return { valid: true, data: data };
        } catch (error) {
            console.error('❌', error);
            return { valid: false, errors: ['Internal Server Error'] };
        }
    }
}

const addressSchema = yup.object().shape({
    country: yup.string().required(),
    region: yup.string().required(),
    department: yup.string().required(),
    city: yup.string().required(),
    zipCode: yup.string().required(),
});

module.exports = EstablishmentService;