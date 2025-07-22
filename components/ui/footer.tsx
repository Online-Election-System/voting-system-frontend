import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-center py-6">
      <div className="container mx-auto px-5">
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/twitter.svg" alt="Twitter" width={24} height={24} />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/facebook.svg" alt="Facebook" width={24} height={24} />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Image src="/icons/linked.svg" alt="Linkedin" width={24} height={24} />
          </a>
        </div>

        {/* Contact Information */}
        <p className="text-sm">Email: onlineelection@election.com | Phone: +94740683564</p>

        {/* Copyright */}
        <p className="text-sm mt-2">
          © {new Date().getFullYear()} Your Company. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
