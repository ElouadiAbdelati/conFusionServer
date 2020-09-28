const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user_id })
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                if (favorites) {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorites);
                } else {
                    var err = new Error('There are no favorites');
                    err.status = 404;
                    return next(err);
                }

            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,
        (req, res, next) => {
            Favorites.findOne({ user: req.user_id }, (err, favorite) => {
                if (err) return next(err);
                if (!favorite) {
                    Favorites.create({ user: user_id })
                        .then((favorite) => {
                            for (i = 0; i < req.body.length; i++) {
                                if (favorite.dishes.indexOf(req.body[i]._id)) {
                                    favorite.dishes.push(req.body[i]);
                                }

                            }
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 200;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite);
                                })
                                .catch((err) => next(err));
                        });
                } else {
                    for (i = 0; i < req.body.length; i++) {
                        if (favorite.dishes.indexOf(req.body[i]._id)) {
                            favorite.dishes.push(req.body[i]);
                        }

                    }
                    favorite.save()
                        .then((favorite) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(favorite);
                        })
                        .catch((err) => next(err));
                }
            });

        })

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({ user: req.user._id })
            .then((favorite) => {
                if (favorite != null) {
                    for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                        favorite.dishes.splice(i, 1);
                    }
                    favorite.save()
                        .then((result) => {
                            res.statusCode = 200;
                            res.setHeader("Content-Type", "application/json");
                            res.json(result);
                        }, (err) => next(err));

                } else {
                    var err = new Error('You do not have any favorites');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

favouriteRouter.route('/:dishId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id })
            .then((favorites) => {
                if (!favorites) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ "exists": false, "favorites": favorites });
                } else {
                    if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": false, "favorites": favorites });
                    } else {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        return res.json({ "exists": true, "favorites": favorites });
                    }
                }

            }, (err) => next(err))
            .catch((err) => next(err))
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,
        (req, res, next) => {
            Favorites.findOne({ user: req.user._id })
                .then((favorite) => {
                    if (favorite == null) {
                        Favorites.create({ user: req.user.id })
                            .then((favorite) => {
                                favorite.dishes.push(req.params.dishId);
                                favorite.save()
                                    .then((favorite) => {
                                        res.statusCode = 201;
                                        res.setHeader("Content-Type", "application/json");
                                        res.json(favorite);
                                        console.log("Favorites Created");
                                    }, (err) => next(err))
                                    .catch((err) => next(err));
                            })
                    } else {
                        if (favorite.dishes.indexOf(req.params.dishId) < 0) {
                            favorite.dishes.push({ "_id": req.params.dishId });
                            favorite.save()
                                .then((favorite) => {
                                    res.statusCode = 201;
                                    res.setHeader("Content-Type", "application/json");
                                    res.json(favorite);
                                    console.log("Favorites Created");
                                }, (err) => next(err))
                                .catch((err) => next(err));
                        }
                    }

                })
                .catch((err) => next(err));
        })

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites/:dishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.findOne({ user: req.user._id }, (err, favorite) => {
            if (err) return next(err);
            var index = favorite.dishes.indexOf(req.params.dishId);
            if (index >= 0) {
                favorite.dishes.splice(index, 1);
                favorite.save()
                    .then((favorite) => {
                        res.statusCode = 201;
                        res.setHeader("Content-Type", "application/json");
                        res.json(favorite);
                        console.log("Favorites deleted");
                    }, (err) => next(err))
                    .catch((err) => next(err));
            } else {
                var err = new Error('You do not have this favorite dish');
                err.status = 404;
                return next(err);
            }
        })


    });

module.exports = favoriteRouter;