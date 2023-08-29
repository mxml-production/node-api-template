const yup = require('yup');
const bcrypt = require('bcryptjs');

const { User, Role } = require('../models');
const { successResponse, errorResponse } = require('../utils/Response');

class UserController {
  static async getAll(req, res) {
    try {
      const users = await User.find().populate('role', 'name');

      const cleanUsers = users.map(user => {
        const userCopy = user.toObject();
        userCopy.role = userCopy.role.name;
        delete userCopy.password; delete userCopy.salt; delete userCopy.__v;
        return userCopy;
      });

      return res.status(200).json(successResponse('Users retrieved successfully', cleanUsers));
    } catch (error) {
      console.error('❌', error);
      console.error('❌', error.name);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async getOne(req, res) {
    try  {
      const { id } = req.params;

      const user = await User.findById(id).populate('role', 'name');
      if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

      const cleanUser = user.toObject();
      cleanUser.role = cleanUser.role.name;
      delete cleanUser.password; delete cleanUser.salt; delete cleanUser.__v;

      return res.status(200).json(successResponse('User retrieved successfully', cleanUser));
    } catch (error) {
      console.error('❌', error.name);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async create(req, res) {
    try {
      let validatedData;
      try {
        validatedData = await schemas.create.validate(req.body, { abortEarly: false, stripUnknown: true });
      } catch (error) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }

      const userExists = await User.findOne({ email: validatedData.email });
      if (userExists) return res.status(400).json(errorResponse('User already exists', 'USER_ALREADY_EXISTS'));

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);

      const role = await Role.findOne({ name: validatedData.role });
      if (!role) return res.status(400).json(errorResponse('Invalid role', 'INVALID_ROLE'));

      validatedData.role = role._id;
      validatedData.password = hashedPassword;
      validatedData.salt = salt;

      const user = await User.create(validatedData);
      const cleanUser = user.toObject();
      delete cleanUser.password; delete cleanUser.salt; delete cleanUser.__v;

      return res.status(201).json(successResponse('User created successfully', cleanUser));
    } catch (error) {
      console.log('❌', error);
      console.error('❌', error.name);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;

      let validatedData;
      try {
        validatedData = await schemas.update.validate(req.body, { abortEarly: false, stripUnknown: true });
      } catch (error) {
        return res.status(400).json(errorResponse(error.message, 'VALIDATION_ERROR'));
      }

      const role = await Role.findOne({ name: validatedData.role });
      if (!role) return res.status(400).json(errorResponse('Invalid role', 'INVALID_ROLE'));
      validatedData.role = role._id;

      if (validatedData.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(validatedData.password, salt);
        validatedData.password = hashedPassword;
        validatedData.salt = salt;
      }

      const user = await User.findByIdAndUpdate(id, validatedData);
      if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

      const cleanUser = user.toObject();
      cleanUser.role = cleanUser.role.name;
      delete cleanUser.password; delete cleanUser.salt; delete cleanUser.__v;

      return res.status(200).json(successResponse('User updated successfully', cleanUser));
    } catch (error) {
      console.error('❌', error.name);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByIdAndDelete(id);
      if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

      return res.status(200).json(successResponse('User deleted successfully', user));
    } catch(error) {
      console.error('❌', error.name);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }
}

const schemas = {
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
}

module.exports = UserController;