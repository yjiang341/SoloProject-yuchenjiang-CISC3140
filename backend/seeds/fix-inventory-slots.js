/**
 * One-time migration: fix item_type and properties.slot for all inventory rows
 * based on D&D 5e conventions and item name/id patterns.
 *
 * Run: node backend/seeds/fix-inventory-slots.js
 */
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// ----------------------------------------------------------------
// Slot / type rules — mirrors D&D 5e API + equipment-panel logic
// ----------------------------------------------------------------

/** Known item overrides by exact item_id */
const OVERRIDES_BY_ID = {
  // Shields (held, not worn)
  'shield':           { item_type: 'armor',     slot: 'off_hand', allowed_slots: ['main_hand', 'off_hand'] },
  'buckler':          { item_type: 'armor',     slot: 'off_hand', allowed_slots: ['main_hand', 'off_hand'] },
  // Consumables
  'potion-of-healing': { item_type: 'consumable', slot: null, allowed_slots: null },
  'antitoxin':         { item_type: 'consumable', slot: null, allowed_slots: null },
  'ration':            { item_type: 'consumable', slot: null, allowed_slots: null },
  'healers-kit':       { item_type: 'consumable', slot: null, allowed_slots: null },
  // Chain shirt is chest armor
  'chain-shirt':       { item_type: 'armor',     slot: 'chest', allowed_slots: ['chest'] },
}

/** Name/id keyword → { item_type, slot } — evaluated in order */
const KEYWORD_RULES = [
  // --- Consumables ---
  [['potion', 'healing', 'antitoxin', 'ration', 'food', 'supply', 'lockpick'], { item_type: 'consumable', slot: null, allowed_slots: null }],

  // --- Shields (hand, not body) ---
  [['shield', 'buckler'], { item_type: 'armor', slot: 'off_hand', allowed_slots: ['main_hand', 'off_hand'] }],

  // --- Hand-held misc ---
  [['torch', 'lantern', 'candle', 'orb', 'wand', 'staff', 'rod'], { item_type: 'misc', slot: 'off_hand', allowed_slots: ['main_hand', 'off_hand'] }],

  // --- Weapons (main hand by default; dual-light weapons also off-hand capable but store main) ---
  [['sword', 'axe', 'mace', 'dagger', 'spear', 'javelin', 'crossbow', 'bow', 'rapier',
    'flail', 'glaive', 'halberd', 'maul', 'morningstar', 'pike', 'quarterstaff',
    'sickle', 'trident', 'war-pick', 'warpick', 'war pick', 'whip', 'club', 'greatclub',
    'handaxe', 'shortsword', 'longsword', 'greatsword', 'battleaxe', 'greataxe'],
  { item_type: 'weapon', slot: 'main_hand', allowed_slots: ['main_hand', 'off_hand'] }],

  // --- Helmet ---
  [['helm', 'helmet', 'hat', 'hood', 'cap', 'coif', 'crown', 'circlet'],
  { item_type: 'armor', slot: 'helmet', allowed_slots: ['helmet'] }],

  // --- Boots ---
  [['boot', 'sabatons', 'shoe', 'sandal', 'greave'],
  { item_type: 'armor', slot: 'boots', allowed_slots: ['boots'] }],

  // --- Leg armor ---
  [['chausses', 'tasset', 'leg armor', 'leg guard'],
  { item_type: 'armor', slot: 'legs', allowed_slots: ['legs'] }],

  // --- Body armor (catch-all after specifics above) ---
  [['armor', 'mail', 'plate', 'breastplate', 'leather', 'studded', 'scale', 'splint', 'padded', 'ring mail'],
  { item_type: 'armor', slot: 'chest', allowed_slots: ['chest'] }],

  // --- Accessories ---
  [['ring', 'amulet', 'necklace', 'pendant', 'brooch'],
  { item_type: 'accessory', slot: 'ring', allowed_slots: ['ring'] }],
]

function classify(item) {
  const id   = (item.item_id   || '').toLowerCase()
  const name = (item.item_name || '').toLowerCase()
  const key  = `${id} ${name}`.trim()

  // Exact override first
  if (OVERRIDES_BY_ID[id]) return OVERRIDES_BY_ID[id]

  // Keyword scan
  for (const [keywords, result] of KEYWORD_RULES) {
    if (keywords.some(kw => key.includes(kw))) return result
  }

  return null // no change
}

async function run() {
  console.log('Fetching all inventory rows…')
  const { data: rows, error } = await supabase
    .from('inventory')
    .select('id, item_id, item_name, item_type, properties')

  if (error) {
    console.error('Failed to fetch inventory:', error.message)
    process.exit(1)
  }

  console.log(`Found ${rows.length} inventory items.`)

  let updated = 0
  let skipped = 0

  for (const row of rows) {
    const classification = classify(row)
    if (!classification) { skipped++; continue }

    const currentSlot = row.properties?.slot ?? undefined
    const currentAllowedSlots = row.properties?.allowed_slots ?? null
    const nextAllowedSlots = classification.allowed_slots ?? null
    const sameType    = row.item_type === classification.item_type
    const sameSlot    = currentSlot === classification.slot
    const sameAllowedSlots = JSON.stringify(currentAllowedSlots) === JSON.stringify(nextAllowedSlots)

    if (sameType && sameSlot && sameAllowedSlots) { skipped++; continue }

    const newProperties = {
      ...(row.properties || {}),
      allowed_slots: classification.allowed_slots,
      slot: classification.slot,
    }

    const { error: updateErr } = await supabase
      .from('inventory')
      .update({ item_type: classification.item_type, properties: newProperties })
      .eq('id', row.id)

    if (updateErr) {
      console.error(`  ✗ Failed to update "${row.item_name}" (id=${row.id}):`, updateErr.message)
    } else {
      console.log(`  ✓ ${row.item_name}: type=${row.item_type}→${classification.item_type}, slot=${currentSlot}→${classification.slot}`)
      updated++
    }
  }

  console.log(`\nDone. Updated: ${updated}, Skipped (no change): ${skipped}`)
}

run()
