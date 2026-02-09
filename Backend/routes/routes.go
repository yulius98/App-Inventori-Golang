package routes

import (
	"net/http"

	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/controllers"
	"github.com/yulius/inventory-backend/handlers"
	"github.com/yulius/inventory-backend/middleware"
)

func SetupRouter() *mux.Router{
		r := mux.NewRouter()
		r.HandleFunc("/login", controllers.Login).Methods("POST")
		r.HandleFunc("/login", handlers.OptionsHandler).Methods("OPTIONS")
		r.Handle(
			"/profile",
			middleware.JWTAuth(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.Write([]byte("Endpoint aman, token valid 👍"))
			})),
		)

		// Terapkan CORS middleware ke semua routes
		r.Use(middleware.CORSMiddleware)
	
	// User routes
	r.HandleFunc("/user", handlers.GetUser).Methods("GET")
	r.HandleFunc("/user", handlers.CreateUser).Methods("POST")
	r.HandleFunc("/user", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/user/{id}", handlers.UpdateUser).Methods("PUT")
	r.HandleFunc("/user/{id}", handlers.DeleteUser).Methods("DELETE")
	r.HandleFunc("/user/{id}", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/user/search/", handlers.SearchUser).Methods("GET")
	r.HandleFunc("/user/search", handlers.OptionsHandler).Methods("OPTIONS")

	// kasir
	r.HandleFunc("/belanja/user/{name}", handlers.GetBelanja).Methods("GET")
	r.HandleFunc("/belanja/user/{name}", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/kasir", handlers.GetProdukKasir).Methods("GET")
	r.HandleFunc("/kasir", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/kasir/search", handlers.SearchProdukKasir).Methods("GET")
	r.HandleFunc("/kasir/search", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/kasir/bayar/{username}", handlers.BayarBelanja).Methods("PUT")
	r.HandleFunc("/kasir/bayar/{username}", handlers.OptionsHandler).Methods("OPTIONS")

	// Produk routes
	r.HandleFunc("/produk", handlers.GetProduk).Methods("GET")
	r.HandleFunc("/produk", handlers.CreateProduk).Methods("POST")
	r.HandleFunc("/produk", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/produk/search/", handlers.SearchProduk).Methods("GET")
	r.HandleFunc("/produk/search", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/produk/{id}", handlers.UpdateProduk).Methods("PUT")
	r.HandleFunc("/produk/{id}", handlers.DeleteProduk).Methods("DELETE")
	r.HandleFunc("/produk/{id}", handlers.OptionsHandler).Methods("OPTIONS")

	// Kategori routes
	r.HandleFunc("/kategori", handlers.GetKategori).Methods("GET")
	r.HandleFunc("/kategori/search/", handlers.SearchKategori).Methods("GET")
	r.HandleFunc("/allkategori", handlers.GetAllKategori).Methods("GET")
	r.HandleFunc("/kategori", handlers.CreateKategori).Methods("POST")
	r.HandleFunc("/kategori", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/kategori/{id}", handlers.UpdateKategori).Methods("PUT")
	r.HandleFunc("/kategori/{id}", handlers.DeleteKategori).Methods("DELETE")
	r.HandleFunc("/kategori/{id}", handlers.OptionsHandler).Methods("OPTIONS")

	// Total barang per kategori
	r.HandleFunc("/kategori/total-barang", handlers.TotalBarangPerKategori).Methods("GET")

	// Data penjualan
	r.HandleFunc("/penjualan/", handlers.DataPenjualan).Methods("GET")

	// Stok routes
	r.HandleFunc("/stok", handlers.GetStok).Methods("GET")
	r.HandleFunc("/stok", handlers.CreateStok).Methods("POST")
	r.HandleFunc("/stok", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/stok/search/", handlers.SearchStok).Methods("GET")
	r.HandleFunc("/stok/search", handlers.OptionsHandler).Methods("OPTIONS")
	r.HandleFunc("/stok/{id}", handlers.UpdateStok).Methods("PUT")
	r.HandleFunc("/stok/{id}", handlers.DeleteStok).Methods("DELETE")
	r.HandleFunc("/stok/{id}", handlers.OptionsHandler).Methods("OPTIONS")
	
	return r
}