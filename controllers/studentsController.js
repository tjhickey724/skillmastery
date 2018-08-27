'use strict';
const Student = require( '../models/Student' );
console.log("loading the skills Controller")


// this displays all of the skills
exports.getAllStudents = ( req, res ) => {

  Student.find( {} )
    .exec()
    .then( ( studentData ) => {
      console.log("in getAllStudents")
      console.dir(studentData)
      console.log(studentData.count)
      res.render( 'students', {
        studentsList: studentData,
        version: "1.0",
        date: new Date()
      } );
    } )
    .catch( ( error ) => {
      console.log( error.message );
      return [];
    } )
    .then( () => {
      console.log( 'student promise complete' );
    } );
};
