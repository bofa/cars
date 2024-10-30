import { DateTime } from "luxon"
import { useEffect, useState } from "react"
import { Slider } from "@blueprintjs/core"

const minDate = DateTime.fromISO('2015-01-01')
const maxDate = DateTime.now().plus({ months: 2 })

const minDays = 0
const maxDays = Math.ceil(maxDate.diff(minDate, 'months').months)

export function DateRangeSlider(props: {
  smooth: number
  value: DateTime
  onValue: (value: DateTime) => void
}) {
  const [dateRange, setDateRange] = useState(1)

  const toMonths = (date: DateTime) => date.diff(minDate, 'months').months

  useEffect(() => {
    const rangeDays = toMonths(props.value)
    setDateRange(rangeDays + props.smooth)
  }, [props.value])

  return (
    <div style={{ padding: 10}}>
      <Slider
        min={minDays}
        max={maxDays}
        value={dateRange}
        showTrackFill={false}
        onChange={setDateRange}
        onRelease={months => props.onValue(minDate.plus({ months: months - props.smooth }))}
        labelRenderer={(months, opt) => {
          const date = minDate.plus({ months })
          const isFirstOfYear = date.month === 1 && date.day === 1

          return opt?.isHandleTooltip
            ? <span style={{ whiteSpace: 'nowrap'  }}>{date.toFormat('yyyy-MM')}</span>
            : isFirstOfYear ? minDate.plus({ months }).toFormat('yyyy')
            : ""
        }}
      />
    </div>
  )
}
