import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { Slider } from "@blueprintjs/core"

const minDate = DateTime.fromISO('2015-01-01')
const maxDate = DateTime.now().plus({ days: 2 })

const minDays = 0
const maxDays = Math.ceil(maxDate.diff(minDate, 'days').days)

export function DateRangeSlider(props: {
  value: DateTime
  onValue: (value: DateTime) => void
}) {
  const [dateRange, setDateRange] = useState(1)

  const toDays = (date: DateTime) => date.diff(minDate, 'days').days

  useEffect(() => {
    const rangeDays = toDays(props.value)
    setDateRange(rangeDays)
  }, [props.value])

  return (
    <div style={{ padding: 10}}>
      <Slider
        min={minDays}
        max={maxDays}
        value={dateRange}
        showTrackFill={false}
        onChange={setDateRange}
        onRelease={day => props.onValue(minDate.plus({ day }))}
        labelRenderer={(day, opt) => {
          const date = minDate.plus({ day })
          const isFirstOfYear = date.month === 1 && date.day === 1

          return opt?.isHandleTooltip
            ? <span style={{ whiteSpace: 'nowrap'  }}>{date.toFormat('yy-MM-dd')}</span>
            : isFirstOfYear ? minDate.plus({ day }).toFormat('yyyy')
            : ""
        }}
      />
    </div>
  )
}
