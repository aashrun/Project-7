const userModel = require("../models/userModel.js")
const movieModel = require("../models/movieModel.js")
const ticketModel = require("../models/ticketModel.js")
const validation = require("../validations/validator.js")
const showModel = require("../models/showModel.js")




//====================================  Booking Tickets  ===========================================//

const bookTicket = async function (req, res){
    try{
        let userId = req.params.userId
        let body = req.body
        let {movieName, timeSlot, seats, showId} = body

        if(!validation.idMatch(userId)) return res.status(400).send({status: false, message: "Invalid userId!"})
        let user = await userModel.findOne({_id: userId})
        if(!user) return res.status(404).send({status: false, message: "User not found"})


        if(!validation.idMatch(showId)) return res.status(400).send({status: false, message: "Invalid showId!"})
        let currShow = await showModel.findOne({_id: showId})
        if(!currShow) return res.status(404).send({status: false, message: "Show not found"})


        if(!movieName) return res.status(400).send({status: false, message: "Movie's name is a mandatory input!"})
        if(!validation.isValid(movieName)) return res.status(400).send({status: false, message: "The input string cannot be empty!"})

        let movie = await movieModel.findOne({movieName: movieName})
        if(!movie) {
            return res.status(404).send({status: false, message: "Movie not found!"})
        }else{
            let shows = await showModel.findOne({movieId: movie._id})
            let slots = shows.timeSlotsAndSeats // object

            let isBelowThreshold = (currentValue) => currentValue == 0;
            let values = Object.values(slots)
            if(values.every(isBelowThreshold)) return res.status(403).send({status: false, message: "No timeslots available for this movie!"})

            if(!timeSlot) return res.status(400).send({status: false, message: "Please provide with your desired timings!"})
            if(!seats) return res.status(400).send({status: false, message: "Please provide number of seats!"})

            for(let keys in slots){
               if(keys == timeSlot){
                if(slots[keys] > seats){
                let data = slots[keys] - seats
                 await showModel.findOneAndUpdate({_id: shows._id}, {timeSlotsAndSeats: data})
                }else{
                    return res.send(404).send({status: false, message: "No seats available for this time"})
                }
               }
                return res.send(404).send({status: false, message: "No slot available for this time"})
               
            }

        }

        let create = await ticketModel.create(body)
        res.send(201).send({status: true, message: `Movie ticket successfully booked for ${seats} person/s!`, data: create})

    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
};











//====================================  Rescheduling Tickets  ===========================================//

const updateTicket = async function (req, res){
    try{
        let userId = req.params.userId
        let ticketId = req.params.ticketId
        let body = req.body
        let {timeSlot, seats, showId} = body


        if(!validation.idMatch(userId)) return res.status(400).send({status: false, message: "Invalid userId!"})
        let user = await userModel.findOne({_id: userId})
        if(!user) return res.status(404).send({status: false, message: "User not found"})

        if(!validation.idMatch(ticketId)) return res.status(400).send({status: false, message: "Invalid ticketId!"})
        let ticket = await ticketModel.findOne({_id: ticketId})
        if(!ticket) return res.status(404).send({status: false, message: "Ticket not found"})


     
            if(timeSlot == ticket.timeSlot) return res.status(403).send({status: false, message: "The time slot you've mentioned is the same as you current ticket's time slot!"})

            let show = showModel.findOne({_id: showId})
            let obj = show.timeSlotsAndSeats

            for(let keys in obj){
                if(keys == timeSlot){
                    if(obj[keys] > seats){
                        let data =  obj[keys] - seats
                        await showModel.findOneAndUpdate({_id: show._id}, {timeSlotsAndSeats: data})
                        res.status(200).send({status: true, message: "Ticket successfully updated!"})
                    }else{
                       return res.status(400).send({status: false, message: "No seats available with this time slot!"})
                    }
                }
            }
           return res.status(404).send({status: false, message: "No slot found with this time!"})
        

        


    }catch(error){
        res.status(500).send({status: false, message: error.message})
    }
}



module.exports = {bookTicket, updateTicket}