'use client';

import { Area, AreaChart, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartData = [
  { month: "Jan", actions: 18 },
  { month: "Feb", actions: 30 },
  { month: "Mar", actions: 23 },
  { month: "Apr", actions: 17 },
  { month: "May", actions: 20 },
  { month: "Jun", actions: 28 },
];

const chartConfig = {
  actions: {
    label: "Actions",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export function ComplianceActivityChart() {
  return (
    <Card className="interactive-lift h-full">
      <CardHeader>
        <CardTitle>Monthly Compliance Activity</CardTitle>
        <CardDescription>Your legal and compliance actions over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="fillActions" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-actions)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-actions)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="actions"
              type="natural"
              fill="url(#fillActions)"
              stroke="var(--color-actions)"
              strokeWidth={2}
              fillOpacity={1}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
