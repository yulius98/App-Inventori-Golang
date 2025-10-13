package main

import (
	"log"
	"net/http"

	"github.com/yulius/inventory-backend/database"
	"github.com/yulius/inventory-backend/routes"
)

func main() {
	database.Connect()
	router := routes.SetupRouter()
	log.Println("Server starting on :8080")
	http.ListenAndServe(":8080",router)
}