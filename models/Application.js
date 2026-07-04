const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    resume: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        default: "Pending"
    }
});

module.exports = mongoose.model("Application", applicationSchema);
