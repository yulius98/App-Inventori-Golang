package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/models"
)

func GetAllKategori(w http.ResponseWriter, r *http.Request) {
	type AllKategoriRespone struct {
		Id  int       `json:"id"`  
		Kategori   string    `json:"kategori"`
	}

	var kategori []AllKategoriRespone

	// Ambil data all kategori
	result := database.DB.
		Table("categories").
		Where("categories.deleted_at IS NULL").
		Scan(&kategori)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(kategori)


}


func GetKategori(w http.ResponseWriter, r *http.Request) {
	type KategoriRespone struct {
		Id  int       `json:"id"`  
		Kategori   string    `json:"kategori"`
	}

	type PaginationResponse struct {
		Data       []KategoriRespone `json:"data"`
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

	var kategori []KategoriRespone
	var total int64

	// Hitung total produk
	countResult := database.DB.
		Table("categories").
		Where("categories.deleted_at IS NULL").
		Count(&total)

	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Ambil data kategori dengan pagination
	result := database.DB.
		Table("categories").
		Where("categories.deleted_at IS NULL").
		Offset(offset).
		Limit(limit).
		Scan(&kategori)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Hitung total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	// Buat response dengan informasi pagination
	response := PaginationResponse{
		Data:       kategori,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func CreateKategori(w http.ResponseWriter, r *http.Request){
	var kategori models.Category

	if err := json.NewDecoder(r.Body).Decode(&kategori); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result := database.DB.Create(&kategori)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(kategori)
}

func UpdateKategori(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var kategori models.Category
	result := database.DB.First(&kategori, id)
	if result.Error != nil {
		http.Error(w, "Kategori not found", http.StatusNotFound)
		return
	}
	
	if err := json.NewDecoder(r.Body).Decode(&kategori); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result = database.DB.Save(&kategori)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(kategori)
}

func DeleteKategori(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var kategori models.Category
	result := database.DB.First(&kategori, id)
	if result.Error != nil {
		http.Error(w, "Kategori not found", http.StatusNotFound)
		return
	}
	
	result = database.DB.Delete(&kategori, id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Kategori deleted successfully"})
}

func SearchKategori(w http.ResponseWriter, r *http.Request){
	
	type KategoriRespone struct {
		Id       int       `json:"id"`  
		Kategori string    `json:"kategori"`
	}
	var kategoriList []KategoriRespone
	
	// Ambil parameter query 'name' dari URL
	kategori := r.URL.Query().Get("kategori")
	
	dbQuery := database.DB.
		Table("categories").
		Where("categories.deleted_at IS NULL")

	
	if kategori != "" {
		dbQuery = dbQuery.Where("LOWER(categories.kategori) LIKE LOWER(?)", "%"+kategori+"%")
	} 

	result := dbQuery.Scan(&kategoriList)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

	// Set header response
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(kategoriList)
}