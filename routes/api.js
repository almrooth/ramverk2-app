const express = require('express');
const router = express.Router();
const fs = require('fs');

// Return content of file if exists else false
const getContentFromFile = file => {
    if (!fs.existsSync(file)) {
        return false;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
};

// Route for chat
router.get('/chat', (req, res, next) => {
    let fileName = './src/data/chat.json';

    let content = getContentFromFile(fileName);

    if (!content) {
        return next();
    }
    res.json(content);
});


// Route for first chat msg
router.get('/chat/:id', (req, res, next) => {
    let id = req.params.id;

    let fileName = './src/data/chat.json';

    let content = getContentFromFile(fileName);

    if (!content) {
        return next();
    }
    res.json(content[id]);
});

module.exports = router;
