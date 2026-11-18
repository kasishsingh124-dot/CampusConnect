const mongoose = require("mongoose");
const clubSchema = new mongoose.Schema({
    name: {
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
    members: {
        type: Number,
        default: 0
    },
    recruitmentOpen: {
        type: Boolean,
        default: false
    },
    recruitmentDeadline: {
        type: String,
        default: ""
    }
});
const Club =
    mongoose.model("Club", clubSchema);
module.exports = Club;