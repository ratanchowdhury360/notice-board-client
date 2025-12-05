import { createBrowserRouter } from "react-router";
import RootHome from "../Layout/RootHome";
import Dashboard from "../Pages/dashboard/Dashboard";
import NoticeBoard from "../Pages/notice-board/NoticeBoard";
import CreateNotice from "../Pages/notice-board/CreateNotice";
import EditNotice from "../Pages/notice-board/EditNotice";
import EmployeeDatabase from "../Pages/employee/EmployeeDatabase";
import AddEmployee from "../Pages/employee/AddEmployee";
import PerformanceReport from "../Pages/employee/PerformanceReport";
import PerformanceHistory from "../Pages/employee/PerformanceHistory";
import Payroll from "../Pages/payroll/Payroll";
import PaySlip from "../Pages/payroll/PaySlip";
import Attendance from "../Pages/attendance/Attendance";
import RequestCenter from "../Pages/request/RequestCenter";
import CareerDatabase from "../Pages/career/CareerDatabase";
import DocumentManager from "../Pages/document/DocumentManager";
import ActivityLog from "../Pages/activity/ActivityLog";
import ExitInterview from "../Pages/exit/ExitInterview";
import Profile from "../Pages/profile/Profile";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootHome,
    children: [
      { 
        index: true,
        Component: Dashboard 
      },
      {
        path: "notice-board",
        Component: NoticeBoard
      },
      {
        path: "notice-board/create",
        Component: CreateNotice
      },
      {
        path: "notice-board/edit/:id",
        Component: EditNotice
      },
      {
        path: "employee/database",
        Component: EmployeeDatabase
      },
      {
        path: "employee/add",
        Component: AddEmployee
      },
      {
        path: "employee/performance-report",
        Component: PerformanceReport
      },
      {
        path: "employee/performance-history",
        Component: PerformanceHistory
      },
      {
        path: "payroll",
        Component: Payroll
      },
      {
        path: "pay-slip",
        Component: PaySlip
      },
      {
        path: "attendance",
        Component: Attendance
      },
      {
        path: "request-center",
        Component: RequestCenter
      },
      {
        path: "career-database",
        Component: CareerDatabase
      },
      {
        path: "document-manager",
        Component: DocumentManager
      },
      {
        path: "activity-log",
        Component: ActivityLog
      },
      {
        path: "exit-interview",
        Component: ExitInterview
      },
      {
        path: "profile",
        Component: Profile
      }
    ]
  },
]);