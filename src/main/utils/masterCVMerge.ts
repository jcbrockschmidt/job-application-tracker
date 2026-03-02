// Merges an incoming MasterCV (e.g. extracted from an uploaded resume) into an
// existing MasterCV without duplicating content.
//
// Merge strategy:
//   Experience — match by (company + title, case-insensitive). If a match exists,
//     append bullets whose text is not already present (exact string match).
//     New entries are appended with fresh nanoid IDs.
//   Education  — match by (degree + institution, case-insensitive). Duplicates are
//     skipped; new entries are appended.
//   Skills     — match category by name (case-insensitive). Union items within a
//     category (case-insensitive dedup). New categories are appended.
//
// All existing IDs, sources, and usedIn arrays are preserved.
// Incoming entry IDs are replaced with new nanoid IDs so the merged result has
// stable, unique identifiers regardless of the source.

import { nanoid } from 'nanoid'
import type {
  MasterCV,
  MasterCVExperienceEntry,
  MasterCVBullet,
  MasterCVEducationEntry,
  MasterCVSkillCategory
} from '../../shared/types'

export function mergeMasterCV(existing: MasterCV, incoming: MasterCV): MasterCV {
  return {
    experience: mergeExperience(existing.experience, incoming.experience),
    education: mergeEducation(existing.education, incoming.education),
    skills: mergeSkills(existing.skills, incoming.skills)
  }
}

function mergeExperience(
  existing: MasterCVExperienceEntry[],
  incoming: MasterCVExperienceEntry[]
): MasterCVExperienceEntry[] {
  const result = existing.map((e) => ({ ...e, bullets: [...e.bullets] }))

  for (const incomingEntry of incoming) {
    const idx = result.findIndex(
      (e) =>
        e.company.toLowerCase() === incomingEntry.company.toLowerCase() &&
        e.title.toLowerCase() === incomingEntry.title.toLowerCase()
    )
    if (idx >= 0) {
      result[idx] = {
        ...result[idx],
        bullets: mergeBullets(result[idx].bullets, incomingEntry.bullets)
      }
    } else {
      result.push(entryWithNewIds(incomingEntry))
    }
  }

  return result
}

function mergeBullets(existing: MasterCVBullet[], incoming: MasterCVBullet[]): MasterCVBullet[] {
  const existingTexts = new Set(existing.map((b) => b.text))
  const newBullets = incoming
    .filter((b) => !existingTexts.has(b.text))
    .map((b) => ({ ...b, id: nanoid() }))
  return [...existing, ...newBullets]
}

function entryWithNewIds(entry: MasterCVExperienceEntry): MasterCVExperienceEntry {
  return {
    ...entry,
    id: nanoid(),
    bullets: entry.bullets.map((b) => ({ ...b, id: nanoid() }))
  }
}

function mergeEducation(
  existing: MasterCVEducationEntry[],
  incoming: MasterCVEducationEntry[]
): MasterCVEducationEntry[] {
  const result = [...existing]

  for (const incomingEdu of incoming) {
    const alreadyPresent = result.some(
      (e) =>
        e.degree.toLowerCase() === incomingEdu.degree.toLowerCase() &&
        e.institution.toLowerCase() === incomingEdu.institution.toLowerCase()
    )
    if (!alreadyPresent) {
      result.push({ ...incomingEdu, id: nanoid() })
    }
  }

  return result
}

function mergeSkills(
  existing: MasterCVSkillCategory[],
  incoming: MasterCVSkillCategory[]
): MasterCVSkillCategory[] {
  const result = existing.map((s) => ({ ...s, items: [...s.items] }))

  for (const incomingSkill of incoming) {
    const idx = result.findIndex(
      (s) => s.category.toLowerCase() === incomingSkill.category.toLowerCase()
    )
    if (idx >= 0) {
      const existingLower = new Set(result[idx].items.map((i) => i.toLowerCase()))
      const newItems = incomingSkill.items.filter((i) => !existingLower.has(i.toLowerCase()))
      result[idx] = { ...result[idx], items: [...result[idx].items, ...newItems] }
    } else {
      result.push({ ...incomingSkill, id: nanoid() })
    }
  }

  return result
}
