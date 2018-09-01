'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;

var skillSchema = Schema( {
  _id: Schema.Types.ObjectId,
  name: String,
  description: String
} );

module.exports = mongoose.model( 'Skill', skillSchema );
