import * as d3 from "d3";

interface EmailMetric {
  date: Date,
  opened: number,
  clicked: number,
  deliver: number
}

export default function LinePlotEmailMetrics({
  dataset,
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 20
}: {
  dataset: EmailMetric[],
  width?: number,
  height?: number,
  marginTop?: number,
  marginRight?: number,
  marginBottom?: number,
  marginLeft?: number
}) {

  const data: EmailMetric[] = dataset.reduce((arr: any[], d: any) => {
    return [
      ...arr,
      {
        ...d,
        date: new Date(d.date)
      }
    ]
  }, [])

  const x = d3.scaleUtc(
    d3.extent(data, d => d.date) as unknown as [Date, Date],
    [marginLeft, width - marginRight])

  const y = d3.scaleLinear(
    [0, 10] as unknown as [Number, Number],
    [height - marginBottom, marginTop])

  const line = d3.line()
    .x((d: any) => x(d.date))
    .y((d: any) => y(d.clicked))

  return (
    <>
      <svg
        width={width}
        height={height}>

        <path
          fill="none"
          stroke="steelblue"
          strokeWidth="1.5"
          d={line(data)} />
        <g
          fill="green"
          stroke="currentColor"
          strokeWidth="1.5">
          {
            data.map((d, i) => (
              <circle key={i} cx={x(d.date)} cy={y(d.clicked)} r="2.5" />
            ))
          }
        </g>
      </svg>
    </>
  )
}
