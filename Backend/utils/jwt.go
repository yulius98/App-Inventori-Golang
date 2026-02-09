package utils

import (
	"time"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("RAHASIA_SUPER_AMAN") // sebaiknya dari ENV

type JwtCustomClaims struct {
	UserID uint   `json:"user_id"`
	UserName string `json:"user_name"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, user_name, email, role string) (string, error) {
	claims := JwtCustomClaims{
		UserID: userID,
		UserName: user_name,
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}