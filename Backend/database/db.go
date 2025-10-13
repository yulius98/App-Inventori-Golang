package database

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/yulius/inventory-backend/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() {
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using environment variables")
	}
	
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	
	// First, connect to MySQL server without specifying database to create it if needed
	dsnWithoutDB := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort)
	
	fmt.Println("Connecting to MySQL server...")
	tempDB, err := gorm.Open(mysql.Open(dsnWithoutDB), &gorm.Config{})
	if err != nil {
		fmt.Printf("Failed to connect to MySQL server: %v\n", err)
		panic("Failed to connect to MySQL server")
	}
	
	// Create database if it doesn't exist
	fmt.Printf("Creating database '%s' if not exists...\n", dbName)
	createDBSQL := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS `%s` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci", dbName)
	err = tempDB.Exec(createDBSQL).Error
	if err != nil {
		fmt.Printf("Failed to create database: %v\n", err)
		panic("Failed to create database")
	}
	fmt.Printf("Database '%s' created or already exists\n", dbName)
	
	// Now connect to the specific database
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName)
	
	fmt.Println("Connecting to database...")
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil{
		fmt.Printf("Failed to connect to database: %v\n", err)
		panic("Failed to connect to database")
	}

	DB = db
	fmt.Println("Database connected successfully!")
	
	fmt.Println("Running AutoMigrate...")
	
	allModels := models.GetAllModels()
	err = db.AutoMigrate(allModels...)
	if err != nil {
		fmt.Printf("AutoMigrate failed: %v\n", err)
		panic("Failed to run AutoMigrate")
	}

	fmt.Println("AutoMigrate completed successfully!")
}
