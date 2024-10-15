import { Checkbox, Divider, HTMLSelect, Menu, MenuDivider, MenuItem } from "@blueprintjs/core"

export function MultiMergeSelect(props: {
  items: {
    id: string
    name: string
  }[]
  selected: { name: string|null, series: string[]}[]
}) {

  return (
    <div style={{ height: '80vh', width: 300, overflowY: 'scroll' }}>
      <Menu>
        {props.selected.map(g => <>
          <MenuDivider title={g.name ?? g.series[0]}/>
          {g.series.map(v => <MenuItem text={v}/>)}
          </>
        )}
      </Menu>
      <Divider/>
      <Menu>
        {props.items.map(item => <MenuItem labelElement={<SelectElement/>} key={item.id} text={item.name}/>)}
      </Menu>
    </div>
  )
}

function SelectElement(props: {

}) {
  return (
    <span style={{ display: 'flex' }}>
      <Checkbox/>
      <HTMLSelect minimal options={['1', '2', '3']} />
    </span>
  )
}
