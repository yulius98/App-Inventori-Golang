'use client';
import { useForm } from "react-hook-form";
import { type Kategori } from "@/lib/api";

interface Props {
    onSubmit:(data: Kategori) => void;
    initialData?: Kategori;
}

export default function KategoriForm({ onSubmit, initialData}: Props) {
    const { register, handleSubmit, formState: { errors }} = useForm<Kategori>({
        defaultValues: initialData || {},
    });

    return (
        <form onSubmit={ handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto p-4 border border-gray-300 rounded">
            <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">
                    {initialData ? `Edit Kategori: ${initialData.kategori || 'Unknown'}` : `Add New Category`}
                </h3>
                {initialData && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">EDIT MODE</span>
                )}
            </div>
            <label className="block font-medium">Kategori</label>
            <input
                {...register('kategori',{ required: true})}
                placeholder="Category"
                className="border p-2 w-full"
                suppressHydrationWarning={true}
            />
            {errors.kategori && <p className="text-red-500 text-sm">Category is required</p>}        
            <button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 w-full rounded font-medium transition-colors"
                suppressHydrationWarning={true}
            >
                {initialData ? '💾 Update Category' : '➕ Create Category'}
            </button>
        </form>
    );


}

