'use strict';
const Evidence = require( '../models/Evidence' );
var mongo = require('mongodb');
console.log("loading the Evidence Controller")


// this displays all of the skills
exports.getAllEvidence = ( req, res ) => {
  console.log('in getAllEvidence')
  console.dir(req.user)
  console.log(req.user.googleemail != 'tjhickey@brandeis.edu')
  let selector = {}
  if (req.user.googleemail != 'tjhickey@brandeis.edu'){
    selector = {student:req.user.googleemail}
  }
  Evidence.find( selector )
    .exec()
    .then( ( evidence ) => {
      console.dir(evidence)
      res.render( 'evidence', {
        evidence: evidence,
        user:req.user,
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'evidence promise complete' );
    } );
};


exports.attachEvidence = ( req, res, next ) => {
  console.log('in attachEvidence')
  Evidence.find( {student:res.locals.user.googleemail} )
    .exec()
    .then( ( evidence ) => {
      res.locals.evidence = evidence
      next()
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'attachEvidence promise complete' );
    } );
};

exports.getEvidenceItem = ( req, res, next ) => {
  console.log('in getEvidenceItem')
  const objId = new mongo.ObjectId(req.params.id)
  Evidence.findOne(objId) //{"_id": objId})
    .exec()
    .then( ( evidence ) => {
      console.dir(evidence)
      res.render('evidenceItem',{e:evidence})
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'attachOneEvidence promise complete' );
    } );
};




exports.saveEvidence = ( req, res ) => {
  //console.log("in saveSkill!")
  //console.dir(q)
  console.log('in saveEvidence')
  let newEvidence = new Evidence( {
    student: req.body.student,
    skill: req.body.skill,
    evidence: req.body.evidence,
    description: req.body.description,
  } )

  //console.log("skill = "+newSkill)

  newEvidence.save()
    .then( () => {
      res.redirect( '/evidence' );
    } )
    .catch( error => {
      res.send( error );
    } )
  }


exports.deleteEvidence = (req, res) => {
  console.log("in deleteEvidence")
  let evidenceName = req.body.evidenceID
  if (typeof(evidenceName)=='string') {
      Evidence.deleteOne({_id:evidenceName})
           .exec()
           .then(()=>{res.redirect('/evidence')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(evidenceName)=='object'){
      Evidence.deleteMany({_id:{$in:evidenceName}})
           .exec()
           .then(()=>{res.redirect('/evidence')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(evidenceName)=='undefined'){
      console.log("This is if they didn't select a skill")
      res.redirect('/evidence')
  } else {
    console.log("This shouldn't happen!")
    res.send(`unknown evidenceName: ${evidenceName}`)
  }
}
