import { Router } from 'express';
import * as authController from '../controllers/authController.ts';
import * as projectController from '../controllers/projectController.ts';
import * as taskController from '../controllers/taskController.ts';
import * as dashboardController from '../controllers/dashboardController.ts';
import { authenticateToken, authorizeRole } from '../../middleware/auth.ts';

const router = Router();

// Auth Routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.getMe);

// Project Routes
router.get('/projects', authenticateToken, projectController.getProjects);
router.post('/projects', authenticateToken, authorizeRole(['ADMIN']), projectController.createProject);
router.get('/projects/:id', authenticateToken, projectController.getProjectById);
router.put('/projects/:id', authenticateToken, authorizeRole(['ADMIN']), projectController.updateProject);
router.delete('/projects/:id', authenticateToken, authorizeRole(['ADMIN']), projectController.deleteProject);

// Task Routes
router.get('/tasks', authenticateToken, taskController.getTasks);
router.post('/tasks', authenticateToken, authorizeRole(['ADMIN']), taskController.createTask);
router.put('/tasks/:id', authenticateToken, taskController.updateTask);
router.delete('/tasks/:id', authenticateToken, authorizeRole(['ADMIN']), taskController.deleteTask);

// Dashboard Routes
router.get('/dashboard/stats', authenticateToken, dashboardController.getStats);
router.get('/users', authenticateToken, dashboardController.getAllUsers);

export default router;
