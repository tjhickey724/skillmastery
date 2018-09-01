'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var classSchema = Schema( {
  _id: Schema.Types.ObjectId,
  semester: String,
  code: String,
  pin: String,
  ownerEmail: String
} );

module.exports = mongoose.model( 'Class', classSchema );
