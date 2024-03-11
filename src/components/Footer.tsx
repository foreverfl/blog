const Footer: React.FC = () => {
  return (
    <footer className="p-4 dark:text-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto text-center">
        <span className="font-caveat text-2xl">
          &copy; {new Date().getFullYear()} designed and built by mogumogu. All
          rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
