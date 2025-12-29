// localStorage persistence layer
// Single versioned key for all app data

const DB_KEY = 'barber_mvp_v1'

// Request statuses
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  SEEN: 'SEEN',
  DONE: 'DONE',
  DISMISSED: 'DISMISSED',
}

// Initial seed data
const createInitialDB = () => {
  const defaultBarberId = crypto.randomUUID()
  return {
    version: 3, // Bumped version for scheduling requests
    barbershopName: 'Barbearia Ousadia',
    services: [
      { id: crypto.randomUUID(), name: 'Corte', price: 30 },
      { id: crypto.randomUUID(), name: 'Barba', price: 25 },
      { id: crypto.randomUUID(), name: 'Corte + Barba', price: 50 },
    ],
    clients: [],
    appointments: [],
    barbers: [
      { id: defaultBarberId, name: 'Barbeiro 1', phone: '', isDefault: true },
    ],
    defaultBarberId,
    schedulingRequests: [],
    ui: {
      lastSeenRequestAt: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// Migrate old DB to include new fields
function migrateDB(db) {
  let migrated = false

  // Check if barbers array exists
  if (!db.barbers || !Array.isArray(db.barbers)) {
    const defaultBarberId = crypto.randomUUID()
    db.barbers = [
      { id: defaultBarberId, name: 'Barbeiro 1', phone: '', isDefault: true },
    ]
    db.defaultBarberId = defaultBarberId
    migrated = true

    // Migrate existing appointments to have barberId
    if (db.appointments && db.appointments.length > 0) {
      db.appointments = db.appointments.map((apt) => ({
        ...apt,
        barberId: apt.barberId || defaultBarberId,
      }))
    }
  }

  // Ensure defaultBarberId exists
  if (!db.defaultBarberId) {
    const defaultBarber = db.barbers.find((b) => b.isDefault) || db.barbers[0]
    if (defaultBarber) {
      db.defaultBarberId = defaultBarber.id
      defaultBarber.isDefault = true
      migrated = true
    }
  }

  // Ensure at least one barber is marked as default
  const hasDefault = db.barbers.some((b) => b.isDefault)
  if (!hasDefault && db.barbers.length > 0) {
    db.barbers[0].isDefault = true
    db.defaultBarberId = db.barbers[0].id
    migrated = true
  }

  // Migrate: Add schedulingRequests if missing
  if (!db.schedulingRequests || !Array.isArray(db.schedulingRequests)) {
    db.schedulingRequests = []
    migrated = true
  }

  // Migrate: Add ui object if missing
  if (!db.ui) {
    db.ui = {
      lastSeenRequestAt: null,
    }
    migrated = true
  }

  // Ensure ui.lastSeenRequestAt exists
  if (db.ui && db.ui.lastSeenRequestAt === undefined) {
    db.ui.lastSeenRequestAt = null
    migrated = true
  }

  // Update version if needed
  if (db.version < 3) {
    db.version = 3
    migrated = true
  }

  return migrated
}

// Load DB from localStorage, seed if missing, migrate if old
export function loadDB() {
  try {
    const stored = localStorage.getItem(DB_KEY)
    if (stored) {
      const db = JSON.parse(stored)
      // Run migration if needed
      if (migrateDB(db)) {
        saveDB(db)
      }
      return db
    }
  } catch (e) {
    console.error('Error loading DB:', e)
  }
  // Seed initial data
  const initial = createInitialDB()
  saveDB(initial)
  return initial
}

// Save DB to localStorage
export function saveDB(db) {
  try {
    db.updatedAt = new Date().toISOString()
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (e) {
    console.error('Error saving DB:', e)
  }
}

// Reset DB to initial state (for debugging)
export function resetDB() {
  localStorage.removeItem(DB_KEY)
  return loadDB()
}

// Helper: Set a barber as the default
export function setDefaultBarber(db, barberId) {
  // Unset all defaults
  db.barbers.forEach((b) => {
    b.isDefault = b.id === barberId
  })
  db.defaultBarberId = barberId
}

// Helper: Reassign appointments from one barber to another
export function reassignAppointmentsBarber(db, oldBarberId, newBarberId) {
  db.appointments = db.appointments.map((apt) => {
    if (apt.barberId === oldBarberId) {
      return { ...apt, barberId: newBarberId }
    }
    return apt
  })
}

// Helper: Get default barber
export function getDefaultBarber(db) {
  return db.barbers.find((b) => b.isDefault) || db.barbers[0]
}

// Helper: Count pending requests (for badge)
export function countPendingRequests(db) {
  return db.schedulingRequests.filter(
    (r) => r.status === REQUEST_STATUS.PENDING
  ).length
}

// Helper: Count new requests (created after lastSeenRequestAt)
export function countNewRequests(db) {
  const lastSeen = db.ui?.lastSeenRequestAt
  if (!lastSeen) {
    return db.schedulingRequests.filter(
      (r) => r.status === REQUEST_STATUS.PENDING
    ).length
  }
  return db.schedulingRequests.filter(
    (r) => r.status === REQUEST_STATUS.PENDING && r.createdAt > lastSeen
  ).length
}

// Helper: Update last seen timestamp
export function updateLastSeenRequestAt(db) {
  db.ui = db.ui || {}
  db.ui.lastSeenRequestAt = new Date().toISOString()
}

// Helper: Create a scheduling request
export function createSchedulingRequest(db, request) {
  const now = new Date().toISOString()
  const newRequest = {
    id: crypto.randomUUID(),
    clientName: request.clientName,
    clientPhone: request.clientPhone,
    preferredDate: request.preferredDate,
    preferredTime: request.preferredTime,
    serviceId: request.serviceId || null,
    barberId: request.barberId || null,
    notes: request.notes || '',
    status: REQUEST_STATUS.PENDING,
    createdAt: now,
    updatedAt: now,
  }
  db.schedulingRequests.push(newRequest)
  return newRequest
}

// Helper: Update request status
export function updateRequestStatus(db, requestId, newStatus) {
  const request = db.schedulingRequests.find((r) => r.id === requestId)
  if (request) {
    request.status = newStatus
    request.updatedAt = new Date().toISOString()
  }
  return request
}
