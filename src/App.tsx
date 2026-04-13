import React, { useState, useEffect, useCallback, Component, ReactNode } from 'react';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Projects from './components/Projects';
import Explorations from './components/Explorations';
import TechStack from './components/TechStack';
import ExperienceTimeline from './components/ExperienceTimeline';
import Footer from './components/Footer';

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

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) return;

    // Fail-safe: never let the UI remain blocked behind the loading overlay.
    const timerId = window.setTimeout(() => {
      setIsLoading(false);
    }, 6000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [isLoading]);

  return (
    <div className="relative min-h-screen bg-bg selection:bg-white selection:text-black noise-overlay">
      {isLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {!isLoading && (
        <ErrorBoundary>
          <Navbar />
          <main>
            <Hero />
            <Stats />
            <Projects />
            <Explorations />
            <TechStack />
            <ExperienceTimeline />
          </main>
          <Footer />
        </ErrorBoundary>
      )}
    </div>
  );
}

export default App;
