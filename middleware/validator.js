const ExpressError = require('../utils/ExpressError')
const { UserSchema } = require('../validationSchemas')

module.exports.ValidateUser = function(req, res, next) {
    const { error } = UserSchema.validate(req.body);
    if (error) {
        const msg = error.details[0].message;
        res.status(400).json({
            "Error": msg
        })
    } else
        next()
}