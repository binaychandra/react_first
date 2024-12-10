import React from 'react';
import { Plus } from 'lucide-react';
import { ProductFormCard } from '../components/ProductFormCard';
import { ProductForm, ClientData } from '../types';

interface ProductDetailsProps {
  forms: ProductForm[];
  distributionData: Map<string, ClientData[]>;
  onFormsUpdate: (forms: ProductForm[]) => void;
  onDistributionDataUpdate: (formId: string, data: ClientData[]) => void;
  onBack: () => void;
  onSubmit: () => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
  forms,
  distributionData,
  onFormsUpdate,
  onDistributionDataUpdate,
  onBack,
  onSubmit,
}) => {
  const addNewForm = () => {
    const newForm: ProductForm = {
      id: Date.now().toString(),
      baseCode: '',
      scenario: '',
      weekDate: '',
      levelOfSugar: '',
      packGroup: '',
      productRange: '',
      segment: '',
      superSegment: '',
      baseNumberInMultipack: 0,
      flavor: '',
      choco: '',
      salty: '',
      weightPerUnitMl: 0,
      listPricePerUnitMl: 0,
      isMinimized: false,
    };
    
    const updatedForms = forms.map(form => ({
      ...form,
      isMinimized: true
    }));
    
    onFormsUpdate([...updatedForms, newForm]);
  };

  const updateForm = (formId: string, updatedForm: ProductForm) => {
    onFormsUpdate(forms.map(form => form.id === formId ? updatedForm : form));
  };

  const deleteForm = (formId: string) => {
    onFormsUpdate(forms.filter(form => form.id !== formId));
  };

  const toggleMinimize = (formId: string) => {
    onFormsUpdate(
      forms.map(form => ({
        ...form,
        isMinimized: form.id === formId ? !form.isMinimized : form.isMinimized
      }))
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Product Details</h1>
      
      <div className="space-y-4 mb-8">
        {forms.map((form) => (
          <ProductFormCard
            key={form.id}
            form={form}
            distributionData={distributionData.get(form.id) || []}
            onUpdate={(updatedForm) => updateForm(form.id, updatedForm)}
            onDelete={() => deleteForm(form.id)}
            onToggleMinimize={() => toggleMinimize(form.id)}
            onDistributionDataUpdate={(data) => onDistributionDataUpdate(form.id, data)}
          />
        ))}
      </div>

      <button
        onClick={addNewForm}
        className="w-full mb-6 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add New Product
      </button>

      <div className="flex justify-center gap-4">
        <button
          onClick={onBack}
          className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onSubmit}
          disabled={forms.length === 0}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          Submit
        </button>
      </div>
    </div>
  );
};