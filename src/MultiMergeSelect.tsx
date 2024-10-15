import { Checkbox, Divider, HTMLSelect, Menu, MenuDivider, MenuItem } from "@blueprintjs/core"

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
          {g.series.length > 1 && <MenuDivider title={g.name ?? g.series.join()}/>}
          {g.series.map(v => <MenuItem text={v} onClick={() => {}}/>)}
          </>
        )}
      </Menu>
      <Divider/>
      <Menu>
        {props.items.map(item =>
          <MenuItem
            labelElement={<SelectElement/>}
            key={item.id}
            text={item.name}
            onClick={(e: any) => {
              if (e.target.localName !== 'select') {
                props.setSelected(props.selected.concat({ name: null, series: [item.id] }))
              }
            }}
          />
        )}
      </Menu>
    </div>
  )
}

function SelectElement(props: {

}) {
  return (
    <HTMLSelect minimal options={['1', '2', '3']} />
  )
}
