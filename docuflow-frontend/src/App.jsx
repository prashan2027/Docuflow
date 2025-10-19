import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SubmitterDashboard from "./pages/SubmitterDashboard";
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ApproverDashboard from "./pages/ApproverDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
  
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/submitter/*"
            element={<SubmitterDashboard></SubmitterDashboard>}
          />
          <Route
            path="/reviewer"
            element={<ReviewerDashboard/>}
          />
          <Route
            path="/approver/*"
            element={<ApproverDashboard/>}
          />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
  );
}
