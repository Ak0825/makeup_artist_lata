const mongoose = require('mongoose')

var schema = new mongoose.Schema({
    name : { type : String, required:true }, 
    email : {type : String, required:true, unique:true },
    subject : {type : String, required:true },
    message : {type : String, required:true},  
    createdOn: {type: Date, default: Date.now}

})

const ContactTable = mongoose.model('ContactTable', schema)

module.exports = ContactTable