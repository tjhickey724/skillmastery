'use strict';
const Evidence = require( '../models/Evidence' );
var mongo = require('mongodb');
console.log("loading the Evidence Controller")


// this displays all of the skills
exports.getAllEvidence = ( req, res ) => {
  console.log('in getAllEvidence')
  console.dir(req.user)
  console.log(req.user.googleemail != 'tjhickey@brandeis.edu')
  let selector = {student:req.user.googleemail,classCode:res.locals.classV.code}
  if (res.locals.status=='teacher' || res.locals.status=='ta'){
    selector = {classCode:res.locals.classV.code}
  }
  Evidence.find( selector )
    .sort({taEmail:1,accepted:1})
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
  Evidence.find( {student:res.locals.student.googleemail,classCode:res.locals.classV.code} )
    .sort({classCode:1, students:1, skill:1})
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
      //console.dir(evidence)
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
    evidenceDate: new Date(),
    description: req.body.description,
    classCode: res.locals.classV.code,
    taEmail:req.user.taEmail,
    accepted: "awaiting review",
    review: "no review yet",
    reviewerEmail: "none"

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


  exports.updateEvidence = ( req, res ) => {
    //console.log("in saveSkill!")
    //console.dir(q)
    Evidence.findById(req.body.evidenceId)
      .then((evidence)=>{
        console.log('updating evidence: '+evidence)
        console.log('\n\n here are the parameters!')
        console.dir(req.body)
        evidence.accepted=req.body.submit;
        evidence.review = req.body.taReview;
        evidence.reviewDate = new Date();
        evidence.reviewerEmail = req.body.reviewerEmail;
        console.log('updated evidence locally: '+evidence)
        evidence.save()
          .then( () => {
            console.log('updated evidence has been saved! ')
            res.redirect('/evidence');
          })
          .catch( error => {
            res.send("error in saving evidence: "+error)
          })

      })
      .catch(error => {
        res.send("error in finding evidence by Id: "+error)
      })
      .then(() => {
        console.log('evidence update promise complete!')
      })
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
