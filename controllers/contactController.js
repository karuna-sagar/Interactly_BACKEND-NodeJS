const { escape } = require('mysql2');
const db = require('../config/db');
const axios = require('axios');
let CRM = [];
exports.createContact = async (req, res) => {
    const { first_name, last_name, email, mobile_number, data_store } = req.body;
    if (data_store === 'DATABASE') {
        const query = `INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)`;
        db.query(query, [first_name, last_name, email, mobile_number], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: 'Contact created successfully', contactId: results.insertId });
        });
    }
    else if (data_store === 'CRM') {
        try {
            const response = await axios.post(
                'https://interactly-744225354823593357.myfreshworks.com/crm/sales/api/contacts',
                {
                    contact: {
                        first_name: first_name,
                        last_name: last_name,
                        email: email,
                        mobile_number: mobile_number
                    }
                },
                {
                    headers: {
                        'Authorization': 'Token token=bdIrsvr-p5ISO3OqWCSBsA',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Returning the response from Freshworks CRM
            res.status(201).json({
                message: 'Contact created successfully in CRM',
                data: response.data
            });
        } catch (error) {
            console.error('Error creating contact in CRM:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to create contact in CRM' });
        }
    }
    else {
        res.status(400).json({ error: 'Invalid data_store value' });
    }
};
exports.getContact = async (req, res) => {
    const { contact_id, data_store } = req.body;
    if (data_store === 'DATABASE') {
        const query = `SELECT * FROM contacts WHERE ID = ?`;
        db.query(query, [contact_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Contact not found' });
            res.status(200).json(results[0]);
        });
    }
    else if (data_store === 'CRM') {
        try {
            const response = await axios.get(
                `https://interactly-744225354823593357.myfreshworks.com/crm/sales/api/contacts/${contact_id}?include=sales_accounts`,
                {
                    headers: {
                        'Authorization': 'Token token=bdIrsvr-p5ISO3OqWCSBsA',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Returning the contact details from Freshworks CRM
            res.status(200).json({
                message: 'Contact retrieved successfully from CRM',
                data: response.data
            });
        } catch (error) {
            console.error('Error retrieving contact from CRM:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to retrieve contact from CRM' });
        }
    }

    else {
        res.status(400).json({ error: 'Invalid data_store value' });
    }
};
exports.updateContact = async (req, res) => {
    const { contact_id, new_email, new_mobile_number, data_store } = req.body;

    // if (!contact_id || !new_email || !new_mobile_number || data_store !== 'DATABASE') {
    //     return res.status(400).json({ error: 'Missing required parameters or invalid data_store value' });
    // }
    if (data_store === 'CRM') {
        try {
            // Update the contact in Freshworks CRM
            const response = await axios.put(
                `https://interactly-744225354823593357.myfreshworks.com/crm/sales/api/contacts/${contact_id}`,
                {
                    contact: {
                        email: new_email,
                        mobile_number: new_mobile_number
                    }
                },
                {
                    headers: {
                        'Authorization': 'Token token=bdIrsvr-p5ISO3OqWCSBsA',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Respond with success message
            res.status(200).json({
                message: 'Contact updated successfully in CRM',
                data: response.data
            });
        } catch (error) {
            console.error('Error updating contact in CRM:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to update contact in CRM' });
        }
    }
    else if (data_store === 'DATABASE') {
        // SQL query to update only email and mobile number
        const query = `UPDATE contacts SET email = ?, mobile_number = ? WHERE ID = ?`;

        db.query(query, [new_email, new_mobile_number, contact_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Contact not found' });
            res.status(200).json({ message: 'Contact updated successfully' });
        });

    }
    else {
        res.status(400).json({ error: 'Invalid data_store value. Must be either "CRM" or "DATABASE".' });
    }
};

exports.deleteContact = async (req, res) => {
    const { contact_id, data_store } = req.body;
    if (data_store === 'DATABASE') {
        const query = `DELETE FROM contacts WHERE ID = ?`;
        db.query(query, [contact_id], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Contact not found' });
            res.status(200).json({ message: 'Contact deleted successfully' });
        });
    }
    if (data_store === 'CRM') {
        try {
            // Delete the contact from Freshworks CRM
            const response = await axios.delete(
                `https://interactly-744225354823593357.myfreshworks.com/crm/sales/api/contacts/${contact_id}`,
                {
                    headers: {
                        'Authorization': 'Token token=bdIrsvr-p5ISO3OqWCSBsA',
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Respond with success message
            res.status(200).json({
                message: 'Contact deleted successfully from CRM',
                data: response.data
            });
        } catch (error) {
            console.error('Error deleting contact from CRM:', error.response ? error.response.data : error.message);
            res.status(500).json({ error: 'Failed to delete contact from CRM' });
        }
    }
    else {
        res.status(400).json({ error: 'Invalid data_store value' });
    }
};
exports.getAllContacts = async (req, res) => {
    const { data_store } = req.body;
    if (data_store === 'DATABASE') {
        const query = `SELECT * FROM contacts`;
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(200).json(results);
        });
    }

    else {
        res.status(400).json({ error: 'Invalid data_store value' });
    }
};
