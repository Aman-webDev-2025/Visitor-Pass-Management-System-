import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddVisitor from "./pages/AddVisitor";
import Scan from "./pages/Scan";
import Register from "./pages/Register";
import VisitorPortal from "./pages/VisitorPortal";
import VisitorPass from "./pages/VisitorPass";
import PassLookup from "./pages/PassLookup";
import PrivateRoute from "./components/PrivateRoute";

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/visitor" element={<VisitorPortal />} />

        <Route path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={["admin", "employee", "security"]}>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        
        <Route path="/add" 
          element={
            <PrivateRoute allowedRoles={["admin", "employee"]}>
              <AddVisitor />
            </PrivateRoute>
          } 
        />

        <Route path="/scan" 
          element={
            <PrivateRoute allowedRoles={["admin", "security"]}>
              <Scan />
            </PrivateRoute>
          } 
        />

        <Route
          path="/pass-lookup"
          element={
            <PrivateRoute allowedRoles={["admin", "employee", "security"]}>
              <PassLookup />
            </PrivateRoute>
          }
        />

        <Route path="/visitor/pass"
          element={
            <PrivateRoute allowedRoles={["visitor"]}>
              <VisitorPass />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
