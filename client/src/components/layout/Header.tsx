import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

// Header navigation items
const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/calculator", label: "Calculator" },
  { href: "/goals", label: "Goals" },
  { href: "/learn", label: "Learn" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/rewards", label: "Rewards" },
  { href: "/community", label: "Community" },
];

// Supply chain navigation items
const supplyChainItems = [
  { href: "/suppliers", label: "Suppliers" },
  { href: "/supplier-emissions", label: "Emissions" },
  { href: "/supply-chain-risks", label: "Risks" },
];

interface HeaderProps {
  currentPath: string;
}

export default function Header({ currentPath }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/dashboard">
            <div className="flex items-center cursor-pointer">
              <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 16.95h-2v-9h2v9zm4 0h-2v-12h2v12z"/>
              </svg>
              <h1 className="ml-2 text-xl font-bold text-neutral-800">EcoTrack</h1>
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`text-neutral-800 hover:text-primary font-medium cursor-pointer ${
                currentPath === item.href ? "text-primary" : ""
              }`}>
                {item.label}
              </div>
            </Link>
          ))}
          
          {/* Supply Chain Navigation - Desktop */}
          <div className="relative group">
            <div className="text-neutral-800 hover:text-primary font-medium cursor-pointer">
              Supply Chain
            </div>
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
              {supplyChainItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className={`block px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 cursor-pointer ${
                    currentPath === item.href ? "bg-neutral-100" : ""
                  }`}>
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex items-center">
          <Link href="/calculator">
            <Button variant="default" className="hidden md:block mr-4">
              Log Activity
            </Button>
          </Link>
          <Link href="/profile">
            <div className="h-8 w-8 rounded-full overflow-hidden cursor-pointer">
              <img
                className="h-full w-full object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="Profile"
              />
            </div>
          </Link>

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden ml-4">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col pt-2 pb-4 space-y-1">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`px-3 py-2 rounded-md text-base font-medium cursor-pointer ${
                      currentPath === item.href
                        ? "bg-primary text-white"
                        : "text-neutral-800 hover:bg-neutral-100"
                    }`}>
                      {item.label}
                    </div>
                  </Link>
                ))}
                
                {/* Supply Chain Items - Mobile */}
                <div className="px-3 py-2 font-medium text-neutral-800">
                  Supply Chain
                </div>
                {supplyChainItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <div className={`px-6 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      currentPath === item.href
                        ? "bg-primary text-white"
                        : "text-neutral-700 hover:bg-neutral-100"
                    }`}>
                      {item.label}
                    </div>
                  </Link>
                ))}
                
                <Link href="/calculator">
                  <Button variant="default" className="mt-2 w-full">
                    Log Activity
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
