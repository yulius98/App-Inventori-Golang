package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// GetAllModels returns slice of all models for AutoMigrate
func GetAllModels() []interface{} {
	return []interface{}{
		&Produk{},
		&Category{},
		&Stock{},
		&User{},
	}
}

type Produk struct {
	gorm.Model
	Nama        string  `json:"nama"`
	IdKategori  int     `json:"id_kategori"`
	UserName      string  `json:"user_name"`  
	Keterangan  string  `json:"keterangan"`
	Price       float64 `json:"price"`
}

type Stock struct {
	gorm.Model
	TglTrx       time.Time `json:"tgl_trx"`  
	IdProduk     int       `json:"id_produk"`
	IdKategori   int       `json:"id_kategori"`
	UserName       string   `json:"user_name"`
	MovementType string   `json:"movement_type"` // IN, OUT, ADJUST, TRANSFER 
	Quantity     int       `json:"quantity"`
	Status       string    `json:"status"` // done, pending
}

type Category struct {
	gorm.Model
	Kategori string  `json:"kategori"`
}

type User struct {
	gorm.Model
	User_name string `json:"user_name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	Role      string `json:"role"`
}

// Method untuk meng-hash password sebelum disimpan
func (u *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

// Method untuk verifikasi password saat login
func (u *User) CheckPassword(password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
    return err == nil
}
