import { Modifier, type ScoreSchemaInput } from '../../models/Score'

export const parsePlayerModifiersForScoreEntry = (currentModifier: number): ScoreSchemaInput['modifiers'] => {
  const arr: ScoreSchemaInput['modifiers'] = []
  for (const [_, index] of Object.entries(Modifier)) {
    if ((currentModifier >> index) % 2) arr.push({ modifier: index })
  }
  return arr
}
