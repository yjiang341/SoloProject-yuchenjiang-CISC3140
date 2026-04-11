const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();

// Import services
const characterService = require("./services/character-service.js");
const dndApi = require("./services/dnd-api.js");
const saveService = require("./services/save-service.js");
const eventService = require("./services/event-service.js");
const gameEngine = require("./services/game-engine.js");

// *** middleware ***
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// *** API ROUTES ***

// =============================================================================
// GAME CONFIG ENDPOINTS
// =============================================================================

// GET /api/config/game - Returns game configuration
app.get("/api/config/game", (req, res) => {
  try {
    res.json({
      standardArray: characterService.STANDARD_ARRAY,
      raceBonuses: characterService.RACE_BONUSES,
      classInfo: characterService.CLASS_INFO,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// CHARACTER ENDPOINTS
// =============================================================================

// POST /api/characters - Create a new character
app.post("/api/characters", async (req, res) => {
  try {
    const { userId, character } = req.body;
    
    if (!userId || !character) {
      return res.status(400).json({ error: "Missing userId or character data" });
    }

    const newCharacter = await characterService.createCharacter(userId, character);
    res.status(201).json(newCharacter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/characters/:userId - Get all characters for a user
app.get("/api/characters/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    const characters = await characterService.getUserCharacters(userId);
    res.json(characters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/characters/:characterId/single - Get a single character
app.get("/api/characters/:characterId/single", async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const character = await characterService.getCharacter(characterId);
    res.json(character);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/characters/:characterId - Update a character
app.put("/api/characters/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    const updates = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const updatedCharacter = await characterService.updateCharacter(characterId, updates);
    res.json(updatedCharacter);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/characters/:characterId - Delete a character
app.delete("/api/characters/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    await characterService.deleteCharacter(characterId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// INVENTORY ENDPOINTS
// =============================================================================

// GET /api/characters/:characterId/inventory - Get character inventory
app.get("/api/characters/:characterId/inventory", async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const inventory = await characterService.getCharacterInventory(characterId);
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/characters/:characterId/inventory - Add item to inventory
app.post("/api/characters/:characterId/inventory", async (req, res) => {
  try {
    const { characterId } = req.params;
    const item = req.body;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const result = await characterService.addItemToInventory(characterId, item);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// PUT /api/characters/:characterId/inventory/:itemId - Toggle equip status
app.put("/api/characters/:characterId/inventory/:itemId", async (req, res) => {
  try {
    const { characterId, itemId } = req.params;
    const { is_equipped } = req.body;
    
    if (!characterId || !itemId) {
      return res.status(400).json({ error: "Missing characterId or itemId" });
    }

    const updatedItem = await characterService.toggleEquipItem(itemId, is_equipped);
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/characters/:characterId/inventory/:itemId - Remove item from inventory
app.delete("/api/characters/:characterId/inventory/:itemId", async (req, res) => {
  try {
    const { characterId, itemId } = req.params;
    
    if (!characterId || !itemId) {
      return res.status(400).json({ error: "Missing characterId or itemId" });
    }

    await characterService.removeItemFromInventory(itemId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// =============================================================================
// GAME SAVE ENDPOINTS
// =============================================================================

// POST /api/saves - Create a new game save
app.post("/api/saves", async (req, res) => {
  try {
    const { userId, characterId, saveName, gameState } = req.body;
    
    if (!userId || !characterId) {
      return res.status(400).json({ error: "Missing userId or characterId" });
    }

    const save = await saveService.createSave(userId, characterId, saveName, gameState);
    res.status(201).json(save);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saves/:characterId - Get saves for a character
app.get("/api/saves/:characterId", async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const saves = await saveService.getSaves(characterId);
    res.json(saves);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/saves/:characterId/latest - Get latest save
app.get("/api/saves/:characterId/latest", async (req, res) => {
  try {
    const { characterId } = req.params;
    
    if (!characterId) {
      return res.status(400).json({ error: "Missing characterId" });
    }

    const save = await saveService.getLatestSave(characterId);
    res.json(save);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/saves/:saveId - Update a game save
app.put("/api/saves/:saveId", async (req, res) => {
  try {
    const { saveId } = req.params;
    const updates = req.body;
    
    if (!saveId) {
      return res.status(400).json({ error: "Missing saveId" });
    }

    const updatedSave = await saveService.updateSave(saveId, updates);
    res.json(updatedSave);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// D&D API HELPERS
// =============================================================================

// GET /api/dnd/ability-modifier/:score - Get ability modifier
app.get("/api/dnd/ability-modifier/:score", (req, res) => {
  try {
    const { score } = req.params;
    const modifier = dndApi.getAbilityModifier(parseInt(score));
    res.json({ score: parseInt(score), modifier });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/dnd/format-modifier/:modifier - Format modifier string
app.get("/api/dnd/format-modifier/:modifier", (req, res) => {
  try {
    const { modifier } = req.params;
    const formatted = dndApi.formatModifier(parseInt(modifier));
    res.json({ modifier: parseInt(modifier), formatted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// GAME ENGINE ENDPOINTS
// =============================================================================

// POST /api/game/roll-dice - Roll dice with notation
app.post("/api/game/roll-dice", (req, res) => {
  try {
    const { diceNotation } = req.body;
    
    if (!diceNotation) {
      return res.status(400).json({ error: "Missing diceNotation" });
    }

    const result = gameEngine.rollDice(diceNotation);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/game/process-choice - Process an event choice
app.post("/api/game/process-choice", (req, res) => {
  try {
    const { character, event, choiceIndex, previousCheckResult } = req.body;
    
    if (!character || !event || choiceIndex === undefined) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const result = eventService.processChoice(character, event, choiceIndex, previousCheckResult);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =============================================================================
// HEALTH CHECK
// =============================================================================

app.get("/", (req, res) => {
  res.json({
    message: "Truth of Abyss API Server",
    status: "running",
    version: "1.0.0",
  });
});

// *** PORT Settings ***
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Listening on ${PORT}`);
});