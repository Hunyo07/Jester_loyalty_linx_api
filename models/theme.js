import mongoose from "mongoose";

const themeSchema = new mongoose.Schema({
  themeName: { type: String, required: true },
  primaryColor: { type: String, required: true },
  secondaryColor: { type: String, required: true },
  textColor: { type: String, required: true },
  backgroundColor: { type: String, required: true },
  themeLogo: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Theme = mongoose.model("Theme", themeSchema);
export default Theme;
