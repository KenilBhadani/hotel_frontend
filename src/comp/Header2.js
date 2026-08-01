import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  Dialog,
  DialogPanel,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  FingerPrintIcon,
  SquaresPlusIcon,
  HomeIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const services = [
  { name: 'Room Booking', description: 'Luxury suites and standard rooms', href: '/services/rooms', icon: HomeIcon },
  { name: 'Events', description: 'Host your weddings and conferences', href: '/services/events', icon: SquaresPlusIcon },
  { name: 'Security', description: '24/7 high-level guest protection', href: '/services/security', icon: FingerPrintIcon },
]

export default function Header2() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeStyle = "text-blue-400 border-b-2 border-blue-400 pb-1"
  const idleStyle = "text-white hover:text-blue-400 transition-colors"

  return (
    <header className="bg-gray-900 sticky top-0 z-50 shadow-xl">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
              <span className="text-white font-black text-xl">R</span>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Royal<span className="text-blue-500">Park</span>
            </span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-400 hover:text-white"
          >
            <Bars3Icon className="size-7" aria-hidden="true" />
          </button>
        </div>

        {/* Desktop Navigation */}
        <PopoverGroup className="lg:flex lg:gap-x-10">
          <NavLink to="/" className={({ isActive }) => `text-sm font-semibold ${isActive ? activeStyle : idleStyle}`}>
            Home
          </NavLink>

          <NavLink to="/services" className={({ isActive }) => `text-sm font-semibold ${isActive ? activeStyle : idleStyle}`}>
            Services
          </NavLink>

          <NavLink to="/contact" className={({ isActive }) => `text-sm font-semibold ${isActive ? activeStyle : idleStyle}`}>
            Contact Us
          </NavLink>
          
          <NavLink to="/booking" className={({ isActive }) => `text-sm font-semibold ${isActive ? activeStyle : idleStyle}`}>
            Booking
          </NavLink>
        </PopoverGroup>

        {/* Desktop Action Button */}
        <div className="lg:flex lg:flex-1 lg:justify-end">
          <Link to="/bookings">
            <button className="bg-blue-600 text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-900/20 transition-all active:scale-95">
              My Booking
            </button>
          </Link>
        </div>
      </nav>

      {/* Mobile Menu Slide-over */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-gray-900 p-6 sm:max-w-sm">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white">Menu</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-400 hover:text-white"
            >
              <XMarkIcon className="size-7" aria-hidden="true" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-white/10">
              <div className="space-y-2 py-6">
                <NavLink to="/" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5">
                  Home
                </NavLink>
                <Disclosure as="div" className="-mx-3">
                  <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pr-3.5 pl-3 text-base font-semibold text-white hover:bg-white/5">
                    Services
                    <ChevronDownIcon className="size-5 flex-none group-data-[open]:rotate-180" aria-hidden="true" />
                  </DisclosureButton>
                  <DisclosurePanel className="mt-2 space-y-2">
                    {services.map((item) => (
                      <Link key={item.name} to={item.href} onClick={() => setMobileMenuOpen(false)} className="block rounded-lg py-2 pr-3 pl-10 text-sm font-semibold text-gray-400 hover:bg-white/5">
                        {item.name}
                      </Link>
                    ))}
                  </DisclosurePanel>
                </Disclosure>
                <NavLink to="/contact" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5">
                  Contact Us
                </NavLink>
                <NavLink to="/bookings" onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-white/5">
                  Booking
                </NavLink>
              </div>
              <div className="py-6">
                <Link to="/bookings" onClick={() => setMobileMenuOpen(false)} className="block text-center bg-blue-600 rounded-xl px-3 py-4 text-base font-bold text-white">
                  My Booking
                </Link>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}