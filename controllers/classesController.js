'use strict';
const mongoose = require( 'mongoose' );
const Class = require( '../models/Class' );
console.log("loading the classes Controller")


exports.addClass = (req,res) => {
  console.log('in addClass')
  Class.findOne({pin:req.body.pin})
    .exec()
    .then((classV)=> {
      if (classV){
        req.session.classV = classV
        res.render('class',{classV:classV})
      } else {
        res.send("please enter a valid course ID")
      }

    })
    .catch((error)=>{
      console.log(error.message)
      return []
    })
    .then( ()=>{
      console.log('addClass promise complete')
    })
}

// this displays all of the classes
exports.getAllClasses = ( req, res ) => {
  console.log('in getAllClasses')
  Class.find( {} )
    .exec()
    .then( ( classes ) => {
      res.render( 'classes', {
        classes:classes
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'getAllClasses promise complete' );
    } );
};


exports.attachClasses = ( req, res, next ) => {
  console.log('in attachClasses')
  Class.find( {} )
    .exec()
    .then( ( classes ) => {
      res.locals.classes = classes
      console.dir(res.locals)
      next()
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'attachClasses promise complete' );
    } );
};



exports.saveClass = ( req, res ) => {
  console.log("in saveClass!")
  console.dir(req.user)
  console.log("req.user._id is ")
  console.dir(req.user._id)
  //console.dir(req)
  let newcode = 1000000+Math.floor(8999999*Math.random())
  let newClass = new Class( {
    code: req.body.code,
    pin: newcode,
    ownerEmail: req.user.googleemail
  } )

  console.dir("class = "+newClass)

  newClass.save()
    .then( () => {
      res.redirect( '/classes' );
    } )
    .catch( error => {
      res.send( error );
    } );
};

exports.deleteClass = (req, res) => {
  console.log("in deleteClass")
  let classCode = req.body.deleteCode
  console.dir(classCode)
  if (typeof(classCode)=='string') {
      Class.deleteOne({code:classCode})
           .exec()
           .then(()=>{res.redirect('/classes')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(classCode)=='object'){
      Class.deleteMany({code:{$in:classCode}})
           .exec()
           .then(()=>{res.redirect('/classes')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(classCode)=='undefined'){
      console.log("This is if they didn't select a class")
      res.redirect('/classes')
  } else {
    console.log("This shouldn't happen!")
    res.send(`unknown className: ${classCode}`)
  }

};
