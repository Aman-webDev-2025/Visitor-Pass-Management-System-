import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatCard from "../components/StatCard";
import UserCard from "../components/UserCard";
import VisitorCard from "../components/VisitorCard";
import API, { getAuthConfig } from "../services/api";

function Dashboard(){
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState("");
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    checkedIn: 0,
    checkedOut: 0,
  })
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [openScheduleId, setOpenScheduleId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitTime, setVisitTime] = useState("");
  const [issueLoadingId, setIssueLoadingId] = useState("");

  
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");
  const currentUserId = localStorage.getItem("userId");
  const canManageVisitors = role === "admin" || role === "employee";
  const canIssuePass = role === "admin" || role === "security";

  const refreshVisitors = async () =>{
    try{
      let url = `/visitors?search=${encodeURIComponent(search)}`;
      if (status !== "all") url += `&status=${status}`;
      const res = await API.get(url, getAuthConfig());
      setVisitors(res.data.visitors);
      setSummary(res.data.summary);
    } 
    catch(err){
      console.error("Could not load visitors", err.message);
      alert(err.response?.data?.message || "Could not load visitors");
    }
  };

  const refreshUsers = async (showError = true) =>{
    if (role !== "admin") return;

    try{
      setUsersLoading(true);
      const res = await API.get("/auth/users", getAuthConfig());
      setUsers(res.data);
    } 
    catch(err){
      console.error("Could not load users", err.message);
      if(showError){
        alert(err.response?.data?.message || "Could not load users");
      }
    } 
    finally{
      setUsersLoading(false);
    }
  };

  useEffect(() =>{
    const fetchVisitors = async () => {
      try{
        let url = `/visitors?search=${encodeURIComponent(search)}`;
        if(status !== "all") url += `&status=${status}`;
        const res = await API.get(url, getAuthConfig());
        setVisitors(res.data.visitors);
        setSummary(res.data.summary);
      } 
      catch(err){
        console.error("Could not load visitors", err.message);
        alert(err.response?.data?.message || "Could not load visitors");
      }
    };

    fetchVisitors();
  }, [search, status]);

  useEffect(() => {
    const loadUsers = async () => {
      if(role !== "admin"){
        return;
      }

      try{
        setUsersLoading(true);
        const res = await API.get("/auth/users", getAuthConfig());
        setUsers(res.data);
      } 
      catch(err){
        console.error("Cant load users", err.message);
        alert(err.response?.data?.message || "Cant load users right now");
      } 
      finally{
        setUsersLoading(false);
      }
    }

    loadUsers();
  }, [role]);

  const approveVisitor = async (id) => {
    try{
      await API.patch(`/visitors/${id}/approve`, {}, getAuthConfig());
      console.log("Visitor approved");
      refreshVisitors();
    } 
    catch (err){
      console.error("Cant approve visitor", err.message);
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  const rejectVisitor = async (id) =>{
    try{
      await API.patch(`/visitors/${id}/reject`, {}, getAuthConfig());
      console.log("Visitor rejected");
      refreshVisitors();
    } 
    catch(err){
      console.error("Can'nt reject visitor", err.message);
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  const openSchedule = (visitorId) => {
    setOpenScheduleId(visitorId);
    setVisitDate("");
    setVisitTime("");
  };

  const closeSchedule = () => {
    setOpenScheduleId("");
    setVisitDate("");
    setVisitTime("");
  };

  const saveSchedule = async (visitorId) => {
    if(!visitDate || !visitTime){
      alert("Please select date and time");
      return;
    }

    try{
      await API.patch(`/visitors/${visitorId}/schedule`, { visitDate, visitTime }, getAuthConfig());
      console.log("Visitor meeting time saved");
      closeSchedule();
      refreshVisitors();
    } 
    catch(err){
      console.error("Cant save visitor meeting time", err.message);
      alert(err.response?.data?.message || "Schedule failed");
    }
  };

  const issuePass = async (id) =>{
    if(issueLoadingId === id){
      return;
    }

    try{
      setIssueLoadingId(id);
      const res = await API.patch(`/visitors/${id}/issue-pass`, {}, getAuthConfig());
      console.log("Visitor pass issued");
      alert(res.data.message);
      refreshVisitors();
    } 
    catch(err){
      console.error("Could not issue visitor pass", err.message);
      alert(err.response?.data?.message || "Issue pass failed");
    } 
    finally{
      setIssueLoadingId("");
    }
  };

  const exportVisitors = async () =>{
    try{
      const res = await API.get("/visitors/export", { ...getAuthConfig(), responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "visitors.csv");
      link.click();
      console.log("Visitor report exported");
    } 
    catch(err){
      console.error("Cant export visitor report", err.message);
      alert("Export failed");
    }
  };

  const deleteUser = async (userId) => {
    const confirmed = window.confirm("Delete this user account?");
    if(!confirmed){
      return;
    }

    try{
      setDeleteUserId(userId);
      const res = await API.delete(`/auth/users/${userId}`, getAuthConfig());
      console.log("Staff account deleted");
      alert(res.data.message);
      refreshUsers(false);
    } 
    catch(err){
      console.error("Cant delete staff account", err.message);
      alert(err.response?.data?.message || "Cant delete user");
    } 
    finally{
      setDeleteUserId("");
    }
  };

  return(
    <div className="min-h-screen bg-gray-100 px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>

            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome, {userName}</p>
          
          </div>

          <div className="flex flex-wrap gap-3">

            {canIssuePass && (
              <button onClick={() => navigate("/scan")} className="rounded-lg bg-blue-600 px-4 py-2 text-white shadow-sm hover:bg-blue-700">Scan QR</button>
            )}

            <button onClick={() => navigate("/pass-lookup")} className="rounded-lg bg-gray-800 px-4 py-2 text-white shadow-sm hover:bg-gray-900">Pass Lookup</button>

            {role === "admin" && (
              <button onClick={exportVisitors} className="rounded-lg bg-green-600 px-4 py-2 text-white shadow-sm hover:bg-green-700">Export CSV</button>
            )}

            <button className="rounded-lg bg-red-500 px-4 py-2 text-white shadow-sm hover:bg-red-600"
              onClick={() => {
                console.log("Staff logged out");
                localStorage.clear();
                navigate("/");
              }}>
              Logout
            </button>

          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard title="Total Visitors" value={summary.total} />
          <StatCard title="Pending Approvals" value={summary.pending} color="text-yellow-600" />
          <StatCard title="Checked In" value={summary.checkedIn} color="text-green-600" />
          <StatCard title="Checked Out" value={summary.checkedOut} color="text-orange-600" />

        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm border md:flex-row">
          
          <input
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-blue-400"
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}/>
            
          <select
            className="rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-blue-400"
            value={status}
            onChange={(e) => setStatus(e.target.value)}>

            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {canManageVisitors && (
            <button onClick={() => navigate("/add")} className="rounded-xl bg-blue-600 px-6 py-2 text-white shadow-sm hover:bg-blue-700">Add Visitor</button>
          )}
        </div>

        <div className="grid gap-5">
          {visitors.length === 0 && (
            <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm border">
              No visitors found for the current filters.
            </div>
          )}

          {visitors.map((visitor) => (
            <VisitorCard
              key={visitor._id}
              visitor={visitor}
              canManageVisitors={canManageVisitors}
              canIssuePass={canIssuePass}
              openScheduleId={openScheduleId}
              visitDate={visitDate}
              visitTime={visitTime}
              issueLoadingId={issueLoadingId}
              setVisitDate={setVisitDate}
              setVisitTime={setVisitTime}
              onApprove={approveVisitor}
              onReject={rejectVisitor}
              onOpenSchedule={openSchedule}
              onCloseSchedule={closeSchedule}
              onSaveSchedule={saveSchedule}
              onIssuePass={issuePass}
            />
          ))}
        </div>

        {role === "admin" && (
          <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
            <div>

              <h2 className="text-xl font-semibold text-gray-800">Staff Management</h2>
              <p className="mt-1 text-sm text-gray-500">Delete staff accounts</p>
            
            </div>

            <div className="mt-5 grid gap-3">
              {usersLoading && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  Loading staff users...
                </div>
              )}

              {!usersLoading && users.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
                  No staff users found.
                </div>
              )}

              {!usersLoading &&
                users.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    currentUserId={currentUserId}
                    deleteUserId={deleteUserId}
                    onDelete={deleteUser}
                  />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
