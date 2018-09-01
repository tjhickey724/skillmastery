'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var evidenceSchema = Schema( {
  student: String,
  skill: String,
  evidence: String,
  description: String
} );

module.exports = mongoose.model( 'Evidence', evidenceSchema );
