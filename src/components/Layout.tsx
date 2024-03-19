import Navbar from "./Navbar";
import Footer from "./Footer";

type LayoutProps = {
  children: React.ReactNode;
  postIdx: string;
};

const Layout: React.FC<LayoutProps> = ({ children, postIdx }) => {
  return (
    <>
      <Navbar postIdx={postIdx} />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
