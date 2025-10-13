package handlers

import (
	"net/http"
)

// OptionsHandler menangani preflight OPTIONS requests
// Middleware CORS sudah menghandle headers, jadi ini hanya perlu return 200 OK
func OptionsHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
}