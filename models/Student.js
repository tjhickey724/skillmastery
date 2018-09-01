'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var studentSchema = Schema( {
  _id: Schema.Types.ObjectId,
  name: String,
  unetid: String
} );

module.exports = mongoose.model( 'Student', studentSchema );
