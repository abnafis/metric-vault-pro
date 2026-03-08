import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line
} from "recharts";

const revenueData = [
  { m: "Jan", v: 12000 }, { m: "Feb", v: 15000 }, { m: "Mar", v: 18000 },
  { m: "Apr", v: 22000 }, { m: "May", v: 28000 }, { m: "Jun", v: 32000 },
  { m: "Jul", v: 35000 }, { m: "Aug", v: 38000 }, { m: "Sep", v: 42000 },
  { m: "Oct", v: 45000 }, { m: "Nov", v: 48000 }, { m: "Dec", v: 52000 },
];

const campaignData = [
  { n: "Search", v: 85 }, { n: "Social", v: 62 }, { n: "Display", v: 45 }, { n: "Email", v: 78 }, { n: "Video", v: 55 },
];

const sourceData = [
  { name: "Google", value: 42 }, { name: "Meta", value: 28 },
  { name: "Direct", value: 18 }, { name: "Organic", value: 12 },
];
const pieColors = ["hsl(210 100% 55%)", "hsl(260 80% 60%)", "hsl(185 80% 55%)", "hsl(150 60% 50%)"];

const conversionData = [
  { d: "Mon", v: 3.2 }, { d: "Tue", v: 3.8 }, { d: "Wed", v: 4.1 },
  { d: "Thu", v: 3.9 }, { d: "Fri", v: 4.5 }, { d: "Sat", v: 4.2 }, { d: "Sun", v: 4.8 },
];

const DashboardShowcase = () => (
  <section className="py-24 relative overflow-hidden">
    <div className="absolute inset-0 bg-radial-glow opacity-30 pointer-events-none" />
    <div className="section-container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <p className="text-sm text-glow-blue uppercase tracking-widest mb-3 font-semibold">Dashboard</p>
        <h2 className="text-3xl sm:text-4xl font-bold">
          Analytics{" "}
          <span className="gradient-text">Dashboard</span>
        </h2>
        <p className="text-muted-foreground mt-3 max-w-lg mx-auto text-sm">
          Custom Looker Studio dashboards that give you real-time visibility into every metric that matters.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="glass-card glow-border p-6 space-y-6"
      >
        {/* Top metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: "$482K", change: "+12.4%" },
            { label: "Conversions", value: "12,847", change: "+8.2%" },
            { label: "Avg. ROAS", value: "5.2x", change: "+15.7%" },
            { label: "Active Events", value: "248", change: "+3.1%" },
          ].map((m, i) => (
            <div key={m.label} className="metric-card">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{m.value}</p>
              <p className="text-xs text-chart-green font-mono mt-1">{m.change}</p>
            </div>
          ))}
        </div>

        {/* Charts grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Revenue */}
          <div className="metric-card md:col-span-2">
            <p className="text-xs text-muted-foreground mb-3">Revenue Attribution</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(210 100% 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(210 100% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                <XAxis dataKey="m" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="v" stroke="hsl(210 100% 55%)" fill="url(#dashGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Traffic Sources */}
          <div className="metric-card">
            <p className="text-xs text-muted-foreground mb-3">Traffic Sources</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={sourceData} innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {sourceData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {sourceData.map((s, i) => (
                <span key={s.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="w-2 h-2 rounded-full" style={{ background: pieColors[i] }} />
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="metric-card">
            <p className="text-xs text-muted-foreground mb-3">Campaign Performance</p>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={campaignData}>
                <XAxis dataKey="n" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} axisLine={false} tickLine={false} />
                <Bar dataKey="v" fill="hsl(260 80% 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="metric-card">
            <p className="text-xs text-muted-foreground mb-3">Conversion Rate Trend</p>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 20% 18%)" />
                <XAxis dataKey="d" tick={{ fontSize: 10, fill: "hsl(215 15% 55%)" }} axisLine={false} tickLine={false} />
                <Line type="monotone" dataKey="v" stroke="hsl(185 80% 55%)" strokeWidth={2} dot={{ fill: "hsl(185 80% 55%)", r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default DashboardShowcase;
