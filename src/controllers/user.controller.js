const bcrypt = require('bcryptjs');

const { User, Role } = require('../models');

const ValidationManager = require('../utils/ValidationManager');
const { successResponse, errorResponse } = require('../utils/Response');
const { UserValidation } = require('../validations');

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
      console.error('❌', error);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async create(req, res) {
    try {
      const { data, valid, errors } = await ValidationManager(UserValidation.create, req.body);
      if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

      const userExists = await User.findOne({ email: data.email });
      if (userExists) return res.status(400).json(errorResponse('User already exists', 'USER_ALREADY_EXISTS'));

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);

      const role = await Role.findOne({ name: data.role });
      if (!role) return res.status(400).json(errorResponse('Invalid role', 'INVALID_ROLE'));

      data.role = role._id;
      data.password = hashedPassword;
      data.salt = salt;

      const user = await User.create(data);
      const cleanUser = user.toObject();
      delete cleanUser.password; delete cleanUser.salt; delete cleanUser.__v;

      return res.status(201).json(successResponse('User created successfully', cleanUser));
    } catch (error) {
      console.log('❌', error);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;

      const { data, valid, errors } = await ValidationManager(UserValidation.update, req.body);
      if (!valid) return res.status(400).json(errorResponse(errors[0], 'VALIDATION_ERROR'));

      if (data.email) {
        const isEmailExist = await User.findOne({ email: data.email });
        if (isEmailExist && isEmailExist._id.toString() !== id) return res.status(400).json(errorResponse('Email already exists', 'EMAIL_ALREADY_EXISTS'));
      }

      if (data.role) {
        const role = await Role.findOne({ name: data.role });
        if (!role) return res.status(400).json(errorResponse('Invalid role', 'INVALID_ROLE'));
        data.role = role._id;
      }

      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);
        data.password = hashedPassword;
        data.salt = salt;
      }

      const user = await User.findByIdAndUpdate(id, data);
      if (!user) return res.status(404).json(errorResponse('User not found', 'USER_NOT_FOUND'));

      const cleanUser = user.toObject();
      cleanUser.role = cleanUser.role.name;
      delete cleanUser.password; delete cleanUser.salt; delete cleanUser.__v;

      return res.status(200).json(successResponse('User updated successfully', cleanUser));
    } catch (error) {
      console.error('❌', error);
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
      console.error('❌', error);
      return res.status(500).json(errorResponse('Internal Server Error', 'SERVER_ERROR'));
    }
  }
}

module.exports = UserController;