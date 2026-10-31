import { Route, Routes } from 'react-router-dom';
import Desktop from './desktop/Desktop';

export default function App() {
  return (
    <Routes>
      <Route path="*" element={<Desktop />} />
    </Routes>
  );
}
