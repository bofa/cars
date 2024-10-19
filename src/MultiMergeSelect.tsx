import { Divider, HTMLSelect, Menu, MenuDivider, MenuItem } from "@blueprintjs/core"
import countries from './assets/selection.json'

export type MergeSelect = { name: string|null, series: string[] }

export function MultiMergeSelect(props: {
  make?: 'bev'
  selected: MergeSelect[]
  setSelected: (selected: MergeSelect[]) => void
}) {
  const { make = 'bev' } = props

  const itemsSorted = countries.sort((a, b) => b.latest[make] - a.latest[make])

  return (
    <div style={{ height: '100%', width: 300, overflowY: 'scroll', flexShrink: 0 }}>
      {/* <HTMLSelect content={[

      ]}/> */}
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
            key={item.id}
            text={item.name}
            onClick={() => props.setSelected(props.selected.concat({ name: null, series: [item.id] }))}
          >
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
          </MenuItem>
        )}
      </Menu>
    </div>
  )
}
