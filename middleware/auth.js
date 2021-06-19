"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when a user must be logged in
 * as an admin.
 * 
 * If not, raises unauthorized
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) {
      throw new UnauthorizedError()
    }
    return next()
  }

  catch(err) {
    return next(err)
  }
}

/** Middleware to use when a valid token must be provided and it must be matching user provided in route param
 * 
 * Otherwise, raises unauthorized
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user
    // if any other condition is met besides the user existing and that user being either an admin or matching the param user, the error is thrown
    if (!(user && (user.isAdmin || user.username === req.params.username))) {
      throw new UnauthorizedError()
    }
    return next()
  }

  catch(err) {

  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
};
