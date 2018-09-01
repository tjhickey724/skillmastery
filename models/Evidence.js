'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var evidenceSchema = Schema( {
  _id: Schema.Types.ObjectId,
  student: String,
  skill: String,
  evidence: String,
  description: String
} );

module.exports = mongoose.model( 'Evidence', evidenceSchema );
