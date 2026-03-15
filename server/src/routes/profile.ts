import { Hono } from 'hono';
import { v4 as uuid } from 'uuid';
import { getDb } from '../db/sqlite';
import { requireAuth } from '../middleware/auth';
import type { UserProfile } from '../models/profile';

const profileRouter = new Hono();

function mapProfileToResponse(profile: any) {
  return {
    id: profile.id,
    user_id: profile.user_id,
    birthDate: profile.birth_date,
    bloodType: profile.blood_type,
    height: profile.height,
    weight: profile.weight,
    allergies: profile.allergies,
    chronicConditions: profile.chronic_conditions,
    emergencyContactName: profile.emergency_contact_name,
    emergencyContactPhone: profile.emergency_contact_phone,
    emergencyContactRelationship: profile.emergency_contact_relationship,
    notes: profile.notes,
  };
}

profileRouter.get('/', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = getDb();

  const profile = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(userId) as
    | UserProfile
    | undefined;

  if (!profile) {
    const id = uuid();
    const now = new Date().toISOString();
    db.prepare(
      'INSERT INTO user_profiles (id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?)'
    ).run(id, userId, now, now);
    return c.json(
      mapProfileToResponse({
        id,
        user_id: userId,
        birth_date: null,
        blood_type: null,
        height: null,
        weight: null,
        allergies: null,
        chronic_conditions: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relationship: null,
        notes: null,
        created_at: now,
        updated_at: now,
      })
    );
  }

  return c.json(mapProfileToResponse(profile));
});

profileRouter.put('/', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = getDb();
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId) as
    | { id: string }
    | undefined;

  if (existing) {
    db.prepare(
      'UPDATE user_profiles SET birth_date = ?, blood_type = ?, height = ?, weight = ?, allergies = ?, chronic_conditions = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relationship = ?, notes = ?, updated_at = ? WHERE user_id = ?'
    ).run(
      body.birthDate || null,
      body.bloodType || null,
      body.height || null,
      body.weight || null,
      body.allergies || null,
      body.chronicConditions || null,
      body.emergencyContactName || null,
      body.emergencyContactPhone || null,
      body.emergencyContactRelationship || null,
      body.notes || null,
      now,
      userId
    );
  } else {
    const id = uuid();
    db.prepare(
      'INSERT INTO user_profiles (id, user_id, birth_date, blood_type, height, weight, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone, emergency_contact_relationship, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      id,
      userId,
      body.birthDate || null,
      body.bloodType || null,
      body.height || null,
      body.weight || null,
      body.allergies || null,
      body.chronicConditions || null,
      body.emergencyContactName || null,
      body.emergencyContactPhone || null,
      body.emergencyContactRelationship || null,
      body.notes || null,
      now,
      now
    );
  }

  const profile = db
    .prepare('SELECT * FROM user_profiles WHERE user_id = ?')
    .get(userId) as UserProfile;
  return c.json(mapProfileToResponse(profile));
});

export default profileRouter;
