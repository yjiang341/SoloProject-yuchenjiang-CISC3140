import AppRoutes from './routes/AppRoutes.jsx';
import SiteNavbar from '@/components/navigation/site-navbar.jsx'

const App = () => {
  return (
    <>
      <SiteNavbar />
      <main className="app-main-content">
        <AppRoutes />
      </main>
    </>
  )
}
export default App;