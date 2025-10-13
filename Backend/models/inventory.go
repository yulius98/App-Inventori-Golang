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
	Tgl_trx     time.Time `json:"tgl_trx"`  
	Id_produk   int       `json:"id_produk"`
	Id_kategori int       `json:"id_kategori"`
	Qty_in      int       `json:"qty_in"`
	Qty_out     int       `json:"qty_out"` 
	
}

type Category struct {
	gorm.Model
	Kategori string  `json:"kategori"`
}