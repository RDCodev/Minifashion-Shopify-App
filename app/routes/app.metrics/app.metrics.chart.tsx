import * as d3 from "d3";
import { useState } from "react";

export default function LinePlotEmailMetrics({
  width = 640,
  height = 400,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 20
}: any) {

  const [data, setData] = useState<any[]>(() => d3.ticks(-2, 2, 200).map(Math.sin));

  function onMouseMove(event: any) {
    const [x, y] = d3.pointer(event);
    setData(data.slice(-200).concat(Math.atan2(x, y)));
  }

  const x = d3.scaleLinear([0, data.length - 1], [marginLeft, width - marginRight]);
  const y = d3.scaleLinear(d3.extent(data), [height - marginBottom, marginTop]);
  const line = d3.line((d, i) => x(i), y);

  return (
    <>
      <div onMouseMove={onMouseMove}>
        <svg
          width={width}
          height={height}>
          <path
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            d={line(data)} />
          <g
            fill="white"
            stroke="currentColor"
            stroke-width="1.5">
            {
              data.map((d: any, i: any) => (
                <circle key={i} cx={x(i)} cy={y(d)} r="2.5" />
              ))
            }
          </g>
        </svg>
      </div>

    </>
  )
}
