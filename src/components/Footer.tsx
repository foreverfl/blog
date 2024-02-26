const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-700 p-4 text-white mt-8">
      <div className="container mx-auto text-center">
        <span>
          &copy; {new Date().getFullYear()} My Blog. All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
