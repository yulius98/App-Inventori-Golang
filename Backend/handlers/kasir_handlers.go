package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	//"time"

	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/models"
)

func BayarBelanja(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	// Update semua stock dengan status "pending" menjadi "done" untuk user ini
	result := database.DB.Model(&models.Stock{}).
		Where("user_name = ? AND status = ?", username, "pending").
		Update("status", "done")

	if result.Error != nil {
		http.Error(w, "Gagal mengubah status stock", http.StatusInternalServerError)
		return
	}

	if result.RowsAffected == 0 {
		http.Error(w, "Tidak ada stock pending untuk user ini", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":       "Pembayaran berhasil",
		"rows_updated":  result.RowsAffected,
	})
}



func GetProdukKasir(w http.ResponseWriter, r *http.Request) {
	type ProdukKasirResponse struct {
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
		Kategori    string  `json:"kategori"`
		Produk      string  `json:"produk"`
		TotalStock  int     `json:"total_stock"`
		Price       float64 `json:"price"`
	}

	type PaginationResponse struct {
		Data       []ProdukKasirResponse `json:"data"`
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

	var stok []ProdukKasirResponse
	var total int64

	// Hitung total produk
	countResult := database.DB.
		Table("stocks").
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
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON stocks.id_kategori = categories.id").
		Where("stocks.deleted_at IS NULL").
		Group("produks.id, categories.id").
		Having("COALESCE(SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) - SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END), 0) > 0").
		Count(&total)


	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}


	result := database.DB.
		Table("stocks").
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
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON stocks.id_kategori = categories.id").
		Where("stocks.deleted_at IS NULL").
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

func SearchProdukKasir(w http.ResponseWriter, r *http.Request){
	
	type SearchProdukKasirResponse struct {
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
		Kategori    string  `json:"kategori"`
		Produk      string  `json:"produk"`
		TotalStock  int     `json:"total_stock"`
		Price       float64 `json:"price"`
	}
	
	var stokList []SearchProdukKasirResponse
	
	// Ambil parameter query nama produk dari URL
	produk := r.URL.Query().Get("produk")

	dbQuery := database.DB.
		Table("stocks").
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
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON stocks.id_kategori = categories.id").
		Where("stocks.deleted_at IS NULL").
		Group("produks.id, categories.id").
		Having("COALESCE(SUM(CASE WHEN stocks.movement_type = 'IN' THEN stocks.quantity ELSE 0 END) - SUM(CASE WHEN stocks.movement_type = 'OUT' THEN stocks.quantity ELSE 0 END), 0) > 0").
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




func GetBelanja(w http.ResponseWriter, r *http.Request) {
	// Buat struct khusus untuk response stok
	type BelanjaResponse struct {
		Id           int    `json:"id"`
		IdKategori   int    `json:"id_kategori"`
		IdProduk     int    `json:"id_produk"`
		Kategori    string  `json:"kategori"`
		Produk      string  `json:"produk"`
		Status      string  `json:"status"`
		UserName    string  `json:"user_name"`
		Quantity        int     `json:"quantity"`
		Price       float64 `json:"price"`
	}

	type PaginationResponse struct {
		Data       []BelanjaResponse `json:"data"`
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

	var stok []BelanjaResponse
	var total int64

	username := r.URL.Query().Get("user_name")

	// Hitung total produk
	countResult := database.DB.
		Table("stocks").
		Select(`
			stocks.id,
			categories.id AS id_kategori,
			produks.id AS id_produk,
			categories.kategori AS kategori,
			produks.nama AS produk,
			stocks.quantity,
			stocks.user_name,
			stocks.status,
			produks.price
		`).
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON stocks.id_kategori = categories.id").
		Where("stocks.status = 'pending'").
		Where("stocks.deleted_at IS NULL").
		Where("stocks.movement_type = 'OUT'").
		Count(&total)

	if username != "" {
		countResult = countResult.Where("LOWER(stocks.user_name) LIKE LOWER(?)", "%"+username+"%")
	}


	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}


	result := database.DB.
		Table("stocks").
		Select(`
			stocks.id,
			categories.id AS id_kategori,
			produks.id AS id_produk,
			categories.kategori AS kategori,
			produks.nama AS produk,
			stocks.quantity,
			stocks.user_name,
			stocks.status,
			produks.price
		`).
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Joins("JOIN categories ON stocks.id_kategori = categories.id").
		Where("stocks.status = 'pending'").
		Where("stocks.deleted_at IS NULL").
		Where("stocks.movement_type = 'OUT'").	
		Offset(offset).
		Limit(limit).
		Scan(&stok)

	if username != "" {
		countResult = countResult.Where("LOWER(stocks.user_name) LIKE LOWER(?)", "%"+username+"%")
	}

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