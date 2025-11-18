export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {currentYear} <span className="font-semibold text-white">Omar Rageh</span>. All rights reserved.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              German PDF Generation System
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-400">
              Developed with ❤️ by Omar Rageh
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
