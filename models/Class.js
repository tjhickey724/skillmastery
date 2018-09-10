'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var classSchema = Schema( {
  semester: String,
  code: String,
  pin: String,
  tas: [Schema.Types.ObjectId], // user_ids for tas
  ownerEmail: String
} );

module.exports = mongoose.model( 'Class', classSchema );
