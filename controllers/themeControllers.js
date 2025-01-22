import Theme from "../models/theme.js";

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
  try {
    const theme = new Theme(req.body);
    await theme.save();
    res.status(201).json(theme);
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
    res.json(theme);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

// Delete a theme
const deleteTheme = async (req, res) => {
  try {
    await Theme.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export { getAllThemes, getThemeById, createTheme, updateTheme, deleteTheme };
