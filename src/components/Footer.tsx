const Footer: React.FC = () => {
  return (
    <footer className="p-4 dark:text-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto text-center">
        {/* md 크기 이상에서만 보이는 span */}
        <span className="hidden md:inline-block font-footer text-2xl">
          &copy; {new Date().getFullYear()} designed and built by mogumogu. All
          rights reserved.
        </span>
        {/* md 크기 미만에서만 보이는 span */}
        <span className="md:hidden font-footer text-2xl">
          &copy; {new Date().getFullYear()} designed and built by mogumogu.
          <br />
          All rights reserved.
        </span>
      </div>
    </footer>
  );
};

export default Footer;
