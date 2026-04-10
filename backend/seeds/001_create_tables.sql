-- Truth of Abyss Database Schema
-- Users profile table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  -- Core Stats
  hp INTEGER NOT NULL,
  max_hp INTEGER NOT NULL,
  mp INTEGER DEFAULT 0,
  max_mp INTEGER DEFAULT 0,
  -- Attributes
  strength INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  wisdom INTEGER NOT NULL,
  charisma INTEGER NOT NULL,
  -- Combat Stats
  attack INTEGER NOT NULL,
  defense INTEGER NOT NULL,
  -- Resources
  gold INTEGER DEFAULT 100,
  -- Status Effects (stored as JSON array)
  status_effects JSONB DEFAULT '[]',
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory/Bag system
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL, -- weapon, armor, consumable, misc
  quantity INTEGER DEFAULT 1,
  is_equipped BOOLEAN DEFAULT FALSE,
  properties JSONB DEFAULT '{}', -- Store item stats/effects
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game saves table
CREATE TABLE IF NOT EXISTS public.game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  save_name TEXT NOT NULL,
  current_event_id TEXT,
  game_time_seconds INTEGER DEFAULT 0,
  game_state JSONB DEFAULT '{}', -- Additional game state data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events table (for story events)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL, -- story, combat, shop, rest, random
  options JSONB NOT NULL, -- Array of choice options
  requirements JSONB DEFAULT '{}', -- Conditions to trigger event
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event history (track player choices)
CREATE TABLE IF NOT EXISTS public.event_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  save_id UUID NOT NULL REFERENCES public.game_saves(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  choice_index INTEGER NOT NULL,
  result_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for characters
CREATE POLICY "characters_select_own" ON public.characters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "characters_insert_own" ON public.characters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "characters_update_own" ON public.characters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "characters_delete_own" ON public.characters FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for inventory
CREATE POLICY "inventory_select_own" ON public.inventory FOR SELECT 
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
CREATE POLICY "inventory_insert_own" ON public.inventory FOR INSERT 
  WITH CHECK (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
CREATE POLICY "inventory_update_own" ON public.inventory FOR UPDATE 
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));
CREATE POLICY "inventory_delete_own" ON public.inventory FOR DELETE 
  USING (character_id IN (SELECT id FROM public.characters WHERE user_id = auth.uid()));

-- RLS Policies for game_saves
CREATE POLICY "saves_select_own" ON public.game_saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "saves_insert_own" ON public.game_saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "saves_update_own" ON public.game_saves FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "saves_delete_own" ON public.game_saves FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for event_history
CREATE POLICY "history_select_own" ON public.event_history FOR SELECT 
  USING (save_id IN (SELECT id FROM public.game_saves WHERE user_id = auth.uid()));
CREATE POLICY "history_insert_own" ON public.event_history FOR INSERT 
  WITH CHECK (save_id IN (SELECT id FROM public.game_saves WHERE user_id = auth.uid()));

-- Events table is public read (game content)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events_select_all" ON public.events FOR SELECT TO authenticated USING (true);
