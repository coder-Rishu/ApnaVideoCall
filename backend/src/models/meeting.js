import mongoose, {Schema} from "mongoose";

const meetingSchema = new Schema({
    userId: {type: String},
    meetingId: {type: String, required: true},
    date: {type: Date, default: Date.now, required: true}
})

const Meetings = mongoose.model("Meeting", meetingSchema);

export default Meetings;