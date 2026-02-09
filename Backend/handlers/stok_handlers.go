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

func GetStok(w http.ResponseWriter, r *http.Request) {
	// Buat struct khusus untuk response stok
	type StokResponse struct {
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
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
		Table("produks").
		Select(`
			categories.id AS id_kategori,
			produks.id AS id_produk,
			categories.kategori AS kategori,
			produks.nama AS produk,
			COALESCE(
				SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) -
				SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END),
			0) AS total_stock,
			produks.price
		`).
		Joins("LEFT JOIN stocks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Where("produks.deleted_at IS NULL").
		Group("produks.id, categories.id").
		Having("COALESCE(SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) - SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END), 0) > 0").
		Count(&total)


	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}


	result := database.DB.
		Table("produks").
		Select(`
			categories.id AS id_kategori,
			produks.id AS id_produk,
			categories.kategori AS kategori,
			produks.nama AS produk,
			COALESCE(
				SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) -
				SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END),
			0) AS total_stock,
			produks.price
		`).
		Joins("LEFT JOIN stocks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Where("produks.deleted_at IS NULL").
		Group("produks.id, categories.id").
		Having("COALESCE(SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) - SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END), 0) > 0").
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
	var input struct {
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
		MovementType string `json:"movement_type"`
		Quantity     int    `json:"quantity"`
		TglTrx       string `json:"tgl_trx"`
		Status		 string `json:"status"`
		UserName     string `json:"user_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "Invalid JSON format: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Parse tanggal dari string ke time.Time
	tglTrx, err := time.Parse("2006-01-02", input.TglTrx)
	if err != nil {
		http.Error(w, "Invalid date format. Use YYYY-MM-DD: "+err.Error(), http.StatusBadRequest)
		return
	}

	stok := models.Stock{
		IdKategori:   input.IdKategori,
		IdProduk:     input.IdProduk,
		MovementType: input.MovementType,
		Quantity:     input.Quantity,
		TglTrx:       tglTrx,
		Status:       input.Status,
		UserName:     input.UserName,
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
	
	type StokResponse struct {
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
		Kategori    string  `json:"kategori"`
		Produk      string  `json:"produk"`
		TotalStock  int     `json:"total_stock"`
		Price       float64 `json:"price"`
	}
	
	var stokList []StokResponse
	
	// Ambil parameter query nama produk dari URL
	produk := r.URL.Query().Get("produk")

	dbQuery := database.DB.
		Table("produks").
		Select(`
			categories.id AS id_kategori,
			produks.id AS id_produk,
			categories.kategori AS kategori,
			produks.nama AS produk,
			COALESCE(
				SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) -
				SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END),
			0) AS total_stock,
			produks.price
		`).
		Joins("LEFT JOIN stocks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON produks.id_kategori = categories.id").
		Where("produks.deleted_at IS NULL").
		Group("produks.id, categories.id")

	if produk != "" {
		dbQuery = dbQuery.Where("LOWER(produks.nama) LIKE LOWER(?)", "%"+produk+"%")
	}

	result := dbQuery.Scan(&stokList)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stokList)
}