package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/yulius/inventory-backend/database"
)

// TotalBarangPerKategori menampilkan total produk per kategori dengan pagination
func TotalBarangPerKategori(w http.ResponseWriter, r *http.Request) {
    type TotalBarangPerKategoriResponse struct {
        Kategori    string `json:"kategori"`
        TotalProduk int    `json:"total_produk"`
    }

    type PaginationResponse struct {
        Data       []TotalBarangPerKategoriResponse `json:"data"`
        Page       int   `json:"page"`
        Limit      int   `json:"limit"`
        Total      int64 `json:"total"`
        TotalPages int   `json:"totalPages"`
    }

    // Ambil parameter pagination dari query string
    pageStr := r.URL.Query().Get("page")
    limitStr := r.URL.Query().Get("limit")

    // Set default values
    page := 1
    limit := 10

    if pageStr != "" {
        if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
            page = p
        }
    }
    if limitStr != "" {
        if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
            limit = l
        }
    }
    offset := (page - 1) * limit

    var result []TotalBarangPerKategoriResponse
    var total int64

    // Hitung total kategori
    countResult := database.DB.
        Table("categories").
        Joins("LEFT JOIN produks ON produks.id_kategori = categories.id").
        Where("categories.deleted_at IS NULL").
		Group("categories.id").
		
        Count(&total)
    if countResult.Error != nil {
        http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
        return
    }

    // Query data kategori dan total produk per kategori
    query := database.DB.
        Table("categories").
        Select("categories.kategori, COUNT(produks.id) as total_produk").
        Joins("LEFT JOIN produks ON produks.id_kategori = categories.id").
        Where("categories.deleted_at IS NULL").
		Group("categories.id, categories.kategori").
        Offset(offset).
        Limit(limit).
        Scan(&result)
    if query.Error != nil {
        http.Error(w, query.Error.Error(), http.StatusInternalServerError)
        return
    }

    totalPages := int((total + int64(limit) - 1) / int64(limit))

    response := PaginationResponse{
        Data:       result,
        Page:       page,
        Limit:      limit,
        Total:      total,
        TotalPages: totalPages,
    }

    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(response)
}