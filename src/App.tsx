import React, { useState, Suspense, lazy, Component, ReactNode } from 'react';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Critical Component Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center text-muted text-sm border border-stroke/20 rounded-2xl m-8">
          Something went wrong in this section. Please refresh.
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load sections
const Hero = lazy(() => import('./components/Hero'));
const Stats = lazy(() => import('./components/Stats'));
const Projects = lazy(() => import('./components/Projects'));
const Journal = lazy(() => import('./components/Journal'));
const Explorations = lazy(() => import('./components/Explorations'));
const TechStack = lazy(() => import('./components/TechStack'));
const ExperienceTimeline = lazy(() => import('./components/ExperienceTimeline'));
const Footer = lazy(() => import('./components/Footer'));

function App() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative min-h-screen bg-bg selection:bg-white selection:text-black noise-overlay">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {!isLoading && (
        <ErrorBoundary>
          <Suspense fallback={<div className="h-screen bg-bg" />}>
            <Navbar />
            <main>
              <Hero />
              <Stats />
              <Projects />
              <Explorations />
              <TechStack />
              <Journal />
              <ExperienceTimeline />
            </main>
            <Footer />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
