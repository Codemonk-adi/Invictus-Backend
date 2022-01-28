const express = require('express');
const auth = require('../middleware/auth')();
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const { parser, secureparser, allQueries, deleteQuery } = require('../controllers/admin');
const { ValidateQuery } = require('../middleware/validator');
const upload = multer({ storage });

router.post('/parse', auth.authenticate(), ValidateQuery, upload.array('invoices'), secureparser)
    .get('/userhistory', auth.authenticate(), allQueries)
    .post('/deletehistory', auth.authenticate(), deleteQuery)
    // .post('/editUser', auth.authenticate())
    // router.post('/signup', ValidateUser, signup, login);
    // router.post('/login', passport.authenticate("local"), login);

// router.post('/secret', auth.authenticate(), secret)
module.exports = router;