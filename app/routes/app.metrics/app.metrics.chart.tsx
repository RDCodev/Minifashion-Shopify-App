import { EmptyState, Grid, InlineStack, Layout, Text } from "@shopify/polaris";
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
  const containerPlot: any = useRef()
  const plotLine: any = useRef();
  const tooltip: any = useRef()
  const tooltipDeliver: any = useRef()
  const tooltipClicked: any = useRef()
  const tooltipOpened: any = useRef()
  const tooltipDate: any = useRef()

  const colorDeliver = "#10ab0e"
  const colorClicked = "#3c36cc"
  const colorOpened = "#e12d2d"

  const data: EmailMetric[] = dataset.reduce((arr: any[], d: any) => {
    return [
      ...arr,
      {
        ...d,
        date: new Date(d.date)
      }
    ]
  }, [])

  const x: any = d3.scaleUtc(
    d3.extent(data, d => d.date) as [Date, Date],
    [marginLeft, width - marginRight])

  const y: any = d3.scaleLinear(
    [0, 10],
    [height - marginBottom, marginTop])

  const lineDeliver = d3.line()
    .x((d: any) => x(d.date))
    .y((d: any) => y(d.deliver))

  const lineOpened = d3.line()
    .x((d: any) => x(d.date))
    .y((d: any) => y(d.opened))

  const lineClicked = d3.line()
    .x((d: any) => x(d.date))
    .y((d: any) => y(d.clicked))

  const points = data.map((d: any, i: number) => [x(d.date), y(i), d.date, d.deliver, d.opened, d.clicked])

  const pointerentered = (event: any) => {
    return
  }

  const pointermove = (event: any) => {
    const [xm, ym] = d3.pointer(event)
    const i: any = d3.leastIndex(points, ([x, y]) => Math.hypot(x - xm, y - ym))
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [x, _, k, l, m, n] = points[i]

    d3.select(containerPlot.current)
      .attr("opacity", "1")

    d3.select(plotLine.current)
      .attr("display", "inline")
      .attr("x1", x)
      .attr("x2", x)

    d3.select(tooltip.current)
      .attr("transform", `translate(${x + 200 >= width ?
        x - 210 : x + 10
        },50)`)

    d3.select(tooltipDate.current)
      .text(`${k.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`)

    d3.select(tooltipDeliver.current)
      .text(l)

    d3.select(tooltipOpened.current)
      .text(m)

    d3.select(tooltipClicked.current)
      .text(n)
  }

  const pointerleft = () => {
    d3.select(containerPlot.current)
      .attr("opacity", "0")
  }

  useEffect(() => {
    void d3.select(axisx.current)
      .call(d3.axisBottom(x).ticks(width / 80).tickSizeOuter(0))
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

  const emptyData = () => (
    <EmptyState
        heading="Data mailer send current empty."
        action={undefined}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>Track and receive the emails about your products recommendations.</p>
      </EmptyState>
  )

  const chart = () => (
    <Layout>
        <Layout.Section>
          <svg
            width="100%"
            height={height}
            onPointerEnter={pointerentered}
            onPointerMove={pointermove}
            onPointerLeave={pointerleft}
            onTouchStart={event => event.preventDefault()}
          >
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
              stroke={colorDeliver}
              strokeWidth="1.5"
              d={lineDeliver(data)} />

            <path
              fill="white"
              stroke={colorOpened}
              strokeWidth="1.5"
              d={lineOpened(data)} />
            <path
              fill="none"
              stroke={colorClicked}
              strokeWidth="1.5"
              d={lineClicked(data)} />
            <g
              fill="white"
              stroke={colorDeliver}
              strokeWidth="1">
              {
                data.map((d: any, i: any) => (
                  <circle key={i} cx={x(d.date)} cy={y(d.deliver)} r="2.5" />
                ))
              }
            </g>
            <g
              fill="white"
              stroke={colorOpened}
              strokeWidth="1">
              {
                data.map((d: any, i: any) => (
                  <circle key={i} cx={x(d.date)} cy={y(d.opened)} r="2.5" />
                ))
              }
            </g>
            <g
              fill="white"
              stroke={colorClicked}
              strokeWidth="1">
              {
                data.map((d: any, i: any) => (
                  <circle key={i} cx={x(d.date)} cy={y(d.clicked)} r="2.5" />
                ))
              }
            </g>
            <g
              ref={containerPlot}
              z={20}
              opacity={0}
            >
              <line
                ref={plotLine}
                y1={0}
                y2={height - marginTop}
                strokeWidth={1}
                stroke="#999999"
                fill="none">
              </line>
              <g
                ref={tooltip}
                z={20}
              >
                <rect
                  fill="white"
                  filter="drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.4))"
                  stroke={"#aaaaaa"}
                  rx={4}
                  ry={4}
                  width={200}
                  height={100}
                />
                <text
                  ref={tooltipDate}
                  transform="translate(10,20)"
                >
                  Date Time
                </text>
                <g
                  transform="translate(10,10)"
                >
                  <rect
                    fill={colorDeliver}
                    rx={4}
                    ry={4}
                    width={20}
                    height={5}
                    transform="translate(5,25)"
                  />
                  <text
                    transform="translate(40,30)"
                  >
                    Deliver
                  </text>
                  <text
                    ref={tooltipDeliver}
                    transform="translate(100,30)"
                  >
                    2
                  </text>
                  <rect
                    fill={colorOpened}
                    rx={4}
                    ry={4}
                    width={20}
                    height={5}
                    transform="translate(5,45)"
                  />
                  <text
                    transform="translate(40,50)"
                  >
                    Opened
                  </text>
                  <text
                    ref={tooltipOpened}
                    transform="translate(100,50)"
                  >
                    3
                  </text>
                  <rect
                    fill={colorClicked}
                    rx={4}
                    ry={4}
                    width={20}
                    height={5}
                    transform="translate(5,65)"
                  />
                  <text
                    transform="translate(40,70)"
                  >
                    Clicked
                  </text>
                  <text
                    ref={tooltipClicked}
                    transform="translate(100,70)"
                  >
                    4
                  </text>
                </g>
              </g>
            </g>
          </svg>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Grid>
            <Grid.Cell columnSpan={{xs: 6}}>
              <Text variant="headingMd" as="h5">
                Legend
              </Text>
            </Grid.Cell>
            <Grid.Cell columnSpan={{xs:1, md: 2, lg:12, xl: 12}}>
            <InlineStack gap={"100"} blockAlign="center" >
                <div 
                    style={{
                      width: 20,
                      height: 5,
                      background: colorClicked,
                      borderRadius: "20px"
                    }}
                  />
                  <Text variant="bodyLg" as="strong">
                    Clicked
                  </Text>
              </InlineStack>
            </Grid.Cell>
            <Grid.Cell columnSpan={{xs:1, md: 2, lg:12, xl: 12}}>
              <InlineStack gap={"100"} blockAlign="center" >
                <div 
                    style={{
                      width: 20,
                      height: 5,
                      background: colorDeliver,
                      borderRadius: "20px"
                    }}
                  />
                  <Text variant="bodyLg" as="strong">
                    Deliver
                  </Text>
              </InlineStack>
            </Grid.Cell>
            <Grid.Cell columnSpan={{xs:1, md: 2, lg:12, xl: 12}}>
            <InlineStack gap={"100"} blockAlign="center" >
                <div 
                    style={{
                      width: 20,
                      height: 5,
                      background: colorOpened,
                      borderRadius: "20px"
                    }}
                  />
                  <Text variant="bodyLg" as="strong">
                    Opened
                  </Text>
              </InlineStack>
            </Grid.Cell>
          </Grid>
        </Layout.Section>
      </Layout>
  )

  return (
    <>
      {
        data.length ? 
          chart() : emptyData()
      }
    </>
  )
}
