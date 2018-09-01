'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var skillSchema = Schema( {
  name: String,
  description: String,
  classCode: String
} );

module.exports = mongoose.model( 'Skill', skillSchema );
