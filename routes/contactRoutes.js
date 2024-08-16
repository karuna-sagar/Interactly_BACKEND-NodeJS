const express = require('express');
const router = express.Router();
const {
    createContact,
    getContact,
    updateContact,
    deleteContact,
    getAllContacts
} = require('../controllers/contactController');

router.post('/createContact', createContact);
router.get('/getContact', getContact);
router.post('/updateContact', updateContact);
router.post('/deleteContact', deleteContact);
router.get('/getAllContacts', getAllContacts);

module.exports = router;
