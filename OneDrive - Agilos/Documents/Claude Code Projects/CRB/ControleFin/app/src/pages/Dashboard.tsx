import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { KpiCard } from '../components/ui/KpiCard'
import {
  kpisData,
  alertsData,
  budgetVsReelData,
  monthlyExpensesData,
  expensesByNatureData,
} from '../data/kpis'

const PIE_COLORS = ['#1E3A5F', '#CE1126', '#4A90D9', '#6BB56A']

function AlertItem({ message, severity }: { message: string; severity: 'critical' | 'warning' }) {
  return (
    <li
      className={`flex items-start gap-2 p-3 rounded-md text-sm ${
        severity === 'critical' ? 'bg-red-50 text-red-800' : 'bg-orange-50 text-orange-800'
      }`}
    >
      <span className="mt-0.5 flex-shrink-0">{severity === 'critical' ? '🔴' : '🟡'}</span>
      {message}
    </li>
  )
}

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-6">
        {kpisData.map((kpi) => (
          <KpiCard
            key={kpi.id}
            title={kpi.label}
            value={kpi.value}
            unit={kpi.unit}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            status={kpi.status}
          />
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Budget vs Réel par centre</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetVsReelData} barGap={4}>
              <XAxis dataKey="centre" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}k €`} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#CBD5E1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="reel" name="Réel" fill="#1E3A5F" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Répartition par nature</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={expensesByNatureData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, percent }: { name: string; percent: number }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {expensesByNatureData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}k €`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Line chart + Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Dépenses mensuelles</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyExpensesData}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => `${(v / 1000).toFixed(0)}k €`} />
              <Line
                type="monotone"
                dataKey="amount"
                name="Dépenses"
                stroke="#CE1126"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">
            Alertes actives{' '}
            <span className="ml-1 bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {alertsData.length}
            </span>
          </h2>
          <ul className="space-y-2">
            {alertsData.map((alert) => (
              <AlertItem key={alert.id} message={alert.message} severity={alert.severity} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
