package routes

import (
	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/handlers"
	"github.com/yulius/inventory-backend/middleware"
)

func SetupRouter() *mux.Router{
	r := mux.NewRouter()
	
	// Terapkan CORS middleware ke semua routes
	r.Use(middleware.CORSMiddleware)
	
	// Produk routes
	r.HandleFunc("/produk", handlers.GetProduk).Methods("GET")
	r.HandleFunc("/produk", handlers.CreateProduk).Methods("POST")
	r.HandleFunc("/produk", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/produk/search", handlers.SearchProduk).Methods("GET")
	r.HandleFunc("/produk/search", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/produk/{id}", handlers.UpdateProduk).Methods("PUT")
	r.HandleFunc("/produk/{id}", handlers.DeleteProduk).Methods("DELETE")
	r.HandleFunc("/produk/{id}", handlers.OptionsHandler).Methods("OPTIONS")

	// Kategori routes
	r.HandleFunc("/kategori", handlers.GetKategori).Methods("GET")
	r.HandleFunc("/allkategori", handlers.GetAllKategori).Methods("GET")
	r.HandleFunc("/kategori", handlers.CreateKategori).Methods("POST")
	r.HandleFunc("/kategori", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/kategori/{id}", handlers.UpdateKategori).Methods("PUT")
	r.HandleFunc("/kategori/{id}", handlers.DeleteKategori).Methods("DELETE")
	r.HandleFunc("/kategori/{id}", handlers.OptionsHandler).Methods("OPTIONS")

	// Stok routes
	r.HandleFunc("/stok", handlers.GetStok).Methods("GET")
	r.HandleFunc("/stok", handlers.CreateStok).Methods("POST")
	r.HandleFunc("/stok", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/stok/search", handlers.SearchStok).Methods("GET")
	r.HandleFunc("/stok/search", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/stok/{id}", handlers.UpdateStok).Methods("PUT")
	r.HandleFunc("/stok/{id}", handlers.DeleteStok).Methods("DELETE")
	r.HandleFunc("/stok/{id}", handlers.OptionsHandler).Methods("OPTIONS")
	
	return r
}