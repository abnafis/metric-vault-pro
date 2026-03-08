import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";
import { TrendingUp, Eye, MousePointerClick, DollarSign } from "lucide-react";

const areaData = [
  { v: 20 }, { v: 35 }, { v: 28 }, { v: 45 }, { v: 38 }, { v: 55 }, { v: 48 }, { v: 62 }, { v: 58 }, { v: 72 }, { v: 68 }, { v: 85 },
];

const barData = [
  { n: "Organic", v: 42 }, { n: "Paid", v: 28 }, { n: "Social", v: 18 }, { n: "Email", v: 12 },
];

const events = [
  { name: "purchase", count: "2,847", time: "2s ago" },
  { name: "add_to_cart", count: "5,129", time: "5s ago" },
  { name: "page_view", count: "48,392", time: "1s ago" },
];

const MetricCard = ({ icon: Icon, label, value, change, delay }: { icon: any; label: string; value: string; change: string; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="metric-card flex flex-col gap-1"
  >
    <div className="flex items-center justify-between">
      <Icon className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs text-chart-green font-mono">{change}</span>
    </div>
    <span className="text-xl font-bold text-foreground">{value}</span>
    <span className="text-xs text-muted-foreground">{label}</span>
  </motion.div>
);

const HeroDashboard = () => (
  <motion.div
    initial={{ opacity: 0, x: 40 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.8, delay: 0.3 }}
    className="relative w-full max-w-lg"
  >
    {/* Glow behind */}
    <div className="absolute -inset-10 bg-radial-glow opacity-60 blur-3xl pointer-events-none" />

    <div className="glass-card glow-border p-5 space-y-4 relative">
      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={MousePointerClick} label="Conversion Rate" value="4.28%" change="+12.3%" delay={0.5} />
        <MetricCard icon={DollarSign} label="Revenue" value="$48.2K" change="+8.7%" delay={0.6} />
        <MetricCard icon={Eye} label="Sessions" value="128K" change="+15.2%" delay={0.7} />
        <MetricCard icon={TrendingUp} label="ROAS" value="5.4x" change="+22.1%" delay={0.8} />
      </div>

      {/* Revenue chart */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="metric-card"
      >
        <span className="text-xs text-muted-foreground mb-2 block">Revenue Attribution</span>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart data={areaData}>
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(210 100% 55%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(210 100% 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke="hsl(210 100% 55%)" fill="url(#heroGrad)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Traffic + Events row */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="metric-card">
          <span className="text-xs text-muted-foreground mb-2 block">Traffic Sources</span>
          <ResponsiveContainer width="100%" height={80}>
            <BarChart data={barData}>
              <XAxis dataKey="n" tick={{ fontSize: 9, fill: "hsl(215 15% 55%)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="v" fill="hsl(260 80% 60%)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }} className="metric-card">
          <span className="text-xs text-muted-foreground mb-2 block">Event Tracking</span>
          <div className="space-y-1.5">
            {events.map((e) => (
              <div key={e.name} className="flex items-center justify-between text-[10px]">
                <code className="text-glow-cyan font-mono">{e.name}</code>
                <span className="text-muted-foreground">{e.count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </motion.div>
);

export default HeroDashboard;
