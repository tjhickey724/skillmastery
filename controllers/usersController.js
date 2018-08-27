'use strict';
const User = require( '../models/User' );
const mongo = require('mongodb');
console.log("loading the users Controller")


// this displays all of the skills
exports.getAllUsers = ( req, res ) => {
  console.log('in getAllUsers')
  User.find( {} )
    .exec()
    .then( ( users ) => {
      res.render( 'users', {
        users: users
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'getUsers promise complete' );
    } );
};

exports.getUser = ( req, res ) => {
  console.log("in getUser")
  const objId = new mongo.ObjectId(req.params.id)
  User.findOne(objId) //{"_id": objId})
    .exec()
    .then( ( user ) => {
      res.render( 'user', {
        user: user
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'getUser promise complete' );
    } );
};

exports.attachUser = ( req, res, next ) => {
  console.log('in attachUser')
  const objId = new mongo.ObjectId(req.params.id)
  User.findOne(objId) //{"_id": objId})
    .exec()
    .then( ( user ) => {
      res.locals.user = user
      next()
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'attachUser promise complete' );
    } );
};
