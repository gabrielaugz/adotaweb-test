import Root from './components/root'
import HomePage from './pages/home'
import SearchPage from './pages/search'
import PetDetailsPage from './pages/detail'
import PetDetailsNotFound from './pages/petDetailsNotFound'
import FaqPage from './pages/faq'
import AdoptionGuide from './pages/adoptionGuide'
import AboutPage from './pages/about'
import ContactPage from './pages/contact'
import AdminPage from './pages/admin'

import {
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
  Route
} from 'react-router-dom'

const appRouter = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Root />}>
      {/* Públicas */}
      <Route index element={<HomePage />} />
      <Route path=':type' element={<HomePage />} />
      <Route path=':type/:id' element={<PetDetailsPage />} />
      <Route path='search' element={<SearchPage />} />
      <Route path='pet-details-not-found' element={<PetDetailsNotFound />} />
      <Route path='faq' element={<FaqPage />} />
      <Route path='adoption-guide' element={<AdoptionGuide />} />
      <Route path='about' element={<AboutPage />} />
      <Route path='contact' element={<ContactPage />} />

      {/* Admin (CRUD sem autenticação) */}
      <Route index element={<AdminPage />} />
      <Route path="add-pet" element={<AddPet />} />
    </Route>
  )
)

export default function App() {
  return <RouterProvider router={appRouter} />
}