package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/yulius/inventory-backend/database"
)

func DataPenjualan(w http.ResponseWriter, r *http.Request ) {
	type PenjualanBulananResponse struct {
		IdProduk int   	`json:"id_produk"`
		Produk   string  `json:"produk"`
		Bulan    string	`json:"bulan"`
		TotalQty int    `json:"total_qty"`
	}


	var penjualan []PenjualanBulananResponse

	var total int64

	result := database.DB.
		Table("stocks").
		Select(`
			id_produk,
			produks.nama AS produk,
			DATE_FORMAT(tgl_trx, '%Y-%m-01') AS bulan,
			SUM(quantity) AS total_qty
		`).
		Joins("JOIN produks ON stocks.id_produk = produks.id").
		Where("movement_type = ?", "OUT").
		Where("status = ?", "done").
		Where("MONTH(tgl_trx) = MONTH(CURDATE()) AND YEAR(tgl_trx) = YEAR(CURDATE())").
		Group("id_produk, bulan").
		Order("bulan ASC").
		Scan(&penjualan)

	if result.Error != nil {
		http.Error(w, result.Error.Error(), http.StatusInternalServerError)
		return
	}
	

	countResult := database.DB.
		Table("(?) as sub", database.DB.
			Table("stocks").
			Select("id_produk, produks.nama AS produk, DATE_FORMAT(tgl_trx, '%Y-%m-01') AS bulan").
			Joins("JOIN produks ON stocks.id_produk = produks.id").
			Where("movement_type = ?", "OUT").
			Where("MONTH(tgl_trx) = MONTH(CURDATE()) AND YEAR(tgl_trx) = YEAR(CURDATE())").
			Group("id_produk, bulan"),
		).
		Count(&total)

	if countResult.Error != nil {
		http.Error(w, countResult.Error.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data":  penjualan,
		"total": total,
	})


}