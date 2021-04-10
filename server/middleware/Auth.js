import jwt from 'jsonwebtoken';
import { query } from '../db/index';

const Joi = require('joi');

export default class Auth {
  static validate(req, res, next) {
    const schema = {
      firstname: Joi.string().required().min(2).regex(/^[a-zA-Z]+/),
      lastname: Joi.string().required().min(2).regex(/^[a-zA-Z]+/),
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string().min(8).required(),
    };

    const { error } = Joi.validate(req.body, schema);

    if (error) {
      switch (error.details[0].context.key) {
        case 'email':
          res.status(400).send({
            status: 400,
            error: 'you must provide a valid email address',
          });
          break;
        case 'firstname':
          res.status(400).send({
            status: 400,
            error: 'firstname cannot be empty or less than two characters and must not start with a number',
          });
          break;
        case 'lastname':
        /* istanbul ignore next */
          res.status(400).send({
            status: 400,
            error: 'lastname cannot be empty or less than two characters and must not start with a number',
          });
          /* istanbul ignore next */
          break;
        case 'password':
          res.status(400).send({
            status: 400,
            error: 'password cannot be empty and must be at least 8',
          });
          break;
        /* istanbul ignore next */
        default:
          res.status(400).send({
            status: 400,
            error: 'invalid registration information',
          });
      }
    } else {
      next();
    }
  }

  static emailToLowerCase(req, res, next) {
    let { email } = req.body;
    email = email.toLowerCase();
    req.body.email = email;
    next();
  }

  static trimmer(req, res, next) {
    const { body } = req;
    if (body) {
      const trimmed = {};

      Object.keys(body).forEach((key) => {
        const value = body[key];
        Object.assign(trimmed, { [key]: value.trim() });
      });
      req.body = trimmed;
    }

    next();
  }

  static magicValidator(req, res, next) {
    const { body } = req;
    const toValidate = {};
    let obj = {};
    Object.keys(body).forEach((key) => {
      obj = Object.assign(toValidate, { [key]: Joi.string().required() });
    });

    const schema = obj;
    const { error } = Joi.validate(body, schema);

    if (error) {
    /* istanbul ignore next */
      res.status(400).send({
        status: 400,
        error: error.details[0].message,
      });
    } else {
      next();
    }
  }

  static async verifyLogin(req, res, next) {
    const schema = {
      email: Joi.string().email({ minDomainAtoms: 2 }).required(),
      password: Joi.string().min(8).required(),
    };

    const { error } = Joi.validate(req.body, schema);

    if (error) {
      switch (error.details[0].context.key) {
        case 'email':
          /* istanbul ignore next */
          res.status(401).send({
            status: 401,
            error: 'you must provide a valid email address',
          });
          break;
        case 'password':
        /* istanbul ignore next */
          res.status(401).send({
            status: 401,
            error: 'password cannot be empty and must be at least 8',
          });
          break;
        /* istanbul ignore next */
        default:
        /* istanbul ignore next */
          res.status(401).send({
            status: 401,
            error: 'invalid registration information',
          });
      }
    } else {
      next();
    }
  }

  static async verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
      return res.status(400).send({
        status: 400,
        error: 'Token is not provided',
      });
    }
    try {
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);
      const text = 'SELECT * FROM users WHERE id = $1';
      const { rows } = await query(text, [decoded.id]);
      if (!rows[0]) {
        return res.status(400).send({
          status: 400,
          error: 'The token you provided is invalid',
        });
      }
      req.user = { id: decoded.id, email: decoded.email };
      next();
    } catch (error) {
      return res.status(500).send({
        status: 500,
        error,
      });
    }
    return {};
  }

  static spoof(req, res, next) {
    const { email } = req.user;
    const { recieversEmail } = req.body;
    if (email === recieversEmail) {
    /* istanbul ignore next */
      return res.status(400).send({
        status: 400,
        error: 'You cannot send an email to your self',
      });
    }
    next();
    return {};
  }
}
