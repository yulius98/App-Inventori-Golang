'use client';
import StokList from './components/StokList';

export default function Home() {
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">Stok Product</h1>
      
      <div className="mb-6">
        < StokList
         
        />
        
      </div>
      
  
    </div>
  );
}
