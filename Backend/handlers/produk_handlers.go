package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/models"
)

func GetProduk(w http.ResponseWriter, r *http.Request) {
	type ProdukRespone struct {
		Id  int       `json:"id"`  
		Nama        string    `json:"nama"`
		ID_Kategori string    `json:"id_kategori"`  
		Kategori    string    `json:"kategori"`
		Stok        int       `json:"stok"`
		Keterangan  string    `json:"keterangan"`
		Price       float64   `json:"price"`
	}
	
	type PaginationResponse struct {
		Data       []ProdukRespone `json:"data"`
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
	limit := 20
	
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
	
	var produk []ProdukRespone
	var total int64
	
	// Hitung total produk
	countResult := database.DB.
		Table("produks").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Where("produks.deleted_at IS NULL").
		Count(&total)
	
	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	// Ambil data produk dengan pagination dan hitung stok
	result := database.DB.
		Table("produks").
		Select(`produks.id AS id, 
			produks.nama AS nama, 
			categories.kategori AS kategori,
			produks.id_kategori AS id_kategori, 
			produks.keterangan AS keterangan, 
			produks.price as price,
			COALESCE(
				(SELECT SUM(CASE WHEN movement_type = 'IN' THEN quantity ELSE 0 END) - 
						SUM(CASE WHEN movement_type = 'OUT' THEN quantity ELSE 0 END)
				 FROM stocks 
				 WHERE stocks.id_produk = produks.id AND stocks.deleted_at IS NULL), 
				0
			) AS stok`).
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Where("produks.deleted_at IS NULL").
		Offset(offset).
		Limit(limit).
		Scan(&produk)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	// Hitung total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	// Buat response dengan informasi pagination
	response := PaginationResponse{
		Data:       produk,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func CreateProduk(w http.ResponseWriter, r *http.Request){
	var produk models.Produk

	if err := json.NewDecoder(r.Body).Decode(&produk); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result := database.DB.Create(&produk)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(produk)
}

func UpdateProduk(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var produk models.Produk
	result := database.DB.First(&produk, id)
	if result.Error != nil {
		http.Error(w, "Produk not found", http.StatusNotFound)
		return
	}
	
	if err := json.NewDecoder(r.Body).Decode(&produk); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result = database.DB.Save(&produk)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(produk)
}

func DeleteProduk(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var produk models.Produk
	result := database.DB.First(&produk, id)
	if result.Error != nil {
		http.Error(w, "Produk not found", http.StatusNotFound)
		return
	}
	
	result = database.DB.Delete(&produk, id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Produk deleted successfully"})
}

func SearchProduk(w http.ResponseWriter, r *http.Request){
	// Struct untuk response dengan field kategori (bukan id_kategori)
	type ProdukResponse struct {
		ID        uint       `json:"ID"`
		CreatedAt time.Time  `json:"CreatedAt"`
		UpdatedAt time.Time  `json:"UpdatedAt"`
		DeletedAt *time.Time `json:"DeletedAt"`
		Nama      string     `json:"nama"`
		Kategori  string     `json:"kategori"`
		Keterangan string    `json:"keterangan"`
		Price     float64    `json:"price"`
	}

	var produk []ProdukResponse
	nama := r.URL.Query().Get("nama")
	kategori := r.URL.Query().Get("kategori")

	dbQuery := database.DB.Table("produks").
		Select("produks.id as ID, produks.created_at as CreatedAt, produks.updated_at as UpdatedAt, produks.deleted_at as DeletedAt, produks.nama, categories.kategori, produks.keterangan, produks.price").
		Joins("JOIN categories ON produks.id_kategori = categories.id")

	query := "produks.deleted_at IS NULL"
	args := []interface{}{}
	if nama != "" {
		query += " AND LOWER(produks.nama) LIKE LOWER(?)"
		args = append(args, "%"+nama+"%")
	}
	if kategori != "" {
		query += " AND LOWER(categories.kategori) LIKE LOWER(?)"
		args = append(args, "%"+kategori+"%")
	}
	result := dbQuery.Where(query, args...).Scan(&produk)
	
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(produk)
}