'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var evidenceSchema = Schema( {
  student: String,
  skill: String,
  evidence: String,
  evidenceDate: Date,
  description: String,
  classCode: String,
  taEmail: String,
  accepted: String,
  review: String,
  reviewDate: Date,
  reviewerEmail: String
} );

module.exports = mongoose.model( 'Evidence', evidenceSchema );
