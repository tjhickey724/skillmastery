'use strict';
const mongoose = require( 'mongoose' );
const Class = require( '../models/Class' );
const User = require( '../models/User' );

console.log("loading the classes Controller")

exports.selectClass = (req,res) => {
  console.log("**** in selectClass *****")
  console.dir(req.params)

  console.dir(req.user.classIds.length)
  Class.findOne({pin:req.params.pin})
    .exec()
    .then((classV)=>{
      if (classV){
        req.session.classV = classV
        res.render('class',{classV:classV})
      } else {
        console.dir(classV)
        res.send("please enter a valid pin, not pin="+req.params.pin)
      }

    })

}

/*
   this looks up the class with the specified pin, or sends an error message
*/
exports.lookupClass = (req,res,next) => {
  console.log('in lookupClass')
  Class.findOne({pin:req.body.pin})
    .exec()
    .then((classV)=> {
      if (classV){
        req.session.classV = classV
        next()
        //res.render('class',{classV:classV})
      } else {
        res.error("please enter a valid course ID")
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

function containsString(list,elt){
  let found=false
  list.forEach(function(e){

    if (JSON.stringify(e)==JSON.stringify(elt)){
      console.log(JSON.stringify(e)+ "=="+ JSON.stringify(elt))
      found=true}
    else {
      console.log(JSON.stringify(e)+ "!="+ JSON.stringify(elt))
    }
  })
  return found
}

exports.addClass = (req,res) => {
  /* We have a class req.classV and need to add it to the user's classes ...
    then return the class page for this class...
  */

  if (! containsString(req.user.classIds,req.session.classV._id )) {
    console.log(JSON.stringify(req.user.classIds,null,2))
    console.log(JSON.stringify(req.session.classV._id))
    console.log('eqtest='+(JSON.stringify(req.session.classV._id) == JSON.stringify(req.user.classIds[0])))

    req.user.classIds.push(req.session.classV._id)
    req.user.save()
      .then( () => {
        res.render('class',{classV:req.session.classV})
      } )
      .catch( error => {
        res.send( error );
      } );
  } else {
    console.log(req.session.classV.code + " is already enrolled")
    res.render('class',{classV:req.session.classV})
  }
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
  if (req.user) {
    Class.find( {_id: req.user.classIds} )
      .exec()
      .then( ( classes ) => {
        res.locals.classes = classes
        //console.dir(res.locals)
        next()
      } )
      .catch( ( error ) => {
        console.log( error.message );
        return [];
        res.error(error.message)
      } )
      .then( () => {
        console.log( 'attachClasses promise complete' );
      } );
  } else {
    next()
  }

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
