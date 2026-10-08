import { ApiError } from '../utils/ApiError.js';

/**
 * Validates req[source] against a Joi schema. Unknown keys are stripped and
 * the sanitised value replaces the original (this also blocks NoSQL operator injection).
 */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/"/g, ''),
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    req[source] = value;
    return next();
  };
