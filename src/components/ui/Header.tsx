import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-white p-4 text-black">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold ml-16 ">
            <Link href="/">Election</Link></h1>
        <ul className="flex space-x-4 mr-4">
          <li>
            <Link href="/" className="hover:underline">HOME</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">ABOUT</Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">CONTACT</Link>
          </li>
          <li>
            <Link href="/signin" className="hover:underline">SIGN IN</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
