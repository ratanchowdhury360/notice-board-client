import { createBrowserRouter } from "react-router";
import RootHome from "../Layout/RootHome";
import Dashboard from "../Pages/dashboard/Dashboard";
import NoticeBoard from "../Pages/notice-board/NoticeBoard";
import CreateNotice from "../Pages/notice-board/CreateNotice";
import EditNotice from "../Pages/notice-board/EditNotice";

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
      }
    ]
  },
]);