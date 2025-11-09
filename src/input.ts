import { Point } from "./MultiMergeSelect"

export const makes = [
  'bev',
  'phev',
  'hybrid',
  'other',
  'petrol',
  'disel',
  'total',
  // 'projection',
] as const

export type Segment = typeof segments[number]
export const segments = [
  'cars',
  'van',
  'busses',
  'mediumtrucks',
  'heavytrucks',
  'fuel'
] as const

export type Make = keyof Omit<Point, 'x'>
