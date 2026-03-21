import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {isAuthenticated && <Footer />}
    </div>
  );
};

export default Layout;
