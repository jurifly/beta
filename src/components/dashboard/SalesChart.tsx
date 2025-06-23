'use client';

import { Bar, BarChart, XAxis, YAxis } from 'recharts';
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

export default function ComplianceChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
      <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
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
        <Bar dataKey="actions" fill="var(--color-actions)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
