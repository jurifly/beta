
"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { BookCheck } from "lucide-react"

const chartConfig = {
  activity: {
    label: "Activities",
    color: "hsl(var(--primary))",
  },
}

interface ComplianceActivityChartProps {
  data: { month: string; activity: number }[];
}

export function ComplianceActivityChart({ data }: ComplianceActivityChartProps) {
  return (
    <Card className="interactive-lift h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <BookCheck />
            Monthly Compliance Activity
        </CardTitle>
        <CardDescription>Your legal and compliance actions over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <defs>
              <linearGradient id="fillActivity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-activity)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="activity"
              type="monotone"
              fill="url(#fillActivity)"
              stroke="var(--color-activity)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
