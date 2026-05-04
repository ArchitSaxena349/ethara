import { CalendarClock, CheckSquare, ClipboardList, Filter, FolderKanban, LayoutDashboard, LogOut, Plus, UserPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, setToken } from "./api";

const STATUSES = ["Todo", "In Progress", "Done"];
const EMPTY_SUMMARY = { Todo: 0, "In Progress": 0, Done: 0 };

function storedAuth() {
  try {
    return JSON.parse(localStorage.getItem("taskflow-auth"));
  } catch {
    return null;
  }
}

function formatDate(date) {
  if (!date) return "No date";
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(date));
}

function isOverdue(task) {
  if (task.status === "Done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(task.dueDate) < today;
}

export default function App() {
  const [auth, setAuth] = useState(storedAuth);
  const [view, setView] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const isAdmin = auth?.user?.role === "Admin";

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("taskflow-auth");
    setAuth(null);
    setDashboard(null);
    setProjects([]);
    setTasks([]);
    setUsers([]);
  }, []);

  const refresh = useCallback(async () => {
    if (!auth) return;
    setLoading(true);
    setMessage("");

    try {
      const taskQuery = statusFilter === "All" ? "" : `?status=${encodeURIComponent(statusFilter)}`;
      const requests = [api("/dashboard"), api("/projects"), api(`/tasks${taskQuery}`)];
      if (isAdmin) requests.push(api("/users?role=Member"));
      const [dashboardData, projectData, taskData, userData = []] = await Promise.all(requests);
      setDashboard(dashboardData);
      setProjects(projectData);
      setTasks(taskData);
      setUsers(userData);
    } catch (error) {
      setMessage(error.message);
      if (error.message.toLowerCase().includes("token")) logout();
    } finally {
      setLoading(false);
    }
  }, [auth, isAdmin, logout, statusFilter]);

  useEffect(() => {
    if (auth?.token) {
      setToken(auth.token);
      localStorage.setItem("taskflow-auth", JSON.stringify(auth));
      refresh();
    }
  }, [auth, refresh]);

  if (!auth) return <AuthScreen onAuth={setAuth} />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">ET</div>
          <div><strong>Ethara</strong><span>{auth.user.role}</span></div>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          <NavButton icon={LayoutDashboard} label="Dashboard" active={view === "dashboard"} onClick={() => setView("dashboard")} />
          <NavButton icon={FolderKanban} label="Projects" active={view === "projects"} onClick={() => setView("projects")} />
          <NavButton icon={CheckSquare} label="Tasks" active={view === "tasks"} onClick={() => setView("tasks")} />
        </nav>
        <button className="ghost-button logout" type="button" onClick={logout}><LogOut size={18} />Logout</button>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div><p className="eyebrow">Welcome back</p><h1>{auth.user.name}</h1></div>
          <button className="secondary-button" type="button" onClick={refresh} disabled={loading}>Refresh</button>
        </header>
        {message ? <div className="notice">{message}</div> : null}
        {view === "dashboard" ? <Dashboard dashboard={dashboard} loading={loading} /> : null}
        {view === "projects" ? <Projects isAdmin={isAdmin} projects={projects} users={users} onRefresh={refresh} setMessage={setMessage} /> : null}
        {view === "tasks" ? <Tasks isAdmin={isAdmin} projects={projects} users={users} tasks={tasks} statusFilter={statusFilter} setStatusFilter={setStatusFilter} onRefresh={refresh} setMessage={setMessage} /> : null}
      </main>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Member" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isSignup = mode === "signup";

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const body = isSignup ? form : { email: form.email, password: form.password };
      const auth = await api(`/auth/${isSignup ? "signup" : "login"}`, { method: "POST", body });
      setToken(auth.token);
      onAuth(auth);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel">
        <div className="auth-copy">
          <div className="brand compact"><div className="brand-mark">ET</div><div><strong>Ethara</strong><span>Project task tracking</span></div></div>
          <h1>{isSignup ? "Create your workspace login" : "Sign in to your workspace"}</h1>
          <p>Admins create projects and assign tasks. Members view assigned work and update status.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <div className="segmented" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>Signup</button>
          </div>
          {isSignup ? <label>Name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label> : null}
          <label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></label>
          <label>Password<input type="password" minLength={6} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required /></label>
          {isSignup ? <label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option>Member</option><option>Admin</option></select></label> : null}
          {message ? <div className="notice compact-notice">{message}</div> : null}
          <button className="primary-button" disabled={loading} type="submit">{loading ? "Working..." : isSignup ? "Create account" : "Login"}</button>
        </form>
      </section>
    </main>
  );
}

