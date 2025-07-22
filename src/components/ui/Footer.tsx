import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-whitw text-black text-center py-6">
      <div className="container mx-auto px-5">
        {/* Navigation Links */}
        <div className="flex justify-center space-x-6 mb-4">
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
          <Link href="/privacy-policy" className="hover:underline">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:underline">Terms of Service</Link>
        </div>

        {/* Social Media Links */}
        <div className="flex justify-center space-x-4 mb-4">
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/twitter.svg" alt="Twitter" className="w-6 h-6" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <img src="/icons/linked.svg" alt="LinkedIn" className="w-6 h-6" />
          </a>
        </div>

        {/* Contact Information */}
        <p className="text-sm">Email: onlineelection@election.com | Phone: +94740683564</p>

        {/* Copyright */}
        <p className="text-sm mt-2">
          © {new Date().getFullYear()} Election Commission of Sri Lanka.All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
