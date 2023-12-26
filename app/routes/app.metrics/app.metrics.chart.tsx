import * as d3 from "d3";
import { useEffect, useRef } from "react";

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

  const axisx: any = useRef();
  const axisy: any = useRef();

  const data: EmailMetric[] = dataset.reduce((arr: any[], d: any) => {
    return [
      ...arr,
      {
        ...d,
        date: new Date(d.date)
      }
    ]
  }, [])

  const x: any = d3.scaleTime(
    d3.extent(data, d => d.date),
    [marginLeft, width - marginRight])

  const y: any = d3.scaleLinear(
    [0, 10],
    [height - marginBottom, marginTop])

  const lineDeliver = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.deliver))

  const lineOpened = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.opened))

  const lineClicked = d3.line()
    .x(d => x(d.date))
    .y(d => y(d.clicked))

  useEffect(() => {
    void d3.select(axisx.current).call(d3.axisBottom(x))
    void d3.select(axisy.current)
      .call(d3.axisLeft(y))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
        .attr("x2", width - marginLeft - marginRight)
        .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start"))
  }, [marginLeft, marginRight, width, x, y])

  return (
    <>
      <svg
        width={width}
        height={height}>
        <g
          ref={axisx}
          transform={`translate(0, ${height - marginBottom})`}
        />
        <g
          ref={axisy}
          transform={`translate(${marginLeft}, 0)`}
        />
        <path
          fill="none"
          stroke="green"
          strokeWidth="1.5"
          d={lineDeliver(data)} />

        <path
          fill="white"
          stroke="red"
          strokeWidth="1.5"
          d={lineOpened(data)} />
        <path
          fill="none"
          stroke="blue"
          strokeWidth="1.5"
          d={lineClicked(data)} />
        <g
          fill="green"
          stroke="green"
          strokeWidth="1.5">
          {
            data.map((d: any, i: any) => (
              <circle key={i} cx={x(d.date)} cy={y(d.deliver)} r="2.5" />
            ))
          }
        </g>
        <g
          fill="red"
          stroke="red"
          strokeWidth="1.5">
          {
            data.map((d: any, i: any) => (
              <circle key={i} cx={x(d.date)} cy={y(d.opened)} r="2.5" />
            ))
          }
        </g>
        <g
          fill="blue"
          stroke="blue"
          strokeWidth="1.5">
          {
            data.map((d: any, i: any) => (
              <circle key={i} cx={x(d.date)} cy={y(d.clicked)} r="2.5" />
            ))
          }
        </g>
      </svg>
    </>
  )
}
