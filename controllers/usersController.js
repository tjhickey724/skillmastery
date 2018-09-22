'use strict';
const User = require( '../models/User' );
const mongo = require('mongodb');
console.log("loading the users Controller")


// this displays all of the skills
exports.getAllUsers = ( req, res ) => {
  console.log('\nin getAllUsers')
  //const selector = {classIds:res.locals.classId}
  const selector = {classCodes:res.locals.classV.code}
  console.log("selector="+JSON.stringify(selector,0,null))
  User.find( selector )
    .sort({taEmail:1,googlename:1})
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
        student: user
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
      res.locals.student = user
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

exports.updateTA = (req,res,next) => {
  console.log("in updateTA")
  let taSelect = req.body.taSelect
  if (typeof(taSelect)=='string') {
      User.update({_id:taSelect},{taEmail:req.user.googleemail},{multi:true})
           .exec()
           .then(()=>{res.redirect('/users')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(taSelect)=='object'){
    User.update({_id:{$in:taSelect}},{taEmail:req.user.googleemail},{multi:true})
         .exec()
         .then(()=>{res.redirect('/users')})
         .catch((error)=>{res.send(error)})
  } else if (typeof(taSelect)=='undefined'){
      console.log("This is if they didn't select any students")
      res.redirect('/users')
  } else {
    console.log("This shouldn't happen!")
    res.send(`unknown values for taSelect: ${taSelect}`)
  }

}
