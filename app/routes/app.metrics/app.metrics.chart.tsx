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

  const x = d3.scaleTime(
    d3.extent(data, d => d.date),
    [marginLeft, width - marginRight])

  const y = d3.scaleLinear(
    [0, d3.max(data, d => d.deliver)],
    [height - marginBottom, marginTop])



  return (
    <>
      <svg
        width={width}
        height={height}>
        
        {/* <path
          fill="none"
          stroke="steelblue"
          strokeWidth="1.5"
          d={line(data)} />
        <g
          fill="green"
          stroke="currentColor"
          strokeWidth="1.5">
          {
            data.map((d: any, i: any) => (
              <circle key={i} cx={x(i)} cy={y(d)} r="2.5" />
            ))
          }
        </g> */}
      </svg>
    </>
  )
}
