import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header.js";
import { Footer } from "../components/layout/Footer.js";

export function PublicLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
