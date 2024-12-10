import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Eye } from 'lucide-react';
import { ProductForm, ProductOutput, ClientData } from '../types';
import { ProductDetailsModal } from '../components/ProductDetailsModal';
import { fetchProductData } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface OutputDisplayProps {
  forms: ProductForm[];
  distributionData: Map<string, ClientData[]>;
  onBack: () => void;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  forms,
  distributionData,
  onBack,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [outputData, setOutputData] = useState<ProductOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProductSelect = async (productId: string) => {
    if (!productId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setSelectedProductId(productId);

      const selectedForm = forms.find(f => f.id === productId);
      if (!selectedForm) {
        throw new Error('Selected product not found');
      }

      const data = await fetchProductData(productId, selectedForm.weekDate || '');
      setOutputData(prev => {
        const existing = prev.filter(p => p.productId !== productId);
        return [...existing, data];
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load product data';
      setError(errorMessage);
      console.error('Error loading product data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedOutput = outputData.find(o => o.productId === selectedProductId);
  const selectedForm = forms.find(f => f.id === selectedProductId);

  const chartData = {
    labels: selectedOutput?.weeklyData.map(d => d.week) || [],
    datasets: [
      {
        label: 'Prediction Values',
        data: selectedOutput?.weeklyData.map(d => d.value) || [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: selectedOutput ? `Prediction Trend - ${selectedOutput.scenarioName}` : 'Prediction Trend',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function (tickValue: string | number) {
            return typeof tickValue === 'number' ? tickValue.toFixed(2) : tickValue;
          },
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Prediction Analysis</h1>
      
      <div className="mb-8 flex gap-4 items-center">
        <select
          className="flex-1 p-2 border rounded-md"
          value={selectedProductId || ''}
          onChange={(e) => handleProductSelect(e.target.value)}
          disabled={isLoading}
        >
          <option value="">Select a product scenario</option>
          {forms.map((form) => (
            <option key={form.id} value={form.id}>
              {form.scenario || 'Unnamed Scenario'} ({form.baseCode || 'No Base Code'})
            </option>
          ))}
        </select>
        
        <button
          onClick={() => setShowDetailsModal(true)}
          disabled={!selectedProductId || isLoading}
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Eye size={20} />
          View Details
        </button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prediction data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {selectedOutput && !isLoading && (
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back to Forms
        </button>
      </div>

      {showDetailsModal && selectedForm && (
        <ProductDetailsModal
          form={selectedForm}
          distributionData={distributionData.get(selectedForm.id) || []}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};