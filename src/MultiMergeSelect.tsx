import { Divider, HTMLSelect, Menu, MenuDivider, MenuItem } from "@blueprintjs/core"

export type MergeSelect = { name: string|null, series: string[] }

export function MultiMergeSelect(props: {
  items: {
    id: string
    name: string
  }[]
  selected: MergeSelect[]
  setSelected: (selected: MergeSelect[]) => void
}) {

  return (
    <div style={{ height: '80vh', width: 300, overflowY: 'scroll' }}>
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
        {props.items.map(item =>
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
