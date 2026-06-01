import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MetaPixelProvider } from './components/MetaPixelProvider';
import { HomePage } from './pages/HomePage';

export default function App() {
  return (
    <BrowserRouter>
      <MetaPixelProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </MetaPixelProvider>
    </BrowserRouter>
  );
}
