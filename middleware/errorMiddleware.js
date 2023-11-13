var express = require('express');

const notFoundMiddleware = (req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
  };
  
  const errorHandler = (err, req, res, next) => {
    const status = err.status || 500;
  
    if (status === 404) {
      res.status(404).render('error');
    } else {
      res.status(status).json({
        error: {
          message: err.message,
          status: status,
        },
      });
    }
  };
  
  module.exports = { notFoundMiddleware, errorHandler };