
"use client"

import * as React from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BookCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const chartConfig = {
  activity: {
    label: "Activities",
    color: "hsl(var(--primary))",
  },
}

interface ComplianceActivityChartProps {
  dataByYear: Record<string, { month: string; activity: number }[]>;
}

export function ComplianceActivityChart({ dataByYear }: ComplianceActivityChartProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const years = React.useMemo(() => Object.keys(dataByYear).sort((a,b) => Number(b) - Number(a)), [dataByYear]);
  
  const getDefaultYear = () => {
    const currentYear = new Date().getFullYear().toString();
    if (years.includes(currentYear)) {
      return currentYear;
    }
    return years[0] || currentYear;
  };

  const [selectedYear, setSelectedYear] = React.useState(getDefaultYear());
  
  React.useEffect(() => {
    if (years.length > 0 && !years.includes(selectedYear)) {
      setSelectedYear(getDefaultYear());
    }
  }, [years, selectedYear]);

  const chartData = dataByYear[selectedYear] || [];
  
  if (!isMounted) {
    return (
        <Card className="interactive-lift h-full">
            <CardHeader>
                <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                    <div>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32 mt-2" />
                    </div>
                    <Skeleton className="h-10 w-[120px]" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-64 w-full" />
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="interactive-lift h-full">
      <CardHeader>
        <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
            <div>
                <CardTitle className="flex items-center gap-2">
                    <BookCheck />
                    Monthly Compliance Activity
                </CardTitle>
                <CardDescription>Your legal and compliance actions for {selectedYear}.</CardDescription>
            </div>
            {years.length > 0 && (
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full sm:w-[120px]">
                      <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                      {years.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
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
