const mongoose = require("mongoose");
const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    club: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    registrationDeadline: {
        type: String,
        required: true
    },
    seats: {
        type: Number,
        default: 0
    }
});
const Event = mongoose.model("Event", eventSchema);
module.exports = Event;