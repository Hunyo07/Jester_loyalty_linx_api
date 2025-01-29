import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  activeThemeId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Theme = mongoose.model("Settings", settingsSchema);
export default Theme;
