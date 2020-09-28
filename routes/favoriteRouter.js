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
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                if (favorites) {
                    user_favorites = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString())[1];
                    if (!user_favorites) {
                        var err = new Error('You have no favorites!');
                        err.status = 404;
                        return next(err);
                    }
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(user_favorites);
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
            Favorites.find({})
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    var user;
                    var user_favorites;
                    if (favorites)
                        user_favorites = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString());
                    if (!user_favorites[0]) {
                        user_favorites = new Favorites({ user: req.user.id });
                        for (let i of req.body) {
                            user_favorites.dishes.push(i._id);
                        }
                    } else {
                        for (let i of req.body) {
                            if (user_favorites.dishes.find((dish) => {
                                    if (dish._id) {
                                        return dish._id.toString() === i._id.toString();
                                    }
                                }))
                                continue;
                            user_favorites.dishes.push(i._id);
                        }
                    }
                    user_favorites.save().then((userFavs) => {
                            res.statusCode = 201;
                            res.setHeader("Content-Type", "application/json");
                            res.json(userFavs);
                            console.log("Favorites Created");
                        }, (err) => next(err))
                        .catch((err) => next(err));

                })
                .catch((err) => next(err));
        })

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                var favsToRemove;
                if (favorites != null) {
                    favsToRemove = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString());
                }
                if (favsToRemove[1] != null) {
                    for (var i = (favsToRemove.length - 1); i >= 0; i--) {
                        favsToRemove[i].remove();
                    }
                    favsToRemove.save()
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
        res.statusCode = 403;
        res.end('GET operation is not supported on /favorites');
    })
    .post(cors.corsWithOptions, authenticate.verifyUser,
        (req, res, next) => {
            Favorites.find({})
                .populate('user')
                .populate('dishes')
                .then((favorites) => {
                    var user_favorites;
                    if (favorites != null)
                        user_favorites = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString());
                    if (user_favorites == null)
                        user_favorites = new Favorites({ user: req.user.id });
                    if (!user_favorites.dishes.find((dish) => {
                            if (dish._id) return dish._id.toString() === req.params.dishId.toString();
                        })) {
                        user_favorites.dishes.push(req.params.dishId);
                        user_favorites.save()
                            .then((userFavs) => {
                                res.statusCode = 201;
                                res.setHeader("Content-Type", "application/json");
                                res.json(userFavs);
                                console.log("Favorites Created");
                            }, (err) => next(err))
                            .catch((err) => next(err));
                    } else {
                        res.statusCode = 403;
                        res.end("this favorite existed");
                    }

                })
                .catch((err) => next(err));
        })

.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation is not supported on /favorites/:dishId');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
        Favorites.find({})
            .populate('user')
            .populate('dishes')
            .then((favorites) => {
                var user_favorites;
                if (favorites) user_favorites = favorites.filter(fav => fav.user._id.toString() === req.user.id.toString());
                if (user_favorites != null) {
                    var existed = false;
                    user_favorites.dishes.forEach((dish) => {
                        if (dish._id.toString() === req.params.dishId) {
                            existed = true;
                            dish.remove();
                            break;
                        }
                    })
                    if (existed) {
                        user_favorites.save()
                            .then((result) => {
                                res.statusCode = 200;
                                res.setHeader("Content-Type", "application/json");
                                res.json(result);
                            }, (err) => next(err));
                    } else {
                        var err = new Error('You do not have this favorite');
                        err.status = 404;
                        return next(err);
                    }

                } else {
                    var err = new Error('You do not have any favorites');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    });

module.exports = favoriteRouter;