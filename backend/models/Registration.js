const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({

    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },

    eventName: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    course: {
        type: String,
        required: true
    },

    year: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

const Registration =
    mongoose.model("Registration", registrationSchema);

module.exports = Registration;