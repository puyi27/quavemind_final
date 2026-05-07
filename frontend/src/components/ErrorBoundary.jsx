import React from 'react';
import { MdWarning } from 'react-icons/md';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border-4 border-[var(--color-quave-orange)] bg-black p-6 m-4 text-white shadow-[8px_8px_0px_#ff6b00]">
          <div className="flex items-center gap-3 mb-4">
            <MdWarning className="text-4xl text-[var(--color-quave-orange)]" />
            <h2 className="font-heading text-2xl font-black uppercase tracking-tighter">
              Interrupción de Módulo
            </h2>
          </div>
          <p className="font-mono text-xs uppercase text-gray-400">
            Los datos de esta sección no se pudieron procesar. El resto del laboratorio sigue operativo.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 border-2 border-white bg-transparent px-4 py-2 font-mono text-xs font-black uppercase text-white hover:bg-white hover:text-black transition-colors"
          >
            Reiniciar Módulo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;