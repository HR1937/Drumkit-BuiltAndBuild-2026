import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Settings,
  Sun,
  Moon,
  Activity,
  AlertTriangle,
  TrendingDown,
  UserRound,
  ArrowUpRight,
  Globe,
  Smartphone,
  Phone,
  MapPin,
} from "lucide-react";
import useTheme from "../hooks/useTheme";

export default function Dashboard() {
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState({
    firstName: "User",
    lastName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("breezeUser");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Customers",
      icon: Users,
    },
    {
      label: "Reports",
      icon: FileText,
    },
    {
      label: "Alerts",
      icon: Bell,
    },
    {
      label: "Settings",
      icon: Settings,
    },
  ];

  const stats = [
    {
      title: "Total Customers",
      value: "2,481",
      change: "+12.4%",
      icon: Users,
    },
    {
      title: "Journeys Tracked",
      value: "8,642",
      change: "+18.7%",
      icon: Activity,
    },
    {
      title: "Unresolved Issues",
      value: "126",
      change: "-8.2%",
      icon: AlertTriangle,
    },
    {
      title: "Churn Signals",
      value: "47",
      change: "+5.3%",
      icon: TrendingDown,
    },
  ];

  const recentActivity = [
    {
      customer: "Customer #1048",
      action: "Support interaction detected",
      channel: "Call Center",
      time: "5 min ago",
    },
    {
      customer: "Customer #2187",
      action: "Journey drop-off detected",
      channel: "Website",
      time: "18 min ago",
    },
    {
      customer: "Customer #0932",
      action: "Repeated contact detected",
      channel: "Mobile App",
      time: "32 min ago",
    },
    {
      customer: "Customer #1764",
      action: "Issue resolved",
      channel: "Physical Location",
      time: "48 min ago",
    },
  ];

  const atRiskCustomers = [
    {
      id: "#1048",
      issue: "3 repeated contacts",
      channel: "Call Center",
      risk: "High",
    },
    {
      id: "#2187",
      issue: "Journey drop-off",
      channel: "Website",
      risk: "Medium",
    },
    {
      id: "#0932",
      issue: "Unresolved issue",
      channel: "Mobile App",
      risk: "High",
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* TOP NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-ink/10 bg-paper/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between px-5 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-thread" />
            <span className="text-xl font-bold tracking-tight">Breeze</span>
          </div>

          {/* Horizontal Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "bg-thread/10 text-thread"
                      : "text-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Theme + Avatar */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-xl p-2.5 text-muted transition hover:bg-ink/5 hover:text-ink"
              title="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun size={19} />
              ) : (
                <Moon size={19} />
              )}
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-thread text-sm font-semibold text-white">
              {user.firstName?.charAt(0)?.toUpperCase() || "U"}
            </div>
          </div>
        </div>
      </header>

      {/* LEFT SIDEBAR */}
      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 border-r border-ink/10 bg-paper lg:block">
        <div className="flex h-full flex-col p-4">
          <div className="mb-6 px-3 pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Workspace
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    index === 0
                      ? "bg-thread text-white shadow-sm"
                      : "text-muted hover:bg-ink/5 hover:text-ink"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Account */}
          <div className="mt-auto rounded-2xl border border-ink/10 bg-surface p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-thread/10 text-thread">
                <UserRound size={18} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {fullName || "Breeze User"}
                </p>

                <p className="truncate text-xs text-muted">
                  {user.role || "Account"}
                </p>
              </div>
            </div>

            <p className="truncate text-xs text-muted">
              {user.email || "No email available"}
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="pt-16 lg:pl-60">
        <div className="mx-auto max-w-[1600px] px-5 py-8 lg:px-8">
          {/* MOBILE NAV */}
          <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
            {navItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    index === 0
                      ? "bg-thread text-white"
                      : "bg-surface text-muted"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* WELCOME */}
          <section className="mb-8 rounded-3xl border border-ink/10 bg-surface p-6 shadow-sm md:p-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="mb-2 text-sm font-medium text-thread">
                  Customer Journey Intelligence
                </p>

                <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                  Welcome, {user.firstName || "User"}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                  Monitor customer journeys across every channel and discover
                  drop-offs, repeated contacts, unresolved issues, and potential
                  churn signals.
                </p>
              </div>

              <div className="rounded-2xl bg-thread/10 px-5 py-4">
                <p className="text-xs font-medium text-muted">Current role</p>
                <p className="mt-1 font-semibold text-thread">
                  {user.role || "Analyst"}
                </p>
              </div>
            </div>
          </section>

          {/* ACCOUNT INFORMATION */}
          <section className="mb-8">
            <div className="mb-4">
              <h2 className="text-xl font-bold">Account Information</h2>
              <p className="mt-1 text-sm text-muted">
                Information provided during registration.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <InfoCard label="Name" value={fullName || "Not provided"} />
              <InfoCard label="Email" value={user.email || "Not provided"} />
              <InfoCard
                label="Company"
                value={user.company || "Not provided"}
              />
              <InfoCard
                label="Phone"
                value={user.phone || "Not provided"}
              />
            </div>
          </section>

          {/* KPI CARDS */}
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-sm"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-thread/10 text-thread">
                      <Icon size={20} />
                    </div>

                    <span className="text-xs font-semibold text-thread">
                      {stat.change}
                    </span>
                  </div>

                  <p className="text-sm text-muted">{stat.title}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                </div>
              );
            })}
          </section>

          {/* JOURNEY FUNNEL + CHANNELS */}
          <section className="mb-8 grid gap-6 xl:grid-cols-2">
            {/* Funnel */}
            <div className="rounded-3xl border border-ink/10 bg-surface p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Journey Overview</h2>
                <p className="mt-1 text-sm text-muted">
                  Current customer journey progression.
                </p>
              </div>

              <div className="space-y-4">
                <FunnelRow label="Journeys Started" value="8,642" width="100%" />
                <FunnelRow label="Engaged" value="6,914" width="80%" />
                <FunnelRow label="Support / Issue" value="2,384" width="55%" />
                <FunnelRow label="Resolved / Completed" value="1,962" width="42%" />
              </div>
            </div>

            {/* Channels */}
            <div className="rounded-3xl border border-ink/10 bg-surface p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Customer Channels</h2>
                <p className="mt-1 text-sm text-muted">
                  Where customer interactions are taking place.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <ChannelCard
                  icon={Globe}
                  label="Website"
                  value="3,218"
                />
                <ChannelCard
                  icon={Smartphone}
                  label="Mobile App"
                  value="2,746"
                />
                <ChannelCard
                  icon={Phone}
                  label="Call Center"
                  value="1,624"
                />
                <ChannelCard
                  icon={MapPin}
                  label="Physical Location"
                  value="1,054"
                />
              </div>
            </div>
          </section>

          {/* ACTIVITY + AT RISK */}
          <section className="grid gap-6 xl:grid-cols-2">
            {/* Activity */}
            <div className="rounded-3xl border border-ink/10 bg-surface p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Recent Activity</h2>
                  <p className="mt-1 text-sm text-muted">
                    Latest customer journey events.
                  </p>
                </div>

                <ArrowUpRight size={19} className="text-muted" />
              </div>

              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div
                    key={`${item.customer}-${item.time}`}
                    className="flex gap-3 border-b border-ink/8 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-thread" />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {item.customer}
                        </p>

                        <span className="text-xs text-muted">
                          {item.time}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-muted">
                        {item.action}
                      </p>

                      <span className="mt-2 inline-flex rounded-full bg-thread/10 px-2.5 py-1 text-xs font-medium text-thread">
                        {item.channel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* At Risk */}
            <div className="rounded-3xl border border-ink/10 bg-surface p-6 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold">At-Risk Customers</h2>
                <p className="mt-1 text-sm text-muted">
                  Customers requiring attention based on journey signals.
                </p>
              </div>

              <div className="space-y-3">
                {atRiskCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="rounded-2xl border border-ink/8 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Customer {customer.id}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {customer.issue}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          customer.risk === "High"
                            ? "bg-red-500/10 text-red-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {customer.risk}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-muted">
                        {customer.channel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-surface p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function FunnelRow({ label, value, width }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-ink/5">
        <div
          className="h-full rounded-full bg-thread"
          style={{ width }}
        />
      </div>
    </div>
  );
}

function ChannelCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-ink/8 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-thread/10 text-thread">
        <Icon size={19} />
      </div>

      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-lg font-bold">{value}</p>
      </div>
    </div>
  );
}
