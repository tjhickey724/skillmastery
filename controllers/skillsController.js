'use strict';
const Skill = require( '../models/Skill' );
console.log("loading the skills Controller")


// this displays all of the skills
exports.getAllSkills = ( req, res ) => {
  console.log('in getAllSkills')
  Skill.find( {classCode:req.session.classV.code} )
    .exec()
    .then( ( skills ) => {
      res.render( 'skills', {
        skills: skills
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'skill promise complete' );
    } );
};


exports.attachSkills = ( req, res, next ) => {
  console.log('in attachSkills')
  Skill.find( {classCode:req.session.classV.code} )
    .exec()
    .then( ( skills ) => {
      res.locals.skills = skills
      console.dir(res.locals)
      next()
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'skill promise complete' );
    } );
};



exports.saveSkill = ( req, res ) => {
  console.log("in saveSkill!")
  //console.dir(req)
  let newSkill = new Skill( {
    name: req.body.name,
    description: req.body.description,
    classCode: req.session.classV.code
  } )

  //console.log("skill = "+newSkill)

  newSkill.save()
    .then( () => {
      res.redirect( '/skills' );
    } )
    .catch( error => {
      res.send( error );
    } );
};

exports.deleteSkill = (req, res) => {
  console.log("in deleteSkill")
  let skillName = req.body.deleteName
  if (typeof(skillName)=='string') {
      Skill.deleteOne({name:skillName,classCode:req.session.classV.code})
           .exec()
           .then(()=>{res.redirect('/skills')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(skillName)=='object'){
      Skill.deleteMany({name:{$in:skillName},classCode:req.session.classV.code})
           .exec()
           .then(()=>{res.redirect('/skills')})
           .catch((error)=>{res.send(error)})
  } else if (typeof(skillName)=='undefined'){
      console.log("This is if they didn't select a skill")
      res.redirect('/skills')
  } else {
    console.log("This shouldn't happen!")
    res.send(`unknown skillName: ${skillName}`)
  }

};
