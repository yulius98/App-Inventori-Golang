package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/models"
	"gorm.io/gorm"
)

func GetStok(w http.ResponseWriter, r *http.Request) {
	// Buat struct khusus untuk response stok
	type StokResponse struct {
		Kategori    string  `json:"kategori"`
		Produk      string  `json:"produk"`
		TotalStock  int     `json:"total_stock"`
		Price       float64 `json:"price"`
	}

	type PaginationResponse struct {
		Data       []StokResponse `json:"data"`
		Page       int            `json:"page"`
		Limit      int            `json:"limit"`
		Total      int64          `json:"total"`
		TotalPages int            `json:"totalPages"`
	}

	// Ambil parameter pagination dari query string
	pageStr := r.URL.Query().Get("page")
	limitStr := r.URL.Query().Get("limit")
	
	// Set default values
	page := 1
	limit := 10

	// Parse page parameter
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	
	// Parse limit parameter
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}
	
	// Hitung offset
	offset := (page - 1) * limit

	var stok []StokResponse
	var total int64

	// Hitung total produk
	countResult := database.DB.
		Table("stocks").
		Select("categories.kategori AS kategori, produks.nama AS produk, SUM(stocks.qty_in) - SUM(stocks.qty_out) AS total_stock, produks.price").
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Group("stocks.id_produk").
		Count(&total)

	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}


	result := database.DB.
		Table("stocks").
		Select("categories.kategori AS kategori, produks.nama AS produk, SUM(stocks.qty_in) - SUM(stocks.qty_out) AS total_stock, produks.price").
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Group("stocks.id_produk").
		Offset(offset).
		Limit(limit).
		Scan(&stok)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Hitung total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	// Buat response dengan informasi pagination
	response := PaginationResponse{
		Data:       stok,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func CreateStok(w http.ResponseWriter, r *http.Request){
	var stok models.Stock

	if err := json.NewDecoder(r.Body).Decode(&stok); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result := database.DB.Create(&stok)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(stok)
}

func UpdateStok(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var stok models.Stock
	result := database.DB.First(&stok, id)
	if result.Error != nil {
		http.Error(w, "Stok not found", http.StatusNotFound)
		return
	}
	
	if err := json.NewDecoder(r.Body).Decode(&stok); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result = database.DB.Save(&stok)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stok)
}

func DeleteStok(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var stok models.Stock
	result := database.DB.First(&stok, id)
	if result.Error != nil {
		http.Error(w, "Stok not found", http.StatusNotFound)
		return
	}
	
	result = database.DB.Delete(&stok, id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Stok deleted successfully"})
}

func SearchStok(w http.ResponseWriter, r *http.Request){
	var stokList []models.Stock
	
	// Ambil parameter query 'id_produk' dari URL
	id_produk := r.URL.Query().Get("id_produk")
	
	var result *gorm.DB
	
	// Jika parameter id_produk kosong, return semua items
	if id_produk == "" {
		result = database.DB.Find(&stokList)
	} else {
		// Cari items berdasarkan id_produk
		result = database.DB.Where("id_produk = ?", id_produk).Find(&stokList)
	}
	
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stokList)
}