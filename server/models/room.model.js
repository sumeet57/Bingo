// server/models/room.model.js
import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    claims: { type: Number, default: 0 },
    ticket: { type: Number, required: true },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    winner: { type: [String], default: [] },
    players: { type: [playerSchema], default: [] },
  },
  { timestamps: true }
);

const RoomModel = mongoose.model("RoomGame", roomSchema);
export default RoomModel;
