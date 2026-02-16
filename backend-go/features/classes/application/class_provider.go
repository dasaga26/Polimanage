package application

// ClassProviderImpl implementa la interfaz ClassProvider para enrollments
type ClassProviderImpl struct {
	service *ClassService
}

func NewClassProvider(service *ClassService) ClassProvider {
	return &ClassProviderImpl{service: service}
}

func (p *ClassProviderImpl) GetClassBySlug(slug string) (ClassInfo, error) {
	class, err := p.service.GetClassBySlug(slug)
	if err != nil {
		return ClassInfo{}, err
	}

	return ClassInfo{
		ID:          class.ID,
		Status:      class.Status,
		MaxCapacity: class.MaxCapacity,
	}, nil
}

func (p *ClassProviderImpl) GetClassByID(id int) (ClassInfo, error) {
	class, err := p.service.GetClassByID(id)
	if err != nil {
		return ClassInfo{}, err
	}

	return ClassInfo{
		ID:          class.ID,
		Status:      class.Status,
		MaxCapacity: class.MaxCapacity,
	}, nil
}
