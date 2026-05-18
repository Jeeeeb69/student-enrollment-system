import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ children }: any) {
  return (
    <div className="flex min-h-screen">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-5">
        <h1 className="text-xl font-bold mb-6">Enrollment</h1>

        <nav className="flex flex-col gap-3">
          <Link to="/">Dashboard</Link>
          <Link to="/students">Students</Link>
          <Link to="/subjects">Subjects</Link>
          <Link to="/sections">Sections</Link>
          <Link to="/enrollments">Enroll</Link>
        </nav>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">

        {/* TOP NAVBAR */}
        <Navbar />

        {/* PAGE CONTENT */}
        <div className="p-6 bg-gray-100 flex-1">
          {children}
        </div>

      </div>
    </div>
  );
}