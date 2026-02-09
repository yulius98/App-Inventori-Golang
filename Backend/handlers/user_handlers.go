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

func GetUser(w http.ResponseWriter, r *http.Request) {
	type UserRespone struct {
		Id        int    `json:"id"`  
		User_name string `json:"user_name"`
		Email     string `json:"email"`
		Password  string `json:"password"`
		Role      string `json:"role"`
	}


	type PaginationResponse struct {
		Data       []UserRespone `json:"data"`
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
	
	var user []UserRespone
	var total int64

	// Hitung total user
	countResult := database.DB.
		Table("users").
		Select("*").
		Where("users.deleted_at IS NULL").
		Count(&total)
	
	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}
	// Ambil data user dengan pagination 
	result := database.DB.
		Table("users").
		Select(`* 
		`).
		Where("users.deleted_at IS NULL").
		Offset(offset).
		Limit(limit).
		Scan(&user)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}	

	// Hitung total pages
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	// Buat response dengan informasi pagination
	response := PaginationResponse{
		Data:       user,
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)

}


func CreateUser(w http.ResponseWriter, r *http.Request) {
    var user models.User

	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	// Hash password sebelum simpan
    if err := user.HashPassword(); err != nil {
        return
    }
	result := database.DB.Create(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}

    w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
	
}

func UpdateUser(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var user models.User
	result := database.DB.First(&user, id)
	if result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	if err := json.NewDecoder(r.Body).Decode(&user); err != nil {
		http.Error(w, "Invalid JSON format", http.StatusBadRequest)
		return
	}
	
	result = database.DB.Save(&user)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}

func DeleteUser(w http.ResponseWriter, r *http.Request){
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid ID format", http.StatusBadRequest)
		return
	}

	var user models.User
	result := database.DB.First(&user, id)
	if result.Error != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	
	result = database.DB.Delete(&user, id)
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "User deleted successfully"})
}

func SearchUser(w http.ResponseWriter, r *http.Request){
	// Struct untuk response dengan field kategori (bukan id_kategori)
	type UserResponse struct {
		ID        uint       `json:"ID"`
		CreatedAt time.Time  `json:"CreatedAt"`
		UpdatedAt time.Time  `json:"UpdatedAt"`
		DeletedAt *time.Time `json:"DeletedAt"`
		UserName   string    `json:"user_name"`
		Email      string    `json:"email"`
		Password   string    `json:"password"`
		Role       string    `json:"role"`
	}

	var user []UserResponse

	user_name := r.URL.Query().Get("user_name")

	dbQuery := database.DB.Table("users").
		Select("*")

	query := "users.deleted_at IS NULL"
	args := []interface{}{}
	
	if user_name != "" {
		query += " AND LOWER(users.user_name) LIKE LOWER(?)"
		args = append(args, "%"+user_name+"%")
	}
	
	result := dbQuery.Where(query, args...).Scan(&user)
	
	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(user)
}