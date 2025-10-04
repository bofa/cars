import { DateTime } from 'luxon'
import { useState } from 'react'
import { HTMLSelect, Radio, RadioGroup, Switch } from '@blueprintjs/core'
import { MergeSelect, MultiMergeSelect } from './MultiMergeSelect'
import { DateRangeSlider } from './DateRangeSlider'
import { Make, makes, Segment, segments } from './input'
import Sales from './Sales'
import Projection from './Projection'
import Fleet from './Fleet'

type Frame = 'fleet'|'sales'|'projection'

function App() {
  const [smooth, setSmooth] = useState(12)
  const [make, setMake] = useState<Make>('bev')
  const [segment, setSegment] = useState<Segment>('cars')
  const [frame, setFrame] = useState<Frame>('sales')
  const [normal, setNormal] = useState<Make|null>('total')
  const [selected, setSelected] = useState<MergeSelect[]>([
    {
      name: null,
      series: ['Sweden']
    }
  ])
  const [stacked, setStacked] = useState(false)
  const [range, setRange] = useState<[DateTime, DateTime]>([
    DateTime.now().minus({ year: 5 }).set({ day: 0 }),
    DateTime.now(),
  ])

  const smoothAdjusted = segment === 'cars' ? smooth : Math.max(1, smooth / 3)

  return (
    <div style={{ width: '100wv', height: '100vh', padding: 20, paddingBottom: 60 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
        <HTMLSelect value={'' + smooth} onChange={e => setSmooth(+e.target.value)}>
          <option value="1">Month</option>
          <option value="3">Quarter</option>
          <option value="12">Year</option>
        </HTMLSelect>
        <HTMLSelect value={segment} onChange={e => setSegment(e.target.value as any)}>
          {segments.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={make} onChange={e => setMake(e.target.value as any)}>
          {makes.map(make => <option key={make} value={make}>{make}</option>)}
        </HTMLSelect>
        <HTMLSelect value={normal ?? 'off'} onChange={e => setNormal(e.target.value === 'off' ? null : e.target.value as any)}>
          {makes.map(normal => <option key={normal} value={normal}>{normal}</option>)}
          <option value="off">-</option>
        </HTMLSelect>
        <Switch
          label="Stacked"
          checked={stacked}
          onChange={e => setStacked(e.target.checked)}
        />
        <RadioGroup
            inline
            name="group"
            onChange={e => setFrame(e.currentTarget.value as Frame)}
            selectedValue={frame}
        >
          <Radio label="Sales" value="sales" />
          <Radio label="Projection" value="projection" />
          <Radio label="Fleet" value="fleet" />
        </RadioGroup>
      </div>
      <div style={{ width: '100%', height: '100%', display: 'flex' }}>
        <div style={{ flexGrow: 1, flexShrink: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {frame === 'sales' && <Sales
            make={make}
            normal={normal}
            segment={segment}
            smooth={smooth}
            selected={selected}
            range={range}
            stacked={stacked}
          />}
          {frame === 'projection' && <Projection
            make={make}
            normal={normal}
            segment={segment}
            smooth={smooth}
            selected={selected}
            range={range}
            stacked={stacked}
          />}
          {frame === 'fleet' && <Fleet
            make={make}
            normal={normal}
            segment={segment}
            smooth={smooth}
            selected={selected}
            range={range}
            stacked={stacked}
          />}
          <DateRangeSlider
            smooth={smoothAdjusted}
            value={range[0]}
            onValue={value => setRange([value, range[1]])}
          />
        </div>
        <MultiMergeSelect
          type={make}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </div>
  )
}

export default App
