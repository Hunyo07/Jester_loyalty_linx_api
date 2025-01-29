import Theme from "../models/theme.js";
import Settings from "../models/settings.js";
// Get all themes
const getAllThemes = async (req, res) => {
  try {
    const themes = await Theme.find();
    res.json(themes);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

// Get a specific theme
const getThemeById = async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    res.json(theme);
  } catch (err) {
    res.status(404).send("Theme not found");
  }
};

// Create a new theme
const createTheme = async (req, res) => {
  const { themeName } = req.body;

  // Validate if themeName already exists
  const existingTheme = await Theme.findOne({ themeName });
  if (existingTheme) {
    return res.status(400).send({ message: "Theme name already exists" });
  }

  try {
    const theme = new Theme(req.body);
    await theme.save();
    // res.status(201).json(theme);
    res.status(201).send({ message: "Theme create Succesfully!" });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Update a theme
const updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    // res.json(theme);
    res.status(200).send({ message: "Theme edit Succesfully!" });
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Delete a theme
const deleteTheme = async (req, res) => {
  try {
    // Find the active theme in the settings schema
    const activeSetting = await Settings.findOne({
      activeThemeId: req.params.id,
    });

    if (activeSetting) {
      return res
        .status(400)
        .send({ message: "Cannot delete an active theme!" });
    }

    // If theme is not active, proceed with deletion
    await Theme.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "Theme deleted!" });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const setActiveTheme = async (req, res) => {
  const { activeThemeId } = req.body;
  const settings = await Settings.findOneAndUpdate(
    {},
    { activeThemeId },
    { new: true, upsert: true }
  );
  // res.status(200).json(settings);
  res.status(200).send({ message: "Theme active Succesfully!" });
};

const getActiveTheme = async (req, res) => {
  const settings = await Settings.findOne();
  const activeTheme = await Theme.findById(settings.activeThemeId);
  res.status(200).json(activeTheme);
};

export {
  getAllThemes,
  getThemeById,
  createTheme,
  updateTheme,
  deleteTheme,
  setActiveTheme,
  getActiveTheme,
};
