// apps/web/src/components/hotel-admin/charts/RevenueBarChart.tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface RevenueBarChartProps {
  data: Array<{ roomType: string; revenue: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="roomType" tick={{ fontSize: 12 }} />
        <YAxis
          tick={{ fontSize: 12 }}
          tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
        />
        <Tooltip
          formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))' }}
        />
        <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};