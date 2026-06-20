import Providers from "@/components/Providers";
import Navbar from "@/components/organism/navbar/Navbar";

// Navbar island: needs the shared Providers tree (auth for Profile,
// loading for SetLanguage, theme for SetMode).
export default function NavbarIsland() {
  return (
    <Providers>
      <Navbar />
    </Providers>
  );
}
