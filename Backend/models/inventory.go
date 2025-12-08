package models

import (
	"time"

	"gorm.io/gorm"
)

// GetAllModels returns slice of all models for AutoMigrate
func GetAllModels() []interface{} {
	return []interface{}{
		&Produk{},
		&Category{},
		&Stock{},
	}
}

type Produk struct {
	gorm.Model
	Nama       string `json:"nama"`
	Id_kategori int       `json:"id_kategori"`
	Keterangan string `json:"keterangan"`
	Price       float64   `json:"price"`
}

type Stock struct {
	gorm.Model
	TglTrx      time.Time `json:"tgl_trx"`  
	IdProduk    int       `json:"id_produk"`
	IdKategori  int       `json:"id_kategori"`
	MovementType string   `json:"movement_type"` // IN, OUT, ADJUST, TRANSFER 
	Quantity    int       `json:"quantity"`
}

type Category struct {
	gorm.Model
	Kategori string  `json:"kategori"`
}