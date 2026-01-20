"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Bot, MessageSquare, Mic, Search } from "lucide-react"
import { WalletButton } from "./WalletButton"
import { ThemeToggle } from "./ThemeToggle"

export const Sidebar: React.FC = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsOpen(true)
      } else {
        setIsOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const navItems = [
    {
      href: "/chat",
      label: "Chat",
      icon: MessageSquare,
      active: pathname?.includes("/chat"),
    },
    {
      href: "/voice",
      label: "Voice",
      icon: Mic,
      active: pathname?.includes("/voice"),
    },
    {
      href: "/explorer",
      label: "Explorer",
      icon: Search,
      active: pathname?.includes("/explorer"),
    },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-3 rounded-xl transition-all duration-200"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--blur-md))",
          WebkitBackdropFilter: "blur(var(--blur-md))",
          border: "1px solid var(--glass-border)",
          color: "var(--text)",
          boxShadow: "var(--shadow-md)",
        }}
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-45 md:hidden transition-opacity duration-300"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full z-50 md:z-auto transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          width: "280px",
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--blur-xl))",
          WebkitBackdropFilter: "blur(var(--blur-xl))",
          borderRight: "1px solid var(--glass-border)",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Logo Section */}
          <div
            className="flex items-center gap-3 px-4 py-4 mb-6 rounded-2xl transition-all duration-200"
            style={{ 
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <h2 className="text-sm font-bold truncate leading-tight" style={{ color: "var(--text)" }}>
                Justin Lee
              </h2>
              <p className="text-xs truncate leading-tight" style={{ color: "var(--text-secondary)" }}>
                AI Assistant
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 mb-6">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group"
                  style={{
                    backgroundColor: item.active ? "var(--bg-hover)" : "transparent",
                    color: item.active ? "var(--accent-primary)" : "var(--text-secondary)",
                    fontWeight: item.active ? "600" : "500",
                    border: item.active ? "1px solid var(--border-subtle)" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.backgroundColor = "var(--bg-hover)"
                      e.currentTarget.style.color = "var(--text)"
                      e.currentTarget.style.borderColor = "var(--border-subtle)"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!item.active) {
                      e.currentTarget.style.backgroundColor = "transparent"
                      e.currentTarget.style.color = "var(--text-secondary)"
                      e.currentTarget.style.borderColor = "transparent"
                    }
                  }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                  {item.active && (
                    <div 
                      className="absolute right-2 w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: "var(--accent-primary)" }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Theme Toggle */}
          <div className="mb-4 flex justify-center items-center">
            <ThemeToggle />
          </div>

          {/* Wallet Button */}
          <div 
            className="pt-4 border-t space-y-3"
            style={{ borderTopColor: "var(--border-subtle)" }}
          >
            <WalletButton />
          </div>
        </div>
      </aside>
    </>
  )
}
