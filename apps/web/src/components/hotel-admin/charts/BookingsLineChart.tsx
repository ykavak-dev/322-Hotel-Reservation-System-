// apps/web/src/components/hotel-admin/charts/BookingsLineChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingsLineChartProps {
  data: Array<{ date: string; count: number }>;
}

export const BookingsLineChart: React.FC<BookingsLineChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })}
        />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip
          labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={{ fill: 'hsl(var(--primary))', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};