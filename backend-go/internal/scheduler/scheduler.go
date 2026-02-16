package scheduler

import (
	"log"
	"time"
)

// Scheduler representa un servicio de tareas programadas
type Scheduler struct {
	ticker   *time.Ticker
	stopChan chan bool
	tasks    []ScheduledTask
}

// ScheduledTask representa una tarea que se ejecuta periódicamente
type ScheduledTask struct {
	Name     string
	Interval time.Duration
	Execute  func() error
}

// NewScheduler crea una nueva instancia del scheduler
func NewScheduler(interval time.Duration) *Scheduler {
	return &Scheduler{
		ticker:   time.NewTicker(interval),
		stopChan: make(chan bool),
		tasks:    []ScheduledTask{},
	}
}

// AddTask añade una tarea al scheduler
func (s *Scheduler) AddTask(task ScheduledTask) {
	s.tasks = append(s.tasks, task)
	log.Printf("[Scheduler] Tarea añadida: %s (intervalo: %v)", task.Name, task.Interval)
}

// Start inicia el scheduler en una goroutine
func (s *Scheduler) Start() {
	log.Println("[Scheduler] Iniciando scheduler de tareas automáticas...")

	// Ejecutar todas las tareas inmediatamente al inicio
	go func() {
		log.Println("[Scheduler] Ejecutando tareas iniciales...")
		s.runAllTasks()
	}()

	// Luego ejecutar en intervalos
	go func() {
		for {
			select {
			case <-s.ticker.C:
				s.runAllTasks()
			case <-s.stopChan:
				log.Println("[Scheduler] Deteniendo scheduler...")
				return
			}
		}
	}()
}

// Stop detiene el scheduler
func (s *Scheduler) Stop() {
	s.ticker.Stop()
	s.stopChan <- true
}

// runAllTasks ejecuta todas las tareas registradas
func (s *Scheduler) runAllTasks() {
	for _, task := range s.tasks {
		log.Printf("[Scheduler] Ejecutando tarea: %s", task.Name)
		if err := task.Execute(); err != nil {
			log.Printf("[Scheduler] Error en tarea %s: %v", task.Name, err)
		} else {
			log.Printf("[Scheduler] Tarea %s completada exitosamente", task.Name)
		}
	}
}
