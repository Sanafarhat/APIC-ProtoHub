import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import {
  Activity,
  Map,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Settings,
  Server,
  Cpu,
  Layers,
  DollarSign,
  Database,
  Globe,
  Star,
  Download
} from "lucide-react";
import "./Dashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [broadcastForm, setBroadcastForm] = useState({
    subject: "",
    message: "",
    target: "all_colleges",
  });
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  const [pendingBookings, setPendingBookings] = useState([]);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsBroadcasting(true);
    setBroadcastResult(null);
    try {
      const res = await fetch(
        "http://localhost:5000/api/communications/broadcast",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(broadcastForm),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Broadcast failed");
      setBroadcastResult({ type: "success", msg: data.message });
      setBroadcastForm({ subject: "", message: "", target: "all_colleges" });
    } catch (err) {
      setBroadcastResult({ type: "error", msg: err.message });
    } finally {
      setIsBroadcasting(false);
    }
  };

  const [completedBookings, setCompletedBookings] = useState([]);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const user = userString ? JSON.parse(userString) : null;
    if (user && user.role === "admin") {
      setIsAuthenticated(true);
      fetch("http://localhost:5000/api/bookings")
        .then((res) => res.json())
        .then((data) => {
          setPendingBookings(data.filter((b) => b.status === "pending_admin"));
          setCompletedBookings(data.filter((b) => b.status === "completed" && b.feedback));
        })
        .catch((err) => console.error("Error fetching bookings:", err));
    }
  }, []);

  const handleAdminApproval = async (id, newStatus) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/bookings/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (res.ok) {
        setPendingBookings(pendingBookings.filter((b) => b._id !== id));
        alert(
          `Booking ${newStatus === "pending_operator" ? "approved and sent to operator" : "rejected"} successfully.`,
        );
      }
    } catch (err) {
      console.error(err);
      alert("Error updating booking status");
    }
  };

  useEffect(() => {
    // Simulate complex data aggregation load
    setTimeout(() => setLoading(false), 1200);
  }, []);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        loginForm.email,
        loginForm.password,
      );
      const firebaseUser = userCredential.user;

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginForm.email, uid: firebaseUser.uid }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Error fetching admin profile");

      if (data.user.role !== "admin") {
        throw new Error(
          "Access Denied: You do not have State Admin privileges.",
        );
      }

      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential")
        setLoginError("Invalid admin credentials.");
      else setLoginError(err.message || "Authentication failed.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="dark min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans px-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/50 flex items-center justify-center text-white mb-4 shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              <Shield size={32} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-widest uppercase">
              APIC Overlord
            </h2>
            <p className="text-slate-400 mt-1 font-mono text-xs tracking-wider">
              STATE-LEVEL COMMAND CENTER
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-4 rounded-lg bg-red-900/20 border border-red-500/30 text-red-400 text-sm font-mono">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                Admin Identifier
              </label>
              <input
                type="email"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
                placeholder="admin@apic.com"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, email: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                Passcode
              </label>
              <input
                type="password"
                className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({ ...loginForm, password: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase py-3 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50"
            >
              {isLoggingIn ? "Authenticating..." : "Initialize Override"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-slate-500 hover:text-slate-300 text-xs font-mono uppercase tracking-widest transition-colors"
            >
              Return to Standard Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mock global data
  const globalStats = {
    totalRevenue: "14,520,000",
    totalJobs: 1432,
    innovatorUsers: 845,
    universityOperators: 30,
    activeHubs: 24,
    activeMachines: 186,
  };

  const regionalHubs = [
    {
      name: "Visakhapatnam AMTZ Hub",
      jobs: 420,
      revenue: "4.2M",
      status: "optimal",
      active: 45,
    },
    {
      name: "Tirupati Research Park",
      jobs: 210,
      revenue: "2.1M",
      status: "heavy-load",
      active: 38,
    },
    {
      name: "Amaravati SRM FabLab",
      jobs: 145,
      revenue: "1.5M",
      status: "optimal",
      active: 22,
    },
    {
      name: "Surampalem Aditya Hub",
      jobs: 95,
      revenue: "850K",
      status: "maintenance",
      active: 12,
    },
  ];

  const universityCategories = [
    {
      name: "Government Tier-1 Tech Institutes",
      jobs: 620,
      revenue: "6.2M",
      status: "optimal",
      active: 12,
    },
    {
      name: "Private Engineering Colleges",
      jobs: 410,
      revenue: "4.1M",
      status: "heavy-load",
      active: 10,
    },
    {
      name: "Arts & Design Schools",
      jobs: 245,
      revenue: "2.5M",
      status: "optimal",
      active: 5,
    },
    {
      name: "Medical R&D Centers",
      jobs: 157,
      revenue: "1.7M",
      status: "maintenance",
      active: 3,
    },
  ];

  const telemetryFeed = [
    {
      id: 1,
      machine: "HAAS 5-Axis (VSKP)",
      event: "Job Completed: JOB-123",
      time: "Just now",
      type: "success",
    },
    {
      id: 2,
      machine: "Stratasys F900 (TPT)",
      event: "Material Low Warning",
      time: "5m ago",
      type: "warning",
    },
    {
      id: 3,
      machine: "Formlabs 3B+ (AMV)",
      event: "Calibration Required",
      time: "12m ago",
      type: "danger",
    },
    {
      id: 4,
      machine: "Epilog Laser (VSKP)",
      event: "Job Started: JOB-125",
      time: "22m ago",
      type: "info",
    },
  ];

  if (loading) {
    return (
      <div className="dark min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans">
        <div className="w-24 h-24 rounded-full bg-blue-900/30 border-4 border-blue-500/20 flex items-center justify-center mb-8 relative">
          <Globe size={40} className="text-blue-500 absolute z-10" />
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin z-20"></div>
          <div className="absolute inset-0 rounded-full border-b-4 border-indigo-500 animate-[spin_1.5s_reverse_infinite] z-20"></div>
        </div>
        <h2 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
          <Shield className="text-blue-500" /> APIC Command Center
        </h2>
        <p className="text-slate-400 mt-2 font-mono text-sm tracking-wider">
          Synchronizing state-wide telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-100 font-sans pb-10 overflow-x-hidden selection:bg-blue-500/30">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4 flex justify-between items-center shadow-2xl shadow-blue-900/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-500/30 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]">
            <Globe size={24} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              APIC Overlord
            </h1>
            <p className="text-slate-400 text-xs font-mono font-bold tracking-widest">
              STATE-LEVEL COMMAND CENTER
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex gap-4 font-mono text-xs font-bold bg-slate-900/80 border border-slate-800 py-2 px-4 rounded-lg shadow-inner shadow-black/50 items-center">
            <span className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>{" "}
              SYSTEM NOMINAL
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">PING: 14ms</span>
          </div>
          <button
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
            onClick={() => navigate("/")}
          >
            Exit Node
          </button>
        </div>
      </header>

      <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-8">
        {/* MACRO METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" /> Platform GMV
            </p>
            <h3 className="text-4xl font-black text-white">
              ₹{globalStats.totalRevenue}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-500 text-sm font-bold">
              <TrendingUp size={16} /> +18.4% MoM Growth
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-2">
              <Layers size={16} className="text-indigo-500" /> Total Jobs
              Processed
            </p>
            <h3 className="text-4xl font-black text-white">
              {globalStats.totalJobs}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-indigo-400 text-sm font-bold">
              Across 12 Categories
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-2">
              <Users size={16} className="text-emerald-500" /> Ecosystem Users
            </p>
            <h3 className="text-4xl font-black text-white">
              {globalStats.innovatorUsers}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm font-bold">
              + {globalStats.universityOperators} University Operators
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all"></div>
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-2">
              <Map size={16} className="text-cyan-500" /> Active Hubs
            </p>
            <h3 className="text-4xl font-black text-white">
              {globalStats.activeHubs}{" "}
              <span className="text-lg text-slate-500">/ 30</span>
            </h3>
            <div className="mt-4 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-cyan-500 rounded-full"
                style={{ width: "80%" }}
              ></div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <p className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2 flex items-center gap-2">
              <Cpu size={16} className="text-amber-500" /> Machines Online
            </p>
            <h3 className="text-4xl font-black text-white">
              {globalStats.activeMachines}
            </h3>
            <div className="mt-4 flex items-center gap-2 text-amber-500 text-sm font-bold">
              <Activity size={16} /> 94% Fleet Utilization
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GEOSPATIAL MAP (MOCKUP) */}
          <div className="lg:col-span-2 p-1 rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700 shadow-2xl relative overflow-hidden h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-800/80 bg-slate-900/50 flex justify-between items-center z-10">
              <h2 className="font-black text-lg flex items-center gap-2 tracking-wider">
                <Map className="text-blue-400" /> STATEWIDE GEOSPATIAL VIEW
              </h2>
              <div className="flex gap-2 text-xs font-bold font-mono">
                <span className="bg-slate-800 px-3 py-1 rounded text-slate-400 border border-slate-700">
                  LIVE
                </span>
                <span className="bg-blue-900/30 px-3 py-1 rounded text-blue-400 border border-blue-900/50">
                  ANDHRA PRADESH REGION
                </span>
              </div>
            </div>

            <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
              {/* Grid Background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none"></div>

              {/* Radar Sweep Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-blue-500/10 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-tl from-blue-500/20 to-transparent origin-top-left animate-[spin_4s_linear_infinite] rounded-tl-full border-l-2 border-blue-400"></div>
                <div className="absolute inset-0 rounded-full border border-blue-500/20 scale-75"></div>
                <div className="absolute inset-0 rounded-full border border-blue-500/30 scale-50"></div>
                <div className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6] -translate-x-1/2 -translate-y-1/2"></div>
              </div>

              {/* Mock Nodes on Map */}
              <div className="absolute top-1/4 left-1/3 group cursor-pointer">
                <div className="relative">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_15px_#10b981] animate-pulse"></div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <p className="text-xs font-black text-white">
                      Visakhapatnam AMTZ Hub
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">
                      Status: OPTIMAL | 45 Nodes Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 left-1/4 group cursor-pointer">
                <div className="relative">
                  <div
                    className="w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_15px_#f59e0b] animate-pulse"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <p className="text-xs font-black text-white">
                      Tirupati Research Park
                    </p>
                    <p className="text-[10px] text-amber-400 font-mono mt-1">
                      Status: HEAVY-LOAD | 38 Nodes Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/3 right-1/3 group cursor-pointer">
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse"
                    style={{ animationDelay: "1s" }}
                  ></div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <p className="text-xs font-black text-white">
                      Amaravati SRM FabLab
                    </p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">
                      Status: OPTIMAL | 22 Nodes Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-1/4 left-1/2 group cursor-pointer">
                <div className="relative">
                  <div
                    className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"
                    style={{ animationDelay: "1.5s" }}
                  ></div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900/90 border border-slate-700 px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                    <p className="text-xs font-black text-white">
                      Surampalem Aditya Hub
                    </p>
                    <p className="text-[10px] text-red-400 font-mono mt-1">
                      Status: MAINTENANCE | 12 Nodes Active
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur border border-slate-700 rounded-lg p-3 max-w-xs">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
                  Network Health
                </h4>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-xs">Optimal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-xs">Heavy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-xs">Issue</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="flex flex-col gap-6">
            {/* REGIONAL HUB STATUS */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
                <Database size={18} className="text-indigo-400" /> Regional
                Nodes
              </h2>
              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                {regionalHubs.map((hub, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-slate-200">
                        {hub.name}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          hub.status === "optimal"
                            ? "bg-emerald-900/30 text-emerald-400 border-emerald-900"
                            : hub.status === "heavy-load"
                              ? "bg-amber-900/30 text-amber-400 border-amber-900"
                              : "bg-red-900/30 text-red-400 border-red-900"
                        }`}
                      >
                        {hub.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Rev: ₹{hub.revenue}</span>
                      <span>Jobs: {hub.jobs}</span>
                      <span>Active: {hub.active}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* UNIVERSITY CATEGORIES */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
                <Database size={18} className="text-indigo-400" /> University
                Categories
              </h2>
              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {universityCategories.map((category, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-950 border border-slate-800/50 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm text-slate-200">
                        {category.name}
                      </h4>
                      <span
                        className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                          category.status === "optimal"
                            ? "bg-emerald-900/30 text-emerald-400 border-emerald-900"
                            : category.status === "heavy-load"
                              ? "bg-amber-900/30 text-amber-400 border-amber-900"
                              : "bg-red-900/30 text-red-400 border-red-900"
                        }`}
                      >
                        {category.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Rev: ₹{category.revenue}</span>
                      <span>Jobs: {category.jobs}</span>
                      <span>Nodes: {category.active}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* LIVE TELEMETRY FEED */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex-1 flex flex-col">
              <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
                <Server size={18} className="text-amber-400" /> Live Telemetry
              </h2>
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                {telemetryFeed.map((feed) => (
                  <div
                    key={feed.id}
                    className="relative pl-4 border-l-2 border-slate-800 group"
                  >
                    <div
                      className={`absolute -left-[5px] top-1.5 w-2 h-2 rounded-full ${
                        feed.type === "success"
                          ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                          : feed.type === "warning"
                            ? "bg-amber-500 shadow-[0_0_5px_#f59e0b]"
                            : feed.type === "danger"
                              ? "bg-red-500 shadow-[0_0_5px_#ef4444]"
                              : "bg-blue-500 shadow-[0_0_5px_#3b82f6]"
                      }`}
                    ></div>
                    <p className="text-xs font-mono font-bold text-slate-400 mb-0.5">
                      {feed.time} <span className="opacity-50">|</span>{" "}
                      {feed.machine}
                    </p>
                    <p
                      className={`text-sm font-semibold ${feed.type === "danger" ? "text-red-400" : "text-slate-200"}`}
                    >
                      {feed.event}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-bold text-slate-400 transition-colors uppercase tracking-widest">
                View Raw Logs
              </button>
            </div>
          </div>

          {/* BROADCAST COMMUNICATIONS CENTER */}
          <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
              <Zap size={18} className="text-indigo-400" /> Statewide Broadcast
              Center
            </h2>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <p className="text-sm text-slate-400 mb-4">
                  Send critical updates, maintenance alerts, or notifications to
                  all regional hubs and university operators instantly via
                  email.
                </p>

                {broadcastResult && (
                  <div
                    className={`p-4 mb-4 rounded-lg font-mono text-sm border ${broadcastResult.type === "success" ? "bg-emerald-900/30 text-emerald-400 border-emerald-500/30" : "bg-red-900/30 text-red-400 border-red-500/30"}`}
                  >
                    {broadcastResult.type === "success" ? "✓ " : "⚠ "}
                    {broadcastResult.msg}
                  </div>
                )}

                <form onSubmit={handleBroadcast} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                      Recipient Target
                    </label>
                    <select
                      className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
                      value={broadcastForm.target}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          target: e.target.value,
                        })
                      }
                    >
                      <option value="all_colleges">
                        ALL UNIVERSITIES & HUBS (Global Broadcast)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm"
                      placeholder="e.g. Critical Node Maintenance Schedule"
                      value={broadcastForm.subject}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          subject: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-widest">
                      Message Payload
                    </label>
                    <textarea
                      className="w-full bg-slate-950 border border-slate-800 text-white p-3 rounded-xl focus:outline-none focus:border-indigo-500 font-mono text-sm min-h-[150px]"
                      placeholder="Enter update details here..."
                      value={broadcastForm.message}
                      onChange={(e) =>
                        setBroadcastForm({
                          ...broadcastForm,
                          message: e.target.value,
                        })
                      }
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isBroadcasting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-widest uppercase py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(79,70,229,0.3)] disabled:opacity-50 flex items-center gap-2"
                  >
                    {isBroadcasting ? "TRANSMITTING..." : "DISPATCH BROADCAST"}
                  </button>
                </form>
              </div>

              <div className="w-full lg:w-1/3 bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-400">
                <h4 className="text-slate-300 font-bold mb-2 flex items-center gap-2">
                  <Globe size={14} /> BROADCAST PROTOCOL
                </h4>
                <p className="mb-2">
                  1. Target group is resolved dynamically via Node Registry.
                </p>
                <p className="mb-2">
                  2. Emails dispatched via encrypted API tunnel (Resend).
                </p>
                <p className="mb-2 text-indigo-400">
                  STATUS: READY FOR TRANSMISSION
                </p>
              </div>
            </div>
          </div>

          {/* PENDING BOOKINGS QUEUE */}
          <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
              <Shield size={18} className="text-emerald-400" /> Pending Booking
              Approvals (Step 1)
            </h2>
            {pendingBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-500 font-mono text-sm">
                No bookings pending admin approval.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-emerald-400 text-sm">
                          Booking #{booking._id.substring(18)}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-amber-900/30 text-amber-400 border border-amber-900/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        Admin Review
                      </span>
                    </div>
                    <div className="text-sm">
                      <p className="text-slate-300">
                        <span className="text-slate-500 mr-2">User:</span>{" "}
                        {booking.user?.name}
                      </p>
                      <p className="text-slate-300">
                        <span className="text-slate-500 mr-2">Facility:</span>{" "}
                        {booking.facility?.name}
                      </p>
                      <p className="text-slate-300">
                        <span className="text-slate-500 mr-2">Amount:</span> ₹
                        {booking.totalCost}
                      </p>
                    </div>
                    <div className="mt-auto pt-4 border-t border-slate-800 flex gap-2">
                      <button
                        onClick={() =>
                          handleAdminApproval(booking._id, "pending_operator")
                        }
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleAdminApproval(booking._id, "rejected")
                        }
                        className="bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white font-bold py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT FEEDBACK QUEUE */}
          <div className="mt-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
            <h2 className="font-black text-lg mb-4 flex items-center gap-2 uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-4">
              <Star size={18} className="text-pink-400" /> Recent Innovator Feedback
            </h2>
            {completedBookings.length === 0 ? (
              <div className="p-8 text-center bg-slate-950 border border-slate-800 rounded-xl text-slate-500 font-mono text-sm">
                No recent feedback available.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-emerald-400 text-sm">
                          Booking #{booking._id.substring(18)}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          {new Date(booking.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
                        Completed
                      </span>
                    </div>
                    <div className="text-sm border-t border-slate-800 pt-3">
                      <p className="text-slate-300 mb-1">
                        <span className="text-slate-500 mr-2">Facility:</span>{" "}
                        {booking.facility?.name}
                      </p>
                      <p className="text-slate-300 mb-1">
                        <span className="text-slate-500 mr-2">Innovator:</span>{" "}
                        {booking.user?.name}
                      </p>
                      {booking.feedback && (
                        <div className="mt-3 p-3 bg-pink-900/10 border border-pink-900/30 rounded-lg relative group">
                          <button 
                            onClick={() => {
                              const content = `Feedback Form\n\nBooking ID: ${booking._id}\nFacility: ${booking.facility?.name || 'N/A'}\nInnovator: ${booking.user?.name || 'N/A'}\nDate: ${new Date(booking.createdAt).toLocaleString()}\n\nFeedback Details:\n${booking.feedback}\n`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `feedback_JOB-${booking._id.substring(18)}.txt`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(url);
                            }}
                            className="absolute right-3 top-3 text-[10px] font-bold text-pink-500/70 hover:text-pink-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Download size={12} /> Download
                          </button>
                          <p className="text-[10px] font-bold text-pink-500 uppercase tracking-wider mb-1">Feedback Left:</p>
                          <p className="text-sm italic text-slate-300 pr-20">"{booking.feedback}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* GLOBAL STYLES FOR ADMIN */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `,
        }}
      />
    </div>
  );
};

export default AdminDashboard;
