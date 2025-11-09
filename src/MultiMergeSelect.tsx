import { max, round } from "mathjs"
import { DateTime } from "luxon"
import { useState } from "react"
import { Divider, HTMLSelect, Menu, MenuDivider, MenuItem, Switch } from "@blueprintjs/core"
import { Segment } from "./input"
import cars from './assets/selection.json'
import van from './assets/selection-van.json'
import busses from './assets/selection-busses.json'
import mediumtrucks from './assets/selection-mediumtrucks.json'
import heavytrucks from './assets/selection-heavytrucks.json'

// TODO fuel own selection
const categories = { cars, van, busses, mediumtrucks, heavytrucks, fuel: cars } 

export type Point = {
  x: DateTime
  total: number
  bev: number|null
  phev: number|null
  hybrid: number|null
  other: number|null
  petrol: number|null
  disel: number|null
}

export type FuelPoint = {
  x: DateTime
  gasoline: number|null
  jet: number|null
  diesel: number|null
}

export type MergeSelect = { name: string|null, series: string[] }

const sortOptions = ['bev', 'other', 'total', 'bevPercent', 'bevGrowthBev', 'bevGrowthTotal'] as const

export function MultiMergeSelect(props: {
  category?: Segment
  type: Exclude<keyof Point, 'x'>
  selected: MergeSelect[]
  setSelected: (selected: MergeSelect[]) => void
}) {
  const { type = 'bev', category = 'cars' } = props

  const [sort, setSort] = useState<typeof sortOptions[number]>('bev')
  const [acending, setAcending] = useState<1|-1>(-1)

  const percent = ['bevPercent'].includes(sort)

  const itemsSorted = categories[category]
  .map(market => {
    let sortValue
    if (sort === 'bevPercent') {
      sortValue = market.latest[type] / market.latest['total']
    } else if (sort === 'bevGrowthBev') {
      sortValue = (market.latest[type] - market.before[type]) / market.before[type]
    } else if (sort === 'bevGrowthTotal') {
      sortValue = (market.latest[type] - market.before[type]) / market.before['total']
    } else {
      sortValue = market.latest[sort]
    }

    return {
      ...market,
      sort: sortValue,
    }
  })
  .sort((a, b) => acending * (a.sort - b.sort))

  const largestValue = percent ? 1 : max(itemsSorted.map(market => market.sort))

  return (
    <div style={{ height: '100%', width: 300, overflowY: 'scroll', flexShrink: 0 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <HTMLSelect options={sortOptions} onChange={e => setSort(e.target.value as any)}/>
        <Switch
          label="Ascending"
          checked={acending === 1}
          onChange={e => setAcending(e.target.checked ? 1 : -1)}  
        />
      </div>
      <Menu>
        {props.selected.map((g, i) => <>
          {g.series.length > 1 &&
            <MenuDivider
              title={g.name ?? g.series.join()}
            />
          }
          {g.series.map(v =>
            <MenuItem
              text={v}
              onClick={() => props.setSelected(props.selected.filter((_, i2) => i2 !== i))}
            />
          )}
          </>
        )}
      </Menu>
      <Divider/>
      <Menu>
        {itemsSorted.map(item =>
          <MenuItem
            style={{ background: item.sort > 0
                ? `linear-gradient(to right, #00000020 ${round(100 * item.sort/largestValue)}%, #FFFFFF33 ${round(100 * item.sort/largestValue)}%)`
                : `linear-gradient(to left, #00000020 ${round(-100 * item.sort/largestValue)}%, #FFFFFF33 ${round(-100 * item.sort/largestValue)}%)`
            }}
            key={item.id}
            text={item.name}
            onClick={() => props.setSelected(props.selected.concat({ name: null, series: [item.id] }))}
          >
            {/*
            {props.selected
            .filter(group => !group.series.includes(item.id))
            .map((group, index) =>
              <MenuItem
                text={group.name ?? group.series.join()}
                onClick={() => props.setSelected(props.selected.map((group, i) => {
                  if (i === index) {
                    return {
                      ...group,
                      series: group.series.concat(item.id)
                    }
                  } else {
                    return group
                  }
                }))}
              />
            )}
            */}
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}
