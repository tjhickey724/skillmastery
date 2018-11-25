'use strict';
const mongoose = require( 'mongoose' );
const Class = require( '../models/Class' );
const User = require( '../models/User' );

console.log("loading the classes Controller")

exports.selectClass = (req,res) => {
  console.log("**** in selectClass *****")
  console.dir(req.params)

  console.dir(req.user.classIds.length)
  Class.findOne({$or:[{pin:req.params.pin},{tapin:req.params.pin}]})
    .exec()
    .then((classV)=>{
      if (classV){
        req.session.classV = classV
        req.session.isTA = (classV.tapin == req.params.pin)
	res.locals.classV = classV
        res.render('class')
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
  console.log('\nin lookupClass:'+req.params.pin)
  console.dir(req.params)
  console.log("is req.params ...\n\n")
  const thePin = req.params.pin || req.body.pin
  Class.findOne({pin:thePin})
    .exec()
    .then((classV)=> {
      if (classV){
	console.log('found a class:'+classV.pin+" "+classV)
        req.session.classV = classV
        next()
        //res.render('class',{classV:classV})
      } else{
        res.error("please enter a valid course ID")
      }

    })
    .catch((error)=>{
      console.log("Error in lookupClass")
      console.log(error.message)
      return []
    })
    .then( ()=>{
      console.log('lookupClass promise complete')
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
  req.user.classCodes = req.user.classCodes || []
  console.log("in addclass");
  console.log("req.session.classV._id = "+req.session.classV._id)
  console.log("req.user.classIds="+req.user.classIds)
  console.log("req.user.classCodes="+req.user.classCodes)

  if (! containsString(req.user.classCodes,req.session.classV.code )) {

    //req.user.classIds.push(req.session.classV._id)

    req.user.classCodes.push(req.session.classV.code)
    req.user.save()
      .then( () => {
        res.render('class',{classV:req.session.classV})
      } )
      .catch( error => {
        res.send( error );
      } );
  } else {
    console.log("\n\n"+req.session.classV.code + " is already enrolled")
    res.render('class',{classV:req.session.classV})
  }
}

// this displays all of the classes
exports.getAllClasses = ( req, res ) => {
  console.log('in getAllClasses')
  Class.find( {ownerEmail:req.user.googleemail} )
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
    Class.find( {$or:[{code: req.user.classCodes}] })
      .exec()
      .then( ( classes ) => {
        res.locals.classes = classes
        //console.dir(res.locals)
        next()
      } )
      .catch( ( error ) => {
        console.log("Error in attachClasses")
        console.log( error.message );
        return [];
        res.error(error.message)
      } )
      //.then( () => {
      //  console.log( 'attachClasses promise complete' );
      //} );
  } else {
    next()
  }

};

exports.checkUnique = (req,res,next) => {
  Class.find({code:req.body.code})
    .exec()
    .then((classes) => {
      if (classes.length==0) {
        next()
      } else {
        res.send(req.body.code+" is already taken")
      }
    })
    .catch((error)=> {res.send(error)})
    .then(() => console.log('checkunique promise is complete!'))
}

exports.saveClass = ( req, res ) => {
  console.log("in saveClass!")
  console.dir(req.user)
  console.log("req.user._id is ")
  console.dir(req.user._id)
  //console.dir(req)
  let newcode = 1000000+Math.floor(8999999*Math.random())
  let newcode2 = 1000000+Math.floor(8999999*Math.random())
  let newClass = new Class( {
    code: req.body.code,
    pin: newcode,
    tapin: newcode2,
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
