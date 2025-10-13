'use client';
import { useState } from 'react';
import { delStok, type NewStok } from '@/lib/api';
import PenjualanForm from '@/app/components/PenjualanForm';

export default function PenjualanPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (data: NewStok) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      await delStok(data);
      setMessage('Penjualan berhasil');
      setMessageType('success');
      
      // Reset form dengan delay untuk memberikan feedback ke user
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error selling:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to sell product');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Penjualan</h1>
      
      {message && (
        <div className={`p-4 mb-4 rounded ${
          messageType === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300' 
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}
      
      {isSubmitting && (
        <div className="p-4 mb-4 bg-blue-100 text-blue-700 border border-blue-300 rounded">
          Sedang memproses pembelian stok...
        </div>
      )}
      
      <PenjualanForm onSubmit={handleSubmit} />
    </div>
  );
}
