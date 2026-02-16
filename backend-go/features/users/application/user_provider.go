package application

import (
	classApp "backend-go/features/classes/application"
	clubApp "backend-go/features/clubs/application"
	userDomain "backend-go/features/users/domain"
)

// ClassUserProvider implementa classApp.UserProvider
type ClassUserProvider struct {
	userRepo userDomain.UserRepository
}

func NewClassUserProvider(userRepo userDomain.UserRepository) classApp.UserProvider {
	return &ClassUserProvider{userRepo: userRepo}
}

func (p *ClassUserProvider) GetUserBySlug(slug string) (classApp.UserInfo, error) {
	user, err := p.userRepo.GetBySlug(slug)
	if err != nil {
		return classApp.UserInfo{}, err
	}

	return classApp.UserInfo{
		ID:     user.ID,
		RoleID: int(user.RoleID),
	}, nil
}

// ClubUserProvider implementa clubApp.UserProvider
type ClubUserProvider struct {
	userRepo userDomain.UserRepository
}

func NewClubUserProvider(userRepo userDomain.UserRepository) clubApp.UserProvider {
	return &ClubUserProvider{userRepo: userRepo}
}

func (p *ClubUserProvider) GetUserBySlug(slug string) (clubApp.UserInfo, error) {
	user, err := p.userRepo.GetBySlug(slug)
	if err != nil {
		return clubApp.UserInfo{}, err
	}

	return clubApp.UserInfo{
		ID:     user.ID,
		RoleID: int(user.RoleID),
	}, nil
}
