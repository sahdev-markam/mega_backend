import mongoose,{Schema} from "mongoose";

const subcriptionSchema = new Schema({
  subcription: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  channel: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
},{timestamps: true})

export const subcription = mongoose.model("Subcription", subcriptionSchema)