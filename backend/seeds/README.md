# Seeds

SQL migration and seed scripts for the Supabase PostgreSQL database. Run these in order against your Supabase project's SQL editor.

## Scripts

### `001_create_tables.sql`

Creates all database tables with Row Level Security (RLS) policies:

| Table           | Purpose                           |
|-----------------|-----------------------------------|
| `profiles`      | User profiles (linked to `auth.users`) |
| `characters`    | Player characters with all stats  |
| `inventory`     | Character items/equipment         |
| `game_saves`    | Save game states + event history  |
| `events`        | Story event content               |
| `event_history` | Player choice log per save        |

### `002_profile_trigger.sql`

Creates a database trigger that automatically inserts a row into `profiles` when a new user signs up through Supabase Auth.

### `003_seed_events.sql`

Populates the `events` table with the initial dungeon story content — the same events available in guest mode via `EVENTS_DATA`.

## Running

Execute each script in the Supabase Dashboard SQL Editor in numeric order, or use the Supabase CLI:

```bash
supabase db reset   # Runs all migrations
```

## Adding New Events

```sql
INSERT INTO public.events (id, title, description, event_type, options) VALUES
('new_event_id', 'Event Title', 'Description text...', 'story',
'[{"text": "Choice text", "next_event": "next_id", "stat_check": {"stat": "dexterity", "dc": 12}}]');
```

### Option Properties

| Property     | Type   | Description                                |
|--------------|--------|--------------------------------------------|
| `text`       | string | Display text for the choice                |
| `next_event` | string | ID of the next event                       |
| `stat_check` | object | `{stat, dc}` — triggers a d20 roll        |
| `failureEvent` | string | Event ID if stat check fails             |
| `effects`    | object | `{hp, mp, gold, experience, item, [stat]}` |

## Database Schema

### profiles
```sql
id UUID PRIMARY KEY REFERENCES auth.users(id)
username TEXT UNIQUE
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

### characters
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
name TEXT
race TEXT
class TEXT
level INTEGER
experience INTEGER
hp, max_hp, mp, max_mp INTEGER
strength, dexterity, constitution INTEGER
intelligence, wisdom, charisma INTEGER
attack, defense INTEGER
gold INTEGER
status_effects JSONB
created_at, updated_at TIMESTAMPTZ
```

### inventory
```sql
id UUID PRIMARY KEY
character_id UUID REFERENCES characters(id)
item_id TEXT
item_name TEXT
item_type TEXT
quantity INTEGER
is_equipped BOOLEAN
properties JSONB
created_at TIMESTAMPTZ
```

### game_saves
```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users(id)
character_id UUID REFERENCES characters(id)
save_name TEXT
current_event_id TEXT
game_time_seconds INTEGER
game_state JSONB
created_at, updated_at TIMESTAMPTZ
```

### events
```sql
id TEXT PRIMARY KEY
title TEXT
description TEXT
event_type TEXT
options JSONB
requirements JSONB
created_at TIMESTAMPTZ
```

### event_history
```sql
id UUID PRIMARY KEY
save_id UUID REFERENCES game_saves(id)
event_id TEXT
choice_index INTEGER
result_data JSONB
created_at TIMESTAMPTZ
```

## Running Migrations

Scripts are executed through v0's Supabase integration using the
`supabase_apply_migration` tool. They are automatically applied
in order based on the numeric prefix.

## Adding New Events

To add new story content, insert into the events table:

```sql
INSERT INTO public.events (id, title, description, event_type, options) VALUES
('new_event_id', 'Event Title', 'Event description...', 'story',
'[
  {"text": "Choice 1", "next_event": "next_event_id"},
  {"text": "Choice 2", "next_event": "other_event_id", "stat_check": {"stat": "dexterity", "dc": 12}}
]');
```

### Event Option Properties
- `text`: Display text for the choice
- `next_event`: ID of the next event
- `stat_check`: `{stat, dc}` for ability checks
- `condition`: `"check_passed"` or `"check_failed"`
- `effects`: `{hp, mp, gold, experience, [stat]: modifier}`
- `combat`: `{enemy_id}` to trigger combat
- `requirements`: Prerequisites to show the option
