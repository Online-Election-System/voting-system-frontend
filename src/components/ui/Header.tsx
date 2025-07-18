import Link from "next/link";

const Header = () => {
  return (
    <header className="bg-whitw p-4 text-black">
      <nav className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">
            <Link href="/">Election</Link></h1>
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className="hover:underline">Home</Link>
          </li>
          <li>
            <Link href="/about" className="hover:underline">About</Link>
          </li>
          <li>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </li>
          <li>
            <Link href="/signin" className="hover:underline">Signin</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
