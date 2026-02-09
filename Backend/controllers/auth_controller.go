// controllers/auth_controller.go
package controllers

import (
	"encoding/json"
	"net/http"

	"golang.org/x/crypto/bcrypt"

	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/models"
	"github.com/yulius/inventory-backend/utils"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	var user models.User

	w.Header().Set("Content-Type", "application/json")

	// Decode body
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Invalid request",
		})
		return
	}

	// Cari user
	result := database.DB.
		Table("users").
		Where("email = ?", req.Email).First(&user)
	if result.Error != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Email atau password salah",
		})
		return
	}

	// Cek password
	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(req.Password),
	); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Email atau password salah",
		})
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID, user.User_name, user.Email, user.Role)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{
			"message": "Gagal generate token",
		})
		return
	}

	// Response sukses
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Login berhasil",
		"token":   token,
	})

	

}
