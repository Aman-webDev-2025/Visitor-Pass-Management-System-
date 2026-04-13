import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }){
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if(!token){
    if(allowedRoles && allowedRoles.includes("visitor")){
      return <Navigate to="/visitor" />;
    }
    return <Navigate to="/" />;
  }

  
  if(allowedRoles && !allowedRoles.includes(role)){
    if(role === "visitor"){
      return <Navigate to="/visitor/pass" />;
    }
    return <Navigate to="/dashboard" />;
  }
  return children;
}

export default PrivateRoute;




