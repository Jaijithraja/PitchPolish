import React, { useState } from 'react';
import { Bug, Play, RefreshCw, CheckCircle, AlertCircle, XCircle, ExternalLink } from 'lucide-react';
import { tavusDebugger, runTavusDiagnostics } from '../utils/tavusDebugger';

interface DebugResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
  fix?: string;
}

const TavusDebugPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DebugResult[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      console.log('🔍 Running Tavus diagnostics...');
      const diagnosticResults = await tavusDebugger.runFullDiagnostic();
      setResults(diagnosticResults);
      
      // Also run the console version
      await runTavusDiagnostics();
    } catch (error) {
      console.error('Diagnostic failed:', error);
      setResults([{
        step: 'Diagnostic Error',
        status: 'error',
        message: 'Failed to run diagnostics',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runQuickFix = async () => {
    setIsRunning(true);
    try {
      await tavusDebugger.quickFix();
      console.log('✅ Quick fix completed');
      // Re-run diagnostics after quick fix
      await runDiagnostics();
    } catch (error) {
      console.error('Quick fix failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-error-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success-50 border-success-200';
      case 'warning':
        return 'bg-warning-50 border-warning-200';
      case 'error':
        return 'bg-error-50 border-error-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const errorCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const successCount = results.filter(r => r.status === 'success').length;

  if (!showPanel) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-primary-600 text-white p-3 rounded-full shadow-lg hover:bg-primary-700 transition-colors"
          title="Open Tavus Debug Panel"
        >
          <Bug className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Bug className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Tavus Debug Panel</h2>
          </div>
          <button
            onClick={() => setShowPanel(false)}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={runDiagnostics}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              <span>{isRunning ? 'Running...' : 'Run Diagnostics'}</span>
            </button>

            <button
              onClick={runQuickFix}
              disabled={isRunning}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-secondary-600 text-white hover:bg-secondary-700'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
              <span>Quick Fix</span>
            </button>

            <button
              onClick={() => window.open('https://docs.tavus.io/', '_blank')}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Tavus Docs</span>
            </button>
          </div>

          {/* Summary */}
          {results.length > 0 && (
            <div className="mt-4 flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-success-600" />
                <span className="text-success-700">{successCount} Passed</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-warning-600" />
                <span className="text-warning-700">{warningCount} Warnings</span>
              </div>
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-error-600" />
                <span className="text-error-700">{errorCount} Errors</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {results.length === 0 ? (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Click "Run Diagnostics" to check Tavus connection issues</p>
            </div>
          ) : (
            <div className="space-y-4">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border-2 ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {result.step}
                      </h3>
                      <p className="text-gray-700 mb-2">{result.message}</p>
                      
                      {result.data && (
                        <details className="mb-2">
                          <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                            View Details
                          </summary>
                          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                      
                      {result.fix && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <p className="text-sm font-medium text-blue-900 mb-1">💡 How to fix:</p>
                          <p className="text-sm text-blue-800">{result.fix}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              <strong>How to use this panel:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Run diagnostics to identify connection issues</li>
              <li>Check the browser console for detailed logs</li>
              <li>Use quick fix to clean up stuck conversations</li>
              <li>Review error messages and follow the suggested fixes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TavusDebugPanel;