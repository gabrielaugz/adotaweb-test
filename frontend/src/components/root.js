// frontend/src/components/root.js
import React from 'react'
import { Outlet, Link } from 'react-router-dom'
import Navigation from './navigation'
import Footer from './footer'

export default function Root() {
  return (
    <>
      <header>
        <Link to="/">
          {/* Your logo or site title */}
          <h1>AdotaWeb</h1>
        </Link>
        <Navigation />
      </header>

      <main>
        {/* Nested routes (HomePage, AdminPage, etc.) render here */}
        <Outlet />
      </main>

      <Footer />
    </>
  )
}
