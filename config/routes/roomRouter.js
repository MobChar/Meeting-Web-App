const express = require('express');
var crypto = require("crypto");
var router = express.Router();

let onlineList = new Map();
onlineList.set('Meeting-1', new Array());
onlineList.set('Meeting-2', new Array());


// console.log(Array.from(onlineList.keys()));


router.get('/room/:id', function (req, res) {
    if (!onlineList.has(req.params.id)) {
        res.status(400).send('400 Invalid request !');
        return;
    }
    res.render('room.ejs');
});


// router.get('/room/:id', function (req, res) {
//     res.render('index.ejs');
// })

// router.post('/room', function (req, res) {
//     var id = crypto.randomBytes(20).toString('hex');
//     app.get('/' + id, function (req, res) {
//         res.end('Join room '.concat(id));
//     })
//     res.end('Create room '.concat(id));
// })

// router.delete('/room/:id', function (req, res) {
//     removeRoute(app, '/'.concat(req.params.id));
//     res.end('Remove room complete '.concat('/'.concat(req.params.id)));
// })


module.exports = {
    onlineList: onlineList,
    router: router
}
// module.exports = router;


