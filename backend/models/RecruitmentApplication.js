const mongoose = require("mongoose");
const recruitmentApplicationSchema = new mongoose.Schema({
    clubId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Club",
        required: true
    },
    clubName: {
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
    skills: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending"
    }

}, {
    timestamps: true
});
const RecruitmentApplication =
    mongoose.model(
        "RecruitmentApplication",
        recruitmentApplicationSchema
    );
module.exports = RecruitmentApplication;