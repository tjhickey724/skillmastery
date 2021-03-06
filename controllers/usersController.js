'use strict';
const User = require( '../models/User' );
const Evidence = require( '../models/Evidence' );
const mongo = require('mongodb');
console.log("loading the users Controller")
const _ = require("underscore");


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


// this displays all of the skills
exports.getDashboard = ( req, res ) => {
  console.log('\nin getDashboard')
  //const selector = {classIds:res.locals.classId}
  let selector = {student:req.user.googleemail,
                  classCode:res.locals.classV.code,
                  accepted:'Accept'}
  if (res.locals.status=='teacher' || res.locals.status=='ta'){
    selector = {classCode:res.locals.classV.code,accepted:"Accept"}
  }
  console.log("selector="+JSON.stringify(selector,0,null))
  Evidence.aggregate(
   [ {$match:selector}, //{classCode:res.locals.classV.code,accepted:"Accept"}},
     {$group:{
        _id:"$student",
        count: { $sum: 1 },
        skillsMastered: {$push: "$skill"}
        }}
  ])
    .exec()
    .then( (users) => {
      res.render('dashboard',
          {
            users:_.sortBy(users,'_id'),
            _:_
          })
    })
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'getDashboard promise complete' );
    } );
};


exports.getDashboard2 = ( req, res ) => {
  console.log('\nin getDashboard')
  //const selector = {classIds:res.locals.classId}
  let selector = {student:req.user.googleemail,
                  classCode:res.locals.classV.code
                  //,accepted:'Accept'
                }
  if (res.locals.status=='teacher' || res.locals.status=='ta'){
    selector = {classCode:res.locals.classV.code}
  }
  console.log("selector="+JSON.stringify(selector,0,null))
  Evidence.aggregate(
     [
       {$match:selector},
       {$group:{
          _id:'$student',
          count:{$sum:1},
          evidence:{$push:{accept:'$accepted',
                            skill:'$skill',
                            ed:'$evidenceDate',
                            rd:'$reviewDate'
                          }}
       }},
       {$sort:{'skill':1,'evidenceDate':1 }}
  ])
    .exec()
    .then( (users) => {
      //console.log("users[0]")
      //console.log(JSON.stringify(users[0],null,1));
      //console.log("users[0].accepts")
      //console.log(JSON.stringify(getAccepts(users[0].evidence),null,1));
      addAccepts(users)
      res.render('dashboard2',
          {
            users:_.sortBy(users,'numAccepts') //'_id'),
          })
    })
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'getDashboard2 promise complete' );
    } );
};

function addAccepts(users){
  users.forEach(function(u) {
    u.accepts = getAccepts(u.evidence)
    u.numAccepts = u.accepts.length
  })
}

function getAccepts(evidence){
  var accepts =
       _.filter(evidence,
                function(e){return e.accept=="Accept"})
  //console.log("accepts="+JSON.stringify(accepts))
  var skills =
      _.pluck(accepts,'skill')
  //console.log("skills="+JSON.stringify(skills))
  var uniqskills =
      _.uniq(skills)
  return uniqskills
}


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

exports.attachUserByEmail = ( req, res, next ) => {
  console.log('in attachUser')
  const selector={googleemail:req.params.id}
  User.findOne(selector) //{"_id": objId})
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
