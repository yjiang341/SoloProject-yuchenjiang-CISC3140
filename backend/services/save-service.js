/**
 * Save Service
 * Handles game save/load operations
 */

import { createClient } from 'backend/supabase/client'

// Create a new game save
export async function createSave(userId, characterId, saveName, gameState = {}) {
  const supabase = createClient()
  
  const save = {
    user_id: userId,
    character_id: characterId,
    save_name: saveName,
    current_event_id: gameState.currentEventId || 'start_awakening',
    game_time_seconds: gameState.gameTime || 0,
    game_state: {
      eventHistory: gameState.eventHistory || [],
      flags: gameState.flags || {},
      ...gameState,
    },
  }
  
  const { data, error } = await supabase
    .from('game_saves')
    .insert(save)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get all saves for a user
export async function getUserSaves(userId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_saves')
    .select(`
      *,
      characters (
        name,
        class,
        race,
        level
      )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  
  if (error) throw error
  return data
}

// Get a specific save
export async function getSave(saveId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_saves')
    .select(`
      *,
      characters (*)
    `)
    .eq('id', saveId)
    .single()
  
  if (error) throw error
  return data
}

// Update a save
export async function updateSave(saveId, updates) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_saves')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', saveId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Delete a save
export async function deleteSave(saveId) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('game_saves')
    .delete()
    .eq('id', saveId)
  
  if (error) throw error
  return true
}

// Auto-save (quick save)
export async function autoSave(saveId, gameState) {
  return updateSave(saveId, {
    current_event_id: gameState.currentEventId,
    game_time_seconds: gameState.gameTime,
    game_state: gameState,
  })
}

// Record event history
export async function recordEventChoice(saveId, eventId, choiceIndex, resultData = {}) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_history')
    .insert({
      save_id: saveId,
      event_id: eventId,
      choice_index: choiceIndex,
      result_data: resultData,
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Get event history for a save
export async function getEventHistory(saveId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('event_history')
    .select('*')
    .eq('save_id', saveId)
    .order('created_at', { ascending: true })
  
  if (error) throw error
  return data
}

// Get the latest save for a character
export async function getLatestSave(characterId) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('character_id', characterId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
  return data
}

// Check if character has any saves
export async function characterHasSaves(characterId) {
  const supabase = createClient()
  
  const { count, error } = await supabase
    .from('game_saves')
    .select('*', { count: 'exact', head: true })
    .eq('character_id', characterId)
  
  if (error) throw error
  return count > 0
}
