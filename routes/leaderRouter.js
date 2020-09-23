const express = require('express');
const bodyParser = require('body-parser');

const lederRouter = express.Router();

lederRouter.use(bodyParser.json());
lederRouter.route('/')
    .all((req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        next();
    })
    .get((req, res, next) => {
        res.end('Will send all the lesders to you!');
    })
    .post((req, res, next) => {
        res.end('Will add the lesder: ' + req.body.name + ' with lesders: ' + req.body.description);
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /lesders');
    })
    .delete((req, res, next) => {
        res.end('Deleting all lesders');
    });


lederRouter.route('/:dishId')
    .get((req, res, next) => {
        res.end('Will send details of the lesder: ' + req.params.dishId + ' to you!');
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /lesders/' + req.params.dishId);
    })
    .put((req, res, next) => {
        res.write('Updating the lesder: ' + req.params.dishId + '\n');
        res.end('Will update the lesder: ' + req.body.name +
            ' with lesder: ' + req.body.description);
    })
    .delete((req, res, next) => {
        res.end('Deleting leader: ' + req.params.dishId);
    });


module.exports = lederRouter;