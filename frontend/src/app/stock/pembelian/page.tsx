'use client';
import { useState } from 'react';
import PembelianForm from '@/app/components/PembelianForm';
import { addStok, type NewStok } from '@/lib/api';

export default function PembelianPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  const handleSubmit = async (data: NewStok) => {
    setIsSubmitting(true);
    setMessage('');
    
    try {
      await addStok(data);
      setMessage('Stock berhasil ditambahkan!');
      setMessageType('success');
      
      // Reset form dengan delay untuk memberikan feedback ke user
      setTimeout(() => {
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error adding stock:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to add stock');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Pembelian Stok</h1>
      
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
      
      <PembelianForm onSubmit={handleSubmit} />
    </div>
  );
}
