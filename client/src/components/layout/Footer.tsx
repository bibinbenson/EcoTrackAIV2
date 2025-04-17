import { Link } from "wouter";
import { 
  Twitter,
  Facebook,
  Instagram,
  Linkedin
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-neutral-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/>
              </svg>
              <h2 className="ml-2 text-xl font-bold">EcoTrack</h2>
            </div>
            <p className="mt-2 text-neutral-300 text-sm">
              Track, reduce, and offset your carbon footprint with our comprehensive ESG platform.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Features</h3>
            <ul className="space-y-2">
              <li><Link href="/calculator"><a className="text-neutral-300 hover:text-white text-sm">Carbon Calculator</a></Link></li>
              <li><Link href="/dashboard"><a className="text-neutral-300 hover:text-white text-sm">Activity Tracker</a></Link></li>
              <li><Link href="/marketplace"><a className="text-neutral-300 hover:text-white text-sm">Offset Marketplace</a></Link></li>
              <li><Link href="/learn"><a className="text-neutral-300 hover:text-white text-sm">Educational Resources</a></Link></li>
              <li><Link href="/community"><a className="text-neutral-300 hover:text-white text-sm">Community Leaderboard</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Sustainability Guide</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">ESG Reporting</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Scientific Research</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Partner Programs</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Developer API</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">About Us</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Our Mission</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Careers</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Press</a></li>
              <li><a href="#" className="text-neutral-300 hover:text-white text-sm">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-neutral-600 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-neutral-300">&copy; 2023 EcoTrack. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-sm text-neutral-300 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-300 hover:text-white">Terms of Service</a>
            <a href="#" className="text-sm text-neutral-300 hover:text-white">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
