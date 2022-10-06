const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId


const ticketSchema = new mongoose.Schema({
    showId : {
        type: ObjectId,
        required: true
    },
    movieName : {
        type : String,
        required : true
    },
    timeSlot : {
        type : String,
        required : true
    },
    seats : {
        type: Number,
        required: true
    }
    

}, {timestamps : true})

module.exports = mongoose.model('Ticket', ticketSchema)