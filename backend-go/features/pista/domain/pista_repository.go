package domain

// PistaRepository define los métodos para interactuar con las pistas
type PistaRepository interface {
	FindAll() ([]Pista, error)
	FindByID(id int) (*Pista, error)
	Create(pista *Pista) error
	Update(pista *Pista) error
	Delete(id int) error
	FindAllAdvanced(params PistaQueryParams) (*PistaPagedResponse, error)
}