function NavButton({ icon: Icon, label, active, onClick }) {
  return <button className={`nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}><Icon size={18} />{label}</button>;
}

function Dashboard({ dashboard, loading }) {
  const summary = dashboard?.statusSummary || EMPTY_SUMMARY;
  return (
    <section className="page-stack">
      <div className="metric-grid">
        <Metric label="Total tasks" value={dashboard?.totalTasks || 0} />
        <Metric label="Todo" value={summary.Todo} tone="amber" />
        <Metric label="In progress" value={summary["In Progress"]} tone="blue" />
        <Metric label="Done" value={summary.Done} tone="green" />
      </div>
      <div className="split-grid">
        <section className="panel"><PanelHeader icon={ClipboardList} title="My Tasks" /><TaskPreviewList tasks={dashboard?.myTasks || []} loading={loading} /></section>
        <section className="panel"><PanelHeader icon={CalendarClock} title="Overdue Tasks" /><TaskPreviewList tasks={dashboard?.overdueTasks || []} loading={loading} overdue /></section>
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }) {
  return <div className={`metric-card ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function PanelHeader({ icon: Icon, title }) {
  return <div className="panel-header"><Icon size={18} /><h2>{title}</h2></div>;
}

function TaskPreviewList({ tasks, loading, overdue = false }) {
  if (loading) return <p className="empty-text">Loading...</p>;
  if (!tasks.length) return <p className="empty-text">Nothing here yet.</p>;
  return <div className="task-preview-list">{tasks.map((task) => <article className="task-row" key={task._id}><div><strong>{task.title}</strong><span>{task.projectId?.name || "No project"}</span></div><div className="row-meta">{overdue || isOverdue(task) ? <span className="badge danger">Overdue</span> : null}<span className={`badge status-${task.status.replaceAll(" ", "-").toLowerCase()}`}>{task.status}</span><span>{formatDate(task.dueDate)}</span></div></article>)}</div>;
}

function Projects({ isAdmin, projects, users, onRefresh, setMessage }) {
  const [form, setForm] = useState({ name: "", description: "", members: [] });
  const [memberByProject, setMemberByProject] = useState({});

  async function createProject(event) {
    event.preventDefault();
    try {
      await api("/projects", { method: "POST", body: form });
      setForm({ name: "", description: "", members: [] });
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function addMember(projectId) {
    const memberId = memberByProject[projectId];
    if (!memberId) return;
    try {
      await api(`/projects/${projectId}/add-member`, { method: "POST", body: { memberId } });
      setMemberByProject({ ...memberByProject, [projectId]: "" });
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="page-stack">
      {isAdmin ? <form className="panel form-grid" onSubmit={createProject}><PanelHeader icon={Plus} title="Create Project" /><label>Project name<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} /></label><label>Initial members<select multiple value={form.members} onChange={(event) => setForm({ ...form, members: Array.from(event.target.selectedOptions).map((option) => option.value) })}>{users.map((user) => <option key={user._id} value={user._id}>{user.name} - {user.email}</option>)}</select></label><button className="primary-button fit" type="submit">Create project</button></form> : null}
      <div className="item-grid">{projects.map((project) => <article className="item-card" key={project._id}><div className="item-card-head"><div><h2>{project.name}</h2><p>{project.description || "No description"}</p></div><span className="badge">{project.members?.length || 0} members</span></div><div className="member-list">{(project.members || []).map((member) => <span key={member._id}>{member.name}</span>)}</div>{isAdmin ? <div className="inline-actions"><select value={memberByProject[project._id] || ""} onChange={(event) => setMemberByProject({ ...memberByProject, [project._id]: event.target.value })}><option value="">Select member</option>{users.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}</select><button className="secondary-button icon-button-text" type="button" onClick={() => addMember(project._id)}><UserPlus size={16} />Add</button></div> : null}</article>)}</div>
    </section>
  );
}

function Tasks({ isAdmin, projects, users, tasks, statusFilter, setStatusFilter, onRefresh, setMessage }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ title: "", description: "", projectId: "", assignedTo: "", dueDate: today });
  const selectedProject = useMemo(() => projects.find((project) => project._id === form.projectId), [form.projectId, projects]);
  const assigneeOptions = selectedProject?.members?.length ? selectedProject.members : users;

  async function createTask(event) {
    event.preventDefault();
    try {
      await api("/tasks", { method: "POST", body: { ...form, status: "Todo" } });
      setForm({ title: "", description: "", projectId: "", assignedTo: "", dueDate: today });
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function updateStatus(taskId, status) {
    try {
      await api(`/tasks/${taskId}`, { method: "PATCH", body: { status } });
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="page-stack">
      {isAdmin ? <form className="panel form-grid" onSubmit={createTask}><PanelHeader icon={Plus} title="Create Task" /><label>Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label><label>Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} /></label><div className="two-column"><label>Project<select value={form.projectId} onChange={(event) => setForm({ ...form, projectId: event.target.value, assignedTo: "" })} required><option value="">Select project</option>{projects.map((project) => <option key={project._id} value={project._id}>{project.name}</option>)}</select></label><label>Assignee<select value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} required disabled={!form.projectId}><option value="">Select member</option>{assigneeOptions.map((user) => <option key={user._id} value={user._id}>{user.name}</option>)}</select></label></div><label>Due date<input type="date" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} required /></label><button className="primary-button fit" type="submit">Create task</button></form> : null}
      <section className="panel"><div className="toolbar"><PanelHeader icon={Filter} title="Task Board" /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div><div className="task-list">{tasks.length ? tasks.map((task) => <article className={`task-card ${isOverdue(task) ? "overdue" : ""}`} key={task._id}><div className="task-main"><div><h2>{task.title}</h2><p>{task.description || "No description"}</p></div><div className="task-badges">{isOverdue(task) ? <span className="badge danger">Overdue</span> : null}<span className={`badge status-${task.status.replaceAll(" ", "-").toLowerCase()}`}>{task.status}</span></div></div><div className="task-footer"><span>{task.projectId?.name || "No project"}</span><span>{task.assignedTo?.name || "Unassigned"}</span><span>{formatDate(task.dueDate)}</span><select value={task.status} onChange={(event) => updateStatus(task._id, event.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></div></article>) : <p className="empty-text">No tasks match this view.</p>}</div></section>
    </section>
  );
}
